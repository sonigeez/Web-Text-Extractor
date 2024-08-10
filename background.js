const textBuffer = new Map();
const flushInterval = 5000; // 5 seconds
const cleanupInterval = 3600000; // 1 hour
const dataRetentionPeriod = 86400000; // 24 hours in milliseconds

function flushBuffer() {
    if (textBuffer.size > 0) {
        const updates = Object.fromEntries(textBuffer);
        chrome.storage.local.set(updates).then(() => {
            console.log("Flushed", textBuffer.size, "updates to storage");
            textBuffer.clear();
        });
    }
}

function cleanupOldData() {
    const cutoffTime = Date.now() - dataRetentionPeriod;
    chrome.storage.local.get(null, (items) => {
        const itemsToRemove = [];
        for (let url in items) {
            if (items[url].timestamp < cutoffTime) {
                itemsToRemove.push(url);
            }
        }
        if (itemsToRemove.length > 0) {
            chrome.storage.local.remove(itemsToRemove, () => {
                console.log("Removed", itemsToRemove.length, "old items");
            });
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "storeText") {
        textBuffer.set(request.url, {
            text: request.text,
            timestamp: Date.now()
        });
    }
});

// Periodically flush the buffer to storage
setInterval(flushBuffer, flushInterval);

// Periodically clean up old data
setInterval(cleanupOldData, cleanupInterval);

// Initial cleanup when the extension starts
cleanupOldData();