var width = 1400,
  height = 1800;

d3.select("svg g")
  .selectAll("circle")
  .data(combined_data)
  .enter()
  .append("circle")
  .attr("r", (d) => d.r)
  .attr("style", (d) => d.style)
  .attr("cx", (d) => d.cx)
  .attr("cy", (d) => d.cy);

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
