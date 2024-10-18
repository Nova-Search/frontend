const searchForm = document.getElementById('searchForm');
const resultsDiv = document.getElementById('results');
const paginationUl = document.getElementById('pagination');
const resultsInfoDiv = document.createElement('div');
resultsInfoDiv.id = 'resultsInfo';
resultsDiv.parentNode.insertBefore(resultsInfoDiv, resultsDiv);
const itemsPerPage = 15;
let currentPage = 1;
let searchResults = [];
let startTime = null;

// Extract query parameter from URL
const urlParams = new URLSearchParams(window.location.search);
const queryParam = urlParams.get('q');

if (queryParam) {
    document.getElementById('query').value = queryParam;
    searchForm.dispatchEvent(new Event('submit'));
}

// Create ghost result elements
function createGhostResults(count) {
    let ghostHTML = '';
    for (let i = 0; i < count; i++) {
        ghostHTML += `
            <div class="result-wrapper ghost-result">
                <div class="result-container">
                    <div class="ghost-line"></div>
                    <div class="ghost-line"></div>
                    <div class="ghost-line"></div>
                </div>
            </div>
        `;
    }
    return ghostHTML;
}


searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    startTime = Date.now(); // Record start time
    const query = document.getElementById('query').value;
    resultsDiv.innerHTML = createGhostResults(itemsPerPage); // Show ghost results
    paginationUl.innerHTML = '';
    resultsInfoDiv.innerHTML = ''; // Clear previous results info

    try {
        const response = await fetch(`http://127.0.0.1:8000/search?query=${query}`);

        if (response.status === 429) {
            resultsDiv.innerHTML = '<p>Too many requests. Please try again later.</p>';
            return;
        }

        searchResults = await response.json();
        currentPage = 1;
        displayResults();
        setupPagination();

        const endTime = Date.now();
        const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds
        resultsInfoDiv.textContent = `${searchResults.length} results found in ${elapsedTime.toFixed(2)} seconds.`;

    } catch (error) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        resultsInfoDiv.innerHTML = ''; // Clear results info on error
    }
});

function displayResults() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedResults = searchResults.slice(start, end);

    resultsDiv.innerHTML = paginatedResults.map(result => `
                <div class="result-wrapper">
                    <div class="result-container">
                        <a href="${result.url}" target="_blank">
                            ${result.favicon_id ? (result.favicon_type === 'svg' ?
            `<object class="favicon" type="image/svg+xml" data="http://127.0.0.1:8000/favicon/${result.favicon_id}"></object>` :
            `<img class="favicon" src="http://127.0.0.1:8000/favicon/${result.favicon_id}">`) : ''}
                            ${result.title || "<i class='text-muted'>No title available</i>"}
                        </a>
                        <p class="text-muted small">${result.url}</p>
                        <p class="description">${result.description || "<i class='text-muted'>We'd show you a description but sadly this site hasn't provided us with one :(</i>"}</p>
                    </div>
                    <div class="feedback-buttons">
                        <button class="thumbs-up" data-url="${result.url}">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <button class="thumbs-down" data-url="${result.url}">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                </div>
            `).join('');

    setupFeedbackButtons();
}

function setupFeedbackButtons() {
    document.querySelectorAll('.thumbs-up, .thumbs-down').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            event.preventDefault();

            const url = button.getAttribute('data-url');
            const isThumbsUp = button.classList.contains('thumbs-up');
            const endpoint = isThumbsUp
                ? 'http://127.0.0.1:8000/quality/rateresult/good'
                : 'http://127.0.0.1:8000/quality/rateresult/bad';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (response.ok) {
                    button.parentElement.innerHTML = ':)';
                } else {
                    button.parentElement.innerHTML = ':(';
                    console.error('Failed to update priority:', response.statusText);
                }
            } catch (error) {
                console.error('Error updating priority:', error);
            }
        });
    });
}

function setupPagination() {
    const pageCount = Math.ceil(searchResults.length / itemsPerPage);
    const screenWidth = window.innerWidth;
    let maxPagesToShow = Math.floor(screenWidth / 50); // Assuming each page item takes ~50px
    maxPagesToShow = Math.max(3, maxPagesToShow); // Ensure at least 3 pages are shown
    maxPagesToShow = Math.min(10, maxPagesToShow); // Ensure no more than 10 pages are shown

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const createPageItem = (page, text = page) => {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (page === currentPage) {
            li.classList.add('active');
        }
        li.innerHTML = `<a class="page-link" href="#">${text}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = page;
            displayResults();
            setupPagination();
        });
        return li;
    };

    const createDisabledPageItem = (text) => {
        const li = document.createElement('li');
        li.classList.add('page-item', 'disabled');
        li.innerHTML = `<a class="page-link" href="#">${text}</a>`;
        return li;
    };

    const fragment = document.createDocumentFragment();

    // Always show the < button, even if on the first page (disable it instead)
    if (currentPage > 1) {
        fragment.appendChild(createPageItem(currentPage - 1, '<'));
    } else {
        fragment.appendChild(createDisabledPageItem('<'));
    }

    // Render visible page numbers
    for (let i = startPage; i <= endPage; i++) {
        fragment.appendChild(createPageItem(i));
    }

    // Always show the > button, even if on the last page (disable it instead)
    if (currentPage < pageCount) {
        fragment.appendChild(createPageItem(currentPage + 1, '>'));
    } else {
        fragment.appendChild(createDisabledPageItem('>'));
    }

    // Only show First and Last on larger screens when more space is available
    const isMobileVertical = screenWidth < 480;
    if (!isMobileVertical && maxPagesToShow > 5) {
        if (currentPage > 1) {
            fragment.prepend(createPageItem(1, 'First'));
        } else {
            fragment.prepend(createDisabledPageItem('First'));
        }

        if (currentPage < pageCount) {
            fragment.appendChild(createPageItem(pageCount, 'Last'));
        } else {
            fragment.appendChild(createDisabledPageItem('Last'));
        }
    }

    paginationUl.innerHTML = '';
    paginationUl.appendChild(fragment);
}