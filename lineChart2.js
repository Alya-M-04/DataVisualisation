// Set chart dimensions
const margin = { top: 20, right: 30, bottom: 100, left: 60 };  // Increased bottom margin for the legend
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

// State to track the current plastic type and location
let currentPlasticType = "Total"; // Default to Total
let currentLocation = "OECD EU"; // Default to OECD EU

// Load and render data
function loadData(location) {
    currentLocation = location;  // Update the location

    // Fetch data based on the location
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
                Total: micro + macro, // Calculate total from both micro and macroplastics
            };
        });

        // Set up scales for the chart
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(nestedData, (d) => d.Year))
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(nestedData, (d) => Math.max(d.Microplastics, d.Macroplastics))]) // Scale based on max of both categories
            .nice()
            .range([height, 0]);

        // Define the line generator for Microplastics and Macroplastics separately
        const lineMicro = d3
            .line()
            .x((d) => xScale(d.Year))
            .y((d) => yScale(d.Microplastics));

        const lineMacro = d3
            .line()
            .x((d) => xScale(d.Year))
            .y((d) => yScale(d.Macroplastics));

        // Define area generators for each category
        const areaGeneratorMicro = d3
            .area()
            .x((d) => xScale(d.Year))
            .y0(height)  // Set the bottom of the area to the chart's height
            .y1((d) => yScale(d.Microplastics)); // Microplastics

        const areaGeneratorMacro = d3
            .area()
            .x((d) => xScale(d.Year))
            .y0(height)  // Set the bottom of the area to the chart's height
            .y1((d) => yScale(d.Macroplastics)); // Macroplastics

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

        // Add areas under the lines for Microplastics and Macroplastics
        if (currentPlasticType === "Microplastics" || currentPlasticType === "Total") {
            svg
                .append("path")
                .datum(nestedData)
                .attr("fill", "rgba(0,122,204,0.3)") // Blue area for Microplastics
                .attr("d", areaGeneratorMicro);
        }

        if (currentPlasticType === "Macroplastics" || currentPlasticType === "Total") {
            svg
                .append("path")
                .datum(nestedData)
                .attr("fill", "rgba(211,164,255,0.3)") // Purple area for Macroplastics
                .attr("d", areaGeneratorMacro);
        }

        // Add the lines for Microplastics and Macroplastics separately
        if (currentPlasticType === "Microplastics" || currentPlasticType === "Total") {
            svg
                .append("path")
                .datum(nestedData)
                .attr("fill", "none")
                .attr("stroke", "#007ACC") // Blue line for Microplastics
                .attr("stroke-width", 2)
                .attr("d", lineMicro);
        }

        if (currentPlasticType === "Macroplastics" || currentPlasticType === "Total") {
            svg
                .append("path")
                .datum(nestedData)
                .attr("fill", "none")
                .attr("stroke", "#D3A4FF") // Purple line for Macroplastics
                .attr("stroke-width", 2)
                .attr("d", lineMacro);
        }

        // Add data points (circles) for Microplastics and Macroplastics separately
        if (currentPlasticType === "Microplastics" || currentPlasticType === "Total") {
            svg
                .selectAll(".circle-micro")
                .data(nestedData)
                .enter()
                .append("circle")
                .attr("cx", (d) => xScale(d.Year))
                .attr("cy", (d) => yScale(d.Microplastics))
                .attr("r", 5)
                .attr("fill", "#007ACC") // Blue for Microplastics
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
        }

        if (currentPlasticType === "Macroplastics" || currentPlasticType === "Total") {
            svg
                .selectAll(".circle-macro")
                .data(nestedData)
                .enter()
                .append("circle")
                .attr("cx", (d) => xScale(d.Year))
                .attr("cy", (d) => yScale(d.Macroplastics))
                .attr("r", 5)
                .attr("fill", "#D3A4FF") // Purple for Macroplastics
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
        }

        // Add the vertical hover line
        const hoverLine = svg
            .append("line")
            .attr("class", "hover-line")
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "4 2")
            .attr("stroke-width", 1)
            .attr("visibility", "hidden");

        // Hover effect to show the line and tooltip anywhere
        svg.on("mousemove", function (event) {
            const mouseX = d3.pointer(event)[0];
            const closestYear = xScale.invert(mouseX); // Find the closest year to the mouse
            const closestDataPoint = nestedData.reduce((prev, curr) => Math.abs(curr.Year - closestYear) < Math.abs(prev.Year - closestYear) ? curr : prev);

            hoverLine
                .attr("x1", xScale(closestDataPoint.Year))
                .attr("x2", xScale(closestDataPoint.Year))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("visibility", "visible");

            let tooltipContent;
            if (currentPlasticType === "Total") {
                tooltipContent = `
                    <strong>Year:</strong> ${closestDataPoint.Year}<br>
                    <strong>Total Plastics:</strong> ${closestDataPoint.Total.toLocaleString()}<br>
                    <strong>Microplastics:</strong> ${closestDataPoint.Microplastics.toLocaleString()}<br>
                    <strong>Macroplastics:</strong> ${closestDataPoint.Macroplastics.toLocaleString()}
                `;
            } else {
                tooltipContent = `
                    <strong>Year:</strong> ${closestDataPoint.Year}<br>
                    <strong>Plastic Type:</strong> ${currentPlasticType}<br>
                    <strong>Value:</strong> ${closestDataPoint[currentPlasticType].toLocaleString()}
                `;
            }

            // Update tooltip content and position
            lineChartTooltip
                .html(tooltipContent)
                .style("top", `${event.pageY + 10}px`) // Position tooltip below cursor
                .style("left", `${event.pageX + 10}px`) // Position tooltip right of cursor
                .style("visibility", "visible") // Force visibility to 'visible'
                .style("opacity", 1); // Ensure it's fully opaque
        }).on("mouseout", function () {
            hoverLine.attr("visibility", "hidden");
            lineChartTooltip
                .style("visibility", "hidden") // Hide tooltip on mouseout
                .style("opacity", 0); // Make it fully transparent
        });
        const legendWidth = 200;
        // Add legend at the bottom
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
    loadData(currentLocation); // Reload with the selected location
});
document.getElementById("Macroplastics").addEventListener("click", () => {
    currentPlasticType = "Macroplastics";
    loadData(currentLocation); // Reload with the selected location
});
document.getElementById("Total").addEventListener("click", () => {
    currentPlasticType = "Total";
    loadData(currentLocation); // Reload with the selected location
});

// Load default data on page load
loadData("OECD EU");
