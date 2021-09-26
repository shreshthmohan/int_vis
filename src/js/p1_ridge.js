// Chart Info
var lines = [
  { col: "Consumer Auto", group: "Consumer Auto", combinedMapping: "Overall" },
  { col: "Dealer", group: "Dealer", combinedMapping: "Overall" },
  { col: "Refinance", group: "Refinance", combinedMapping: "Overall" },
  { col: "Servicing", group: "Servicing", combinedMapping: "Overall" },
  { col: "United Income", group: "United Income", combinedMapping: "Overall" },
  { col: "Overall", group: "Overall", combinedMapping: "Overall" },
];
var linesXKey = "month";

var areas = [
  {
    col: "Consumer Auto Pre",
    group: "Consumer Auto",
    combinedMapping: "Overall Pre",
  },
  // {
  //   col: "Consumer Auto Pan",
  //   group: "Consumer Auto",
  //   combinedMapping: "Overall Pan",
  // },
  {
    col: "Consumer Auto Post",
    group: "Consumer Auto",
    combinedMapping: "Overall Post",
  },
  { col: "Dealer Pre", group: "Dealer", combinedMapping: "Overall Pre" },
  // { col: "Dealer Pan", group: "Dealer", combinedMapping: "Overall Pan" },
  { col: "Dealer Post", group: "Dealer", combinedMapping: "Overall Post" },
  { col: "Refinance Pre", group: "Refinance", combinedMapping: "Overall Pre" },
  // { col: "Refinance Pan", group: "Refinance", combinedMapping: "Overall Pan" },
  {
    col: "Refinance Post",
    group: "Refinance",
    combinedMapping: "Overall Post",
  },
  { col: "Servicing Pre", group: "Servicing", combinedMapping: "Overall Pre" },
  // { col: "Servicing Pan", group: "Servicing", combinedMapping: "Overall Pan" },
  {
    col: "Servicing Post",
    group: "Servicing",
    combinedMapping: "Overall Post",
  },
  {
    col: "United Income Pre",
    group: "United Income",
    combinedMapping: "Overall Pre",
  },
  // {
  //   col: "United Income Pan",
  //   group: "United Income",
  //   combinedMapping: "Overall Pan",
  // },
  {
    col: "United Income Post",
    group: "United Income",
    combinedMapping: "Overall Post",
  },
  { col: "Overall Pre", group: "Overall", combinedMapping: "Overall Pre" },
  // { col: "Overall Pan", group: "Overall", combinedMapping: "Overall Pan" },
  { col: "Overall Post", group: "Overall", combinedMapping: "Overall Post" },
];
var areasXKey = "frustration_index";

// Size & Margins
const pw = d3.select("#svgcont").node().getBoundingClientRect().width;

var svgWidth = pw,
  svgHeight = 400,
  margin = { top: 75, right: 0, bottom: 25, left: 150, gap: 50 },
  heightMultiplier = 3;

// Setup chart components
var svg = d3
  .select("#svgcont")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// svg
//   .append("rect")
//   .attr("stroke", "red")
//   .attr("stroke-width", 2)
//   .attr("fill", "none")
//   .attr("height", svgHeight)
//   .attr("width", svgWidth);

var svgLHeader = svg.append("g").attr("id", "left_header").append("text");
var svgRHeader = svg.append("g").attr("id", "right_header").append("text");

var svgL = svg.append("g").attr("id", "left_section");
var svgR = svg.append("g").attr("id", "right_section");
var svgSection = svg.append("g").attr("id", "section_name");

var svgLChart = svgL.append("g").attr("id", "left_chart");
var svgLHighlighter = svgLChart.append("rect").attr("id", "highlighter");
var svgLYAxes = svgL.append("g").attr("id", "left_y_axis");
var svgLXAxes = svgL.append("g").attr("id", "left_x_axis");
var svgLGrid = svgL.append("g").attr("id", "left_grid");
var svgRChart = svgR.append("g").attr("id", "right_x_chart");
var svgRYAxes = svgR.append("g").attr("id", "right_y_axis");
var svgRXAxes = svgR.append("g").attr("id", "right_x_axis");
var svgRGrid = svgR.append("g").attr("id", "right_grid");

