d3.csv("Cleaned OECD Plastics 2019-2029.csv").then(function(data) {
    plasticData = data;
    console.log("Plastic data loaded:", plasticData); // Debugging the CSV load
});


const width = 1100;
const height = 600;

let selectedYear = "2019"; // Default year
// Append an SVG to the map container
const svg = d3.select(".map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define projections and path generators for each map
const projectionEurope = d3.geoMercator()
    .scale(1500)
    .center([5, 49])  // Approximate center of Europe
    .translate([width / 2, height / 2]);

const pathEurope = d3.geoPath().projection(projectionEurope);

const projectionAsia = d3.geoMercator()
    .scale(1100)
    .center([135, 35])  // Approximate center of Asia
    .translate([width / 2, height / 2]);

const pathAsia = d3.geoPath().projection(projectionAsia);

const projectionEurasia = d3.geoMercator()
    .scale(800)  // Adjust scale for Eurasia map
    .center([55, 45])  // Approximate center for Eurasia
    .translate([width / 2, height / 2]);  // Center the map in the container

const pathEurasia = d3.geoPath().projection(projectionEurasia);

const projectionAllCountries = d3.geoMercator()
    .scale(250)  // Adjust scale for All OECD Countries map
    .center([50, 40])  // Approximate center for all OECD countries
    .translate([width / 2, height / 2]);

const pathAllCountries = d3.geoPath().projection(projectionAllCountries);

loadAllCountriesMap();

// Create a single tooltip element that will be updated on hover
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0); // Initially hidden



// Function to load the Europe map
function loadEuropeMap(year, observationValue) {
    d3.json("oecd_europe.geojson").then(data => {
        if (!data.features || data.features.length === 0) {
            console.error("GeoJSON data is empty or missing features.");
            return;
        }
        
        svg.selectAll(".country") // Clear the SVG
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathEurope)
            .style("fill", "#a4c9e0")
            .style("stroke", "#333")
            .style("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                // Change color on hover
                d3.select(this).style("fill", "#ff9900");

                // Show tooltip with Year and Observation Value
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1); // Fade in the tooltip
                
                tooltip.html(`<strong>Year:</strong> ${year} <br><strong>Observation Value:</strong> ${observationValue}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function() {
                // Reset color on mouse out
                d3.select(this).style("fill", "#a4c9e0");

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0); // Fade out the tooltip
            });
    }).catch(error => {
        console.error("Error loading or processing GeoJSON:", error);
    });
}
    

function loadAsiaMap(year, observationValue) {
    d3.json("oecd_asia.geojson").then(data => {
        if (!data.features || data.features.length === 0) {
            console.error("GeoJSON data is empty or missing features.");
            return;
        }

        svg.selectAll(".country") // Clear the SVG
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathAsia)
            .style("fill", "#ffcc99")
            .style("stroke", "#333")
            .style("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                // Change color on hover
                d3.select(this).style("fill", "#ff9900");

                // Show tooltip with Year and Observation Value
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1); // Fade in the tooltip
                
                tooltip.html(`<strong>Year:</strong> ${year} <br><strong>Observation Value:</strong> ${observationValue}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function() {
                // Reset color on mouse out
                d3.select(this).style("fill", "#ffcc99");

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0); // Fade out the tooltip
            });
    }).catch(error => {
        console.error("Error loading or processing GeoJSON:", error);
    });
}


