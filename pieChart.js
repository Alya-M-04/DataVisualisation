// Set up chart dimensions
const margin = { top: 30, right: 30, bottom: 30, left: 30 };
const width = 500 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const radius = Math.min(width, height) / 2;

// Append SVG to the container
const svg = d3
    .select("#pie-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

// Create the "piechart-tooltip" div
const piechartTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "piechart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "3px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

// State to track the current plastic type and location
let currentPlasticType = "Total"; // Default to Total
let currentLocation = "OECD EU"; // Default to OECD EU

// Load and render data
function loadData(location) {
    currentLocation = location;  // Update the location

    d3.csv("Cleaned OECD Plastics 2019-2029.csv", (d) => {
        d.Observation_Value = +d.Observation_Value;
        d.Year = +d.Year;
        return d;
    }).then((data) => {
        // Filter data based on location and plastic type
        const filteredData = data
            .filter((d) => d.Location === location)
            .filter((d) => d.Plastic_Category === currentPlasticType || currentPlasticType === "Total");

        if (!filteredData.length) {
            console.warn(`No data found for location: ${location}`);
            svg.selectAll("*").remove(); // Clear SVG if no data
            return;
        }

        // Nest data by plastic category to prepare for pie chart
        const categoryData = d3.groups(filteredData, (d) => d.Plastic_Category).map(([key, values]) => ({
            key: key,
            value: d3.sum(values, (d) => parseFloat(d.Observation_Value)),
        }));

        // Calculate the total value (for percentage calculation)
        const totalValue = d3.sum(categoryData, (d) => d.value);

        // Clear previous elements
        svg.selectAll("*").remove();

        // Define color scale for the pie chart (dynamically updated for current plastic type)
        const colorScale = d3
            .scaleOrdinal()
            .domain(categoryData.map((d) => d.key))
            .range(currentPlasticType === "Microplastics" ? ["#87CEEB"] : currentPlasticType === "Macroplastics" ? ["#9370DB"] : ["#87CEEB", "#9370DB"]);

        // Define the pie chart generator
        const pie = d3.pie().value((d) => d.value).sort(null);

        // Define the arc generator
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        // Create the pie chart
        const arcs = svg
            .selectAll(".arc")
            .data(pie(categoryData))
            .enter()
            .append("g")
            .attr("class", "arc");

        // Append pie chart arcs (path)
        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d) => colorScale(d.data.key));

        // Append labels to the arcs
        arcs.append("text")
            .attr("transform", (d) => `translate(${arc.centroid(d)})`)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text((d) => d.data.key);

        // Append percentage labels below each category
        arcs.append("text")
            .attr("transform", (d) => `translate(${arc.centroid(d)})`)
            .attr("dy", "1.8em")  // Adjust the position for percentage text
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#000")
            .text((d) => {
                const percentage = ((d.data.value / totalValue) * 100).toFixed(2); // Calculate percentage
                return `${percentage}%`; // Display percentage
            });

        // Add tooltip functionality on mouseover
        arcs.on("mouseover", function (event, d) {
            piechartTooltip
                .style("visibility", "visible")
                .html(`Category: ${d.data.key}<br>Value: ${d.data.value.toFixed(2)}<br>Percentage: ${((d.data.value / totalValue) * 100).toFixed(2)}%`)
                .style("top", `${event.pageY + 5}px`)
                .style("left", `${event.pageX + 5}px`);
        })
        .on("mouseout", function () {
            piechartTooltip.style("visibility", "hidden");
        });

        // Display the data under the chart (value and percentage for each category)
        displayCategoryInfo(categoryData, totalValue);
    });
}

// Function to display the information for Microplastics and Macroplastics
function displayCategoryInfo(categoryData, totalValue) {
    // Get the elements where we want to display the information
    const infoContainer = d3.select("#plastic-info");

    // Clear the previous content
    infoContainer.html("");

    // Add a white box to display the values and percentages
    const box = infoContainer.append("div")
        .style("background-color", "#ffffff")
        .style("padding", "20px")
        .style("border-radius", "8px")
        .style("box-shadow", "0px 4px 6px rgba(0, 0, 0, 0.1)")
        .style("max-width", "400px")
        .style("margin", "0 auto");

    // Append the location inside the box and underline it
    box.append("h3")
        .html(`<strong>Location: ${currentLocation}</strong>`)
        .style("margin-bottom", "15px");  // Add space below the location text

    // Loop through the categories and add their value and percentage
    categoryData.forEach((category) => {
        const percentage = ((category.value / totalValue) * 100).toFixed(2);
        box.append("div")
            .html(`<span style="text-decoration: underline;">${category.key}</span><br><span style="color: blue;">Value in Tonnes: ${category.value.toFixed(2)}</span><br><span style="color: red;">Percentage: ${percentage}%</span>`)
            .style("margin-bottom", "15px");
    });
}

// Event listeners for region buttons
document.getElementById("OECDEuropeButton").addEventListener("click", () => {
    loadData("OECD EU"); // Reload data for OECD Europe
});
document.getElementById("OECDAsiaButton").addEventListener("click", () => {
    loadData("OECD Asia"); // Reload data for OECD Asia
});
document.getElementById("OECDEurasiaButton").addEventListener("click", () => {
    loadData("Other Eurasia"); // Reload data for Other Eurasia
});
document.getElementById("OtherEuropeButton").addEventListener("click", () => {
    loadData("Other EU"); // Reload data for Other Europe
});

// Load default data on page load
loadData("OECD EU");
