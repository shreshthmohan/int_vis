/* global swatches, dimensions, options */
// https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals

// SVG parent element CSS selector, preferably HTML id
// e.g. #svg-container
const svgParentNodeSelector = '#svg-container'

;(function () {
  const { beforeField, afterField, topicField } = dimensions

  const {
    heading = '{{ heading }}',
    subheading = '{{ subheading }}',

    aspectRatio,

    marginTop = 60,
    marginRight = 50,
    marginBottom = 20,
    marginLeft = 50,

    bgColor = 'transparent',

    beforeFieldColor = '#43CAD7',
    afterFieldColor = '#1570A6',
    // linkColor = 'farFromReference',

    /* Legends */
    beforeLegendLabel = beforeField,
    afterLegendLabel = afterField,

    /* Axes */
    xAxisTitle = '',
    xAxisLabelOffset = 30,

    xDomainCustom,

    glyphSize = 5,
    connectorSize = 5,
    opacityActive = 1,
    opacityInactive = 0.3,

    // Labels
    xLabelOffset = 10,

    // Opinionated (currently cannot be changed from options)
    yPaddingInner = 0.6,
    yPaddingOuter = 1,
  } = options

  d3.select('#style').html(`.g-interaction .topic:not(.g-match, .g-hover) {
    opacity: ${opacityInactive};
  }`)

  d3.select('#chart-heading').node().textContent = heading
  d3.select('#chart-subheading').node().textContent = subheading

  const coreChartWidth = 1000
  const coreChartHeight = coreChartWidth / aspectRatio

  const viewBoxHeight = coreChartHeight + marginTop + marginBottom
  const viewBoxWidth = coreChartWidth + marginLeft + marginRight

  const svgParent = d3.select(svgParentNodeSelector)

  const svg = svgParent
    .append('svg')
    .attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
    .style('background', bgColor)

  const allComponents = svg.append('g').attr('class', 'core-chart')

  const chartCore = allComponents
    .append('g')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)
    .attr('class', 'axes')

  const axes = allComponents
    .append('g')
    .attr(
      'transform',

      `translate(${marginLeft}, ${marginTop + coreChartHeight})`,
    )
    .attr('class', 'axes')

  const yScale = d3
    .scaleBand()
    .range([0, coreChartHeight])
    .paddingInner(yPaddingInner)
    .paddingOuter(yPaddingOuter)

  const xScale = d3.scaleLinear().range([0, coreChartWidth])
  // debugger
  const colorScale = d3
    .scaleOrdinal()
    .domain([beforeLegendLabel, afterLegendLabel])
    .range([beforeFieldColor, afterFieldColor])

  const line = d3
    .line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))

  d3.csv('data.csv').then(data => {
    const yDomain = _.map(data, topicField)
    const xDomainDefault = d3.extent([
      ..._.map(data, d => Number.parseFloat(d[beforeField])),
      ..._.map(data, d => Number.parseFloat(d[afterField])),
    ])

    const xDomain = (xDomainCustom || xDomainDefault).slice()

    yScale.domain(yDomain)
    xScale.domain(xDomain)

    axes
      .append('g')
      .attr('class', 'x-axis-bottom')
      .call(d3.axisBottom(xScale).tickSize(-coreChartHeight))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2))

    axes
      .append('text')
      .attr(
        'transform',
        `translate(${coreChartWidth / 2}, ${xAxisLabelOffset})`,
      )
      .text(xAxisTitle)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')

    const yGroups = chartCore
      .append('g')
      .attr('class', 'topics')
      .selectAll('g')
      .data(data)

    // enter selection
    const yGroupsEnter = yGroups
      .enter()
      .append('g')
      .attr('class', 'topic')
      .attr('id', d => `${d[topicField]}`)
      .attr('opacity', opacityActive)
      .on('mouseover', (e, d) => {
        d3.select('.topics').classed('g-interaction', true)
        d3.select(e.target.parentNode).classed('g-hover', true)
      })
      .on('mouseout', (e, d) => {
        d3.select('.topics').classed('g-interaction', false)
        d3.select(e.target.parentNode).classed('g-hover', false)
      })

    yGroupsEnter
      .append('path')
      .attr('d', d => {
        const d_ = [
          { x: Number(d[beforeField]), y: d[topicField] },
          { x: Number(d[afterField]), y: d[topicField] },
        ]
        return line(d_)
      })
      .attr('fill', 'none')
      .attr('stroke-width', connectorSize)
      .attr('stroke', afterFieldColor)

    yGroupsEnter
      .append('circle')
      .attr('cx', d => xScale(d[beforeField]))
      .attr('cy', d => yScale(d[topicField]))
      .attr('r', glyphSize)
      .attr('fill', beforeFieldColor)

    yGroupsEnter
      .append('circle')
      .attr('cx', d => xScale(d[afterField]))
      .attr('cy', d => yScale(d[topicField]))
      .attr('r', glyphSize)
      .attr('fill', afterFieldColor)

    yGroupsEnter
      .append('text')
      .text(d => d[topicField])
      .attr('x', d => glyphSize + xLabelOffset + xScale(d[afterField]))
      .attr('y', d => yScale(d[topicField]))
      .attr('fill', afterFieldColor)
      .attr('dominant-baseline', 'middle')

    d3.select('#color-legend').html(swatches({ color: colorScale }))

    // Search
    const search = d3.select('#search')
    search.attr('placeholder', `Find by ${topicField}`)
    function searchBy(term) {
      if (term) {
        d3.select('.topics').classed('g-interaction', true)
        yGroupsEnter.classed('g-match', d => {
          return d[topicField].toLowerCase().includes(term.toLowerCase())
        })
      } else {
        d3.select('.topics').classed('g-interaction', false)
      }
    }

    search.on('keyup', e => {
      searchBy(e.target.value.trim())
    })

    // adjust svg to prevent overflows
    let allComponentsBox = allComponents.node().getBBox()

    const safetyMargin = 20

    const updatedViewBoxWidth =
      allComponentsBox.width + safetyMargin + marginLeft + marginRight
    const updatedViewBoxHeight =
      allComponentsBox.height + safetyMargin + marginTop + marginBottom
    svg.attr('viewBox', `0 0 ${updatedViewBoxWidth} ${updatedViewBoxHeight}`)

    allComponentsBox = allComponents.node().getBBox()

    allComponents.attr(
      'transform',
      `translate(${-allComponentsBox.x + safetyMargin / 2 + marginLeft}, ${
        -allComponentsBox.y + safetyMargin / 2 + marginTop
      })`,
    )
  })
})()
