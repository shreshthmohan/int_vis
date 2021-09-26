// Chart Info

var motionDelay = 1000 // time in ms

// Size & Margins
var rs = document.getElementById('range-slider')
const pw = d3.select('#svg-container').node().getBoundingClientRect().width
var intervalId
let stateCodeMap = {}
let stateCodeArr = []
let timeDomain

var svgWidth = pw * 0.7,
  svgHeight = (9 * svgWidth) / 16,
  margin = { top: 20, right: 10, bottom: 30, left: 50 }
;(width = svgWidth - margin.left - margin.right),
  (height = svgHeight - margin.top - margin.bottom)

var baseOpacity = 0.7

// Setup chart components
var svg = d3
  .select('#svg-container')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)

var div = d3
  .select('body')
  .append('div')
  .attr(
    'class',
    'scatter-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border',
  )
  .style('opacity', 0)

// Shapes

// Scales
function getChartScales(xDomain, xRange, yDomain, yRange, colorDomain) {
  var x = d3.scaleLinear().domain(xDomain).range(xRange)
  var y = d3.scaleLinear().domain(yDomain).range(yRange)
  var color = d3
    .scaleOrdinal()
    .domain(colorDomain)
    .range(
      _.concat(
        d3.schemeCategory10,
        d3.schemeAccent,
        d3.schemeDark2,
        d3.schemeSet1,
        d3.schemeSet2,
        d3.schemeSet3,
      ),
    )

  return { xScale: x, yScale: y, colorScale: color }
}
var xScale, yScale, colorScale, sizeScale
var tdl
// Load Data
var scatterData = []
Promise.all([
  // d3.csv("data/q1.csv"),
  d3.csv('data/new/motion.csv'),
  d3.csv('data/state_codes.csv'),
]).then(([q1, stateCodes]) => {
  // var q1 = _.filter(q1, { queue: "Arizona" });
  // var q2 = _.filter(q1, { queue: "Arizona" });
  // var q3 = _.filter(q1, { queue: "Texas" });
  // q1 = [...q2, ...q3];
  stateCodeArr = stateCodes.map(sc => ({
    state: sc.state.toLowerCase(),
    code: sc.code,
  }))
  stateCodes.forEach(sc => {
    stateCodeMap[sc.state.toLowerCase()] = sc.code
  })

  var sizes = q1.map(d => d.size)
  var sizeDomain = d3.extent(sizes)
  sizeScale = d3.scaleSqrt().domain([0, sizeDomain[1]]).range([0, 20])
  // sizeScale = d3.scaleSqrt().domain([0, sizeDomain[1]]).range([5, 5]);

  var allScales = getChartScales(
    [0, 8], // frustration
    [0, width],
    [0, 30], // unemp
    [height, 0],
    _.uniq(_.map(q1, 'queue')),
  )

  xScale = allScales.xScale
  yScale = allScales.yScale
  // colorScale = allScales.colorScale;

  processData(q1)
  renderChart(q1, svg)

  // Size Legend
  const areaValues = [5, 10, 50, 100]
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
    .attr('width', 200)
    .attr('height', 66)

  const moveSizeObjectDownBy = 2

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
    .text((d, i) => areaValues[i])

  sizeLegend
    .append('text')
    .attr('alignment-baseline', 'middle')
    .attr('transform', 'translate(0, 8)')
    .style('font-size', 10)
    .style('font-weight', 600)
    .text('Call Volume')
})
var rangeSlider = d3.select('#range-slider')
var sliderValue = d3.select('#slider-value')

function processData(data) {
  var colorDomain = _.map(data, 'queue')
  var [minX, maxX] = [
    _.minBy(data, 'frustration'),
    _.maxBy(data, 'frustration'),
  ]
  var [minY, maxY] = [
    _.minBy(data, 'unemployment'),
    _.maxBy(data, 'unemployment'),
  ]

  timeDomain = _.uniq(_.map(data, 'quarter')).sort()
  tdl = timeDomain.length

  const groupedData = _.groupBy(data, 'queue')

  rangeSlider
    .attr('min', 0)
    .attr('max', timeDomain.length - 1)
    .attr('value', 0)
    .on('input', e => {
      Object.keys(groupedData).forEach(q =>
        renderChartCore(groupedData[q].slice(0, +e.target.value + 1)),
      )
    })

  Object.keys(groupedData).forEach(q =>
    renderChartCore(groupedData[q].slice(0, +rs.value + 1)),
  )

  const startButton = d3.select('#start')
  const stopButton = d3.select('#stop')

  startButton.on('click', () => {
    startButton.node().disabled = true
    stopButton.node().disabled = false

    if (rs.value == tdl - 1) {
      rs.value = 0
    }
    intervalId = setInterval(() => {
      if (rs.value == tdl - 1) {
        clearInterval(intervalId)
        startButton.node().disabled = false
        stopButton.node().disabled = true
        return
      }
      rs.value++
      Object.keys(groupedData).forEach(q =>
        renderChartCore(groupedData[q].slice(0, +rs.value + 1)),
      )
    }, motionDelay)
  })

  stopButton.on('click', () => {
    stopButton.node().disabled = true
    startButton.node().disabled = false
    clearInterval(intervalId)
  })

  var search = d3.select('#search')
  search.on('keyup', e => {
    const searchStr = e.target.value
    let matchCount = 0
    let matchedCode = ''
    if (searchStr) {
      d3.select('#s-circles').classed('searching', true)
      const lowerSearchStr = searchStr.toLowerCase()

      stateCodeArr.forEach(sc => {
        if (sc.state.includes(lowerSearchStr)) {
          d3.select(`g.g-${sc.code}`).classed('g-active', true).raise()
          matchCount++
          matchedCode = sc.code
        } else {
          d3.select(`g.g-${sc.code}`).classed('g-active', false)
        }
      })
    } else {
      stateCodeArr.forEach(sc => {
        d3.select(`g.g-${sc.code}`).classed('g-active', false)
      })
      d3.select('#s-circles').classed('searching', false)
    }
    if (matchCount === 1) {
      // set class so that the line/links for one state are visible
      d3.select(`g.g-${matchedCode} path`).classed('p-matched', true)
    } else {
      stateCodeArr.forEach(sc => {
        d3.select(`g.g-${sc.code} path`).classed('p-matched', false)
      })
    }
  })

  return [minX, maxX, minY, maxY]
}
var svgChart = svg
  .append('g')
  .attr('id', 's-circles')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

