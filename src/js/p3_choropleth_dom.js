(function () {
  const svg = d3.select("#usmap");

  const margin = { top: 300 };

  const w = 975;
  const h = 610 + margin.top;

  // const window_width = window.innerWidth;
  const pw = d3.select("#svg-container").node().getBoundingClientRect().width;

  const factor = (0.3 * pw) / +w;
  // const factor = 2 / 5;

  svg.attr("width", +w * factor);
  svg.attr("height", +h * factor);
  svg.attr("viewBox", `0 0 ${w * factor} ${h * factor}`);

  const path = d3.geoPath();

  var div = d3
    .select("body")
    .append("div")
    .attr(
      "class",
      "cho-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border"
    )
    .style("opacity", 0);

  Promise.all([
    d3.json("data/counties-albers-10m.json"),
    d3.csv("data/state_codes.csv"),
    d3.csv("data/q1.csv"),
  ]).then(([us, stateCodes, data]) => {
    const stateCodeMap = {};
    stateCodes.forEach((sc) => {
      stateCodeMap[sc.state.toLowerCase()] = sc.code;
    });

    const colorDomain = data.map((d) => parseFloat(d.unemployment));

    var quarters = _.chain(data).map("quarter").uniq().value();

    var latestQ;

    quarters.forEach((quarter) => {
      if (!latestQ) {
        latestQ = quarter;
      } else {
        const storedQYear = parseInt(latestQ.split("-")[0], 10);
        const quarterYear = parseInt(quarter.split("-")[0], 10);
        if (quarterYear > storedQYear) {
          latestQ = quarter;
        } else if (quarterYear === storedQYear) {
          const storedQq = parseInt(latestQ.split("-Q")[1], 10);
          const Qq = parseInt(quarter.split("-Q")[1], 10);
          if (Qq > storedQq) {
            latestQ = quarter;
          }
        }
      }
    });

    var latestQData = _.filter(data, { quarter: latestQ });

    renderMap(us, stateCodeMap, latestQData, colorDomain);
  });

  function evalTranslate(x, y) {
    return `translate(${x}, ${y})`;
  }
  function renderMap(topo, stateCodeMap, data, colorDomain) {
    // const edDomain = d3.extent(ed);

    // const xColorScale = d3.scaleLinear().domain(edDomain).range(["white", clr]);
    // const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, 1]);

    // const colorScale = d3
    //   .scaleSequential((t) => d3.interpolateSpectral(1 - t))
    //   .domain([0, 1]);
    // // .scaleSequential(d3.interpolateSpectral)
    // // .domain([1, 0]);
    // const chooseColors = [0, 1, 2, 7];
    // const chooseColors = [1, 2, 3, 7];
    const chooseColors = [0, 2, 3, 6];
    const customSchemeSpectral = d3.schemeSpectral[9].filter(
      (c, i) => chooseColors.indexOf(i) > -1
    );

    const colorScale = d3
      .scaleQuantile()
      .domain(colorDomain.sort())
      .range(customSchemeSpectral.slice().reverse());
    // .range(customSchemeSpectral);

    svg
      .append("g")
      .append("text")
      .attr("class", "font-sans")
      .text("States by Unemployment Rate")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      // .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("transform", `translate(${(w * factor) / 2}, ${22})`)
      .attr("style", "font-size: 12px; font-weight: 600;");

    svg
      .append("g")
      .attr(
        "transform",
        `scale(${factor}, ${factor}), translate(0, ${margin.top * factor})`
      )
      .selectAll("path")
      .data(topojson.feature(topo, topo.objects.states).features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const state = d.properties.name.toLowerCase();
        const stateData = _.find(data, (dd) => dd.queue.toLowerCase() == state);
        return colorScale(stateData.unemployment);
      })
      .attr("opacity", 0.7)
      .on("mouseover", (e, d) => {
        div.transition().duration(200).style("opacity", 1);
        const code = stateCodeMap[d.properties.name.toLowerCase()];
        d3.select(`.band-${code}`).classed("b-active", true);
        d3.selectAll(`.rect-${code}`).raise().classed("r-active", true);
        d3.select(".g-links").classed("hovered", true);
        d3.select(e.target)
          .raise()
          .attr("opacity", 0.9)
          .attr("stroke", "black")
          .style("outline-offset", "-4px")
          .attr("stroke-width", 2);

        d3.select(".c-mesh").attr("opacity", 0);

        const state = d.properties.name.toLowerCase();
        const stateData = _.find(data, (dd) => dd.queue.toLowerCase() == state);
        div.html(
          `<div> <span class="font-bold">${stateData.queue}</span> (${stateData.quarter})</div>
          <div class="flex space-between">
            <div>Unemployment:</div>
            <div class="pl-2">${stateData.unemployment}%</div>
          </div>`
        );
        div
          .style("left", e.clientX + "px")
          // TODO: Tooltip issue
          .style("top", e.clientY + window.scrollY + 15 + "px");
      })
      .on("mouseout", (e, d) => {
        const code = stateCodeMap[d.properties.name.toLowerCase()];
        d3.select(`.band-${code}`).classed("b-active", false);
        d3.selectAll(`.rect-${code}`).classed("r-active", false);
        d3.select(".g-links").classed("hovered", false);
        d3.select(e.target).attr("stroke-width", 0).attr("opacity", 0.7);
        div.transition().duration(500).style("opacity", 0);
        d3.select(".c-mesh").attr("opacity", 1);
      });
    // .on("mousemove", (e) => {
    //   div.style("left", e.clientX + "px").style("top", e.clientY + 15 + "px");
    // });

    svg
      .append("path")
      .attr("class", "c-mesh")
      // .attr("transform", `${tl ? evalTl(tl[0], tl[1]) : ""}`)
      .attr(
        "transform",
        `scale(${factor}, ${factor}), translate(0, ${margin.top * factor})`
      )
      .datum(topojson.mesh(topo, topo.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    d3.select("#color-legend")
      .append("svg")
      // .attr("transform", `${tl ? evalTl(tl[0], tl[1]) : ""}`)
      // .append("g")
      // .attr("transform", `translate(${610 * factor}, ${20 * factor})`)
      .attr("width", 300)
      .attr("height", 66)
      .append(() =>
        legend({
          color: colorScale,
          title: "Unemployment rate(%)",
          width: 260,
          // height: 50 * factor < 40 ? 40 : 50,
          // tickSize: 6 * factor,
        })
      );
  }
})();
