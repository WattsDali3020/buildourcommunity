---
name: GitHub Shell authentication
description: Replit's GitHub App connection and the workspace Shell's HTTPS Git credentials are separate authentication paths.
---

A working Replit GitHub integration does not automatically replace an invalid HTTPS credential used by `git push` in the Shell. Shell pushes need a valid GitHub PAT entered interactively, or another separately configured Git credential.

**Why:** Reconnecting the GitHub integration can succeed while `git push origin main` continues to return invalid username or token because Git is using a cached credential.

**How to apply:** Force an interactive non-force push without credential helpers, and never place the PAT in a command, project file, or chat message.

A `403` that names the authenticated GitHub account generally means the token was recognized but lacks write access to the selected repository. Verify the token's resource owner, repository selection, and `Contents: Read and write` permission before retrying.