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

async function resolveUsernameToId(username, retryCount = 0) {
    const url = `https://www.instagram.com/${username}/`;
    
    try {
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        if (response.status === 200) {
            const html = await response.text();
            
            // 1. Arama Yöntemi: Meta etiketlerinden ID'yi bulmak (En garantilisi)
            // <meta property="al:ios:url" content="instagram://user?username=kullanici&id=123456789" />
            const metaMatch = html.match(/instagram:\/\/user\?username=[^&]+&id=([0-9]+)/);
            if (metaMatch && metaMatch[1]) {
                return { success: true, id: metaMatch[1] };
            }
            
            // 2. Arama Yöntemi: JSON veri bloklarının içinden bulmak
            const profileMatch = html.match(/"profilePage_([0-9]+)"/);
            if (profileMatch && profileMatch[1]) {
                return { success: true, id: profileMatch[1] };
            }
            
            const userMatch = html.match(/"user_id":"([0-9]+)"/);
            if (userMatch && userMatch[1]) {
                return { success: true, id: userMatch[1] };
            }

            return { success: false, error: 'USER_NOT_FOUND_IN_HTML' };
        } else if (response.status === 429) {
            if (retryCount < 3) {
                const waitTime = Math.pow(2, retryCount) * 5000;
                console.warn(`[Content Script] Instagram HTML sayfası için Rate Limit verdi. ${waitTime}ms bekleniyor...`);
                await delay(waitTime);
                return await resolveUsernameToId(username, retryCount + 1);
            }
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

async function executeUnfollow(userId, username) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) return { success: false, error: 'NO_CSRF_TOKEN' };

    const strategies = [
        {
            name: 'v1_destroy',
            url: `https://www.instagram.com/api/v1/friendships/destroy/${userId}/`,
        },
        {
            name: 'web_unfollow',
            url: `https://www.instagram.com/web/friendships/${userId}/unfollow/`,
        }
    ];

    for (const strategy of strategies) {
        try {
            const response = await fetch(strategy.url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'X-IG-App-ID': IG_APP_ID,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*'
                }
            });

            const bodyText = await response.text();

            if (response.status === 200) {
                // Check if Instagram returned HTML instead of JSON (= session expired / login redirect)
                if (bodyText.trimStart().startsWith('<!DOCTYPE') || bodyText.trimStart().startsWith('<html')) {
                    console.error(`[Content Script] 🔒 SESSION EXPIRED! Instagram returned a login page instead of processing the unfollow. You need to refresh the Instagram page and make sure you're logged in.`);
                    return { success: false, error: 'SESSION_EXPIRED' };
                }

                try {
                    const data = JSON.parse(bodyText);
                    if (data && data.status === 'ok') {
                        return { success: true, strategy: strategy.name };
                    } else {
                        console.warn(`[Content Script] ⚠️ [${strategy.name}] ${username}: HTTP 200 but status not ok. Response: ${bodyText.substring(0, 200)}`);
                    }
                } catch (e) {
                    console.warn(`[Content Script] ⚠️ [${strategy.name}] ${username}: HTTP 200 but not JSON. Body: ${bodyText.substring(0, 200)}`);
                }
            } else if (response.status === 429) {
                return { success: false, error: 'RATE_LIMITED' };
            } else {
                console.error(`[Content Script] ❌ [${strategy.name}] ${username} (ID: ${userId}): HTTP ${response.status}. Response: ${bodyText.substring(0, 300)}`);
                if (response.status === 400) continue;
                return { success: false, error: `HTTP_${response.status}` };
            }
        } catch (error) {
            console.error(`[Content Script] ❌ [${strategy.name}] ${username}: Network error: ${error.message}`);
            continue;
        }
    }

    return { success: false, error: 'ALL_STRATEGIES_FAILED' };
}

