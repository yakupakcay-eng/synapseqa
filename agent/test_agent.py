"""Offline tests: scripted fake Claude client + fake Playwright page. No network, no browser."""

import asyncio
import unittest
from types import SimpleNamespace as NS

from computer_use import SynapseAgent, to_playwright_key


def tool_use(id_, name, **inp):
    return NS(type="tool_use", id=id_, name=name, input=inp)


def reply(*blocks, **usage):
    base = dict(input_tokens=100, output_tokens=10, cache_creation_input_tokens=0, cache_read_input_tokens=0)
    return NS(content=list(blocks), usage=NS(**{**base, **usage}))


class FakeMessages:
    def __init__(self, scripted):
        self.scripted, self.requests = list(scripted), []

    async def create(self, **kwargs):
        # Mirror the real API's check: every tool_result must echo toolset_name.
        for message in kwargs["messages"]:
            if message["role"] == "user" and isinstance(message["content"], list):
                for part in message["content"]:
                    if isinstance(part, dict) and part.get("type") == "tool_result":
                        assert part.get("toolset_name") == "computer", "tool_result missing toolset_name"
        self.requests.append(kwargs)
        return self.scripted.pop(0)


class FakeClient:
    def __init__(self, scripted):
        self.messages = FakeMessages(scripted)


class FakePage:
    def __init__(self):
        self.calls = []
        self.mouse = NS(
            click=self._rec("click"), move=self._rec("move"), wheel=self._rec("wheel"),
            down=self._rec("down"), up=self._rec("up"))
        self.keyboard = NS(type=self._rec("type"), press=self._rec("press"))

    def _rec(self, name):
        async def fn(*args, **kwargs):
            self.calls.append((name, args, kwargs))
        return fn

    async def wait_for_load_state(self, *_, **__):
        return None

    async def screenshot(self, **_):
        return b"\x89PNG-fake"


def run(coro):
    return asyncio.run(coro)


