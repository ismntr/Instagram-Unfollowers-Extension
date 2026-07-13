# System Patterns

## Architecture

- **Frontend/UI:** Vanilla HTML/CSS in `popup.html`.
- **Interception Layer:** `inject.js` injected via dynamic `<script>` tags or `chrome.scripting.executeScript` into the **MAIN** world to bypass extension isolation.
- **Orchestration Layer:** `content.js` running in the **ISOLATED** world to handle logic, filtering, and queuing via `window.postMessage`.

## Key Technical Decisions

### Resilient Selectors / Scraping
**Strictly banned.** We do not look for DOM buttons. We intercept the `/api/v1/friendships/` or `/graphql/query/` JSON responses.

### Authentication Pattern
To execute the unfollow action, the extension must extract the `csrftoken` from `document.cookie` and retrieve necessary application identifiers. The unfollow action is a **POST** request to:
```
https://www.instagram.com/web/friendships/{user_id}/unfollow/
```

### Anti-Ban Pattern
A strict queue system must be implemented. Unfollow requests must be spaced by `Math.random() * 10000 + 5000` milliseconds. Batching requests simultaneously is **strictly forbidden**.

### Data Parsing
The target dataset (`igtracker_dont_follow_back_2026-07-13.csv`) contains headers `username,full_name`. The filtering logic must check if the intercepted `username` exists in this whitelist before adding the numerical `user_id` to the unfollow execution queue.
