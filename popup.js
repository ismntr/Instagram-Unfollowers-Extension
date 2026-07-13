// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusText = document.getElementById('statusText');
    const targetCount = document.getElementById('targetCount');
    const processedCount = document.getElementById('processedCount');
    const csvUpload = document.getElementById('csvUpload');

    // Function to send messages to the active tab's content script
    function sendMessageToContent(action, payload, callback) {
        if (typeof payload === 'function') {
            callback = payload;
            payload = {};
        }
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes("instagram.com")) {
                const message = { action: action, ...payload };
                chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
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
        targetCount.textContent = state.targetSize || 0;
        processedCount.textContent = state.processedCount || 0;

        if (state.queuePaused) {
            statusText.textContent = "Paused (Rate Limit)";
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

    // CSV File Upload Listener
    csvUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const lines = text.split('\n');
            const importedTargets = [];
            
            // Assuming first column is username. Skip header if it exists.
            // We'll skip the first line just in case, typical for CSVs.
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const parts = line.split(',');
                    const username = parts[0].trim().replace(/^"|"$/g, ''); 
                    if (username) {
                        importedTargets.push(username);
                    }
                }
            }

            sendMessageToContent("IMPORT_TARGETS", { targets: importedTargets }, updateUI);
            
            // Provide feedback in the UI
            csvUpload.value = ''; // Reset input
            statusText.textContent = "CSV Loaded!";
            statusText.className = "status-running";
            setTimeout(pollStatus, 2000); // Revert status text after 2s
        };
        reader.readAsText(file);
    });
});