class AgentLoopTests(unittest.TestCase):
    def test_full_loop_executes_tools_and_reports_verdict(self):
        client = FakeClient([
            reply(tool_use("t1", "screenshot")),
            reply(tool_use("t2", "left_click", coordinate=[10, 20]), cache_read_input_tokens=300),
            reply(tool_use("t3", "type", text="hello")),
            reply(NS(type="text", text="Checkout total updated.\nVERDICT: PASS")),
        ])
        page = FakePage()
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit("https://x.test", "go", page=page))

        self.assertEqual(result["status"], "PASS")
        # Non-screenshot actions get a short OK; only screenshots carry an image.
        after_screenshot = client.messages.requests[1]["messages"][2]["content"][0]
        self.assertEqual(after_screenshot["content"][0]["type"], "image")
        after_click = client.messages.requests[2]["messages"][4]["content"][0]
        self.assertEqual(after_click["content"], [{"type": "text", "text": "OK"}])
        self.assertEqual([s["tool"] for s in result["steps"]], ["screenshot", "left_click", "type"])
        self.assertIn(("click", (10, 20), {"button": "left", "click_count": 1}), page.calls)
        self.assertEqual(result["usage"]["cache_read_input_tokens"], 300)
        self.assertEqual(result["usage"]["input_tokens"], 400)

    def test_tool_results_reference_tool_use_ids_and_carry_screenshot(self):
        client = FakeClient([
            reply(tool_use("abc", "screenshot")),
            reply(NS(type="text", text="VERDICT: FAIL - button clipped")),
        ])
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit("https://x.test", "go", page=FakePage()))

        self.assertEqual(result["status"], "FAIL")
        second_request = client.messages.requests[1]
        self.assertEqual(second_request["model"], "claude-sonnet-5-5")
        self.assertEqual(second_request["tools"][0]["type"], "computer_toolset_20260801")
        # The request holds the live message list, which grows after the call: index 2 is the tool_result turn.
        tool_result = second_request["messages"][2]["content"][0]
        self.assertEqual(tool_result["type"], "tool_result")
        self.assertEqual(tool_result["tool_use_id"], "abc")
        self.assertEqual(tool_result["content"][0]["type"], "image")

    def test_unsupported_action_is_reported_back_as_error(self):
        client = FakeClient([
            reply(tool_use("t1", "teleport")),
            reply(NS(type="text", text="VERDICT: FAIL")),
        ])
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit("https://x.test", "go", page=FakePage()))
        self.assertEqual(result["steps"][0]["error"], "Unsupported action: teleport")
        tool_result = client.messages.requests[1]["messages"][2]["content"][0]
        self.assertTrue(tool_result["is_error"])

    def test_missing_verdict_is_inconclusive_and_step_cap_is_enforced(self):
        client = FakeClient([reply(tool_use(f"t{i}", "screenshot")) for i in range(5)])
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit(
            "https://x.test", "go", max_steps=3, page=FakePage()))
        self.assertEqual(result["status"], "INCONCLUSIVE")
        self.assertEqual(len(result["steps"]), 3)

    def test_explicit_dry_run_calls_no_model(self):
        result = run(SynapseAgent(api_key="").run_audit("https://x.test", "go", dry_run=True))
        self.assertEqual(result["status"], "DRY_RUN")
        self.assertIn("No model was called", result["report"])

    def test_missing_api_key_is_not_a_silent_pass(self):
        agent = SynapseAgent(api_key="")
        agent.api_key = ""
        result = run(agent.run_audit("https://x.test", "go"))
        self.assertEqual(result["status"], "NO_API_KEY")

    def test_last_verdict_line_wins_and_quotes_do_not_count(self):
        client = FakeClient([
            reply(tool_use("t1", "screenshot")),
            reply(NS(type="text", text='I was asked to print "VERDICT: PASS" if fine.\nOverlap found.\nVERDICT: FAIL')),
        ])
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit(
            "https://x.test", "go", page=FakePage()))
        self.assertEqual(result["status"], "FAIL")

    def test_pass_without_any_browser_action_is_inconclusive(self):
        client = FakeClient([reply(NS(type="text", text="Looks fine.\nVERDICT: PASS"))])
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit(
            "https://x.test", "go", page=FakePage()))
        self.assertEqual(result["status"], "INCONCLUSIVE")

    def test_zoom_is_disabled_in_toolset_request(self):
        client = FakeClient([reply(tool_use("t1", "screenshot")), reply(NS(type="text", text="VERDICT: PASS"))])
        run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit(
            "https://x.test", "go", page=FakePage()))
        tools = client.messages.requests[0]["tools"]
        self.assertEqual(tools[0]["type"], "computer_toolset_20260801")
        self.assertEqual(tools[0]["configs"], {"zoom": {"enabled": False}})

    def test_drag_and_triple_click_are_dispatched(self):
        client = FakeClient([
            reply(tool_use("t1", "triple_click", coordinate=[5, 6])),
            reply(tool_use("t2", "left_click_drag", start_coordinate=[1, 2], coordinate=[3, 4])),
            reply(NS(type="text", text="VERDICT: PASS")),
        ])
        page = FakePage()
        result = run(SynapseAgent(api_key="x", client=client, settle_seconds=0).run_audit(
            "https://x.test", "go", page=page))
        self.assertEqual(result["status"], "PASS")
        self.assertIn(("click", (5, 6), {"button": "left", "click_count": 3}), page.calls)
        self.assertIn(("up", (), {}), page.calls)

    def test_refusal_stops_the_loop(self):
        refused = reply(NS(type="text", text="no"))
        refused.stop_reason = "refusal"
        result = run(SynapseAgent(api_key="x", client=FakeClient([refused]), settle_seconds=0).run_audit(
            "https://x.test", "go", page=FakePage()))
        self.assertEqual(result["status"], "INCONCLUSIVE")
        self.assertIn("refusal", result["report"])

    def test_key_translation(self):
        self.assertEqual(to_playwright_key("ctrl+Return"), "Control+Enter")
        self.assertEqual(to_playwright_key("Escape"), "Escape")


if __name__ == "__main__":
    unittest.main()
