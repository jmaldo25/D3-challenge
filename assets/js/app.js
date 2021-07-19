// Put in boiler plate code
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create svg wrapper and group that will hold chart
var svg = d3.select("#scatter")
    .append("svg")
    .classed("chart", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight)

// Append svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial params for chart to include assignment and bonus
var allData = null;   // used to store the chart data
var chosenXAxis = "poverty";   // default initial x-axis for chart
var chosenYAxis = "obesity";   // default initial y-axis for chart
var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
"age": "Age (Median)", 
"income": "Household Income (Median)",
"obesity": "Obese (%)", 
"smokes": "Smokes (%)", 
"healthcare": "Lacks Healthcare (%)" };

// Creating function for x and y scales, and update x and y upon click
function xScale(censusData, chosenXAxis){
  var xLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d=>d[chosenXAxis])*0.9, d3.max(censusData, d=>d[chosenXAxis])*1.1])
  .range([0, width])
  return xLinearScale;
}

function yScale(censusData, chosenYAxis){
  var yLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d=>d[chosenYAxis])*.09, d3.max(censusData, d=>d[chosenYAxis])*1.1])
  .range([height, 0]);
  return yLinearScale;
}

function renderXAxis(newXScale, xAxis){
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
  .call(bottomAxis);
  return xAxis;
}

function renderYAxis(newYScale, yAxis){
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
  .call(leftAxis);
  return yAxis;
}

// Creating function to update circles and transition
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis){
  circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]))
  .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// Creating function used to update text and transition to new text
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis){
  circletextGroup.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]))
  .attr("y", d => newYScale(d[chosenYAxis]));
  return circletextGroup;
}

// Creating function for tool tip and updated tool tip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){
  // X-Axis
  if (chosenXAxis === "poverty"){
    var xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "income"){
    var xlabel = "Median Income: "
  }
  else {
    var xlabel = "Age: "
  }
  // Y-Axis
  if (chosenYAxis === "healthcare"){
    var ylabel = "Lacks Healthcare: ";
  }
  else if (chosenYAxis === "smokes"){
    var ylabel = "Smokers: "
  }
  else {
    var ylabel = "Obesity: "
  }
  // Tool Tip
  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .stytle("background", "#5E238D")
  .style("color", "white")
  .offset([120, -60])
  .html(function(d) {
    if (chosenXAxis === "age"){
      // Set up for all yAxis labels to show as (%)
      // Also set up Age display without xAxis format
      return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
    } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
      // Display for Income in dollars for xAxis
      return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
    } else {
      // Set Poverty to show (%) for xAxis
      return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
    }
  });
  // Creating mouse event listeners
  circlesGroup.call(toolTip);
  // mouse on event
  circlesGroup.on("mouseover", function(data){
    toolTip.show(data, this);
  })
  // mouse out event
  .on("mouseout", function(data,index){
    toolTip.hide(data)
  });

  return circlesGroup;
}

// Retrieve data from CSV and execute
d3.csv("assets/data/data.csv").then(function(censusData){

  // parse data
  censusData.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.healthcare = +d.healthcare;
    d.smokes = +d.smokes;
  });

  // LinearScale function with csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Creating X an Y axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append axis to chart
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  // Creating initial circles
  var circlesGroup = chartGroup.selectAll("circle")
  .data(censusData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.obesity))
  .attr("r", 18)
  .attr("fill", "purple")
  .attr("opacity", ".5");

  // Adding text to circles
  var circletextGroup = chartGroup.selectAll()
  .data(censusData)
  .enter()
  .append("text")
  .text(d => (d.abbr))
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .style("font-size", "11px")
  .style("text-anchor", "middle")
  .style('fill', 'black');

  var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 15)
  .attr("value", "poverty")
  .classed("active", true)
  .text("In Poverty (%)");

  var healthcareLabel = labelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", margin.left * 2)
  .attr("y", 0 - (height + 95))
  .attr("value", "healthcare")
  .classed("active", true)
  .text("Lacks Healthcare (%)");

  var ageLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 35)
  .attr("value", "age")
  .classed("inactive", true)
  .text("Age (Median)");

  var smokeLabel = labelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", margin.left * 2)
  .attr("y", 0 - (height + 115))
  .attr("value", "smokes")
  .classed("inactive", true)
  .text("Smokes (%)");

  var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 55)
  .attr("value", "income")
  .classed("inactive", true)
  .text("Household Income (Median)");

  var obesityLabel = labelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", margin.left * 2)
  .attr("y", 0 - (height + 135))
  .attr("value", "obesity")
  .classed("inactive", true)
  .text("Obesity (%)");

  // Updating tool tip function to support csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X axis lables event listener
  labelsGroup.selectAll("text").on("click", function() {
    // Getting value of selection
    var value = d3.select(this).attr("value");
    // console.log(value);   // Test to print to console log

    // if select for x axises
    if(true) {
      if (value === "poverty" || value === "age" || value === "income") {
        chosenXAxis = value;
      }
    }
  })
})