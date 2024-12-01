// Set chart dimensions
const margin = { top: 60, right: 60, bottom: 90, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Append SVG to the container
const svg = d3
    .select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create the "barchart-tooltip" div
const barchartTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "barchart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "3px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

// State to track the current plastic type
let currentPlasticType = "Total"; // Default to Total

// Load and render data
function loadData(location) {
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

        // Nest data by year to prepare for stacking
        const nestedData = d3.groups(filteredData, (d) => d.Year).map(([key, values]) => {
            const micro = values.find((d) => d.Plastic_Category === "Microplastics")?.Observation_Value || 0;
            const macro = values.find((d) => d.Plastic_Category === "Macroplastics")?.Observation_Value || 0;
            return {
                Year: +key,
                Microplastics: micro,
                Macroplastics: macro,
                Total: micro + macro,
            };
        });

        // Set up scales
        const xScale = d3
            .scaleBand()
            .domain(nestedData.map((d) => d.Year))
            .range([0, width])
            .padding(0.2);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(nestedData, (d) => d.Total)])
            .nice()
            .range([height, 0]);

        const colorScale = d3
            .scaleOrdinal()
            .domain(["Microplastics", "Macroplastics"])
            .range(["#007ACC", "#D3A4FF"]); // Update colors

        // Clear previous elements
        svg.selectAll("*").remove();

        // Add x-axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

        // Add y-axis with title
        svg.append("g").call(d3.axisLeft(yScale));
        svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .text("Observed Value in Tonnes");

        // Stack data for rendering
        const stack = d3.stack().keys(["Microplastics", "Macroplastics"]);
        const stackedData = stack(nestedData);

        // Add bars
        svg
            .selectAll(".layer")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("fill", (d) => colorScale(d.key))
            .selectAll("rect")
            .data((d) => d)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.data.Year))
            .attr("y", (d) => yScale(d[1]))
            .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            // Show barchart-tooltip on mouseover
            .on("mouseover", function (event, d) {
                const year = d.data.Year;
                const value = d[1] - d[0];
                barchartTooltip
                    .style("visibility", "visible")
                    .html(`Year: ${year}<br>Value: ${value.toFixed(2)}`)
                    .style("top", `${event.pageY + 5}px`)
                    .style("left", `${event.pageX + 5}px`);
            })
            // Hide barchart-tooltip on mouseout
            .on("mouseout", function () {
                barchartTooltip.style("visibility", "hidden");
            });

        // Add legend
        const legendWidth = 200;
        const legend = svg.append("g")
            .attr("transform", `translate(${(width / 2) - (legendWidth / 2)}, ${height + 50})`); // Position legend below the chart

        // Microplastics legend
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#007ACC"); // Blue for Microplastics

        legend.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text("Microplastics")
            .style("font-size", "12px");

        // Macroplastics legend
        legend.append("rect")
            .attr("x", 120)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#D3A4FF"); // Purple for Macroplastics

        legend.append("text")
            .attr("x", 145)
            .attr("y", 15)
            .text("Macroplastics")
            .style("font-size", "12px");
    });
}

// Button click handlers for locations
document.getElementById("OECDEuropeButton").addEventListener("click", () => {
    loadData("OECD EU");
});
document.getElementById("OECDAsiaButton").addEventListener("click", () => {
    loadData("OECD Asia");
});
document.getElementById("OECDEurasiaButton").addEventListener("click", () => {
    loadData("Other Eurasia");
});
document.getElementById("OtherEuropeButton").addEventListener("click", () => {
    loadData("Other EU");
});

// Button click handlers for plastic type
document.getElementById("Microplastics").addEventListener("click", () => {
    currentPlasticType = "Microplastics";
    loadData("OECD EU"); // Reload with default location
});
document.getElementById("Macroplastics").addEventListener("click", () => {
    currentPlasticType = "Macroplastics";
    loadData("OECD EU"); // Reload with default location
});
document.getElementById("Total").addEventListener("click", () => {
    currentPlasticType = "Total";
    loadData("OECD EU"); // Reload with default location
});

// Load default data on page load
loadData("OECD EU");
