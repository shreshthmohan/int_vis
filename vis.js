const newCompanies = companies.filter(
  (company) => company.taxRate > 0 && company.taxRate < 45
  // company.sector === "Financials"
);

var width = 1400,
  height = 1800;

const sectors = [...new Set(newCompanies.map((c) => c.sector))];
var xScale = d3.scaleLinear().domain([0, 40]).range([100, 800]);
var xColorScale = d3.scaleQuantile().domain([0, 40]).range(d3.schemeOrRd[5]);

var yScale = d3.scaleBand().domain(sectors).range([0, 1600]);

// var numNodes = 40;
// var nodes = d3.range(numNodes).map(function (d, i) {
//   return {
//     radius: Math.random() * 25,
//     value: Math.random(),
//   };
// });
const maxCapitalization = Math.max(
  ...newCompanies.map((c) => c.capitalization)
);

const nodes = newCompanies.map((company) => {
  const radius = Math.sqrt(company.capitalization / maxCapitalization) * 20;
  const value = company.taxRate;
  return { radius, value, sector: company.sector };
});

// var simulation = d3
//   .forceSimulation(nodes)
//   .force("charge", d3.forceManyBody().strength(1))
//   .force(
//     "x",
//     d3
//       .forceX()
//       .x(function (d) {
//         return xScale(d.value);
//         // return 0;
//       })
//       .strength(1)
//   )
//   .force(
//     "y",
//     d3.forceY().y(function (d) {
//       // return yScale(d.sector);
//       return 0;
//     })
//     // .strength(1)
//   )
//   .force(
//     "collision",
//     d3.forceCollide().radius(function (d) {
//       return d.radius + 0.5;
//     })
//   )
//   .on("tick", ticked);

function ticked() {
  var u = d3.select("svg g").selectAll("circle").data(nodes);

  u.enter()
    .append("circle")
    .attr("r", function (d) {
      return d.radius;
    })
    .style("fill", function (d) {
      return xColorScale(d.value);
    })
    .attr("stroke", function (d) {
      return d3.rgb(xColorScale(d.value)).darker(0.5);
    })
    .style("stroke-width", 1)
    .merge(u)
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    });

  // console.log(
  //   u._groups[0].map((c) => ({
  //     cx: c.attributes.cx.value,
  //     cy: c.attributes.cy.value,
  //     r: c.attributes.r.value,
  //     style: c.attributes.style.value,
  //   }))
  // );

  u.exit().remove();
}

function sim2() {
  var simu2 = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(1))
    .force(
      "x",
      d3
        .forceX()
        .x(function (d) {
          return xScale(d.value);
          // return 0;
        })
        .strength(1)
    )
    .force(
      "y",
      d3.forceY().y(function (d) {
        return yScale(d.sector);
        // return 0;
      })
      // .strength(1)
    )
    .force(
      "collision",
      d3.forceCollide().radius(function (d) {
        return d.radius + 0.5;
      })
    )
    .on("tick", ticked)
    .on("end", () => {
      console.log("ended");
      // sim1();
    });
}
function sim1() {
  var simu1 = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(1))
    .force(
      "x",
      d3
        .forceX()
        .x(function (d) {
          return xScale(d.value);
          // return 0;
        })
        .strength(1)
    )
    .force(
      "y",
      d3.forceY().y(function (d) {
        // return yScale(d.sector);
        return 0;
      })
      // .strength(1)
    )
    .force(
      "collision",
      d3.forceCollide().radius(function (d) {
        return d.radius + 0.5;
      })
    )
    .on("tick", ticked)
    .on("end", () => {
      console.log("ended");
      sim2();
    });
}

sim1();
