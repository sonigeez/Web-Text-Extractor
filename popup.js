// // Debounce function
// function debounce(func, delay) {
//     let debounceTimer;
//     return function() {
//         const context = this;
//         const args = arguments;
//         clearTimeout(debounceTimer);
//         debounceTimer = setTimeout(() => func.apply(context, args), delay);
//     }
// }

// // Search function
// function performSearch() {
//     const searchTerm = document.getElementById('searchInput').value.toLowerCase();
//     if (searchTerm.length < 2) {
//         document.getElementById('results').innerHTML = '<p>Please enter at least 2 characters to search.</p>';
//         return;
//     }

//     const resultsDiv = document.getElementById('results');
//     resultsDiv.innerHTML = '<p>Searching...</p>';

// 	chrome.storage.local.get(null, (items) => {
// 		let results = [];
// 		for (let url in items) {
// 			const content = items[url].text.toLowerCase();
// 			const index = content.indexOf(searchTerm);
// 			if (index !== -1) {
// 				results.push({
// 					url: url,
// 					preview: getPreview(items[url].text, index, searchTerm)
// 				});
// 			}
// 		}
// 		displayResults(results, searchTerm);
// 	});
// }

// // Debounced search function
// const debouncedSearch = debounce(performSearch, 150);

// // Event listeners
// document.getElementById('searchInput').addEventListener('input', debouncedSearch);
// document.getElementById('searchButton').addEventListener('click', performSearch);

// function getPreview(content, index, searchTerm) {
//     const previewLength = 100;
//     const start = Math.max(0, index - previewLength / 2);
//     const end = Math.min(content.length, index + searchTerm.length + previewLength / 2);
//     return content.substring(start, end);
// }

// function displayResults(results, searchTerm) {
//     const resultsDiv = document.getElementById('results');
//     if (results.length === 0) {
//         resultsDiv.innerHTML = '<p>No results found.</p>';
//     } else {
//         resultsDiv.innerHTML = `<p>Found ${results.length} result(s):</p>`;
//         results.forEach(result => {
//             const resultItem = document.createElement('div');
//             resultItem.className = 'result-item';
//             const highlightedPreview = highlightSearchTerm(result.preview, searchTerm);
//             resultItem.innerHTML = `
//                 <a href="${result.url}" target="_blank" class="result-url">${result.url}</a>
//                 <div class="result-preview">${highlightedPreview}</div>
//             `;
//             resultsDiv.appendChild(resultItem);
//         });
//     }
// }

// function highlightSearchTerm(text, searchTerm) {
//     const regex = new RegExp(searchTerm, 'gi');
//     return text.replace(regex, match => `<span class="highlight">${match}</span>`);
// }



let fuse;

// Debounce function (keep this as is)
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

// Initialize Fuse with the stored data
function initializeFuse(items) {
    const documents = Object.entries(items).map(([url, data]) => ({
        url: url,
        content: data.text
    }));

    const options = {
        keys: ['content'],
        includeScore: true,
        threshold: 0.3,
        ignoreLocation: true
    };

    fuse = new Fuse(documents, options);
}

// Perform fuzzy search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm.length < 2) {
        document.getElementById('results').innerHTML = '<p>Please enter at least 2 characters to search.</p>';
        return;
    }

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Searching...</p>';

    const searchResults = fuse.search(searchTerm);
    displayResults(searchResults, searchTerm);
}

// Display results
function displayResults(results, searchTerm) {
    const resultsDiv = document.getElementById('results');
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        resultsDiv.innerHTML = `<p>Found ${results.length} result(s):</p>`;
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            const preview = getPreview(result.item.content, result.item.content.indexOf(searchTerm), searchTerm);
            const highlightedPreview = highlightSearchTerm(preview, searchTerm);
            resultItem.innerHTML = `
                <a href="${result.item.url}" target="_blank" class="result-url">${result.item.url}</a>
                <div class="result-preview">${highlightedPreview}</div>
            `;
            resultsDiv.appendChild(resultItem);
        });
    }
}

// Get preview (keep this as is)
function getPreview(content, index, searchTerm) {
    const previewLength = 100;
    const start = Math.max(0, index - previewLength / 2);
    const end = Math.min(content.length, index + searchTerm.length + previewLength / 2);
    return content.substring(start, end);
}

// Highlight search term (keep this as is)
function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(searchTerm, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

// Initialize the extension
function initialize() {
    chrome.storage.local.get(null, (items) => {
        initializeFuse(items);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', initialize);
document.getElementById('searchInput').addEventListener('input', debounce(performSearch, 300));

// Refresh data periodically
setInterval(initialize, 60000); // Refresh every minute