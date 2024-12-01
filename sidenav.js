// Get the sidenav, dropdown, and sidebar icon elements
const sidenav = document.getElementById('mySidenav');
const sideNavIcon = document.getElementById('sidebarIcon');
const overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

// Function to toggle Sidenav
function toggleSidenav() {
    const isOpen = sidenav.classList.toggle('open'); // Toggle "open" class
    overlay.style.display = isOpen ? 'block' : 'none'; // Show or hide the overlay
    document.body.style.overflow = isOpen ? 'hidden' : ''; // Prevent scrolling when sidenav is open
}

// Function to close Sidenav
function closeSidenav() {
    sidenav.classList.remove('open'); // Remove "open" class
    overlay.style.display = 'none'; // Hide the overlay
    document.body.style.overflow = ''; // Allow scrolling
}

// Function to toggle dropdown and arrow icon
function toggleDropdown() {
    const dropdownContainer = document.querySelector('.dropdown-container');
    const dropdownBtn = document.querySelector('.dropdown-btn');

    // Get the computed style of dropdownContainer
    const isVisible = window.getComputedStyle(dropdownContainer).display === 'block';

    // Toggle dropdown visibility
    dropdownContainer.style.display = isVisible ? 'none' : 'block';

    // Update arrow direction
    dropdownBtn.innerHTML = isVisible 
        ? 'Visualisations &#11166;' // Right arrow
        : 'Visualisations &#11167;'; // Down arrow
}


// Close sidenav when clicking on the overlay
overlay.addEventListener('click', closeSidenav);
