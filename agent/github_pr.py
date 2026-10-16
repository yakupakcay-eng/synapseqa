"""
Open a GitHub pull request from a model-proposed single-file fix.

Creates a branch off `base_branch`, commits the new file contents, and opens a PR.
The patch is a *proposal*: nothing here proves it fixes the defect, so the PR body
says so and a human review is expected before merging.
"""

import os
from typing import Any, Dict, Optional

try:
    from github import Github
except ImportError:  # pragma: no cover
    Github = None


class AutonomousPRDispatcher:
    def __init__(self, repo_slug: str, github_token: Optional[str] = None, client: Any = None):
        self.repo_slug = repo_slug
        self.token = github_token or os.getenv("GITHUB_TOKEN", "")
        self._client = client

    def _github(self) -> Any:
        if self._client is not None:
            return self._client
        if not self.token:
            raise RuntimeError("GITHUB_TOKEN is not set")
        if Github is None:
            raise RuntimeError("PyGithub is not installed: pip install -r agent/requirements.txt")
        return Github(self.token)

    @staticmethod
    def format_pull_request_body(defect: str, file_path: str, run_report: str, model: str) -> str:
        return (
            "## SynapseQA proposed fix\n\n"
            f"**Defect observed:** {defect}\n\n"
            f"**File changed:** `{file_path}`\n\n"
            f"**Agent report:**\n\n> " + run_report.replace("\n", "\n> ") + "\n\n"
            f"_Generated with `{model}`. This is a proposal, not a verified fix. Review before merging._\n"
        )

    def open_fix_pr(
        self,
        file_path: str,
        new_content: str,
        branch_name: str,
        title: str,
        body: str,
        base_branch: str = "main",
    ) -> Dict[str, Any]:
        repo = self._github().get_repo(self.repo_slug)
        base = repo.get_branch(base_branch)
        repo.create_git_ref(ref=f"refs/heads/{branch_name}", sha=base.commit.sha)
        current = repo.get_contents(file_path, ref=base_branch)
        repo.update_file(file_path, title, new_content, current.sha, branch=branch_name)
        pr = repo.create_pull(title=title, body=body, head=branch_name, base=base_branch)
        return {"status": "CREATED", "branch": branch_name, "pr_number": pr.number, "pr_url": pr.html_url}
