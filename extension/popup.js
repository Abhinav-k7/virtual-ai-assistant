// Handle "Open Capture Now" button
document.getElementById('openCaptureBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'open-modal' });
        }
    });
});

// Handle "Settings" button
document.getElementById('settingsBtn').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    }
});
