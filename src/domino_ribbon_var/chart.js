/* global legend, dimensions, options */
// https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals

// SVG parent element CSS selector, preferably HTML id
// e.g. #svg-container
const svgParentNodeSelector = '#svg-container'

;(function () {
  const {
    aspectRatio,

    marginTop = 60,
    marginRight = 50,
    marginBottom = 20,
    marginLeft = 50,

    bgColor = 'transparent',

    sizeLegendLabelCustom,

    sizeLegendValues = [1, 5, 10, 20],
    sizeLegendGapInSymbols = 25,
    sizeLegendMoveSymbolsDownBy = 15,

    xDomainCustom,
    colorDomainCustom,
    colorRangeCustom,

    // xAxisLabelOffset = 0,
    // yAxisLabelOffset = 0,

    // xAxisLocations = ['top'],
    // yAxisLocations = ['left'],

    // hoverEnabled = true,
    // searchEnabled = true,

    sizeRangeCustom = [2, 20],

    // Opinionated (currently cannot be changed from options)
    yPaddingInner = 0.8,
    yPaddingOuter = 0.1,

    heading = '{{ Heading }}',
    subheading = '{{ Subheading }}',
  } = options

  const {
    xField = 'frustration', // number
    yField = 'quarter', // string
    dominoField = 'queue', // string
    sizeField = 'size', // number
    // colorField = 'unemployment', // number
  } = dimensions

  const colorField = dimensions.colorField || xField

  d3.select('#chart-heading').node().textContent = heading
  d3.select('#chart-subheading').node().textContent = subheading

  const sizeLegendLabel = sizeLegendLabelCustom || _.capitalize(sizeField)

  const svgParentWidth = d3
    .select(svgParentNodeSelector)
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = svgWidth / aspectRatio

  const width = svgWidth - marginLeft - marginRight
  const height = svgHeight - marginTop - marginBottom

  const svg = d3
    .select(svgParentNodeSelector)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('background', bgColor)

  const chartCore = svg
    .append('g')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)

  const tooltipDiv = d3
    .select('body')
    .append('div')
    .attr(
      'class',
      'dom-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border',
    )
    .style('opacity', 0)

  const yScale = d3
    .scaleBand()
    .range([0, height])
    .paddingInner(yPaddingInner)
    .paddingOuter(yPaddingOuter)

  const xScale = d3.scaleLinear().range([0, width])
  const sizeScale = d3.scaleLinear().range(sizeRangeCustom)

  const toClassText = str => str.replace(/\s/g, '-').toLowerCase()

  d3.csv('data.csv').then(data => {
    // TODO: provide options to sort and reverse the y domain
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const yDomain = _.chain(data).map(yField).uniq().value().sort()
    const xDomainDefault = d3.extent(
      _.chain(data)
        // eslint-disable-next-line unicorn/no-array-callback-reference
        .map(xField)
        .uniq()
        .value(t => Number.parseFloat(t)),
    )

    // Set xDomain to custom if available, if not stick to default
    // And make a copy with .slice
    const xDomain = (xDomainCustom || xDomainDefault).slice()
    yScale.domain(yDomain)
    xScale.domain(xDomain)

    const sizeDomain = d3.extent(
      _.chain(data)
        // eslint-disable-next-line unicorn/no-array-callback-reference
        .map(sizeField)
        .uniq()
        .value(t => Number.parseFloat(t)),
    )

    sizeScale.domain(sizeDomain)

    const colorDomainFromData = d3.extent(
      data.map(d => Number.parseFloat(d[colorField])),
    )
    const colorDomain = colorDomainCustom || colorDomainFromData

    const chooseColors = [0, 2, 3, 6]

    const colorRangeDefault = d3.schemeSpectral[9]
      // eslint-disable-next-line unicorn/prefer-includes
      .filter((c, i) => chooseColors.indexOf(i) > -1)
      .slice()
      .reverse()

    const colorRange = colorRangeCustom || colorRangeDefault
    // Note: number of colors is decided by length of chooseColors or .range(<this value>)
    const colorScale = d3.scaleQuantize().domain(colorDomain).range(colorRange)

    // X-Axis label
    chartCore
      .append('g')
      .append('text')
      .attr('class', 'font-sans x-axis-label')
      .text(xField)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('transform', `translate(${width / 2}, -40)`)
      .style('font-size', '12px')
      .style('font-weight', 600)
      .style('text-transform', 'capitalize')

    // TODO top and bottom xAxis - Link it to xAxisLocations (this is only top)
    // X-Axis
    chartCore
      .append('g')
      .attr('class', 'x-axis-top')
      .attr('transform', `translate(0, ${yScale(yDomain[0]) - 30})`)
      .call(d3.axisTop(xScale).tickSize(-height))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2))

    // TODO left and right yAxis - yAxisLocations
    // Y-Axis
    chartCore
      .append('g')
      .attr('class', 'y-axis-right')
      .attr('transform', `translate(${xScale(xDomain[1]) + 20}, 0)`)
      .call(d3.axisRight(yScale).tickSize(0))
      .call(g => g.select('.domain').remove())

    const allConnectors = chartCore.append('g').attr('class', 'g-ribbons')

    const dataWithCoordinates = []
    data.forEach(d => {
      const x0 = xScale(d[xField]) - sizeScale(d[sizeField]) / 2
      const x1 = x0 + sizeScale(d[sizeField])
      const y0 = yScale(d[yField])
      dataWithCoordinates.push(
        { ...d, x0, x1, y0 },
        { ...d, x0, x1, y0: y0 + yScale.bandwidth() },
      )
    })
    const ribbonArea = d3
      .area()
      .curve(d3.curveMonotoneY)
      .y(d => d.y0)
      .x0(d => d.x0)
      .x1(d => d.x1)

    chartCore
      .append('g')
      .attr('class', 'g-dominos')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', d => `domino-${toClassText(d[dominoField])}`)
      .attr('x', d => xScale(d[xField]) - sizeScale(d[sizeField]) / 2)
      .attr('y', d => yScale(d[yField]))
      .attr('width', d => sizeScale(d[sizeField]))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(Number.parseFloat(d[colorField])))
      .attr('stroke', d =>
        d3.rgb(colorScale(Number.parseFloat(d[colorField]))).darker(0.5),
      )
      .attr('opacity', 1)
      .on('mouseover', (e, d) => {
        tooltipDiv.transition().duration(200).style('opacity', 1)

        tooltipDiv.html(
          `<div> <span class="font-bold">${d[dominoField]}</span> (${d[yField]})</div>
           <div class="flex space-between">
             <div class="capitalize">${xField}:</div>
             <div class="pl-2 font-bold">${d[xField]}</div>
           </div>`,
        )

        d3.select(e.target).raise()

        const dominoGroupCode = toClassText(d[dominoField])
        d3.select(`.ribbon-${dominoGroupCode}`).classed('ribbon-active', true)
        d3.selectAll(`.domino-${dominoGroupCode}`)
          .raise()
          .classed('domino-active', true)
        d3.select('.g-ribbons').classed('hovered', true)

        tooltipDiv
          .style('left', `${e.clientX}px`)
          .style('top', `${e.clientY + 20 + window.scrollY}px`)
      })
      .on('mouseout', (e, d) => {
        tooltipDiv
          .style('left', '-300px')
          .transition()
          .duration(500)
          .style('opacity', 0)
        const dominoGroupCode = toClassText(d[dominoField])
        d3.select(`.ribbon-${dominoGroupCode}`).classed('ribbon-active', false)
        d3.selectAll(`.domino-${dominoGroupCode}`).classed(
          'domino-active',
          false,
        )
        d3.select(e.target).lower()
        d3.select('.g-ribbons').classed('hovered', false)
      })
      .on('click', (e, d) => {
        const dominoGroupCode = toClassText(d[dominoField])
        const clickedState = d3
          .select(`.ribbon-${dominoGroupCode}`)
          .classed('ribbon-clicked')
        d3.select(`.ribbon-${dominoGroupCode}`).classed(
          'ribbon-clicked',
          !clickedState,
        )
      })

    allConnectors
      .selectAll('path')
      // eslint-disable-next-line unicorn/no-array-callback-reference
      .data(_.chain(data).map(dominoField).uniq().value())
      .join('path')
      .attr('fill', d => `url(#gradient-${toClassText(d)})`)
      .attr('class', d => `ribbon-${toClassText(d)}`)
      .attr('opacity', 0.05)
      .attr('d', d =>
        ribbonArea(_.filter(dataWithCoordinates, { [dominoField]: d })),
      )
      .on('mouseover', (e, d) => {
        // TODO: if dominoGroupCode isn't unique it will cause problems
        // Can generate unique group codes for the whole dataset?
        const dominoGroupCode = toClassText(d)
        d3.select(`.ribbon-${dominoGroupCode}`).classed('ribbon-active', true)
        d3.selectAll(`.domino-${dominoGroupCode}`)
          .classed('domino-active', true)
          .raise()
        d3.select('.g-ribbons').classed('hovered', true)
      })
      .on('mouseout', (e, d) => {
        const dominoGroupCode = toClassText(d)
        d3.select(`.ribbon-${dominoGroupCode}`).classed('ribbon-active', false)
        d3.selectAll(`.domino-${dominoGroupCode}`)
          .classed('domino-active', false)
          .lower()
        d3.select('.g-ribbons').classed('hovered', false)
      })
      .on('click', e => {
        const clickedState = d3.select(e.target).classed('ribbon-clicked')
        d3.select(e.target).classed('ribbon-clicked', !clickedState)
      })

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const allDominoFieldValues = _.chain(data).map(dominoField).uniq().value()

    const gradientContainer = chartCore.append('defs')
    // linear gradient
    allDominoFieldValues.forEach(val => {
      const gradient = gradientContainer
        .append('linearGradient')
        .attr('id', `gradient-${toClassText(val)}`)
        .attr('x1', '100%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '100%')

      const singleDominoFieldValues = _.chain(dataWithCoordinates)
        .filter({ [dominoField]: val })
        .sortBy()
        .value()

      singleDominoFieldValues.forEach(d => {
        gradient
          .append('stop')
          .attr(
            'offset',
            `${
              (100 * (d.y0 - singleDominoFieldValues[0].y0)) /
              (singleDominoFieldValues[singleDominoFieldValues.length - 1].y0 -
                singleDominoFieldValues[0].y0)
            }%`,
          )
          .attr('stop-color', colorScale(d[colorField]))
      })
    })

    const clearSearchButton = d3.select('#clear-search')
    clearSearchButton.style('visibility', 'hidden')
    const search = d3.select('#search')
    search.attr('placeholder', `Find by ${dominoField}`)
    search.on('keyup', e => {
      const qstr = e.target.value
      if (qstr) {
        clearSearchButton.style('visibility', 'visible')
        const lqstr = qstr.toLowerCase()
        allDominoFieldValues.forEach(val => {
          const dominoGroupCode = toClassText(val)
          if (val.toLowerCase().includes(lqstr)) {
            d3.select(`.ribbon-${dominoGroupCode}`).classed(
              'ribbon-matched',
              true,
            )
            d3.select('.g-ribbons').classed('searching', true)
          } else {
            d3.select(`.ribbon-${dominoGroupCode}`).classed(
              'ribbon-matched',
              false,
            )
          }
        })
      } else {
        allDominoFieldValues.forEach(val => {
          const dominoGroupCode = toClassText(val)
          d3.select(`.ribbon-${dominoGroupCode}`).classed(
            'ribbon-matched',
            false,
          )
        })
        d3.select('.g-ribbons').classed('searching', false)
        clearSearchButton.style('visibility', 'hidden')
      }
    })

    const sizeLegend = d3.select('#size-legend').append('svg')
    const sizeLegendContainerGroup = sizeLegend.append('g')

    sizeLegendContainerGroup
      .append('g')
      .attr('class', 'g-size-container')
      .attr('transform', `translate(0, ${sizeLegendMoveSymbolsDownBy})`)
      .selectAll('.g-size-dominos')
      // TODO: a way to automatically compute suitable values based on data
      .data(sizeLegendValues)
      .enter()
      .append('g')
      .attr('class', 'g-size-dominos')
      .append('rect')
      .style('fill', '#bebebe')
      .style('stroke-width', 1)
      .style('stroke', 'gray')
      .attr('width', d => d)
      .attr('height', 25)
      // TODO: the gap logic isn't perfect, fix it
      .attr('x', (d, i) => d + i * sizeLegendGapInSymbols)

    sizeLegendContainerGroup
      .selectAll('.g-size-dominos')
      .append('text')
      .attr('dy', 35)
      .attr('dx', (d, i) => 1.5 * d + i * sizeLegendGapInSymbols)
      .attr('text-anchor', 'middle')
      .style('font-size', 8)
      .text(d => d)

    sizeLegendContainerGroup
      .append('text')
      .attr('alignment-baseline', 'hanging')
      // .attr("transform", "translate(0, 8)")
      .style('font-size', 10)
      .style('font-weight', 600)
      .text(sizeLegendLabel)

    const legendBoundingBox = sizeLegendContainerGroup.node().getBBox()
    sizeLegend
      .attr('height', legendBoundingBox.height)
      .attr('width', legendBoundingBox.width)

    d3.select('#color-legend')
      .append('svg')
      .attr('width', 300)
      .attr('height', 66)
      .append(() =>
        legend({
          color: colorScale,
          title: _.capitalize(colorField),
          width: 260,
          // height: 50 * factor < 40 ? 40 : 50,
          // tickSize: 6 * factor,
        }),
      )
  })

  // TODO: test fields / dimensions by changing data column headers and dimension values
  // TODO:
  // - Color Field label
  // - y axis label
  // - x axis label

  // TODO: Color customisation
})()
