var margin = { top: 30, right: 50, bottom: 30, left: 150, gap: 20 }
const pw = d3.select('#svg-container').node().getBoundingClientRect().width

const newCompanies = companies.filter(
  company => company.taxRate > 0 && company.taxRate < 45,
)

console.log({ newCompanies })

const splitButton = d3.select('#split-bubbles')
const combineButton = d3.select('#combine-bubbles')

let allowSplit = false
let allowCombine = false

function manageSplitCombine() {
  if (!allowSplit) {
    splitButton.node().disabled = true
    splitButton.attr(
      'title',
      'Combined force simulation is either in progress or current configuration is already split',
    )
  } else {
    splitButton.node().disabled = false
    splitButton.attr('title', null)
  }

  if (!allowCombine) {
    combineButton.node().disabled = true
    combineButton.attr(
      'title',
      'Split force simulation is either in progress or current configuration is already combined',
    )
  } else {
    combineButton.node().disabled = false
    combineButton.attr('title', null)
  }
}
manageSplitCombine()

var svgWidth = pw,
  combinedHeight = 250
var splitHeight = 1200
var svg = d3
  .select('#svg-container')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', combinedHeight)

var width = svgWidth - margin.left - margin.right
var heightInnerCombined = combinedHeight - margin.top - margin.bottom
var heightInnerSplit = splitHeight - margin.top - margin.bottom

const sectors = [...new Set(newCompanies.map(c => c.sector))]

const maxCapitalization = Math.max(...newCompanies.map(c => c.capitalization))

const nodes = newCompanies.map(company => {
  const radius = Math.sqrt(company.capitalization / maxCapitalization) * 20
  const value = company.taxRate
  return {
    radius,
    value,
    sector: company.sector,
    name: company.symbol,
    volume: company.capitalization,
  }
})

var yScale = d3
  .scaleBand()
  .domain(sectors)
  .range([0, splitHeight - margin.top - margin.bottom])

const xValues = nodes.map(n => n.value)
// const xDomain = d3.extent(xValues);
const xDomain = [0, 45]
var xScale = d3.scaleLinear().domain(xDomain).range([0, width])

// var xColorScale = d3.scaleQuantile().domain([0, 40]).range(d3.schemeOrRd[5]);
var xColorScale = d3
  .scaleQuantile()
  // .domain(xValues)
  .domain(xDomain)
  .range(colorScheme[5])

var sizeScale = d3
  .scaleSqrt()
  .domain([0, parseFloat(maxCapitalization)])
  .range([0, 20])

// Replace margin.top * 0.3 with yScale.bandwith (/2?)

var div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip absolute bg-white rounded px-1 text-xs border')
  .style('opacity', 0)

// https://observablehq.com/@d3/color-legend
d3.select('#color-legend')
  .append('svg')
  .attr('width', 260)
  .attr('height', 66)
  .append(() =>
    legend({ color: xColorScale, title: 'Frustration Index', width: 260 }),
  )

// Size Legend
const areaValues = [10e3, 50e3, 10e4, 25e4]
// const sizeValues = [2, 5, 10, 20]; // radii
const sizeValues = areaValues.map(a => sizeScale(a))
const gapInCircles = 25
var cumulativeSize = 0
const cumulativeSizes = []
sizeValues.forEach((sz, i) => {
  if (i == 0) {
    cumulativeSize += sz
  } else {
    cumulativeSize += sizeValues[i - 1] + sizeValues[i]
  }

  cumulativeSizes.push(cumulativeSize)
})

const sizeLegend = d3
  .select('#size-legend')
  .append('svg')
  .attr('width', 260)
  .attr('height', 66)

const moveSizeObjectDownBy = 10

