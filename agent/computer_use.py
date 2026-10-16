"""
SynapseQA agent engine.

A small, readable agent loop around Anthropic's computer use tool:

    Playwright (headless Chromium)  <->  Claude Messages API (computer_toolset_20260801)

Each turn Claude receives the conversation so far, answers with one or more
`tool_use` blocks (screenshot, left_click, type, ...), we execute them in the
browser and send back `tool_result` blocks that include a fresh screenshot.
The run ends when Claude replies without tool calls and reports a verdict.

Nothing here is simulated: without ANTHROPIC_API_KEY the engine refuses to
pretend and returns a DRY_RUN result that says no model was called.
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import re
import sys
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Tuple

try:
    from anthropic import AsyncAnthropic
except ImportError:  # pragma: no cover - optional until a real run is requested
    AsyncAnthropic = None

try:
    from playwright.async_api import async_playwright
except ImportError:  # pragma: no cover - optional until a real run is requested
    async_playwright = None


DEFAULT_MODEL = "claude-sonnet-5-5"
COMPUTER_TOOLSET = {"type": "computer_toolset_20260801"}

SYSTEM_PROMPT = (
    "You are SynapseQA, a QA engineer operating a real web browser through the computer use tool. "
    "Work only from what you can see on screen. Take a screenshot first, then perform the smallest "
    "set of actions needed to exercise the requested user journey. Watch for visual defects "
    "(overlap, clipping, unreadable contrast, broken layout) and functional failures (errors, dead "
    "buttons, wrong totals). Do not enter real credentials or personal data. When finished, reply "
    "with a short report that ends with exactly one line: `VERDICT: PASS` or `VERDICT: FAIL`, "
    "followed by the concrete evidence for that verdict."
)

_KEY_ALIASES = {
    "return": "Enter",
    "enter": "Enter",
    "esc": "Escape",
    "escape": "Escape",
    "ctrl": "Control",
    "control": "Control",
    "cmd": "Meta",
    "super": "Meta",
    "page_down": "PageDown",
    "page_up": "PageUp",
}


def to_playwright_key(combo: str) -> str:
    """Translate xdotool-style key names ("ctrl+Return") to Playwright ("Control+Enter")."""
    parts = [p.strip() for p in combo.split("+") if p.strip()]
    return "+".join(_KEY_ALIASES.get(p.lower(), p) for p in parts)


@dataclass
class StepRecord:
    index: int
    tool: str
    input: Dict[str, Any]
    error: Optional[str] = None


@dataclass
class Usage:
    input_tokens: int = 0
    output_tokens: int = 0
    cache_creation_input_tokens: int = 0
    cache_read_input_tokens: int = 0

    def add(self, raw: Any) -> None:
        for name in asdict(self):
            setattr(self, name, getattr(self, name) + int(getattr(raw, name, 0) or 0))

    @property
    def cache_read_ratio(self) -> Optional[float]:
        total = self.input_tokens + self.cache_creation_input_tokens + self.cache_read_input_tokens
        return round(self.cache_read_input_tokens / total, 3) if total else None


class SynapseAgent:
    """Autonomous web QA agent built on Claude's computer use tool."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL,
        viewport_width: int = 1440,
        viewport_height: int = 900,
        client: Any = None,
    ):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.model = model
        self.viewport_width = viewport_width
        self.viewport_height = viewport_height
        self._client = client

    # ------------------------------------------------------------------ setup
    @property
    def client(self) -> Any:
        if self._client is None and self.api_key and AsyncAnthropic is not None:
            self._client = AsyncAnthropic(api_key=self.api_key)
        return self._client

    def system_blocks(self) -> List[Dict[str, Any]]:
        # The system prompt is identical on every turn, so mark it cacheable.
        return [{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}]

    async def _launch_browser(self, target_url: str) -> Tuple[Any, Any, Any]:
        if async_playwright is None:
            raise RuntimeError(
                "playwright is not installed. Run: pip install -r agent/requirements.txt && playwright install chromium"
            )
        pw = await async_playwright().start()
        browser = await pw.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        context = await browser.new_context(
            viewport={"width": self.viewport_width, "height": self.viewport_height},
            device_scale_factor=1,
        )
        page = await context.new_page()
        await page.goto(target_url, wait_until="load")
        return pw, browser, page

    # -------------------------------------------------------------- execution
    @staticmethod
    async def screenshot_b64(page: Any) -> str:
        return base64.b64encode(await page.screenshot(type="png")).decode("ascii")

    async def execute_tool(self, page: Any, name: str, args: Dict[str, Any]) -> Optional[str]:
        """Run one computer-use member tool. Returns an error string, or None on success."""
        coord = args.get("coordinate") or args.get("coordinates")
        has_xy = isinstance(coord, (list, tuple)) and len(coord) >= 2
        x, y = (coord[0], coord[1]) if has_xy else (None, None)

        if name == "screenshot":
            return None
        if name in ("left_click", "click", "right_click", "double_click", "middle_click"):
            if not has_xy:
                return f"{name} requires a coordinate"
            button = "right" if name == "right_click" else "middle" if name == "middle_click" else "left"
            await page.mouse.click(x, y, button=button, click_count=2 if name == "double_click" else 1)
        elif name == "mouse_move":
            if not has_xy:
                return "mouse_move requires a coordinate"
            await page.mouse.move(x, y)
        elif name == "type":
            await page.keyboard.type(str(args.get("text", "")), delay=20)
        elif name in ("key", "press_key"):
            await page.keyboard.press(to_playwright_key(str(args.get("text") or args.get("key") or "")))
        elif name == "scroll":
            if has_xy:
                await page.mouse.move(x, y)
            amount = float(args.get("scroll_amount", 3)) * 100
            direction = str(args.get("scroll_direction", "down"))
            dx = {"left": -amount, "right": amount}.get(direction, 0)
            dy = {"up": -amount, "down": amount}.get(direction, 0)
            await page.mouse.wheel(dx, dy)
        elif name == "wait":
            await asyncio.sleep(min(float(args.get("duration", 1)), 10))
        else:
            return f"Unsupported action: {name}"
        return None

    # -------------------------------------------------------------------- run
    async def run_audit(
        self,
        target_url: str,
        goal: str,
        max_steps: int = 12,
        page: Any = None,
        dry_run: bool = False,
    ) -> Dict[str, Any]:
        """
        Drive `target_url` towards `goal`. Pass `page` to reuse an already-navigated
        Playwright page (used by the tests); otherwise a headless Chromium is launched.
        """
        base = {"target": target_url, "model": self.model, "goal": goal}
        if dry_run or self.client is None:
            reason = "dry run requested" if dry_run else "ANTHROPIC_API_KEY is not set"
            return {**base, "status": "DRY_RUN", "steps": [], "usage": asdict(Usage()),
                    "report": f"No model was called ({reason}). Nothing was tested."}

        owns_browser = page is None
        pw = browser = None
        if owns_browser:
            pw, browser, page = await self._launch_browser(target_url)

        usage = Usage()
        steps: List[StepRecord] = []
        report = ""
        messages: List[Dict[str, Any]] = [{
            "role": "user",
            "content": [{
                "type": "text",
                "text": (f"The page {target_url} is already open in a {self.viewport_width}x"
                         f"{self.viewport_height} browser viewport.\nGoal: {goal}"),
            }],
        }]

        try:
            for _ in range(max_steps):
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=self.system_blocks(),
                    tools=[COMPUTER_TOOLSET],
                    messages=messages,
                )
                usage.add(getattr(response, "usage", None))
                messages.append({"role": "assistant", "content": response.content})

                tool_uses = [b for b in response.content if getattr(b, "type", "") == "tool_use"]
                texts = [getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text"]
                if not tool_uses:
                    report = "\n".join(t for t in texts if t).strip()
                    break

                results = []
                for block in tool_uses:
                    args = dict(getattr(block, "input", {}) or {})
                    error = await self.execute_tool(page, block.name, args)
                    steps.append(StepRecord(len(steps) + 1, block.name, args, error))
                    content: List[Dict[str, Any]] = [{
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/png",
                                   "data": await self.screenshot_b64(page)},
                    }]
                    if error:
                        content.insert(0, {"type": "text", "text": error})
                    results.append({"type": "tool_result", "tool_use_id": block.id,
                                    "content": content, **({"is_error": True} if error else {})})
                messages.append({"role": "user", "content": results})
        finally:
            if owns_browser and browser is not None:
                await browser.close()
                await pw.stop()

        match = re.search(r"VERDICT:\s*(PASS|FAIL)", report, re.IGNORECASE)
        status = match.group(1).upper() if match else "INCONCLUSIVE"
        return {**base, "status": status, "steps": [asdict(s) for s in steps], "report": report,
                "usage": {**asdict(usage), "cache_read_ratio": usage.cache_read_ratio}}


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="SynapseQA: Claude-driven browser QA agent")
    parser.add_argument("--target", required=True, help="URL to test")
    parser.add_argument("--goal", default="Smoke-test the main user journey and report any visual or functional defects.")
    parser.add_argument("--max-steps", type=int, default=12)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--dry-run", action="store_true", help="Do not call the model or open a browser")
    args = parser.parse_args(argv)

    agent = SynapseAgent(model=args.model)
    try:
        result = asyncio.run(agent.run_audit(args.target, args.goal, args.max_steps, dry_run=args.dry_run))
    except Exception as exc:  # surface a clean message instead of a stack trace
        print(f"synapseqa: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, indent=2))
    return 1 if result["status"] in ("FAIL", "INCONCLUSIVE") else 0


if __name__ == "__main__":
    sys.exit(main())
