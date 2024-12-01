// Define the regions and their filters
const regions = [
    { name: "All OECD Countries", filter: "OECD" },
    { name: "OECD Europe", filter: "OECD EU" },
    { name: "OECD Asia", filter: "OECD Asia" },
    { name: "OECD Eurasia", filter: "Other Eurasia" }
];

// Set up event listener for the year filter
document.getElementById("yearFilter").addEventListener("change", function () {
    selectedYear = parseInt(this.value); // Update selected year based on user selection
    updatePlasticData(); // Update data whenever the year changes
});

// Function to load the CSV data and update the values
document.addEventListener("DOMContentLoaded", function() {
    updatePlasticData(); // Call the function once DOM is loaded
});

function updatePlasticData() {
    // Load CSV data
    d3.csv("Cleaned OECD Plastics 2019-2029.csv").then(function(data) {
        const selectedYear = document.getElementById("yearFilter").value;

        // Define the regions to be processed
        const regions = [
            { name: "OECD EU", elementPrefix: "OECD_EU" },
            { name: "OECD Asia", elementPrefix: "OECD_Asia" },
            { name: "Other Eurasia", elementPrefix: "OECD_Eurasia" }
        ];

        // Initialize variables for total plastics of all OECD countries
        let totalMicroplastics = 0;
        let totalMacroplastics = 0;

        // Loop through each region
        regions.forEach(function(region) {
            // Filter the data for the selected region and year
            const regionData = data.filter(d => d.Location.trim() === region.name && d.Year == selectedYear);

            // Initialize variables for microplastics and macroplastics for this region
            let microplastics = 0;
            let macroplastics = 0;

            // Sum up microplastics and macroplastics from the Plastic_Category column
            regionData.forEach(function(d) {
                if (d.Plastic_Category === "Microplastics") {
                    microplastics += parseFloat(d.Observation_Value);
                    totalMicroplastics += parseFloat(d.Observation_Value);  // Add to the total
                } else if (d.Plastic_Category === "Macroplastics") {
                    macroplastics += parseFloat(d.Observation_Value);
                    totalMacroplastics += parseFloat(d.Observation_Value);  // Add to the total
                }
            });

            // Calculate Total Plastics for the current region
            const totalPlastics = microplastics + macroplastics;

            // If data is found, update the HTML elements with the calculated values
            if (regionData.length > 0) {
                document.getElementById(`${region.elementPrefix}TotalPlastics`).textContent = totalPlastics.toFixed(2);
                document.getElementById(`${region.elementPrefix}Microplastics`).textContent = microplastics.toFixed(2);
                document.getElementById(`${region.elementPrefix}Macroplastics`).textContent = macroplastics.toFixed(2);
            } else {
                // If no data found for the region and year, set N/A
                document.getElementById(`${region.elementPrefix}TotalPlastics`).textContent = "N/A";
                document.getElementById(`${region.elementPrefix}Microplastics`).textContent = "N/A";
                document.getElementById(`${region.elementPrefix}Macroplastics`).textContent = "N/A";
            }
        });

        // After all regions are processed, calculate the total plastics for All OECD countries
        const totalPlasticsForAllOECD = totalMicroplastics + totalMacroplastics;

        // Update the "All OECD Countries" total plastics value
        document.getElementById("OECDTotalPlastics").textContent = totalPlasticsForAllOECD.toFixed(2);
    }).catch(function(error) {
        console.error("Error loading CSV data: ", error);
    });
}