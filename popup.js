// Debounce function
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

// Search function
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm.length < 2) {
        document.getElementById('results').innerHTML = '<p>Please enter at least 2 characters to search.</p>';
        return;
    }

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Searching...</p>';

	chrome.storage.local.get(null, (items) => {
		let results = [];
		for (let url in items) {
			const content = items[url].text.toLowerCase();
			const index = content.indexOf(searchTerm);
			if (index !== -1) {
				results.push({
					url: url,
					preview: getPreview(items[url].text, index, searchTerm)
				});
			}
		}
		displayResults(results, searchTerm);
	});
}

// Debounced search function
const debouncedSearch = debounce(performSearch, 150);

// Event listeners
document.getElementById('searchInput').addEventListener('input', debouncedSearch);
document.getElementById('searchButton').addEventListener('click', performSearch);

function getPreview(content, index, searchTerm) {
    const previewLength = 100;
    const start = Math.max(0, index - previewLength / 2);
    const end = Math.min(content.length, index + searchTerm.length + previewLength / 2);
    return content.substring(start, end);
}

function displayResults(results, searchTerm) {
    const resultsDiv = document.getElementById('results');
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        resultsDiv.innerHTML = `<p>Found ${results.length} result(s):</p>`;
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            const highlightedPreview = highlightSearchTerm(result.preview, searchTerm);
            resultItem.innerHTML = `
                <a href="${result.url}" target="_blank" class="result-url">${result.url}</a>
                <div class="result-preview">${highlightedPreview}</div>
            `;
            resultsDiv.appendChild(resultItem);
        });
    }
}

function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(searchTerm, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}