sizeLegend
  .append('g')
  .attr('class', 'g-size-container')
  .attr('transform', `translate(0, ${moveSizeObjectDownBy})`)
  .selectAll('.g-size-circle')
  .data(sizeValues)
  .enter()
  .append('g')
  .attr('class', 'g-size-circle')
  .append('circle')
  .attr('r', d => d)
  .style('fill', '#bebebe')
  .style('stroke-width', 1)
  .style('stroke', 'gray')
  .attr('cx', (d, i) => cumulativeSizes[i] + i * gapInCircles + 1)
  .attr('cy', sizeValues[sizeValues.length - 1] + 1)

sizeLegend
  .selectAll('.g-size-circle')
  .append('text')
  .attr('alignment-baseline', 'middle')
  .attr('dy', sizeValues[sizeValues.length - 1] + 2)
  // .attr("dy", 21)
  .attr('dx', (d, i) => d + cumulativeSizes[i] + (i + 0.1) * gapInCircles)
  .style('font-size', 8)
  .text((d, i) => areaValues[i] / 1000 + 'k')

sizeLegend
  .append('text')
  .attr('alignment-baseline', 'middle')
  .attr('transform', 'translate(0, 8)')
  .style('font-size', 10)
  .style('font-weight', 600)
  .text('Call Volume')

const xAxisLabel = svg
  .append('g')
  .attr(
    'transform',
    `translate(${margin.left + width / 2}, ${margin.top - 20})`,
  )
  .append('text')
  .attr('class', 'text-xs font-semibold tracking-wider')
  .text('Frustration Index')
  .attr('text-anchor', 'middle')

const xAxis = svg
  .append('g')
  .attr('id', 'x-axis')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

xAxis
  .call(d3.axisTop(xScale).tickSize(-heightInnerCombined))
  .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.1))
  .call(g => g.select('.domain').remove())

function renderXAxisSplit() {
  xAxis
    .call(d3.axisTop(xScale).tickSize(-heightInnerSplit))
    .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.1))
    .call(g => g.select('.domain').remove())
}
function renderXAxisCombined() {
  xAxis
    .call(d3.axisTop(xScale).tickSize(-heightInnerCombined))
    .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.1))
    .call(g => g.select('.domain').remove())
}

const yAxisLabel = svg
  .append('g')
  .attr('transform', `translate(${margin.left - 23}, ${margin.top - 20})`)
  .append('text')
  .attr('class', 'text-xs font-semibold ')
  .text('Line of Business')
  .attr('text-anchor', 'end')

const yAxisSplit = svg
  .append('g')
  .attr('id', 'y-axis-split')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .call(d3.axisLeft(yScale).tickSize(-width))
  .call(g => g.select('.domain').remove())
  .call(g => {
    g.selectAll('.tick line').attr('stroke-opacity', 0.1)
    g.selectAll('.tick text')
      .attr('transform', 'translate(-20,0)')
      .classed('text-xs', true)
  })
  .attr('opacity', 0)

var yScaleCombined = d3
  .scaleBand()
  .domain(['Servicing'])
  .range([0, heightInnerCombined])

const yAxisCombined = svg
  .append('g')
  .attr('id', 'y-axis-split')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .call(d3.axisLeft(yScaleCombined).tickSize(-width))
  .call(g => g.select('.domain').remove())
  .call(g => {
    g.selectAll('.tick line').attr('stroke-opacity', 0.1)
    g.selectAll('.tick text')
      .attr('transform', 'translate(-20,0)')
      .classed('text-xs', true)
  })
  .attr('opacity', 0)

const bubbles = svg
  .append('g')
  .attr(
    'transform',
    `translate(${margin.left}, ${margin.top + heightInnerCombined / 2})`,
  )
  .attr('class', 'bubbles')

