// Set chart dimensions
const margin = { top: 20, right: 30, bottom: 70, left: 60 };
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

// Create the "linechart-tooltip" div
const lineChartTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "linechart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden") // Start with tooltip hidden
    .style("background-color", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("z-index", "1000");

// State to track the current plastic type
let currentPlasticType = "Total"; // Default to Total

// Load and render data
function loadData(location) {
    d3.csv("Cleaned OECD Plastics 2019-2029.csv", (d) => {
        d.Observation_Value = +d.Observation_Value; // Convert to number
        d.Year = +d.Year; // Convert year to number
        return d;
    }).then((data) => {
        // Filter data based on location and selected plastic category (Total, Microplastics, Macroplastics)
        const filteredData = data
            .filter((d) => d.Location === location)
            .filter((d) => d.Plastic_Category === currentPlasticType || currentPlasticType === "Total");

        if (!filteredData.length) {
            console.warn(`No data found for location: ${location}, category: ${currentPlasticType}`);
            svg.selectAll("*").remove(); // Clear SVG if no data
            return;
        }

        // Nest data by year to prepare for rendering the line chart
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

        // Set up scales for the chart
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(nestedData, (d) => d.Year))
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(nestedData, (d) => d.Total)]) // Use "Total" to set y-scale
            .nice()
            .range([height, 0]);

        // Define the line
        const line = d3
            .line()
            .x((d) => xScale(d.Year))
            .y((d) => yScale(d[currentPlasticType])); // Dynamically use the selected plastic type

        // Clear previous chart elements
        svg.selectAll("*").remove();

        // Add x-axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
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

        // Add the line based on selected plastic category
        svg
            .append("path")
            .datum(nestedData)
            .attr("fill", "none")
            .attr("stroke", "#007ACC") // Blue line for default
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add data points (circles)
        // On mouseover event for circles
        svg
    .selectAll(".circle")
    .data(nestedData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d[currentPlasticType])) // Use selected plastic category
    .attr("r", 5)
    .attr("fill", "#007ACC")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
        console.log("Mouseover event fired", d); // Debugging log

        let tooltipContent;
        if (currentPlasticType === "Total") {
            tooltipContent = `
                <strong>Year:</strong> ${d.Year}<br>
                <strong>Total Plastics:</strong> ${d.Total.toLocaleString()}<br>
                <strong>Microplastics:</strong> ${d.Microplastics.toLocaleString()}<br>
                <strong>Macroplastics:</strong> ${d.Macroplastics.toLocaleString()}
            `;
        } else {
            tooltipContent = `
                <strong>Year:</strong> ${d.Year}<br>
                <strong>Plastic Type:</strong> ${currentPlasticType}<br>
                <strong>Value:</strong> ${d[currentPlasticType].toLocaleString()}
            `;
        }

        // Update tooltip content and position
        lineChartTooltip
            .html(tooltipContent)
            .style("top", `${event.pageY + 10}px`)  // Position tooltip below cursor
            .style("left", `${event.pageX + 10}px`) // Position tooltip right of cursor
            .style("visibility", "visible") // Force visibility to 'visible'
            .style("opacity", 1);  // Ensure it's fully opaque

        console.log(`Tooltip position: ${event.pageX + 10}, ${event.pageY + 10}`);
    })
    .on("mouseout", function () {
        console.log("Mouseout event fired"); // Debugging log

        // Hide tooltip
        lineChartTooltip
            .style("visibility", "hidden") // Hide tooltip on mouseout
            .style("opacity", 0); // Make it fully transparent
    });


    });
}

// Button click handlers for location
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