function loadEurasiaMap(year, observationValue) {
    d3.json("oecd_eurasia.geojson").then(data => {
        if (!data.features || data.features.length === 0) {
            console.error("GeoJSON data is empty or missing features.");
            return;
        }

        svg.selectAll(".country") // Clear the SVG
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathEurasia)
            .style("fill", "#99ff99")
            .style("stroke", "#333")
            .style("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                // Change color on hover
                d3.select(this).style("fill", "#ff9900");

                // Show tooltip with Year and Observation Value
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1); // Fade in the tooltip
                
                tooltip.html(`<strong>Year:</strong> ${year} <br><strong>Observation Value:</strong> ${observationValue}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function() {
                // Reset color on mouse out
                d3.select(this).style("fill", "#99ff99");

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0); // Fade out the tooltip
            });
    }).catch(error => {
        console.error("Error loading or processing GeoJSON:", error);
    });
}


function loadAllCountriesMap() {
    // Load all GeoJSON data simultaneously
    Promise.all([
        d3.json("oecd_europe.geojson"),
        d3.json("oecd_asia.geojson"),
        d3.json("oecd_eurasia.geojson")
    ]).then(([europeData, asiaData, eurasiaData]) => {
        if (!europeData.features || !asiaData.features || !eurasiaData.features) {
            console.error("One or more GeoJSON files are empty or missing features.");
            return;
        }

        // Clear the SVG before rendering
        svg.selectAll("*").remove();

        // Use a global Mercator projection for the entire map
        const worldProjection = d3.geoMercator()
            .scale(250) // Scale for the world map
            .center([50, 40])
            .translate([width / 2, height / 2]); // Center in the SVG container

        const worldPath = d3.geoPath().projection(worldProjection);

        // Function to draw a region with filtering
        function drawRegion(data, regionName) {
            svg.append("g")
                .selectAll(`.country-${regionName}`)
                .data(data.features)
                .enter()
                .append("path")
                .attr("class", `country-${regionName}`)
                .attr("d", worldPath)
                .style("fill", regionName === "Europe" ? "#a4c9e0" :
                               regionName === "Asia" ? "#ffcc99" : "#99ff99")
                .style("stroke", "#333")
                .style("stroke-width", 0.5)
                .on("mouseover", function (event, d) {
                    d3.select(this).style("fill", "#ff9900"); // Highlight on hover

                    // Get observation value for the region
                    const observationValue = getObservationValue(
                        regionName === "Europe" ? "OECD EU" :
                        regionName === "Asia" ? "OECD Asia" : "Other Eurasia",
                        selectedYear
                    );

                    // Show tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);

                    tooltip.html(`
                        <strong>Region:</strong> ${regionName} <br>
                        <strong>Year:</strong> ${selectedYear} <br>
                        <strong>Observation Value:</strong> ${observationValue}
                    `)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                })
                .on("mouseout", function () {
                    d3.select(this).style("fill", regionName === "Europe" ? "#a4c9e0" :
                                                   regionName === "Asia" ? "#ffcc99" : "#99ff99");

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        }

        // Draw each region with updated observation values
        drawRegion(europeData, "Europe");
        drawRegion(asiaData, "Asia");
        drawRegion(eurasiaData, "Eurasia");

    }).catch(error => {
        console.error("Error loading or processing GeoJSON:", error);
    });
}


// Helper function to get the observation value based on location and year
function getObservationValue(location, year) {
    const yearStr = year.toString();
    const filteredData = plasticData.filter(d => d.Location.trim() === location && d.Year.toString() === yearStr);
    if (filteredData.length > 0) {
        return filteredData[0].Observation_Value;
    }
    return "No data available";  // Default value if no data is found
}

document.getElementById("yearFilter").addEventListener("change", function() {
    selectedYear = this.value;  // Update the selected year

    // If the current map is "AllCountries", reload it with the new year
    if (currentMap === "AllCountries") {
        svg.selectAll("*").remove();  // Clear existing map
        loadAllCountriesMap();  // Reload All Countries map with the new year
    } else {
        // Only update if the current map is not "AllCountries"
        let observationValue;
        switch (currentMap) {
            case "Europe":
                observationValue = getObservationValue("OECD EU", selectedYear);
                svg.selectAll("*").remove(); // Clear existing content
                loadEuropeMap(selectedYear, observationValue); // Reload Europe map
                break;
            case "Asia":
                observationValue = getObservationValue("OECD Asia", selectedYear);
                svg.selectAll("*").remove(); // Clear existing content
                loadAsiaMap(selectedYear, observationValue); // Reload Asia map
                break;
            case "Eurasia":
                observationValue = getObservationValue("Other Eurasia", selectedYear);
                svg.selectAll("*").remove(); // Clear existing content
                loadEurasiaMap(selectedYear, observationValue); // Reload Eurasia map
                break;
            default:
                console.error("Unknown map type:", currentMap);
        }
    }
});

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

document.getElementById("OECDEuropeButton").addEventListener("click", function() {
    currentMap = "Europe"; // Update the active map
    const observationEurope = getObservationValue("OECD EU", selectedYear);
    svg.selectAll("*").remove(); // Clear existing map
    loadEuropeMap(selectedYear, observationEurope);  // Trigger Europe map loading
});

// Event listener for the OECD Asia button
document.getElementById("OECDAsiaButton").addEventListener("click", function() {
    currentMap = "Asia"; // Update the active map
    const observationAsia = getObservationValue("OECD Asia", selectedYear);
    svg.selectAll("*").remove(); // Clear existing map
    loadAsiaMap(selectedYear, observationAsia);  // Trigger Asia map loading
});

// Event listener for the OECD Eurasia button
document.getElementById("OECDEurasiaButton").addEventListener("click", function() {
    currentMap = "Eurasia"; // Update the active map
    const observationEurasia = getObservationValue("Other Eurasia", selectedYear);
    svg.selectAll("*").remove(); // Clear existing map
    loadEurasiaMap(selectedYear, observationEurasia);  // Trigger Eurasia map loading
});

document.getElementById("AllCountriesButton").addEventListener("click", function() {
    currentMap = "AllCountries";  // Set the current map to "AllCountries"
    loadAllCountriesMap();  // Trigger All Countries map loading
});




