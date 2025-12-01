// 🎯 Background Service Worker for Chrome Extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'open-modal') {
        // Send message to content script to open modal
        chrome.tabs.sendMessage(sender.tab.id, { action: 'open-modal' });
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ AI Assistant extension installed!');
});