function renderChartCore(data) {
  sliderValue.text(timeDomain[+rs.value])
  // console.log("data:", data);
  const t = svg.transition().duration(250)

  const stateName = data[0].queue.toLowerCase()
  const stateCode = stateCodeMap[stateName]
  let qg = svgChart.select(`g.g-${stateCode}`)
  if (qg.empty()) {
    qg = svgChart.append('g').attr('class', `g-${stateCode}`)
  }

  // Lines / links / paths
  const linegen = d3
    .line()
    .x(d => xScale(d.frustration))
    .y(d => yScale(d.unemployment))

  qg.selectAll('.current').classed('current', false).classed('previous', true)
  const matched = qg.selectAll('.p-matched').empty() ? '' : 'p-matched'

  qg
    // .selectAll("path")
    .append('path')
    .attr('class', `p-${stateCode}-${data.length} current ${matched}`)
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke-width', 1)
    // .transition(t)
    .attr('stroke', 'gray')
    .attr('visibility', 'hidden')
    // .attr("stroke-width", 5)
    // .attr("opacity", 0.03)
    .attr('d', linegen)

  var rm = qg.selectAll('.previous').remove()

  // Circles
  qg.selectAll('circle')
    // .data(dataValues, keyFunction)
    .data(data, d => d.quarter + '-' + d.queue)
    .join(
      enter => {
        return (
          enter
            .append('circle')
            .attr('r', d => sizeScale(d.size))
            // .attr("r", 5)
            .attr('cx', d => xScale(d.frustration))
            .attr('cy', d => yScale(d.unemployment))
            .call(enter => {
              // console.log("enter:", enter);
              return (
                enter
                  // .transition(t)
                  // .attr("r", 5)
                  .attr('fill', (d, i) =>
                    i === data.length - 1 ? 'steelblue' : 'lightgray',
                  )
                  .attr('opacity', (d, i) =>
                    i === data.length - 1 ? baseOpacity : 0.1,
                  )
                  .attr('stroke', (d, i) =>
                    i === data.length - 1
                      ? d3.rgb('steelblue').darker(0.5)
                      : d3.rgb('gray').darker(0.5),
                  )
              )
            })
            .on('mouseover', (e, d) => {
              // console.log(d);
              div.transition().duration(200).style('opacity', 1)
              d3.select(e.target).raise()

              div.html(
                `<div> <span class="font-bold">${d.queue}</span> (${
                  d.quarter
                })</div>
               <div class="flex space-between">
                 <div>Frustration index:</div>
                 <div class="pl-2 font-bold">${parseFloat(
                   d.frustration,
                 ).toFixed(1)}</div>
               </div>
               <div class="flex space-between">
                 <div>Unemployment rate:</div>
                 <div class="pl-2 font-bold">${parseFloat(
                   d.unemployment,
                 ).toFixed(1)}%</div>
               </div>
               <div class="flex space-between">
                 <div>Calls:</div>
                 <div class="pl-2 font-bold">${d.size}</div>
               </div>
               `,
              )

              div
                .style('left', e.clientX + 'px')
                .style('top', e.clientY + 20 + window.scrollY + 'px')
            })
            .on('mouseout', (e, d) => {
              div.transition().duration(500).style('opacity', 0)
            })
        )
      },
      update =>
        update
          .attr('opacity', (d, i) =>
            i === data.length - 1 ? baseOpacity : 0.1,
          )
          .attr('fill', (d, i) =>
            i === data.length - 1 ? 'steelblue' : 'lightgray',
          )
          .attr('stroke', (d, i) =>
            i === data.length - 1
              ? d3.rgb('steelblue').darker(0.5)
              : d3.rgb('gray').darker(0.5),
          ),

      exit =>
        exit
          .attr('fill', 'lightgray')
          .attr('stroke', d3.rgb('gray').darker(0.5))
          .attr('opacity', 0.1)
          .remove(),
    )
    .raise()
}

function renderChart(data, svg) {
  var svgXAxis = svg
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (margin.top + height) + ')',
    )

  var svgYAxis = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var xAxis = d3.axisBottom(xScale)
  svgXAxis
    .append('g')
    .call(xAxis)
    .style('color', 'gray')
    .attr('class', 'x-axis')

  svgXAxis
    .append('text')
    .attr('transform', `translate(${width / 2}, ${margin.bottom})`)
    .style('text-anchor', 'middle')
    .style('dominant-baseline', 'top')
    .attr('class', 'text-xs ')
    .text('Frustration Index')

  var yAxis = d3
    .axisLeft(yScale)
    .tickValues([0, 5, 10, 15, 20, 25, 30])
    .tickFormat(d => d + '%')
  svgYAxis.append('g').call(yAxis).style('color', 'gray')

  svgYAxis
    .append('text')
    .attr('transform', `translate(${-margin.left}, ${height / 2}), rotate(-90)`)
    .style('text-anchor', 'middle')
    .style('dominant-baseline', 'hanging')
    .attr('class', 'text-xs ')
    .text('Unemployment Rate')
}
