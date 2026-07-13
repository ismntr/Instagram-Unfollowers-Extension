# Agent Skills

## Workflow: Manifest V3 Network Interception

1. Content scripts (**Isolated World**) **cannot** intercept `fetch` requests made by the host page.
2. You **must** create an `inject.js` file.
3. You **must** use `content.js` to inject `inject.js` into the DOM by creating a `<script>` tag and appending it to `document.head` or `document.documentElement`.
4. `inject.js` overrides `window.fetch` and `XMLHttpRequest`, checks if the URL matches the target API, clones the response, parses the JSON, and sends it to `content.js` using `window.postMessage`.
5. `content.js` listens with `window.addEventListener("message", ...)` to receive the intercepted data safely across world boundaries.

## Workflow: Authenticated POST Requests

1. Read `document.cookie`.
2. Extract the string value where the key is `csrftoken`.
3. Construct the headers: `{'X-CSRFToken': token, 'Content-Type': 'application/x-www-form-urlencoded'}` (and app ID if structurally required).
4. Issue the POST request to the explicit `/web/friendships/{id}/unfollow/` endpoint.
5. Handle status codes appropriately (e.g., `429 Too Many Requests` triggers immediate queue suspension).
