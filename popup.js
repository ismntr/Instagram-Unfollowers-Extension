// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusText = document.getElementById('statusText');
    const queueCount = document.getElementById('queueCount');
    const whitelistCount = document.getElementById('whitelistCount');

    // Function to send messages to the active tab's content script
    function sendMessageToContent(action, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes("instagram.com")) {
                chrome.tabs.sendMessage(tabs[0].id, { action: action }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Connection error:", chrome.runtime.lastError.message);
                        statusText.textContent = "Error: Refresh IG Page";
                        statusText.className = "status-stopped";
                        return;
                    }
                    if (callback && response) callback(response);
                });
            } else {
                statusText.textContent = "Not on Instagram";
                statusText.className = "status-stopped";
                startBtn.disabled = true;
            }
        });
    }

    // Update UI based on state
    function updateUI(state) {
        queueCount.textContent = state.queueLength || 0;
        whitelistCount.textContent = state.whitelistSize || 0;

        if (state.queuePaused) {
            statusText.textContent = "Rate Limited (Paused)";
            statusText.className = "status-paused";
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else if (state.isRunning) {
            statusText.textContent = "Running";
            statusText.className = "status-running";
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusText.textContent = "Stopped";
            statusText.className = "status-stopped";
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    // Polling function to keep stats updated while popup is open
    function pollStatus() {
        sendMessageToContent("GET_STATUS", updateUI);
    }

    // Initial status fetch
    pollStatus();
    
    // Poll every 1.5 seconds
    setInterval(pollStatus, 1500);

    // Event Listeners for buttons
    startBtn.addEventListener('click', () => {
        sendMessageToContent("START_QUEUE", updateUI);
    });

    stopBtn.addEventListener('click', () => {
        sendMessageToContent("STOP_QUEUE", updateUI);
    });
});