var svgRXAxisLabel = svgRXAxes.append("text");
var svgLXAxisLabel = svgLXAxes.append("text").attr("id", "Hello");

// Shapes
var line = d3
  .line()
  // .curve(d3.curveMonotoneX)
  .x((d) => d.x_)
  .y((d) => d.y_);

var area = d3
  .area()
  .curve(d3.curveMonotoneX)
  .x((d) => d.x0)
  .y0((d) => d.y0)
  .y1((d) => d.y1);

// Scales
function getGridScales(
  gridRows,
  gridCols,
  xDomain,
  yDomain,
  gridWidth,
  gridHeight,
  paddingInnerY
) {
  var paddingInnerX = 0.2;
  var paddingOuterX = 0;
  var paddingInnerY = paddingInnerY;
  var paddingOuterY = 0.1;

  var xGrid = d3
    .scaleBand()
    .domain(xDomain)
    .range([0, gridWidth])
    .paddingInner(paddingInnerX)
    .paddingOuter(paddingOuterX)
    .align(0.5);

  var yGrid = d3
    .scaleBand()
    .domain(yDomain)
    .range([0, gridHeight])
    .paddingInner(paddingInnerY)
    .paddingOuter(paddingOuterY);

  return {
    xGridScale: xGrid,
    yGridScale: yGrid,
  };
}

function getChartScales(xDomain, xRange, yDomain, yRange) {
  var x = d3.scalePoint().domain(xDomain).range(xRange);
  var y = d3.scaleLinear().domain(yDomain).range(yRange);

  return { xScale: x, yScale: y };
}

// var color = d3.scaleOrdinal().domain(lines).range(d3.schemeCategory10);
var color = d3
  .scaleOrdinal()
  // .domain(["Pre", "Post", "Pan"])
  .domain(["Pre", "Post"])
  .range([d3.schemePaired[0],d3.schemePaired[1],d3.schemePaired[4]]);
  // .range([d3.schemeCategory10[1], d3.schemeCategory10[2], d3.schemeAccent[3]]);

d3.select("#color-legend").html(swatches({ color, uid: "rs" }));

// Load Data
var callsData = [];
var frustrationData = [];
var linesData, linesXValues, linesYMaxValue;
var areasData, areasXValues, areasYMaxValue;
Promise.all([d3.csv("data/calls.csv"), d3.csv("data/frustration.csv")]).then(
  ([calls, frustration]) => {
    callsData = calls;
    frustrationData = frustration;

    processData_();
    renderCombined();
    // renderSplit()
  }
);

function processData_() {
  [linesData, linesXValues, linesYMaxValue] = processData(
    callsData,
    lines,
    linesXKey
  );

  [areasData, areasXValues, areasYMaxValue] = processData(
    frustrationData,
    areas,
    areasXKey
  );
}

// Process Data
function processData(data, cols, xAxisKey) {
  var data_ = [];
  var xAxisValues = _.map(data, xAxisKey);
  var yMaxValues = [];
  _.forEach(cols, function (val, index) {
    var colValues = _.map(data, val.col);
    data_.push({
      id: val.col,
      group: val.group,
      combinedMapping: val.combinedMapping,
      values: _.zip(xAxisValues, colValues),
    });
    yMaxValues.push(_.max(colValues));
  });

  var yMaxValue = _.max(yMaxValues);

  return [data_, xAxisValues, yMaxValue];
}

