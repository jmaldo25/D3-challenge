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
