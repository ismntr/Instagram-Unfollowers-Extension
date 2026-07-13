// content.js - Runs in ISOLATED world
console.log("[Content Script] Initializing ISOLATED world...");

// Inject the script into the MAIN world
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
    this.remove(); // Clean up after execution to keep DOM tidy
};
(document.head || document.documentElement).appendChild(script);

// Store captured users for processing
let capturedUsers = [];

// Whitelist and Queue State
let whitelist = new Set();
let isQueueRunning = false;
let queuePaused = false;

// Helper function to recursively search for user objects in unknown JSON structures
function extractUsersFromPayload(obj, extracted = []) {
    if (!obj || typeof obj !== 'object') return extracted;

    // Check if this object represents a user (typical Instagram payload structures)
    // REST API usually has 'pk' (primary key) and 'username'
    // GraphQL usually has 'id' and 'username'
    if (obj.username && (obj.pk || obj.id)) {
        // Exclude the currently logged-in user if they somehow appear, though unlikely in following lists
        extracted.push({
            id: obj.pk || obj.id,
            username: obj.username,
            full_name: obj.full_name || ''
        });
        return extracted; // Stop traversing this branch once we find a user object
    }

    // Recursively search arrays and objects
    if (Array.isArray(obj)) {
        for (const item of obj) {
            extractUsersFromPayload(item, extracted);
        }
    } else {
        for (const key in obj) {
            extractUsersFromPayload(obj[key], extracted);
        }
    }
    
    return extracted;
}

// Function to extract CSRF token from cookies
function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to get the Application ID (required by Instagram)
const IG_APP_ID = '936619743392459';

// Core Engine Function: Execute Unfollow POST Request
async function executeUnfollow(userId) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
        console.error("[Content Script] CSRF token not found. Are you logged in?");
        return { success: false, error: 'NO_CSRF_TOKEN' };
    }

    const url = `https://www.instagram.com/web/friendships/${userId}/unfollow/`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'X-IG-App-ID': IG_APP_ID,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*'
            }
        });

        if (response.status === 200) {
            console.log(`[Content Script] Successfully unfollowed user ID: ${userId}`);
            return { success: true, status: response.status };
        } else if (response.status === 429) {
            console.warn(`[Content Script] RATE LIMITED (429) for user ID: ${userId}. Execution must pause.`);
            return { success: false, error: 'RATE_LIMITED', status: 429 };
        } else {
            console.error(`[Content Script] Failed to unfollow user ID: ${userId}. Status: ${response.status}`);
            return { success: false, error: 'REQUEST_FAILED', status: response.status };
        }
    } catch (error) {
        console.error(`[Content Script] Network error while unfollowing user ID: ${userId}`, error);
        return { success: false, error: 'NETWORK_ERROR' };
    }
}

// Delay helper
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Core Engine Orchestrator
async function startQueue() {
    if (isQueueRunning) {
        console.log("[Content Script] Queue is already running.");
        return;
    }
    
    if (whitelist.size === 0) {
        console.warn("[Content Script] Warning: Starting queue with an empty whitelist! No users will be protected.");
    }

    isQueueRunning = true;
    console.log("[Content Script] Starting execution queue...");

    while (capturedUsers.length > 0 && isQueueRunning) {
        if (queuePaused) {
            // Check every 10 seconds if unpaused
            await delay(10000);
            continue;
        }

        const user = capturedUsers[0]; // Peek the first user
        
        if (whitelist.has(user.username)) {
            console.log(`[Content Script] SKIP: User ${user.username} is in the whitelist.`);
            capturedUsers.shift(); // Remove from queue
            continue;
        }
        
        console.log(`[Content Script] Action: Unfollowing ${user.username} (ID: ${user.id})...`);
        const result = await executeUnfollow(user.id);
        
        if (result.success) {
            capturedUsers.shift(); // Successfully unfollowed, remove from queue
            
            // Randomized delay between 5s and 15s
            const sleepTime = Math.floor(Math.random() * 10000) + 5000;
            console.log(`[Content Script] Sleeping for ${sleepTime}ms before next action...`);
            await delay(sleepTime);
        } else if (result.error === 'RATE_LIMITED') {
            console.warn("[Content Script] Rate limit hit. Pausing queue for 15 minutes.");
            queuePaused = true;
            // Exponential backoff or static 15-minute pause
            setTimeout(() => {
                queuePaused = false;
                console.log("[Content Script] Resuming queue after rate limit pause.");
            }, 15 * 60 * 1000); 
            // Don't remove the user from the queue, we'll retry them
        } else if (result.error === 'NO_CSRF_TOKEN') {
            console.error("[Content Script] Halting queue due to missing CSRF token.");
            isQueueRunning = false;
            break;
        } else {
            console.error(`[Content Script] Unhandled error for ${user.username}. Removing from queue to prevent infinite loop.`);
            capturedUsers.shift();
            await delay(5000); // 5s fallback delay on error
        }
    }
    
    isQueueRunning = false;
    if (capturedUsers.length === 0) {
        console.log("[Content Script] Queue execution finished: No more users in queue.");
    } else {
        console.log("[Content Script] Queue execution stopped manually.");
    }
}

function stopQueue() {
    isQueueRunning = false;
    console.log("[Content Script] Stopping execution queue...");
}

// Make functions accessible from the isolated context console for testing
window.startQueue = startQueue;
window.stopQueue = stopQueue;

// Listen for messages from the MAIN world inject.js
window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data && event.data.type === "FROM_INJECT_JS") {
        const payload = event.data.payload;
        console.log(`[Content Script] Intercepted network data from: ${payload.url}`);
        
        const extracted = extractUsersFromPayload(payload.data);
        if (extracted.length > 0) {
            console.log(`[Content Script] Extracted ${extracted.length} users from payload!`);
            
            // Add to our global list avoiding duplicates
            let newAdditions = 0;
            extracted.forEach(newUser => {
                if (!capturedUsers.find(u => u.id === newUser.id)) {
                    capturedUsers.push(newUser);
                    newAdditions++;
                }
            });
            
            if (newAdditions > 0) {
                console.log(`[Content Script] Added ${newAdditions} new users. Total captured users in queue: ${capturedUsers.length}`);
                console.table(capturedUsers.slice(-newAdditions)); // Log just the newly added ones for clean console
            }
        }
    }
}, false);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_STATUS") {
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            queueLength: capturedUsers.length,
            whitelistSize: whitelist.size
        });
    } else if (request.action === "START_QUEUE") {
        startQueue();
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            queueLength: capturedUsers.length,
            whitelistSize: whitelist.size
        });
    } else if (request.action === "STOP_QUEUE") {
        stopQueue();
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            queueLength: capturedUsers.length,
            whitelistSize: whitelist.size
        });
    } else if (request.action === "IMPORT_WHITELIST") {
        if (request.whitelist && Array.isArray(request.whitelist)) {
            // Clear existing whitelist and load the new one
            whitelist.clear();
            request.whitelist.forEach(username => whitelist.add(username));
            console.log(`[Content Script] Imported custom whitelist. Total size: ${whitelist.size}`);
        }
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            queueLength: capturedUsers.length,
            whitelistSize: whitelist.size
        });
    }
    return true; // Keep message channel open for async response if needed
});