// Control Functions
function renderCombined() {
  // SVGs & Scales
  svg
    .transition()
    .duration(1500)
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  var { xGridScale, yGridScale } = getGridScales(
    1,
    2,
    [0, 1],
    ["Overall"],
    width,
    height,
    0.1
  );

  svgLHeader
    .attr(
      "transform",
      "translate(" +
        (margin.left + xGridScale(0) + xGridScale.bandwidth() / 2) +
        "," +
        margin.top / 2 +
        ")"
    )
    .style("dominant-baseline", "top")
    .style("text-anchor", "middle")
    .attr("font-size", 22)
    .text("Calls per customer")
    .style("fill", "gray");

  svgRHeader
    .attr(
      "transform",
      "translate(" +
        (margin.left + xGridScale(1) + xGridScale.bandwidth() / 2) +
        "," +
        margin.top / 2 +
        ")"
    )
    .style("dominant-baseline", "top")
    .style("text-anchor", "middle")
    .attr("font-size", 22)
    .text("Calls distribution by frustration")
    .style("fill", "gray");

  // Render Lines
  svgLXAxes.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  svgLYAxes.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  svgLChart.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  var isCombined = true;

  var { xScale, yScale } = getChartScales(
    linesXValues,
    [0, xGridScale.bandwidth()],
    [0, 1],
    [yGridScale.bandwidth(), 0]
  );
  renderLines(
    linesData,
    svgLChart,
    { xGridScale, yGridScale },
    { xScale, yScale },
    isCombined
  );

  var highlightStart = "2020-02-01";
  var highlightEnd = "2021-01-01";
  svgLHighlighter
    .attr("transform", "translate(" + xScale(highlightStart) + "," + 0 + ")")
    .attr("height", 1.1 * height)
    .attr("width", xScale(highlightEnd) - xScale(highlightStart))
    .attr("fill", d3.schemeAccent[3])
    .attr("opacity", 0.6);

  svgSection.attr(
    "transform",
    "translate(" + (2 * margin.left) / 3 + "," + margin.top + ")"
  );

  renderSectionNames(
    linesData,
    svgSection,
    { xGridScale, yGridScale },
    { xScale, yScale },
    isCombined
  );

  svgRChart.attr(
    "transform",
    "translate(" + (margin.left + xGridScale(1)) + "," + margin.top + ")"
  );
  svgRXAxes.attr(
    "transform",
    "translate(" + (margin.left + xGridScale(1)) + "," + margin.top + ")"
  );

  svgRYAxes.attr(
    "transform",
    "translate(" + (margin.left + xGridScale(1)) + "," + margin.top + ")"
  );

  var { xScale, yScale } = getChartScales(
    areasXValues,
    [0, xGridScale.bandwidth()],
    [0, 0.5],
    [yGridScale.bandwidth(), 0]
  );
  renderAreas(
    areasData,
    svgRChart,
    { xGridScale, yGridScale },
    { xScale, yScale },
    isCombined
  );
}

function renderSplit() {
  // SVGs & Scales
  svg
    .transition()
    .duration(1500)
    .attr("width", svgWidth)
    .attr("height", svgHeight * heightMultiplier);
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight * heightMultiplier - margin.top - margin.bottom;
  var { xGridScale, yGridScale } = getGridScales(
    1,
    2,
    [0, 1],
    ["Consumer Auto", "Dealer", "Refinance", "Servicing", "United Income"],
    width,
    height,
    0.4
  );
  var { xScale, yScale } = getChartScales(
    linesXValues,
    [0, xGridScale.bandwidth()],
    [0, 1],
    [yGridScale.bandwidth(), 0]
  );

  svgLHeader
    .attr(
      "transform",
      "translate(" +
        (margin.left + xGridScale(0) + xGridScale.bandwidth() / 2) +
        "," +
        margin.top / 2 +
        ")"
    )
    .style("dominant-baseline", "top")
    .style("text-anchor", "middle")
    .attr("font-size", 22)
    .text("Calls per customer")
    .style("fill", "gray");

  svgRHeader
    .attr(
      "transform",
      "translate(" +
        (margin.left + xGridScale(1) + xGridScale.bandwidth() / 2) +
        "," +
        margin.top / 2 +
        ")"
    )
    .style("dominant-baseline", "top")
    .style("text-anchor", "middle")
    .attr("font-size", 22)
    .text("Calls distribution by frustration")
    .style("fill", "gray");

  // Render Lines
  svgLXAxes.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  svgLYAxes.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  svgLChart.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );
  var highlightStart = "2020-02-01";
  var highlightEnd = "2021-01-01";
  svgLHighlighter
    .attr("transform", "translate(" + xScale(highlightStart) + "," + 0 + ")")
    .attr("height", 1.1 * height)
    .attr("width", xScale(highlightEnd) - xScale(highlightStart))
    .attr("fill", d3.schemeAccent[3])
    .attr("opacity", 0.6);

  var isCombined = false;
  renderLines(
    linesData,
    svgLChart,
    { xGridScale, yGridScale },
    { xScale, yScale },
    isCombined
  );

  svgSection.attr(
    "transform",
    "translate(" + (2 * margin.left) / 3 + "," + margin.top + ")"
  );

  renderSectionNames(
    linesData,
    svgSection,
    { xGridScale, yGridScale },
    { xScale, yScale },
    isCombined
  );

  svgRChart.attr(
    "transform",
    "translate(" + (margin.left + xGridScale(1)) + "," + margin.top + ")"
  );
  svgRXAxes.attr(
    "transform",
    "translate(" + (margin.left + xGridScale(1)) + "," + margin.top + ")"
  );

  svgRYAxes.attr(
    "transform",
    "translate(" + (margin.left + xGridScale(1)) + "," + margin.top + ")"
  );

  var { xScale, yScale } = getChartScales(
    areasXValues,
    [0, xGridScale.bandwidth()],
    [0, 0.5],
    [yGridScale.bandwidth(), 0]
  );
  renderAreas(
    areasData,
    svgRChart,
    { xGridScale, yGridScale },
    { xScale, yScale },
    isCombined
  );
}

