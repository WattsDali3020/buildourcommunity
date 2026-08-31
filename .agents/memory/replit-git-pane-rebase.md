---
name: Replit Git pane rebase behavior
description: The Replit Git pane can attempt and abort a rebase even when the GitHub branch is already an ancestor of the local branch.
---

When the Git pane reports a merge conflict, inspect the actual repository state before resolving or overwriting anything. If the remote branch is an ancestor of local `main`, the safe operation is a normal fast-forward push; do not force-push.

**Why:** The Replit Git pane may run an automatic pull/rebase workflow that aborts without leaving conflicted files, even though the local branch can be pushed safely.

**How to apply:** Check `git status`, unmerged paths, and the ancestor relationship before choosing conflict resolution or force-push options.