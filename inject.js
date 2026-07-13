// inject.js - Runs in MAIN world
console.log("[Inject Script] Running in MAIN world, monkey-patching fetch/XHR...");

// Monkey-patch fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0] instanceof Request ? args[0].url : args[0];

    // Clone the response so we can read it without consuming the stream for the original caller
    const clone = response.clone();

    if (url && (url.includes('/api/v1/friendships/') || url.includes('graphql/query'))) {
        clone.json().then(data => {
            window.postMessage({ type: "FROM_INJECT_JS", payload: { url: url, data: data } }, "*");
        }).catch(err => {
            // Ignore JSON parse errors for non-JSON responses
        });
    }

    return response;
};

// Monkey-patch XMLHttpRequest
const originalXHR = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.addEventListener('load', function() {
        if (typeof url === 'string' && (url.includes('/api/v1/friendships/') || url.includes('graphql/query'))) {
            try {
                // Parse if response is text/json
                if (this.responseType === '' || this.responseType === 'text') {
                   const data = JSON.parse(this.responseText);
                   window.postMessage({ type: "FROM_INJECT_JS", payload: { url: url, data: data } }, "*");
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    });
    return originalXHR.call(this, method, url, ...rest);
};
