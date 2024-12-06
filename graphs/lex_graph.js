document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    d3.csv('data/Titanic-Dataset.csv') // Load the dataset
  ])
    .then(([dataset]) => {
      const groupedData = processAgeGroups(dataset);
      createLineGraph(groupedData);
    })
    .catch((error) => console.error('Error loading data:', error));
});

// Function to process data into age groups
function processAgeGroups(dataset) {
  const ageRanges = [
    { range: "0-10", min: 0, max: 10 },
    { range: "11-20", min: 11, max: 20 },
    { range: "21-30", min: 21, max: 30 },
    { range: "31-40", min: 31, max: 40 },
    { range: "41-50", min: 41, max: 50 },
    { range: "51-60", min: 51, max: 60 },
    { range: "61-70", min: 61, max: 70 },
    { range: "71-80", min: 71, max: 80 },
  ];

  return ageRanges.map(group => {
    const passengersInRange = dataset.filter(d => {
      const age = parseFloat(d.Age);
      return age >= group.min && age <= group.max;
    });

    const survivalRate =
      (passengersInRange.filter(d => d.Survived === '1').length /
        passengersInRange.length) *
      100;

    return {
      ageRange: group.range,
      survivalRate: survivalRate || 0,
    };
  });
}

// Function to create the line graph
function createLineGraph(data) {
  const margin = { top: 90, right: 30, bottom: 90, left: 70 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Select the existing SVG element
  const svg = d3
    .select("#line-graph-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Title
  svg.append("text")
    .attr("class", "graph-title")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Survival Rate by Age Range");

  // Set up scales
  const xScale = d3
    .scalePoint()
    .domain(data.map(d => d.ageRange))
    .range([0, width])
    .padding(0.5);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.survivalRate)])
    .nice()
    .range([height, 0]);

  // Create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("opacity", 0)
    .transition()
    .duration(1500)
    .attr("opacity", 1);

  svg.append("g")
    .call(yAxis)
    .selectAll("text")
    .attr("opacity", 0)
    .transition()
    .duration(1500)
    .attr("opacity", 1);

  // Add axis titles
  svg.append("text")
    .attr("class", "x-axis-title")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10) 
    .text("Age Ranges (Years)");
   
  svg.append("text")
    .attr("class", "y-axis-title")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2) 
    .attr("y", -margin.left + 20) 
    .attr("transform", "rotate(-90)")
    .text("Survival Rate (%)");

  // Add gradient for the line
  const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "line-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", yScale(0))
    .attr("x2", 0)
    .attr("y2", yScale(d3.max(data, d => d.survivalRate)));

  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#FF7F50");
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#1E90FF");

  // Line generator
  const line = d3
    .line()
    .x(d => xScale(d.ageRange))
    .y(d => yScale(d.survivalRate))
    .curve(d3.curveMonotoneX);

  // Draw the line with animation
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "url(#line-gradient)")
    .attr("stroke-width", 2)
    .attr("d", line)
    .attr("stroke-dasharray", function () {
      const length = this.getTotalLength();
      return `${length} ${length}`;
    })
    .attr("stroke-dashoffset", function () {
      return this.getTotalLength();
    })
    .transition()
    .duration(2000)
    .attr("stroke-dashoffset", 0);

  // Add points
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => xScale(d.ageRange))
    .attr("cy", d => yScale(d.survivalRate))
    .attr("r", 4)
    .attr("fill", "#E6968F")
    .on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");
      tooltip
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`)
        .style("opacity", 1)
        .html(
          `<strong>Age Range:</strong> ${d.ageRange}<br><strong>Survival Rate:</strong> ${d.survivalRate.toFixed(
            2
          )}%`
        );
        // Enlarge the point on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 8);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);

      // Shrink the point on mouseout
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 4);
    });
}

// Add tooltip div
d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid #ddd")
  .style("padding", "5px")
  .style("border-radius", "5px")
  .style("opacity", 0);

// Circle element for tooltip
const circle = svd.append("circle")
  .attr("r", 0)
  .attr("fill", "steelblue")
  .style("stroke", "white")
  .attr("opacity", .70)
  .style("pointer-events", "none");