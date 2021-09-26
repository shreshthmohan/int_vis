/* global legend */
const options = {
  // svgWidth,
  // svgHeight,

  // width / height
  aspectRatio: 0.4,

  marginTop: 60,
  marginRight: 90,
  marginBottom: 20,
  marginLeft: 50,

  bgColor: 'transparent',

  // xAxisLabelOffset: 0,
  // yAxisLabelOffset: 0,

  // xAxisLocations: ['top'],
  // yAxisLocations: ['left'],

  // hoverEnabled: true,
  // searchEnabled: true,

  // Note: domino field is search field
  // searchField: '',

  // [xMin, xMax]
  xDomainCustom: [0, 100],
}

const dimensions = {
  xField: 'frustration',
  yField: 'quarter',
  dominoField: 'queue', // string; this is also the search field
  sizeField: 'size',
  colorField: 'frustration', // number
}

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

    xDomainCustom,

    // xAxisLabelOffset = 0,
    // yAxisLabelOffset = 0,

    // xAxisLocations = ['top'],
    // yAxisLocations = ['left'],

    // hoverEnabled = true,
    // searchEnabled = true,

    // Opinionated (currently cannot be changed from options)
    yPaddingInner = 0.8,
    yPaddingOuter = 0.1,
  } = options

  const {
    xField = 'frustration', // number
    yField = 'quarter', // string
    dominoField = 'queue', // string
    sizeField = 'size', // number

    colorField = 'unemployment', // number
  } = dimensions

  // const d3 = d3
  // const _ = _

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

  const toClassText = str => str.replace(/\s/g, '-').toLowerCase()

  d3.csv('data.csv').then(data => {
    // TODO: provide options to sort and reverse the y domain
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const yDomain = _.chain(data).map(yField).uniq().value()
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

    const colorDomain = data.map(d => Number.parseFloat(d[colorField])).sort()
    const chooseColors = [0, 2, 3, 6]
    const colorRange = d3.schemeSpectral[9]
      // eslint-disable-next-line unicorn/prefer-includes
      .filter((c, i) => chooseColors.indexOf(i) > -1)
      .slice()
      .reverse()
    // Note: number of colors is decided by length of chooseColors or .range(<this value>)
    const colorScale = d3.scaleQuantile().domain(colorDomain).range(colorRange)

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

    // Dominos - rectangles
    chartCore
      .append('g')
      .attr('class', 'g-dominos')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', d => `domino-${toClassText(d[dominoField])}`)
      .attr('x', d => xScale(Number.parseFloat(d[xField])))
      .attr('y', d => yScale(d[yField]))
      .attr('width', d => Number.parseFloat(d[sizeField]))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(Number.parseFloat(d[colorField])))
      .attr('stroke', 'gray')
      .attr('opacity', 1)
      .on('mouseover', (e, d) => {
        tooltipDiv.transition().duration(200).style('opacity', 1)

        tooltipDiv.html(
          `<div> <span class="font-bold">${d[dominoField]}</span> (${d[yField]})</div>
           <div class="flex space-between">
             <div>${xField}:</div>
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
        tooltipDiv.transition().duration(500).style('opacity', 0)
        const dominoGroupCode = toClassText(d[dominoField])
        d3.select(`.ribbon-${dominoGroupCode}`).classed('ribbon-active', false)
        d3.selectAll(`.domino-${dominoGroupCode}`).classed(
          'domino-active',
          false,
        )
        d3.select('.g-ribbons').classed('hovered', false)
      })

    const dataGroupedByObj = _.groupBy(data, dominoField)
    const dataGroupedByArr = Object.keys(dataGroupedByObj).map(
      dominoValue => dataGroupedByObj[dominoValue],
    )

    const gradientContainer = chartCore.append('defs')

    const allConnectors = chartCore.append('g').attr('class', 'g-ribbons')

    dataGroupedByArr.forEach(dominoData => {
      const dominoGroupCode = toClassText(dominoData[0][dominoField])

      allConnectors
        .append('g')
        .attr('class', `ribbon-${dominoGroupCode}`)
        .selectAll('path')
        .data(dominoData)
        .join('path')
        .attr('fill', 'none')
        .attr('stroke-width', d => Number.parseFloat(d[sizeField]))
        .attr('opacity', 0.1)
        .attr('data-base-opacity', 0.1)
        .attr('stroke', (d, i) => {
          if ((i + 1) % yDomain.length === 0) {
            return
          }
          const startColor = colorScale(Number.parseFloat(d[colorField]))
          const stopColor = colorScale(
            Number.parseFloat(dominoData[i + 1][colorField]),
          )
          const startHex = d3.color(startColor).formatHex().replace('#', '')
          const stopHex = d3.color(stopColor).formatHex().replace('#', '')

          // Linear gradient doesn't work if both colors are the same
          if (startHex === stopHex) {
            return `#${startHex}`
          }
          return `url(#g-${startHex}-${stopHex})`
        })
        .attr('d', (d, i) => {
          if ((i + 1) % yDomain.length === 0) {
            return
          }

          const startColor = colorScale(Number.parseFloat(d[colorField]))
          const stopColor = colorScale(
            Number.parseFloat(dominoData[i + 1][colorField]),
          )
          const startHex = d3.color(startColor).formatHex().replace('#', '')
          const stopHex = d3.color(stopColor).formatHex().replace('#', '')

          const gid = `g-${startHex}-${stopHex}`

          if (d3.select(`#${gid}`).empty() && startHex !== stopHex) {
            const gradient = gradientContainer
              .append('linearGradient')
              .attr('id', gid)
              .attr('x1', '100%')
              .attr('x2', '100%')
              .attr('y1', '0%')
              .attr('y2', '100%')

            gradient
              .append('stop')
              .attr('class', 'start')
              .attr('offset', '0%')
              .attr('stop-color', startColor)
              .attr('stop-opacity', 1)

            gradient
              .append('stop')
              .attr('class', 'end')
              .attr('offset', '100%')
              .attr('stop-color', stopColor)
              .attr('stop-opacity', 1)
          }
          return d3.line().curve(d3.curveBumpY)([
            [
              xScale(d[xField]) + Number.parseFloat(d[sizeField]) / 2,
              yScale(d[yField]) + yScale.bandwidth(),
            ],
            [
              xScale(dominoData[i + 1][xField]) +
                Number.parseFloat(d[sizeField]) / 2,
              yScale(dominoData[i + 1][yField]),
            ],
          ])
        })
        .on('mouseover', (e, d) => {
          d3.select(`.ribbon-${dominoGroupCode}`).classed('ribbon-active', true)
          d3.select('.g-ribbons').classed('hovered', true)

          d3.selectAll(`.domino-${dominoGroupCode}`)
            .raise()
            .classed('domino-active', true)

          tooltipDiv.transition().duration(200).style('opacity', 1)

          tooltipDiv.html(
            `<div> <span class="font-bold">${d[dominoField]}</span> (${d[yField]})</div>
             <div class="flex space-between">
               <div>${xField}:</div>
               <div class="pl-2 font-bold">${d[xField]}</div>
             </div>`,
          )

          tooltipDiv
            .style('left', `${e.clientX}px`)
            .style('top', `${e.clientY + window.scrollY + 15}px`)
        })
        .on('mouseout', () => {
          d3.select(`.ribbon-${dominoGroupCode}`).classed(
            'ribbon-active',
            false,
          )
          tooltipDiv.transition().duration(500).style('opacity', 0)
          d3.select('.g-ribbons').classed('hovered', false)
          d3.selectAll(`.domino-${dominoGroupCode}`).classed(
            'domino-active',
            false,
          )
        })
    })

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const allDominoFieldValues = _.chain(data).map(dominoField).uniq().value()

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
              'ribbon-active',
              true,
            )
            d3.select('.g-ribbons').classed('searching', true)
          } else {
            d3.select(`.ribbon-${dominoGroupCode}`).classed(
              'ribbon-active',
              false,
            )
          }
        })
      } else {
        allDominoFieldValues.forEach(val => {
          const dominoGroupCode = toClassText(val)
          d3.select(`.ribbon-${dominoGroupCode}`).classed(
            'ribbon-active',
            false,
          )
        })
        d3.select('.g-ribbons').classed('searching', false)
        clearSearchButton.style('visibility', 'hidden')
      }
    })

    const legendOptions = {
      // TODO: adapt this to data
      sizeValues: [1, 5, 10, 20],
      gapInRects: 25,
      moveSizeObjectDownBy: 15,
    }

    const { sizeValues, moveSizeObjectDownBy, gapInRects } = legendOptions

    const sizeLegend = d3.select('#size-legend').append('svg')
    const sizeLegendContainerGroup = sizeLegend.append('g')

    sizeLegendContainerGroup
      .append('g')
      .attr('class', 'g-size-container')
      .attr('transform', `translate(0, ${moveSizeObjectDownBy})`)
      .selectAll('.g-size-dominos')
      .data(sizeValues)
      .enter()
      .append('g')
      .attr('class', 'g-size-dominos')
      .append('rect')
      .style('fill', '#bebebe')
      .style('stroke-width', 1)
      .style('stroke', 'gray')
      .attr('width', d => d)
      .attr('height', 25)
      .attr('x', (d, i) => d + i * gapInRects)

    sizeLegendContainerGroup
      .selectAll('.g-size-dominos')
      .append('text')
      .attr('dy', 35)
      .attr('dx', (d, i) => 1.5 * d + i * gapInRects)
      .attr('text-anchor', 'middle')
      .style('font-size', 8)
      .text(d => d)

    sizeLegendContainerGroup
      .append('text')
      .attr('alignment-baseline', 'hanging')
      // .attr("transform", "translate(0, 8)")
      .style('font-size', 10)
      .style('font-weight', 600)
      .text('Call Volume')

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
          title: colorField,
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
