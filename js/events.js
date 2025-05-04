// events.js - Events page specific functionality

document.addEventListener('DOMContentLoaded', function() {
    // Fetch events data
    fetchEvents();
    
    // Event filter functionality
    setupFilters();
});

/**
 * Fetch events data from JSON file
 */
function fetchEvents() {
    // Fetch from external JSON file
    fetch('data/events.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store events data globally so filters can access it
            window.eventsData = data;
            displayEvents(data, 'all');
        })
        .catch(error => {
            console.error('Error fetching events data:', error);
            document.getElementById('eventsContainer').innerHTML = createNoEventsMessage('Error loading events', 'There was a problem loading the events data. Please try again later.');
        });
}

/**
 * Display events based on filter
 * @param {Array} events - Array of event objects
 * @param {String} filter - Filter type ('all', 'current', 'upcoming', 'past')
 */
function displayEvents(events, filter) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    
    let filteredEvents;
    
    switch(filter) {
        case 'current':
            filteredEvents = events.filter(event => event.status === 'current');
            break;
        case 'upcoming':
            filteredEvents = events.filter(event => event.status === 'future');
            break;
        case 'past':
            filteredEvents = events.filter(event => event.status === 'past');
            break;
        default:
            filteredEvents = events;
    }
    
    if (filteredEvents.length === 0) {
        container.innerHTML = createNoEventsMessage('No events found', 'There are no events available for the selected filter. Please try another category.');
        return;
    }
    
    filteredEvents.forEach(event => {
        container.appendChild(createEventCard(event));
    });
}

/**
 * Create a message for when no events are found
 * @param {String} title - Message title
 * @param {String} message - Message content
 * @returns {String} HTML for no events message
 */
function createNoEventsMessage(title, message) {
    return `
        <div class="no-events">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Create an event card
 * @param {Object} event - Event data object
 * @returns {HTMLElement} Event card element
 */
/**
 * Set up event filter functionality
 */
function setupFilters() {
    // Get filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add click event to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value from data attribute
            const filterValue = this.getAttribute('data-filter');
            
            // Display events based on filter
            if (window.eventsData) {
                displayEvents(window.eventsData, filterValue);
            }
        });
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // Determine status badge class
    let statusClass = '';
    let statusText = '';
    
    switch(event.status) {
        case 'current':
            statusClass = 'status-current';
            statusText = 'Current';
            break;
        case 'past':
            statusClass = 'status-past';
            statusText = 'Past';
            break;
        case 'future':
            statusClass = 'status-future';
            statusText = 'Upcoming';
            break;
    }
    
    // Create registration button based on status
    let registrationButton = '';
    
    if (event.status === 'current' && event.registrationLink) {
        registrationButton = `
            <a href="${event.registrationLink}" target="_blank" class="register-btn">Register Now</a>
        `;
    } else if (event.status === 'future') {
        registrationButton = `
            <span class="register-btn disabled">Coming Soon</span>
        `;
    } else {
        registrationButton = `
            <span class="register-btn disabled">Closed</span>
        `;
    }
    
    // Build skills tags
    const skillsTags = event.skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    // Determine speaker image
    let speakerImage = '';
    if (event.speaker && event.speaker.image) {
        speakerImage = `<img src="${event.speaker.image}" alt="${event.speaker.name}">`;
    } else {
        speakerImage = '<i class="fas fa-user"></i>';
    }
    
    card.innerHTML = `
        <div class="event-banner">
            <div class="event-header">
                <h2 class="event-title">${event.eventName}</h2>
            </div>
            <span class="event-status ${statusClass}">${statusText}</span>
        </div>
        <div class="event-body">
            <p class="event-description">${event.description}</p>
            
            <div class="speaker-section">
                <div class="speaker-image">
                    ${speakerImage}
                </div>
                <div class="speaker-details">
                    <h3>${event.speaker.name}</h3>
                    <p>${event.speaker.profile}</p>
                    <div class="speaker-social">
                        <a href="${event.speaker.linkedin}" target="_blank"><i class="fab fa-linkedin"></i> View Profile</a>
                    </div>
                </div>
            </div>
            
            <div class="event-skills">
                ${skillsTags}
            </div>
            
            <div class="event-registration">
                <div class="registration-count">
                    <i class="fas fa-users"></i> ${event.noOfRegistrations} registrations
                </div>
                ${registrationButton}
            </div>
        </div>
    `;
    
    return card;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    // Function to perform search
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            // If search is empty, show all events based on current filter
            const activeFilter = document.querySelector('.filter-btn.active');
            const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            displayEvents(window.eventsData, filterValue);
            return;
        }
        
        // Filter events based on search term
        const searchResults = window.eventsData.filter(event => {
            // Search in event title
            if (event.eventName.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in speaker name
            if (event.speaker && event.speaker.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in skills (tags)
            if (event.skills && event.skills.some(skill => skill.toLowerCase().includes(searchTerm))) {
                return true;
            }
            
            // Search in description (optional)
            if (event.description.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            return false;
        });
        
        // Display search results
        displaySearchResults(searchResults, searchTerm);
    };
    
    // Search button click event
    searchButton.addEventListener('click', performSearch);
    
    // Enter key press in search input
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Display search results
 * @param {Array} results - Array of search result events
 * @param {String} searchTerm - The term that was searched
 */
function displaySearchResults(results, searchTerm) {
    const container = document.getElementById('eventsContainer');
    
    // Clear current events
    container.innerHTML = '';
    
    // Show search results info
    const resultsInfo = document.createElement('div');
    resultsInfo.className = 'search-results-info';
    
    if (results.length === 0) {
        // No results found
        container.appendChild(resultsInfo);
        container.innerHTML += createNoEventsMessage(
            'No matching events found',
            `We couldn't find any events matching "${searchTerm}". Please try a different search term.`
        );
    } else {
        // Show results count
        resultsInfo.textContent = `Found ${results.length} event${results.length !== 1 ? 's' : ''} matching "${searchTerm}"`;
        container.appendChild(resultsInfo);
        
        // Display each result
        results.forEach(event => {
            container.appendChild(createEventCard(event));
        });
    }
}

// Update the DOMContentLoaded event to include search setup
document.addEventListener('DOMContentLoaded', function() {
    // Fetch events data
    fetchEvents();
    
    // Event filter functionality
    setupFilters();
    
    // Setup search functionality
    setupSearch();
});

// Update the setupFilters function to reset search when a filter is clicked
function setupFilters() {
    // Get filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add click event to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Reset search input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value from data attribute
            const filterValue = this.getAttribute('data-filter');
            
            // Display events based on filter
            if (window.eventsData) {
                displayEvents(window.eventsData, filterValue);
            }
        });
    });
}