function renderLines(
  data,
  svg_,
  { xGridScale, yGridScale },
  { xScale, yScale },
  isCombined
) {
  var lines = svg_.selectAll("path").data(data);
  var xScale = xScale;

  var combinedCol = [];
  var dCombined = [];
  if (isCombined) {
    combinedCol = _.filter(data, { id: "Overall" })[0];
    if (combinedCol != null) {
      _.forEach(combinedCol.values, function (val, index) {
        dCombined.push({
          x_: xScale(val[0]),
          y_: yGridScale(combinedCol.id) + yScale(val[1]),
        });
      });
    }
  }

  var yAxes = svgLYAxes.selectAll("g.y_axis").data(data);
  var yAxis = d3.axisLeft(yScale);
  yAxes
    .enter()
    .append("g")
    .merge(yAxes)
    .attr("class", "y_axis")
    .attr("transform", (d) => {
      if (isCombined) {
        return "translate(" + 0 + "," + yGridScale("Overall") + ")";
      } else {
        var translateY = d.id == "Overall" ? 0 : yGridScale(d.id);
        return "translate(" + 0 + "," + translateY + ")";
      }
    })
    .style("opacity", (d) => {
      if (isCombined && d.id != "Overall") return 0;
      if (!isCombined && d.id == "Overall") return 0;
      return 1;
    })
    .call(
      yAxis
        .tickValues([0, 0.25, 0.5, 0.75, 1.0])
        .tickSize(-xGridScale.bandwidth())
    )
    .call((g) => g.selectAll(".tick line").attr("stroke-opacity", 0.25))
    .call((g) => g.select(".domain").remove())
    .style("color", "gray");

  lines
    .enter()
    .append("path")
    .merge(lines)
    .transition()
    .duration(1000)
    .attr("id", (d) => d.id)
    .attr("stroke-width", 3.5)
    // .attr("stroke", (d) => {
    //   return isCombined ? color("Overall") : color(d.id);
    // })
    .attr("stroke", d3.schemeCategory10[0])
    .attr("opacity", (d) => {
      return isCombined && d.id != "Overall" ? 0 : 1;
    })
    .attr("fill", "none")
    .attr("d", (d) => {
      if (isCombined) {
        return line(dCombined);
      } else {
        if (d.id == "Overall") return "";

        var d_ = [];
        _.forEach(d.values, function (val, index) {
          d_.push({
            x_: xScale(val[0]),
            y_: yGridScale(d.id) + yScale(val[1]),
          });
        });
        return line(d_);
      }
    });

  svgLXAxisLabel
    .attr("transform", (d) => {
      if (isCombined)
        return (
          "translate(" +
          xGridScale.bandwidth() / 2 +
          "," +
          (svgHeight - margin.top - margin.bottom / 2) +
          ")"
        );
      if (!isCombined)
        return (
          "translate(" +
          xGridScale.bandwidth() / 2 +
          "," +
          (heightMultiplier * svgHeight - margin.top - margin.bottom / 3) +
          ")"
        );
    })
    .text("Month")
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("font-weight", 600);

  var xAxes = svgLXAxes.selectAll("g.x_axis").data(data);
  var xAxis = d3.axisBottom(xScale).tickFormat(dateFormatter);
  xAxes
    .enter()
    .append("g")
    .merge(xAxes)
    .transition()
    .duration(1000)
    .attr("id", (d) => d.id)
    .attr("class", "x_axis")
    .attr("transform", (d) => {
      if (isCombined) {
        return (
          "translate(" +
          0 +
          "," +
          (yGridScale("Overall") + yGridScale.bandwidth()) +
          ")"
        );
      } else {
        var translateY_ =
          d.id == "Overall" ? 0 : yGridScale(d.id) + yGridScale.bandwidth();
        // console.log("translate(" + 0 + "," + translateY_ + ")");
        return "translate(" + 0 + "," + translateY_ + ")";
      }
    })
    .call(
      xAxis
        .tickValues(_.filter(xScale.domain(), (val, index) => !(index % 4)))
        .tickSizeOuter(0)
    )
    .style("color", "gray")
    // .style("opacity", 1)
    .style("opacity", (d) => {
      if (isCombined && d.id != "Overall") return 0;
      if (!isCombined && d.id == "Overall") return 0;
      return 1;
    })
    .selectAll("text")
    .style("text-anchor", "start")
    .style("dominant-baseline", "central")
    .attr("dx", "-0.5em")
    .style("color", "gray");

  // var yGrid = svgLYAxes.selectAll("g.grid").data(data);
  // // var yAxis = d3.axisLeft(yScale);
  // yGrid
  //   .enter()
  //   .append("g")
  //   .merge(yGrid)
  //   .attr("class", "grid")
  //   .attr("transform", (d) => {
  //     if (isCombined) {
  //       // debugger
  //       return "translate(" + 0 + "," + yGridScale("Overall") + ")";
  //     } else {
  //       var translateY = d.id == "Overall" ? 0 : yGridScale(d.id);
  //       return "translate(" + 0 + "," + translateY + ")";
  //     }
  //   })
  //   .style("opacity", (d) => {
  //     if (isCombined && d.id != "Overall") return 0;
  //     if (!isCombined && d.id == "Overall") return 0;
  //     return 1;
  //   })
  //   .call(
  //     yAxis
  //       .tickValues([0.25, 0.5, 0.75, 1.0])
  //       .tickSize(-xGridScale.bandwidth())
  //       .tickFormat("")
  //   )
  //   .call((g) => g.select(".domain").remove())
  //   .call((g) => {
  //     g.selectAll(".tick line")
  //       .attr("stroke-opacity", 0.2)
  //       // .attr("stroke-dasharray", "5 10");
  //   });

  // yAxes.exit();
}

