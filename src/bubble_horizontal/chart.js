/* global legend, options */
const pw = d3.select('#svg-container').node().getBoundingClientRect().width

const {
  sizeField,
  xField,
  nameField, // also search field
  // colorField,
  segmentField,
} = dimensions

const {
  marginTop = 60,
  marginRight = 90,
  marginBottom = 20,
  marginLeft = 50,

  bgColor = 'transparent',

  collisionDistance,
  // colorScheme,

  customColorScheme,
  inbuiltScheme = 'schemeOrRd',
  numberOfColors = 5,

  xDomainCustom,

  sizeRange = [2, 20],

  sizeLegendValues = [10e3, 50e3, 10e4, 25e4],
  sizeLegendTitle = sizeField,
  xAxisLabel = xField,

  colorLegendTitle = xField,

  combinedSegmentLabel = 'All',
  segmentType = segmentField,
  segmentTypeCombined = '',
  segmentTypeSplit = '',

  heading = '{{ Heading }}',
  subheading = '{{ Subheading }}',
} = options

d3.csv('data.csv').then(data => {
  const parsedData = data.map(d => ({
    ...d,
    [sizeField]: Number.parseFloat(d[sizeField]),
    [xField]: Number.parseFloat(d[xField]),
  }))

  d3.select('#chart-heading').node().textContent = heading
  d3.select('#chart-subheading').node().textContent = subheading

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

      // eslint-disable-next-line unicorn/no-null
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
      // eslint-disable-next-line unicorn/no-null
      combineButton.attr('title', null)
    }
  }
  manageSplitCombine()

  const svgWidth = pw
  // TODO: responsive?
  const combinedHeight = 250
  const splitHeight = 1200
  const svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', combinedHeight)
    .style('background', bgColor)

  const width = svgWidth - marginLeft - marginRight
  const heightInnerCombined = combinedHeight - marginTop - marginBottom
  const heightInnerSplit = splitHeight - marginTop - marginBottom

  const sectors = [...new Set(parsedData.map(c => c.sector))]
  const maxSizeValue = Math.max(...parsedData.map(c => c[sizeField]))

  const sizeScale = d3.scaleSqrt().range(sizeRange).domain([0, maxSizeValue])

  // const nodes = parsedData.map(d => {
  //   // const radius = Math.sqrt(d[sizeField] / maxCapitalization) * 20
  //   const value = d[xField]

  //   return {
  //     capitalization: d[sizeField],
  //     value,
  //     sector: d.sector,
  //     name: d.symbol,
  //     volume: d[sizeField],
  //   }
  // })

  const yScale = d3
    .scaleBand()
    .domain(sectors)
    .range([0, splitHeight - marginTop - marginBottom])

  const xValues = parsedData.map(d => d[xField]).sort()
  const xDomainDefault = d3.extent(xValues)
  const xDomain = xDomainCustom || xDomainDefault
  const xScale = d3.scaleLinear().domain(xDomain).range([0, width])

  // TODO: separate field for color scale and xscale?
  // Right now both x scale and color scale are based on the same
  // const xColorScale = d3.scaleQuantile().domain([0, 40]).range(d3.schemeOrRd[5]);
  const xColorScale = d3
    .scaleQuantize()
    // .domain(xValues)
    .domain(xDomain)
    // TODO: provide a way to customize color scheme
    // .range(colorScheme[5])
    .range(customColorScheme || d3[inbuiltScheme][numberOfColors])

    .nice()

  // Replace marginTop * 0.3 with yScale.bandwith (/2?)

  const div = d3
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
      legend({ color: xColorScale, title: colorLegendTitle, width: 260 }),
    )

  // Size Legend

  const sizeValues = sizeLegendValues.map(a => sizeScale(a))

  // TODO: move to options
  const gapInCircles = 30

  let cumulativeSize = 0
  const cumulativeSizes = []
  sizeValues.forEach((sz, i) => {
    if (i === 0) {
      cumulativeSize += sz
    } else {
      cumulativeSize += sizeValues[i - 1] + sizeValues[i]
    }

    cumulativeSizes.push(cumulativeSize)
  })

  const sizeLegend = d3.select('#size-legend').append('svg')
  const sizeLegendContainerGroup = sizeLegend.append('g')
  // .attr('width', 260)
  // .attr('height', 66)

  // TODO: move this to options?
  const moveSizeObjectDownBy = 5

  sizeLegendContainerGroup
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

  sizeLegendContainerGroup
    .selectAll('.g-size-circle')
    .append('text')
    .attr('alignment-baseline', 'middle')
    .attr('dy', sizeValues[sizeValues.length - 1] + 2)
    .attr('dx', (d, i) => d + cumulativeSizes[i] + (i + 0.1) * gapInCircles)
    .style('font-size', 8)
    .text((d, i) => d3.format('.3s')(sizeLegendValues[i]))

  sizeLegendContainerGroup
    .append('text')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', 10)
    .style('font-weight', 600)
    .text(sizeLegendTitle)

  const legendBoundingBox = sizeLegendContainerGroup.node().getBBox()
  sizeLegend
    .attr('height', legendBoundingBox.height)
    .attr('width', legendBoundingBox.width)

  svg
    .append('g')
    .attr(
      'transform',
      `translate(${marginLeft + width / 2}, ${marginTop - 20})`,
    )
    .append('text')
    .attr('class', 'text-xs font-semibold tracking-wider')
    .text(xAxisLabel)
    .attr('text-anchor', 'middle')

  const xAxis = svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)

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
    .attr('transform', `translate(${marginLeft - 23}, ${marginTop - 20})`)
    .append('text')
    .attr('class', 'text-xs font-semibold ')
    .text(segmentType)
    .attr('text-anchor', 'end')

  const yAxisSplit = svg
    .append('g')
    .attr('id', 'y-axis-split')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)
    .call(d3.axisLeft(yScale).tickSize(-width))
    .call(g => g.select('.domain').remove())
    .call(g => {
      g.selectAll('.tick line').attr('stroke-opacity', 0.1)
      g.selectAll('.tick text')
        .attr('transform', 'translate(-20,0)')
        .classed('text-xs', true)
    })
    .attr('opacity', 0)

  const yScaleCombined = d3
    .scaleBand()
    .domain([combinedSegmentLabel])
    .range([0, heightInnerCombined])

  const yAxisCombined = svg
    .append('g')
    .attr('id', 'y-axis-split')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)
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
      `translate(${marginLeft}, ${marginTop + heightInnerCombined / 2})`,
    )
    .attr('class', 'bubbles')

  let allBubbles
  function ticked() {
    const u = bubbles.selectAll('circle').data(parsedData)
    allBubbles = u
      .enter()
      .append('circle')
      .attr('r', d => sizeScale(d[sizeField]))
      .style('fill', function (d) {
        return xColorScale(d[xField])
      })
      .attr('stroke', function (d) {
        return d3.rgb(xColorScale(d[xField])).darker(0.5)
      })
      .style('stroke-width', 1)
      .merge(u)
      .attr('cx', function (d) {
        // console.log(d.x)
        return d.x
      })
      .attr('cy', function (d) {
        return d.y
      })
      .on('mouseover', (e, d) => {
        div.transition().duration(200).style('opacity', 1)
        // div.html(`Radius: ${d.radius}; Tax rate: ${d.value}`);
        div.html(
          `<div><span class="font-bold">${d[nameField]}</span>(${
            d[segmentField]
          })</div>
         <div class="flex space-between">
           <div class="capitalize">${xField}:</div>
           <div class="pl-2 font-bold">${d[xField].toFixed(0)}</div>
         </div>
         <div class="flex space-between">
           <div class="capitalize">${sizeField}:</div>
           <div class="pl-2 font-bold">${d[sizeField].toFixed(0)}</div>
         </div>`,
        )
        div
          .style('left', `${e.clientX}px`)
          .style('top', `${e.clientY + window.scrollY + 30}px`)
        d3.select(e.target).attr('stroke', 'black').style('stroke-width', 2)
      })
      .on('mouseout', (e, d) => {
        div.transition().duration(500).style('opacity', 0)
        d3.select(e.target)
          .attr('stroke', d3.rgb(xColorScale(d[xField])).darker(0.5))
          .style('stroke-width', 1)
      })
    u.exit().remove()
  }

  const search = d3.select('#search')

  search.attr('placeholder', `Find by ${nameField}`)

  function searchBy(term) {
    if (term) {
      d3.select('.bubbles').classed('g-searching', true)
      allBubbles.classed('c-match', d =>
        d[nameField].toLowerCase().includes(term.toLowerCase()),
      )
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
    yAxisLabel.text(segmentTypeSplit)

    svg.transition().duration(1000).attr('height', splitHeight)

    bubbles.attr('transform', `translate(${marginLeft}, ${marginTop})`)

    d3.forceSimulation(parsedData)
      .force('charge', d3.forceManyBody().strength(1))
      .force(
        'x',
        d3
          .forceX()
          .x(function (d) {
            return xScale(d[xField])
          })
          // split X strength
          .strength(1),
      )
      .force(
        'y',
        d3
          .forceY()
          .y(function (d) {
            return yScale(d[segmentField]) + yScale.bandwidth() / 2
          })
          // split Y strength
          .strength(1.2),
      )
      .force(
        'collision',
        d3.forceCollide().radius(function (d) {
          return sizeScale(d[sizeField]) + collisionDistance
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

    yAxisLabel.text(segmentTypeCombined)
    svg.transition().duration(1000).attr('height', combinedHeight)

    bubbles.attr(
      'transform',
      `translate(${marginLeft}, ${marginTop + heightInnerCombined / 2})`,
    )

    d3.forceSimulation(parsedData)
      .force('charge', d3.forceManyBody().strength(1))
      .force(
        'x',
        d3
          .forceX()
          .x(d => xScale(d[xField]))
          // combine X strength
          .strength(1),
      )
      .force(
        'y',
        d3.forceY().y(
          0,
          // function (d) { return 0 }
        ),
        // combine Y strength
        // .strength(1)
      )
      .force(
        'collision',
        d3.forceCollide().radius(function (d) {
          return sizeScale(d[sizeField]) + collisionDistance
        }),
      )
      .on('tick', ticked)
      .on('end', () => {
        console.log('combined force simulation ended')
        allowSplit = true
        manageSplitCombine()
      })
  }
  window.combinedSim = combinedSim
  window.splitSim = splitSim

  combinedSim()
})
