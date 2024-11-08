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
    setTimeout(() => {
        searchForm.dispatchEvent(new Event('submit'));
    }, 0);
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
    startTime = Date.now();
    const query = document.getElementById('query').value.trim();
    
    // Update URL with search query without page refresh
    const newUrl = new URL(window.location);
    if (query) {
        newUrl.searchParams.set('q', query);
    } else {
        newUrl.searchParams.delete('q');
    }
    history.pushState({}, '', newUrl);

    resultsDiv.innerHTML = createGhostResults(itemsPerPage);
    paginationUl.innerHTML = '';
    resultsInfoDiv.innerHTML = '';

    if (!query) {
        resultsDiv.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }

    document.getElementById('searchContainer').classList.add('searched');

    try {
        const response = await fetch(`https://api.novasearch.xyz/search?query=${query}`);

        if (response.status === 429) {
            resultsDiv.innerHTML = "<div class='result-wrapper'><div class='result-container information-container'><h2>Slow down!</h2><p>Our servers have automatically blocked you for sending too many requests to our servers. This may be caused by an automation tool, malware on your computer, a malicious device on your network, or spam refreshing the search page (please stop).</p></div></div>";
            return;
        }

        if (response.status === 500) {
            resultsDiv.innerHTML = "<div class='result-wrapper'><div class='result-container information-container'><h2>Uh oh</h2><p>We're sorry, something went wrong with our server while searching for results, please try again later.</p></div></div>";
            return;
        }

        const data = await response.json();
        if (data.detail === "No results found.") {
            searchResults = [];
            resultsInfoDiv.textContent = `0 results found in ${(Date.now() - startTime) / 1000}s.`;
            // No results from the API, but continue to check for recaptures/apps
        } else {
            searchResults = Array.isArray(data) ? data : [];
            currentPage = 1;
            displayResults();
            setupPagination();

            const elapsedTime = (Date.now() - startTime) / 1000;
            resultsInfoDiv.textContent = `${searchResults.length} results found in ${elapsedTime.toFixed(2)} seconds.`;
        }
    } catch (error) {
        if (!navigator.onLine) {
            resultsDiv.innerHTML = "<div class='result-wrapper'><div class='result-container information-container'><h2>Offline</h2><p>It looks like you're offline. Please check your internet connection and try again.</p></div></div>";
        } else {
            resultsDiv.innerHTML = "<div class='result-wrapper'><div class='result-container information-container'><h2>Uh oh</h2><p>We're sorry, something went wrong while searching for results, please check your internet connection or try again later.</p></div></div>";
        }
        resultsInfoDiv.innerHTML = '';
        return; // Exit the function to prevent further execution
    }

    // Continue to check for recaptures/apps even if API returned no results
    displayResults(); 
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function displayUpdate() {
    const resultsDiv = document.getElementById('container-fluid');
    resultsDiv.innerHTML += `
            <div class="result-container">
                <h1 style="text-align: center; font-size: 30px;">Got time to give us feedback?</h1>
                <p style="text-align: center;">We'd love to hear what you have to say about Nova Search. If you've got a few minutes, please take the time to fill out <a href='https://forms.gle/znfiSbfnKNSf1DQu7'>this form</a>!</p>
            </div>
    `;
}

window.addEventListener('load', () => {
    if (!navigator.onLine) {
        resultsDiv.innerHTML += "<div class='result-wrapper'><div class='result-container information-container'><h2>Offline</h2><p>It looks like you're offline. Please check your internet connection and try again.</p></div></div>";
    }

    if (!getCookie('hasSeenFeedbackForm')) {
        displayUpdate();
        setCookie('hasSeenFeedbackForm', 'true', 365);
    }

    const icon = document.getElementById('icon');
    if (icon) {
        const updateIconColor = () => {
            icon.setAttribute('fill', prefersDarkScheme.matches ? 'white' : 'black');
        };

        updateIconColor(); // Set initial color
        prefersDarkScheme.addEventListener('change', updateIconColor); // Update color on theme change
    }
});

async function fetchRecaptures() {
    const response = await fetch('assets/recaptures.json');
    return response.json();
}

async function fetchApps() {
    const response = await fetch('/apps/apps.json');
    return response.json();
}