function renderAreas(
  data,
  svg_,
  { xGridScale, yGridScale },
  { xScale, yScale },
  isCombined
) {
  var areas = svg_.selectAll("path").data(data);
  var xScale = xScale;
  var dCombined = [];
  if (isCombined) {
    var combinedCol = _.filter(data, { group: "Overall" })[0];
    if (combinedCol != null) {
      _.forEach(combinedCol.values, function (val, index) {
        dCombined.push({
          // x0: xGridScale(1) + xScale(val[0]),
          x0: xScale(val[0]),
          y0: yGridScale(combinedCol.group) + yGridScale.bandwidth(),
          y1: yGridScale(combinedCol.group) + yScale(val[1]),
        });
      });
    }
  }

  var axesData = _.chain(data).map("group").uniq().value();
  var yAxes = svgRYAxes.selectAll("g.y_axis").data(axesData);
  var yAxis = d3.axisLeft(yScale);
  yAxes
    .enter()
    .append("g")
    .merge(yAxes)
    .attr("class", "y_axis")
    .attr("transform", (d) => {
      if (isCombined) {
        // debugger
        return "translate(" + 0 + "," + yGridScale("Overall") + ")";
      } else {
        var translateY = d == "Overall" ? 0 : yGridScale(d);
        return "translate(" + 0 + "," + translateY + ")";
      }
    })
    .style("opacity", (d) => {
      if (isCombined && d != "Overall") return 0;
      if (!isCombined && d == "Overall") return 0;
      return 1;
    })
    .call(
      yAxis
        .tickValues([0.0, 0.1, 0.2, 0.3, 0.4, 0.5])
        .tickFormat((d, i) => 100 * d + "%")
        .tickSize(-xGridScale.bandwidth())
    )
    .call((g) => g.selectAll(".tick line").attr("stroke-opacity", 0.25))
    .call((g) => g.select(".domain").remove())
    .style("color", "gray");

  areas
    .enter()
    .append("path")
    .merge(areas)
    .transition()
    .duration(1000)
    .attr("id", (d) => d.id)
    .attr("opacity", (d) => {
      return isCombined && d.group != "Overall" ? 0 : 0.6;
    })
    .attr("fill", (d) => {
      var strMatch = "";
      // debugger
      if (d.id.search("Post") > -1) strMatch = "Post";
      if (d.id.search("Pre") > -1) strMatch = "Pre";
      if (d.id.search("Pan") > -1) strMatch = "Pan";

      return color(strMatch);
    })
    .attr("d", (d) => {
      if (isCombined) {
        var dMapped = _.filter(data, { id: d.combinedMapping })[0];
        var d_ = [];
        _.forEach(dMapped.values, function (val, index) {
          // debugger
          d_.push({
            x0: xScale(val[0]),
            y0: yGridScale(dMapped.group) + yGridScale.bandwidth(),
            y1: yGridScale(dMapped.group) + yScale(val[1]),
          });
        });
        return area(d_);
      } else {
        if (d.group == "Overall") return "";

        var d_ = [];
        _.forEach(d.values, function (val, index) {
          d_.push({
            x0: xScale(val[0]),
            y0: yGridScale(d.group) + yGridScale.bandwidth(),
            y1: yGridScale(d.group) + yScale(val[1]),
          });
        });
        return area(d_);
      }
    });

  // var xAxes = svgRXAxes.selectAll("g.x_axis").data(data);
  var xAxes = svgRXAxes.selectAll("g.x_axis").data(axesData);
  var xAxis = d3.axisBottom(xScale);

  svgRXAxisLabel
    .attr("transform", (d) => {
      if (isCombined)
        return (
          "translate(" +
          xGridScale.bandwidth() / 2 +
          "," +
          (svgHeight - margin.top - margin.bottom / 2) +
          ")"
        );
      if (!isCombined)
        return (
          "translate(" +
          xGridScale.bandwidth() / 2 +
          "," +
          (heightMultiplier * svgHeight - margin.top - margin.bottom / 3) +
          ")"
        );
    })
    .text("Frustration Index")
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("font-weight", 600);

  xAxes
    .enter()
    .append("g")
    .merge(xAxes)
    .transition()
    .duration(1000)
    // .attr("id", (d) => d.id)
    .attr("id", (d) => d)
    .attr("class", "x_axis")
    .attr("transform", (d) => {
      if (isCombined) {
        return (
          "translate(" +
          0 +
          "," +
          (yGridScale("Overall") + yGridScale.bandwidth()) +
          ")"
        );
      } else {
        var translateY_ =
          d == "Overall" ? 0 : yGridScale(d) + yGridScale.bandwidth();
        // console.log("translate(" + 0 + "," + translateY_ + ")");
        return "translate(" + 0 + "," + translateY_ + ")";
      }
    })
    // .attr("transform", (d) => {
    //   if (isCombined) {
    //     return (
    //       "translate(" +
    //       0 +
    //       "," +
    //       (yGridScale("Overall") + yGridScale.bandwidth()) +
    //       ")"
    //     );
    //   } else {
    //     var translateY_ =
    //       d.group == "Overall"
    //         ? 0
    //         : yGridScale(d.group) + yGridScale.bandwidth();
    //     // console.log("translate(" + 0 + "," + translateY_ + ")");
    //     return "translate(" + 0 + "," + translateY_ + ")";
    //   }
    // })
    .call(xAxis.tickValues([0, 2, 4, 6, 8, 10]).tickSizeOuter(0))
    .style("color", "gray")
    // .style("opacity", 1)
    // .style("opacity", (d) => {
    //   if (isCombined && d.group != "Overall") return 0;
    //   if (!isCombined && d.group == "Overall") return 0;
    //   return 1;
    // })
    .style("opacity", (d) => {
      if (isCombined && d != "Overall") return 0;
      if (!isCombined && d == "Overall") return 0;
      return 1;
    })
    .selectAll("text")
    .style("text-anchor", "start")
    .style("dominant-baseline", "central")
    .attr("dx", "-0.5em")
    .style("color", "gray");

  // var yGrid = svgRYAxes.selectAll("g.grid").data(axesData);
  // // var yAxis = d3.axisLeft(yScale);
  // yGrid
  //   .enter()
  //   .append("g")
  //   .merge(yGrid)
  //   .attr("class", "grid")
  //   .attr("transform", (d) => {
  //     if (isCombined) {
  //       // debugger
  //       return "translate(" + 0 + "," + yGridScale("Overall") + ")";
  //     } else {
  //       var translateY = d == "Overall" ? 0 : yGridScale(d);
  //       return "translate(" + 0 + "," + translateY + ")";
  //     }
  //   })
  //   .style("opacity", (d) => {
  //     if (isCombined && d != "Overall") return 0;
  //     if (!isCombined && d == "Overall") return 0;
  //     return 1;
  //   })
  //   .call(
  //     yAxis
  //       .tickValues([0.1, 0.2, 0.3, 0.4, 0.5])
  //       .tickSize(-xGridScale.bandwidth())
  //       .tickFormat("")
  //   )
  //   .call((g) => g.select(".domain").remove())
  //   .call((g) => {
  //     g.selectAll(".tick line")
  //       .attr("stroke-opacity", 0.5)
  //       .attr("stroke-dasharray", "5 10");
  //   });
}

