// content.js
console.log("[Content Script] Initializing CSV-to-Unfollow Engine...");

let targetList = []; // Array of usernames from CSV
let processedCount = 0; // How many we have successfully processed
let isQueueRunning = false;
let queuePaused = false;
const IG_APP_ID = '936619743392459';

function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function resolveUsernameToId(username) {
    console.log(`[Content Script] Resolving ID for username: ${username}`);
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'X-IG-App-ID': IG_APP_ID,
                'X-CSRFToken': getCsrfToken(),
                'Accept': '*/*'
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            if (data && data.data && data.data.user) {
                return { success: true, id: data.data.user.id };
            }
            return { success: false, error: 'USER_NOT_FOUND' };
        } else if (response.status === 429) {
            return { success: false, error: 'RATE_LIMITED' };
        } else if (response.status === 404) {
            return { success: false, error: 'USER_NOT_FOUND' };
        }
        return { success: false, error: `HTTP_${response.status}` };
    } catch (e) {
        console.error(`[Content Script] Fetch error for ${username}:`, e);
        return { success: false, error: 'NETWORK_ERROR' };
    }
}

async function executeUnfollow(userId) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) return { success: false, error: 'NO_CSRF_TOKEN' };

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
            return { success: true };
        } else if (response.status === 429) {
            return { success: false, error: 'RATE_LIMITED' };
        }
        return { success: false, error: `HTTP_${response.status}` };
    } catch (error) {
        return { success: false, error: 'NETWORK_ERROR' };
    }
}

async function startQueue() {
    if (isQueueRunning) return;
    if (targetList.length === 0) {
        console.warn("[Content Script] Target list is empty.");
        return;
    }

    isQueueRunning = true;
    console.log("[Content Script] Engine started...");

    while (targetList.length > 0 && isQueueRunning) {
        if (queuePaused) {
            await delay(10000);
            continue;
        }

        const username = targetList[0];
        
        // 1. Resolve ID
        const resolveResult = await resolveUsernameToId(username);
        
        if (resolveResult.success) {
            const userId = resolveResult.id;
            console.log(`[Content Script] Found ID for ${username}: ${userId}. Unfollowing...`);
            
            // 2. Wait 2 seconds between profile fetch and unfollow to simulate realistic delay
            await delay(2000);
            
            // 3. Unfollow
            const unfollowResult = await executeUnfollow(userId);
            
            if (unfollowResult.success) {
                console.log(`[Content Script] Successfully unfollowed: ${username}`);
                targetList.shift();
                processedCount++;
                
                // 4. Random delay (5 - 15 seconds)
                const sleepTime = Math.floor(Math.random() * 10000) + 5000;
                console.log(`[Content Script] Sleeping for ${sleepTime}ms...`);
                await delay(sleepTime);
                
            } else if (unfollowResult.error === 'RATE_LIMITED') {
                console.warn("[Content Script] RATE LIMITED during unfollow. Pausing for 15 mins.");
                queuePaused = true;
                setTimeout(() => { queuePaused = false; }, 15 * 60 * 1000);
            } else {
                console.error(`[Content Script] Unfollow failed for ${username}: ${unfollowResult.error}`);
                targetList.shift(); // skip to next
                await delay(5000);
            }
            
        } else if (resolveResult.error === 'RATE_LIMITED') {
            console.warn("[Content Script] RATE LIMITED during ID resolution. Pausing for 15 mins.");
            queuePaused = true;
            setTimeout(() => { queuePaused = false; }, 15 * 60 * 1000);
        } else if (resolveResult.error === 'USER_NOT_FOUND') {
            console.log(`[Content Script] User ${username} not found (maybe changed name or deleted). Skipping.`);
            targetList.shift();
            processedCount++; // count as processed so progress bar moves
            await delay(2000);
        } else {
            console.error(`[Content Script] Failed to resolve ${username}: ${resolveResult.error}`);
            targetList.shift();
            await delay(5000);
        }
    }
    
    isQueueRunning = false;
    console.log("[Content Script] Engine stopped.");
}

function stopQueue() {
    isQueueRunning = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_STATUS") {
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            targetSize: targetList.length,
            processedCount: processedCount
        });
    } else if (request.action === "START_QUEUE") {
        startQueue();
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            targetSize: targetList.length,
            processedCount: processedCount
        });
    } else if (request.action === "STOP_QUEUE") {
        stopQueue();
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            targetSize: targetList.length,
            processedCount: processedCount
        });
    } else if (request.action === "IMPORT_TARGETS") {
        if (request.targets && Array.isArray(request.targets)) {
            targetList = [...request.targets];
            processedCount = 0;
            console.log(`[Content Script] Loaded ${targetList.length} targets.`);
        }
        sendResponse({
            isRunning: isQueueRunning,
            queuePaused: queuePaused,
            targetSize: targetList.length,
            processedCount: processedCount
        });
    }
    return true;
});
