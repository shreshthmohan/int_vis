// console.log(d3);
// console.log(topojson);

const svg = d3.select("#usmap");

const w = svg.style("width").replace("px", "");
const h = svg.style("height").replace("px", "");

const window_width = window.innerWidth;

const factor = window_width / +w;

svg.attr("width", +w * factor * 0.8);
svg.attr("height", +h * factor * 0.8);

const path = d3.geoPath();

Promise.all([
  d3.json("data/counties-albers-10m.json"),
  d3.json("data/education.json"),
]).then(([us, edu]) => {
  // console.log("countyData:", countyData);
  // console.log("edu:", educationData);
  renderMap(us, edu, "green");
  // renderMap(us, edu, "blue", [975, 0]);
});

function evalTl(x, y) {
  return `translate(${x}, ${y})`;
}
var div = d3
  .select("body")
  .append("div")
  .attr(
    "class",
    "tooltip absolute text-center bg-white rounded px-1 text-xs border"
  )
  .style("opacity", 0);

function renderMap(topo, data, clr, tl) {
  const ed = data.map((el) => el.bachelorsOrHigher);
  const edDomain = d3.extent(ed);

  const xColorScale = d3.scaleLinear().domain(edDomain).range(["white", clr]);
  // const xColorScale = d3
  //   .scaleLinear()
  //   .domain(edDomain)
  //   .range(d3.interpolateBlues[0]);
  // const xColorScale = d3.scaleSequential(edDomain, ["white", clr]);
  // const xColorScale = d3.scaleSequential(edDomain, d3.interpolateBlues);

  svg
    .append("g")
    .attr("transform", `${tl ? evalTl(tl[0], tl[1]) : ""}`)
    .selectAll("path")
    .data(topojson.feature(topo, topo.objects.counties).features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const found = data.find((el) => el.fips == d.id);
      if (found) {
        return xColorScale(found.bachelorsOrHigher);
      }
      return "gray";
    })
    .on("mouseover", (e, d) => {
      div.transition().duration(200).style("opacity", 1);
      const found = data.find((el) => el.fips == d.id);
      if (found) {
        div.html(
          found.area_name +
            ", " +
            found.state +
            "<br/>" +
            found.bachelorsOrHigher +
            "% have bachelors or a higher degree"
        );
      }

      d3.select(e.target).attr("stroke", "gray").attr("stroke-width", 1);
      div.style("left", e.screenX + "px").style("top", e.screenY - 180 + "px");
    })
    .on("mouseout", (e, d) => {
      d3.select(e.target).attr("stroke-width", 0);
      div.transition().duration(500).style("opacity", 0);
    });

  svg
    .append("path")
    .attr("transform", `${tl ? evalTl(tl[0], tl[1]) : ""}`)
    .datum(topojson.mesh(topo, topo.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  svg
    .append("g")
    .attr("transform", `${tl ? evalTl(tl[0], tl[1]) : ""}`)
    .append("g")
    .attr("transform", "translate(610, 20)")
    .append(() =>
      legend({ color: xColorScale, title: "Higher education rate", width: 260 })
    );
}
