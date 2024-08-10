let lastExtractedText = '';
const extractionInterval = 2000; // 2 seconds

function extractText() {
    const currentText = document.body.innerText;
    if (currentText !== lastExtractedText) {
        lastExtractedText = currentText;
		chrome.runtime.sendMessage({
			action: "storeText",
			text: currentText,
			url: window.location.href
		});
    }
}

// Initial extraction
extractText();

// Set up a MutationObserver to watch for DOM changes
const observer = new MutationObserver(extractText);
observer.observe(document.body, { childList: true, subtree: true });

// Periodically check for changes as a fallback
setInterval(extractText, extractionInterval);

// Listen for navigation events
window.addEventListener('popstate', extractText);