async function checkSession() {
    const csrfToken = getCsrfToken();
    const cookies = document.cookie;
    const hasSessionId = cookies.includes('sessionid=');
    
    console.log(`[Content Script] 🔍 Session Check: csrftoken=${csrfToken ? 'YES' : 'NO'}, sessionid=${hasSessionId ? 'YES' : 'NO'}`);
    
    if (!csrfToken || !hasSessionId) {
        console.error(`[Content Script] 🔒 SESSION CHECK FAILED: Missing ${!csrfToken ? 'csrftoken' : 'sessionid'} cookie. You are not logged in.`);
        return false;
    }
    
    // Real API test: check if we can reach a simple authenticated endpoint
    try {
        const testResponse = await fetch('https://www.instagram.com/api/v1/web/accounts/current_user/', {
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrfToken,
                'X-IG-App-ID': IG_APP_ID,
                'Accept': '*/*'
            }
        });
        const testBody = await testResponse.text();
        
        if (testBody.trimStart().startsWith('<!DOCTYPE') || testBody.trimStart().startsWith('<html')) {
            console.error(`[Content Script] 🔒 SESSION CHECK FAILED: Instagram returned a login page. Your session is expired. Please log out, log back in, and refresh the page.`);
            return false;
        }
        
        if (testResponse.status === 200) {
            try {
                const data = JSON.parse(testBody);
                if (data && data.status === 'ok' && data.user) {
                    console.log(`[Content Script] ✅ Session is valid! Logged in as: ${data.user.username}`);
                    return true;
                }
            } catch(e) {}
        }
        
        console.error(`[Content Script] 🔒 SESSION CHECK FAILED: Unexpected response (HTTP ${testResponse.status}). Body: ${testBody.substring(0, 200)}`);
        return false;
    } catch (e) {
        console.error(`[Content Script] 🔒 SESSION CHECK FAILED: Network error: ${e.message}`);
        return false;
    }
}

async function startQueue() {
    if (isQueueRunning) return;
    if (targetList.length === 0) {
        console.warn("[Content Script] Target list is empty.");
        return;
    }

    // Pre-flight session check
    const sessionValid = await checkSession();
    if (!sessionValid) {
        console.error("[Content Script] 🔒 ENGINE CANNOT START: Session is not valid. Fix the login issue above and try again.");
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
            
            // 2. Wait 2 seconds between profile fetch and unfollow
            await delay(2000);
            
            // 3. Unfollow
            const unfollowResult = await executeUnfollow(userId, username);
            
            if (unfollowResult.success) {
                targetList.shift();
                processedCount++;
                
                // 4. Random delay (15 - 30 seconds)
                const sleepTime = Math.floor(Math.random() * 15000) + 15000;
                const total = processedCount + targetList.length;
                
                console.log(`[Content Script] ✅ [${processedCount}/${total}] Unfollowed: ${username} (Sleeping ${(sleepTime/1000).toFixed(1)}s...)`);
                
                await delay(sleepTime);
                
            } else if (unfollowResult.error === 'RATE_LIMITED') {
                console.error(`[Content Script] ❌ RATE LIMIT ERROR while unfollowing ${username}. Instagram returned 429 Too Many Requests. Action: Pausing queue for 15 minutes to prevent account ban.`);
                queuePaused = true;
                setTimeout(() => { queuePaused = false; }, 15 * 60 * 1000);
            } else if (unfollowResult.error === 'SESSION_EXPIRED' || unfollowResult.error === 'NO_CSRF_TOKEN') {
                console.error(`[Content Script] 🔒 ENGINE STOPPED: Your Instagram session has expired. Please refresh the Instagram page (F5), make sure you're logged in, then re-upload your CSV and click Start again.`);
                isQueueRunning = false;
                return;
            } else {
                console.error(`[Content Script] ❌ UNFOLLOW FAILED for ${username} (ID: ${userId}). Error Code: ${unfollowResult.error}. Action: Skipping to next user in 5s.`);
                targetList.shift(); 
                await delay(5000);
            }
            
        } else if (resolveResult.error === 'RATE_LIMITED') {
            console.error(`[Content Script] ❌ RATE LIMIT ERROR while fetching profile for ${username}. Instagram returned 429 Too Many Requests. Action: Pausing queue for 15 minutes to prevent account ban.`);
            queuePaused = true;
            setTimeout(() => { queuePaused = false; }, 15 * 60 * 1000);
        } else if (resolveResult.error === 'USER_NOT_FOUND' || resolveResult.error === 'USER_NOT_FOUND_IN_HTML') {
            console.warn(`[Content Script] ⚠️ SKIPPED: ${username} not found. They might have changed their username or deleted their account.`);
            targetList.shift();
            processedCount++; 
            await delay(2000);
        } else {
            console.error(`[Content Script] ❌ RESOLVE FAILED for ${username}. Error Code: ${resolveResult.error}. Could not extract numeric ID from HTML. Action: Skipping to next user in 5s.`);
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