var allBubbles
function ticked() {
  var u = bubbles.selectAll('circle').data(nodes)
  allBubbles = u
    .enter()
    .append('circle')
    .attr('r', d => sizeScale(d.volume))
    .style('fill', function (d) {
      return xColorScale(d.value)
    })
    .attr('stroke', function (d) {
      return d3.rgb(xColorScale(d.value)).darker(0.5)
    })
    .style('stroke-width', 1)
    .merge(u)
    .attr('cx', function (d) {
      return d.x
    })
    .attr('cy', function (d) {
      return d.y
    })
    .on('mouseover', (e, d) => {
      div.transition().duration(200).style('opacity', 1)
      // div.html(`Radius: ${d.radius}; Tax rate: ${d.value}`);
      div.html(
        `<div><span class="font-bold">${d.name}</span></div>
         <div class="flex space-between">
           <div>Frustration index:</div>
           <div class="pl-2 font-bold">${d.value.toFixed(0)}</div>
         </div>
         <div class="flex space-between">
           <div>Call volume:</div>
           <div class="pl-2 font-bold">${d.volume.toFixed(0)}</div>
         </div>`,
      )
      div
        .style('left', e.clientX + 'px')
        .style('top', e.clientY + window.scrollY + 30 + 'px')
      d3.select(e.target).attr('stroke', 'black').style('stroke-width', 2)
    })
    .on('mouseout', (e, d) => {
      div.transition().duration(500).style('opacity', 0)
      d3.select(e.target)
        .attr('stroke', d3.rgb(xColorScale(d.value)).darker(0.5))
        .style('stroke-width', 1)
    })
  // console.log(u);
  // console.log(
  //   u._groups[0].map((c) => ({
  //     cx: c.attributes.cx.value,
  //     cy: c.attributes.cy.value,
  //     r: c.attributes.r.value,
  //     style: c.attributes.style.value,
  //   }))
  // );

  u.exit().remove()
}

var search = d3.select('#search')

function searchBy(term) {
  if (term) {
    d3.select('.bubbles').classed('g-searching', true)
    allBubbles.classed('c-match', d => d.name.toLowerCase().includes(term))
  } else {
    d3.select('.bubbles').classed('g-searching', false)
  }
}

search.on('keyup', e => {
  searchBy(e.target.value.trim())
})

function splitSim() {
  allowSplit = false
  manageSplitCombine()
  renderXAxisSplit()

  yAxisSplit.transition().duration(1000).attr('opacity', 1)
  yAxisCombined.transition().duration(1000).attr('opacity', 0)
  yAxisLabel.text('Experiences')

  svg.transition().duration(1000).attr('height', splitHeight)

  bubbles.attr('transform', `translate(${margin.left}, ${margin.top})`)

  d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(1))
    .force(
      'x',
      d3
        .forceX()
        .x(function (d) {
          return xScale(d.value)
        })
        // split X strength
        .strength(1),
    )
    .force(
      'y',
      d3
        .forceY()
        .y(function (d) {
          return yScale(d.sector) + yScale.bandwidth() / 2
        })
        // split Y strength
        .strength(1.2),
    )
    .force(
      'collision',
      d3.forceCollide().radius(function (d) {
        return d.radius + collisionDistance
      }),
    )
    .on('tick', ticked)
    .on('end', () => {
      console.log('split force simulation ended')
      allowCombine = true
      manageSplitCombine()
    })
}
function combinedSim() {
  allowCombine = false
  manageSplitCombine()
  renderXAxisCombined()

  yAxisSplit.transition().duration(1000).attr('opacity', 0)
  yAxisCombined.transition().duration(1000).attr('opacity', 1)

  yAxisLabel.text('Line of Business')
  svg.transition().duration(1000).attr('height', combinedHeight)

  bubbles.attr(
    'transform',
    `translate(${margin.left}, ${margin.top + heightInnerCombined / 2})`,
  )

  d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(1))
    .force(
      'x',
      d3
        .forceX()
        .x(function (d) {
          return xScale(d.value)
        })
        // combine X strength
        .strength(1),
    )
    .force(
      'y',
      d3.forceY().y(function (d) {
        return 0
      }),
      // combine Y strength
      // .strength(1)
    )
    .force(
      'collision',
      d3.forceCollide().radius(function (d) {
        return d.radius + collisionDistance
      }),
    )
    .on('tick', ticked)
    .on('end', () => {
      console.log('combined force simulation ended')
      allowSplit = true
      manageSplitCombine()
    })
}

combinedSim()
