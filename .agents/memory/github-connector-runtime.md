---
name: GitHub connector runtime
description: Runtime detail for making authenticated GitHub API requests from the Replit connector sandbox.
---

Authenticated GitHub connections returned by the sandbox connection helper expose `proxyFetch` on the connection object. The setup documentation's `getClient().proxy(...)` shape may not exist on that returned client.

**Why:** The connected GitHub account was healthy, but the documented client method was unavailable at runtime; inspecting the connection object revealed the working proxy method.

**How to apply:** When querying connected GitHub data from the sandbox, use the connection's `proxyFetch` after confirming a GitHub connection is attached.