function renderSectionNames(
  data,
  svg_,
  { xGridScale, yGridScale },
  { xScale, yScale },
  isCombined
) {
  var texts = svg_.selectAll("text").data(data);
  texts
    .enter()
    .append("text")
    .merge(texts)
    .transition()
    .duration(1000)
    .attr("id", (d) => d.id)
    .attr("transform", (d) => {
      if (isCombined) {
        return (
          "translate(" +
          0 +
          "," +
          // (yGridScale(d.combinedMapping) + yGridScale.bandwidth() / 2) +
          yGridScale(d.combinedMapping) +
          ")"
        );
      } else {
        return (
          "translate(" +
          0 +
          "," +
          // (yGridScale(d.id) + yGridScale.bandwidth() / 2) +
          yGridScale(d.id) +
          ")"
        );
      }
    })
    .attr("opacity", (d) => {
      return isCombined && d.group != "Overall" ? 0 : 1;
    })
    // .attr("fill", (d) => {
    //   return isCombined ? color("Overall") : color(d.group);
    // })
    .attr("fill", d3.schemeCategory10[0])
    .text((d) => {
      if (isCombined) {
        return d.combinedMapping;
      } else {
        if (d.group == "Overall") return "";
        return d.group;
      }
    })
    .attr("font-size", 14)
    .attr("font-weight", 800)
    .style("dominant-baseline", "middle")
    .style("text-anchor", "end");
}
// Helpers
function dateFormatter(label) {
  return moment(label, "YYYY-MM-DD").format("MMM-YY");
}

// // Debug Code - Delete Later
// function markAreas() {
//   svg
//     .append("rect")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight)
//     .attr("fill", "none")
//     .attr("stroke", d3.schemePastel1[0])
//     .attr("stroke-width", 4);

//   svgl
//     .append("rect")
//     .attr("transform", (d) => {
//       return "translate(" + 0 + "," + yGrid(lines[0]) + ")";
//     })
//     .attr("width", xGrid.bandwidth())
//     .attr("height", yGrid.bandwidth())
//     .attr("fill", d3.schemePastel1[1])
//     .attr("stroke", d3.schemePastel1[0])
//     .attr("stroke-width", 4);

//   svgr
//     .append("rect")
//     .attr("transform", (d) => {
//       return "translate(" + 0 + "," + yGrid(lines[0]) + ")";
//     })
//     .attr("width", xGrid.bandwidth())
//     .attr("height", yGrid.bandwidth())
//     .attr("fill", d3.schemePastel1[1])
//     .attr("stroke", d3.schemePastel1[0])
//     .attr("stroke-width", 4);
// }

// // markAreas();
