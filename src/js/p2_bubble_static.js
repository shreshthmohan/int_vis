var width = 1400,
  height = 1800;

var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.select("svg g")
  .selectAll("circle")
  .data(combined_data)
  .enter()
  .append("circle")
  .attr("r", (d) => d.r)
  .attr("style", (d) => d.style)
  .attr("cx", (d) => d.cx)
  .attr("cy", (d) => d.cy)
  .on("mouseover", (e, d) => {
    div.transition().duration(200).style("opacity", 0.9);
    // console.log(d.cy + 500 + "px");
    div.text("" + d.r);

    // console.log(div.node().getBoundingClientRect());

    div
      .style("left", d.cx + "px")
      .style("top", parseFloat(d.cy) + (195 - d.r) + "px");
  })
  .on("mouseout", function () {
    div.transition().duration(500).style("opacity", 0);
  });

function changeData(x) {
  x.enter()
    .append("circle")
    .merge(x)
    .transition()
    .duration(1000)
    .attr("r", (d) => d.r)
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy);
}

function splitData() {
  var v = d3.select("svg g").selectAll("circle").data(split_data);
  changeData(v);
}

function combineData() {
  var u = d3.select("svg g").selectAll("circle").data(combined_data);
  changeData(u);
}