async function displayResults() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const results = Array.isArray(searchResults) ? searchResults : [];
    const paginatedResults = results.slice(start, end);
    const query = document.getElementById('query').value.toLowerCase().trim();
    const recaptures = await fetchRecaptures();
    const apps = await fetchApps();
    const matchingRecapture = recaptures.find(recapture =>
        recapture.keywords.split(', ').includes(query)
    );
    const matchingApp = apps.find(app =>
        app.keywords.split(', ').some(keyword => query.includes(keyword))
    );

    // Right panel content (always show if matches exist)
    let rightPanelHTML = '';
    if (matchingRecapture) {
        rightPanelHTML += `
            <div class="result-wrapper">
                <div class="result-container information-container">
                    <h2>${matchingRecapture.title}</h2>
                    <p>${matchingRecapture.description}</p>
                </div>
            </div>
        `;
    }
    if (matchingApp) {
        rightPanelHTML += `
            <div class="result-wrapper">
                <div class="app">
                    <iframe src="${matchingApp.src}?query=${encodeURIComponent(query.split(' ').slice(1).join(' '))}" width="100%" height="355px;" frameborder="0"></iframe>
                </div>
            </div>
        `;
    }
    document.getElementById('rightPanel').innerHTML = rightPanelHTML;

    // Main results
    let resultsHTML = '';
    if (paginatedResults.length > 0) {
        resultsHTML = paginatedResults.map(result => {
            const description = result.description || "<i class='text-muted'>Description not available.</i>";
            const truncatedDescription = description.length > 180 ? description.substring(0, 180) + '...' : description;
            return `
                <div class="result-wrapper">
                    <div class="result-container">
                        <a href="${result.url}" target="_blank">
                            ${result.favicon_id ? (result.favicon_type === 'svg' ?
                                `<object class="favicon" type="image/svg+xml" data="https://api.novasearch.xyz/favicon/${result.favicon_id}"></object>` :
                                `<img class="favicon" src="https://api.novasearch.xyz/favicon/${result.favicon_id}">`) : ''}
                            ${result.title || "<i class='text-muted'>No title available</i>"}
                        </a>
                        <p class="text-muted small">${result.url}</p>
                        <p class="description">${truncatedDescription}</p>
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
            `;
        }).join('');
    } else {
        resultsHTML = "<div class='result-wrapper'><div class='result-container information-container'><h2>No results</h2><p>Try searching for something less specific.</p></div></div>";
    }
    
    resultsDiv.innerHTML = resultsHTML;
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
                ? 'https://api.novasearch.xyz/quality/rateresult/good'
                : 'https://api.novasearch.xyz/quality/rateresult/bad';

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

function setPWAColor(color) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
    } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = color;
        document.head.appendChild(meta);
    }
}

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function updatePWAColor() {
    setPWAColor(prefersDarkScheme.matches ? '#252525' : '#f8f9fa');
}

prefersDarkScheme.addEventListener('change', updatePWAColor);
window.addEventListener('load', updatePWAColor);

window.addEventListener('load', () => {
    setTimeout(updatePWAColor, 500);
});

// Add to window load event
window.addEventListener('load', () => {
    // Remove 'searched' class if no search query
    if (!document.getElementById('query').value) {
        document.getElementById('searchContainer').classList.remove('searched');
    }
});

document.getElementById('logoLink').addEventListener('click', function (e) {
    e.preventDefault();

    // Clear the search input but keep the search bar visible
    const searchInput = document.getElementById('query');
    if (searchInput) {
        searchInput.value = '';
    }

    // Remove the search parameter from URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('q');
    history.pushState({}, '', newUrl);

    // Remove the 'searched' class to reverse the animation
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) {
        searchContainer.classList.remove('searched');
        // Clear resultsInfo content
        const resultsInfoInContainer = searchContainer.querySelector('#resultsInfo');
        if (resultsInfoInContainer) {
            resultsInfoInContainer.textContent = '';
            resultsInfoInContainer.innerHTML = '';
        }
    }

    // Clear resultsInfo content using multiple methods
    const resultsInfo = document.getElementById('resultsInfo');
    if (resultsInfo) {
        resultsInfo.textContent = '';
        resultsInfo.innerHTML = '';
    }

    // Clear main content area
    const mainContent = document.querySelector('.container-fluid');
    if (mainContent) {
        const resultsElements = mainContent.querySelectorAll('#resultsInfo');
        resultsElements.forEach(el => {
            el.textContent = '';
            el.innerHTML = '';
        });
    }

    // Clear other result elements
    ['results', 'pagination', 'rightPanel'].forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '';
        }
    });

    // Ensure search form stays visible and centered
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.style.display = 'flex';
    }
});