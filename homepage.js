// JavaScript for Smooth Scroll Down to the Background and Motivation Section
document.getElementById("scrollDownArrow1").addEventListener("click", function() {
    document.getElementById("backgroundForm").scrollIntoView({
        behavior: 'smooth'  // Smooth scrolling effect
    });
});

// JavaScript for Smooth Scroll Down to the Visualisation Purpose Section
document.getElementById("scrollDownArrow2").addEventListener("click", function() {
    document.getElementById("visualisationPurposeForm").scrollIntoView({
        behavior: 'smooth'  // Smooth scrolling effect
    });
});

// JavaScript to make the "Go Back Up" button appear when scrolling down
window.addEventListener('scroll', function() {
    const goBackUpButton = document.getElementById('goBackUpButton');
    
    if (window.scrollY > 100) {  // If the scroll position is greater than 100px
        goBackUpButton.style.display = 'block';  // Show the button
    } else {
        goBackUpButton.style.display = 'none';  // Hide the button if scrolled back to the top
    }
});

// Scroll back to the top when the "Go Back Up" button is clicked
document.getElementById('goBackUpButton').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'  // Smooth scroll to the top
    });
});
