// import * as d3 from "d3";
// import _ from "lodash";
// import * as moment from "moment";

// Size & Margins
var margin = { top: 50, right: 50, bottom: 50, left: 50, gap: 50 },
  svgWidth = 900,
  svgHeight = 500,
  totalWidth = svgWidth - margin.left - margin.right,
  width = (svgWidth - margin.left - margin.right - margin.gap) / 2,
  height = svgHeight - margin.top - margin.bottom;

// Append svg
var svg = d3
  .select("#svgcont")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Left chart
var svgl = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");

var svgl_chart = svgl
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgl_yaxis = svgl
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgl_xaxis = svgl
  .append("g")
  .attr(
    "transform",
    "translate(" + margin.left + "," + (svgHeight - margin.bottom) + ")"
  );

// Right chart
var svgr = svg
  .append("g")
  .attr("transform", "translate(" + svgWidth / 2 + "," + 0 + ")");

var svgr_chart = svgr
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgr_yaxis = svgr
  .append("g")
  .attr("transform", "translate(" + 0 + "," + margin.top + ")");

var svgr_xaxis = svgr
  .append("g")
  .attr(
    "transform",
    "translate(" + margin.left + "," + (svgHeight - margin.bottom) + ")"
  );

// Scales
var x = d3.scalePoint().range([0, svgWidth / 2 - margin.left - margin.right]);

var y = d3.scaleLinear().range([height, 0]);

var color = d3.scaleOrdinal().range(d3.schemeCategory10);

// Shapes
var line = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x(function (d) {
    return x(d[0]);
  })
  .y(function (d) {
    return y(d[1]);
  });

// Chart Information
var lines1 = ["Consumer Auto"];
var lines2 = ["Dealer", "Refinance", "Servicing", "United Income"];
var xAxisKey = "month";

var state_ = 'Combined'
var _data_ = [];

d3.csv("data/calls.csv").then(function (data) {

  _data_ = data;
  
  var xAxisValues = _.map(data, xAxisKey);
  x.domain(xAxisValues);
  y.domain([0, 1]);
  color.domain(_.union(lines1, lines2));
  
  var x_axis = d3.axisBottom().scale(x).tickFormat(dateFormatter);
  var y_axis = d3.axisLeft().scale(y);

  svgl_xaxis
    .call(x_axis)
    .selectAll("text")
    .style("text-anchor", "end")
    .style("dominant-baseline", "central")
    .attr("dx", "-1em")
    .attr("dy", "-0.9em")
    .attr("transform", "rotate(-90)");

  svgl_yaxis.call(y_axis);

  var lines = (state_ == 'Combined') ? lines1 : lines2

  var data_ = processData(lines, _data_)
  renderChart_(data_);

});

function processData(lines, data) {
  var data_ = [];
  var xAxisValues = _.map(data, xAxisKey);
  _.forEach(lines, function (line, index) {
    var lineValues = _.map(data, line);
    data_.push({
      line: line,
      values: _.zip(xAxisValues, lineValues),
    });
  });

  return data_
}

function renderChart_(data) {
  var paths = svgl_chart.selectAll("path").data(data);

  paths
    .enter()
    .append("path")
    .transition()
    .duration(2000)
    .attr("id", (d) => d.line)
    .attr("stroke-width", 1.5)
    .attr("stroke", (d) => color(d.line))
    .attr("fill", "none")
    .attr("d", (d) => {
      return line(d.values);
    });

  paths
    .exit()
    .transition()
    .duration(2000)
    .delay(500)
    .ease(d3.easeExpOut)
    .attr("opacity", 0)
    .remove();

  paths
    .transition()
    .duration(2000)
    .delay(500)
    .ease(d3.easeExpOut)
    .attr("stroke", (d) => color(d.line))
    .attr("d", (d) => {
      return line(d.values);
    });
}

document
  .getElementById("btn-combined")
  .addEventListener("click", triggerTransition.bind(null, 'Combined'), false)

document
  .getElementById("btn-split")
  .addEventListener("click", triggerTransition.bind(null, 'Split'), false);

function triggerTransition(action_) {
  state_ = action_
  var maxValues = [];
  var lines = (state_ == 'Combined') ? lines1 : lines2
  var data_ = processData(lines, _data_)
  renderChart_(data_);
}

function dateFormatter(label) {
  return moment(label, "YYYY-MM-DD").format("MMM-YY");
}

// Debug Code - Delete Later
function markAreas() {
  svg
    .append("rect")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[0])
    .attr("stroke-width", 4);

  svgl
    .append("rect")
    .attr("width", svgWidth / 2)
    .attr("height", svgHeight)
    .attr("fill", d3.schemePastel1[1])
    .attr("opacity", 0.2);

  svgr
    .append("rect")
    .attr("width", svgWidth / 2)
    .attr("height", svgHeight)
    .attr("fill", d3.schemePastel1[2])
    .attr("opacity", 0.2);

  svgl_chart
    .append("rect")
    .attr("width", svgWidth / 2 - margin.left - margin.right)
    .attr("height", svgHeight - margin.top - margin.bottom)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[4])
    .attr("stroke-width", 4);

  svgl_yaxis
    .append("rect")
    .attr("transform", "translate(" + -margin.left + "," + 0 + ")")
    .attr("width", margin.left)
    .attr("height", svgHeight - margin.top - margin.bottom)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[1])
    .attr("stroke-width", 4);

  svgl_xaxis
    .append("rect")
    .attr("width", svgWidth / 2 - margin.left - margin.right)
    .attr("height", margin.bottom)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[6])
    .attr("stroke-width", 4);

  svgr_chart
    .append("rect")
    .attr("width", svgWidth / 2 - margin.left - margin.right)
    .attr("height", svgHeight - margin.top - margin.bottom)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[4])
    .attr("stroke-width", 4);

  svgr_yaxis
    .append("rect")
    .attr("width", margin.left)
    .attr("height", svgHeight - margin.top - margin.bottom)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[5])
    .attr("stroke-width", 4);

  svgr_xaxis
    .append("rect")
    .attr("width", svgWidth / 2 - margin.left - margin.right)
    .attr("height", margin.bottom)
    .attr("fill", "none")
    .attr("stroke", d3.schemePastel1[6])
    .attr("stroke-width", 4);
}

// markAreas();
