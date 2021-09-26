const svgParentWidth = d3
  .select('#svg-container')
  .node()
  .getBoundingClientRect().width

const { xFieldStart, xFieldEnd, yFieldStart, yFieldEnd, sizeField, nameField } =
  dimensions

const {
  oppositeDirectionColor = '#ee4e34',
  sameDirectionColor = '#44a8c1',
  svgWidth = svgParentWidth,
  aspectRatio = 2,

  marginTop = 60,
  marginRight = 90,
  marginBottom = 20,
  marginLeft = 50,
  yAxisTitle = 'y axis title',
  xAxisTitle = 'x axis title',

  directionStartLabel = 'start point',
  directionEndLabel = 'end point',
  sizeLegendValues = [1e6, 1e8, 1e9],
  sizeLegendMoveSizeObjectDownBy = 5,
  sizeLegendTitle = 'size legend title',
  heading = 'This is a heading for the chart',
  subheading = 'This is a subheading for the chart describing it in more detail',

  xFieldType = `${xFieldStart} → ${xFieldEnd}`,
  yFieldType = `${yFieldStart} → ${yFieldEnd}`,

  xAxisTickValues,

  xScaleLogOrLinear = 'linear', // linear or log
  xScaleLogBase = 10, // applicable only if log scale

  opacityActive = 1,
  opacityInactive = 0.2,
} = options

const svgHeight = svgWidth / aspectRatio
const width = svgWidth - marginLeft - marginRight
const height = svgHeight - marginTop - marginBottom

d3.select('#chart-heading').node().textContent = heading
d3.select('#chart-subheading').node().textContent = subheading

const tooltipDiv = d3
  .select('body')
  .append('div')
  .attr(
    'class',
    'dom-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border',
  )
  .style('opacity', 0)

const svg = d3
  .select('#svg-container')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)

const coreChart = svg
  .append('g')
  .attr('transform', `translate(${marginLeft}, ${marginTop})`)

d3.csv('data.csv').then(data => {
  // console.log(data)
  // {country, gdp_start, gdp_end, happiness_start, happiness_end}
  const dataParsed = data
    .map(el => {
      const elParsed = { ...el }
      elParsed[xFieldStart] = Number.parseFloat(el[xFieldStart])
      elParsed[xFieldEnd] = Number.parseFloat(el[xFieldEnd])
      elParsed[yFieldStart] = Number.parseFloat(el[yFieldStart])
      elParsed[yFieldEnd] = Number.parseFloat(el[yFieldEnd])
      elParsed.slope =
        (elParsed[yFieldEnd] - elParsed[yFieldStart]) /
        (elParsed[xFieldEnd] - elParsed[xFieldStart])
      return elParsed
    })
    .filter(d => !Number.isNaN(d.slope))

  const yDomainStart = dataParsed.map(el => Number.parseFloat(el[yFieldStart]))
  const yDomainEnd = dataParsed.map(el => Number.parseFloat(el[yFieldEnd]))
  const yDomain = d3.extent([...yDomainStart, ...yDomainEnd])
  const yScale = d3.scaleLinear().range([height, 0]).domain(yDomain).nice()

  const xDomainStart = dataParsed.map(el => Number.parseFloat(el[xFieldStart]))
  const xDomainEnd = dataParsed.map(el => Number.parseFloat(el[xFieldEnd]))
  const xDomain = d3.extent([...xDomainStart, ...xDomainEnd])
  const xScale =
    xScaleLogOrLinear === 'log'
      ? d3
          .scaleLog()
          .base(xScaleLogBase || 10)
          .range([0, width])
          .domain(xDomain)
          .nice()
      : d3.scaleLinear().range([0, width]).domain(xDomain).nice()

  // Area of circle should be proportional to the population
  const sizeMax = d3.max(dataParsed.map(el => Number.parseFloat(el[sizeField])))
  const circleSizeScale = d3.scaleSqrt().range([2, 30]).domain([0, sizeMax])
  const lineWidthScale = d3.scaleSqrt().range([2, 5]).domain([0, sizeMax])

  const sizeValues = sizeLegendValues.map(a => circleSizeScale(a))

  // TODO: move to options?
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

  sizeLegendContainerGroup
    .append('g')
    .attr('class', 'g-size-container')
    .attr('transform', `translate(0, ${sizeLegendMoveSizeObjectDownBy})`)
    .selectAll('.g-size-circle')
    .data(sizeValues)
    .enter()
    .append('g')
    .attr('class', 'g-size-circle')
    .append('circle')
    .attr('r', d => d)
    .style('fill', 'transparent')
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
    .text((d, i) => d3.format('.2s')(sizeLegendValues[i]))

  sizeLegendContainerGroup
    .append('text')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', 10)
    .style('font-weight', 600)
    .text(sizeLegendTitle)

  const sizeLegendBoundingBox = sizeLegendContainerGroup.node().getBBox()
  sizeLegend
    .attr('height', sizeLegendBoundingBox.height)
    .attr('width', sizeLegendBoundingBox.width)

  const colorScale = slope =>
    slope > 0 ? sameDirectionColor : oppositeDirectionColor

  const stickHeight = 3
  const stickLength = 30
  const ballRadius = 6
  const gapForText = 5
  const singleMaceSectionHeight = 20
  const colorLegend = d3.select('#color-legend').append('svg')
  const colorLegendMain = colorLegend
    .append('g')
    .attr(
      'transform',
      `translate(0, ${-(singleMaceSectionHeight - ballRadius)})`,
    ) // 20-6
  const colorLegendSame = colorLegendMain
    .append('g')
    .attr('transform', `translate(0, ${singleMaceSectionHeight})`)
    .attr('fill', sameDirectionColor)
  colorLegendSame
    .append('circle')
    .attr('cx', ballRadius + stickLength)
    .attr('r', ballRadius)
  colorLegendSame
    .append('rect')
    .attr('width', stickLength)
    .attr('height', stickHeight)
    .attr('y', -stickHeight / 2)
  colorLegendSame
    .append('text')
    .text('Moving in the same direction')
    .style('font-size', 10)
    .style('font-weight', 600)
    .attr(
      'transform',
      `translate(${stickLength + ballRadius * 2 + gapForText}, 0)`,
    )
    .attr('alignment-baseline', 'middle')
  const colorLegendOpposite = colorLegendMain
    .append('g')
    .attr('transform', `translate(0, ${singleMaceSectionHeight * 2})`)
    .attr('fill', oppositeDirectionColor)
  colorLegendOpposite
    .append('circle')
    .attr('cx', ballRadius + stickLength)
    .attr('r', ballRadius)
  colorLegendOpposite
    .append('rect')
    .attr('width', stickLength)
    .attr('height', stickHeight)
    .attr('y', -stickHeight / 2)
  colorLegendOpposite
    .append('text')
    .text('Moving in the opposite direction')
    .style('font-size', 10)
    .style('font-weight', 600)
    .attr(
      'transform',
      `translate(${stickLength + ballRadius * 2 + gapForText}, 0)`,
    )
    .attr('alignment-baseline', 'middle')
  const legendBoundingBox = colorLegendMain.node().getBBox()
  colorLegend
    .attr('height', legendBoundingBox.height)
    .attr('width', legendBoundingBox.width)

  const directionLegend = d3.select('#direction-legend').append('svg')
  const directionLegendMain = directionLegend
    .append('g')
    .attr(
      'transform',
      `translate(0, ${-(singleMaceSectionHeight - ballRadius)})`,
    ) // 20-6
  const directionLegendChild = directionLegendMain
    .append('g')
    .attr('fill', 'gray')
  directionLegendChild
    .append('circle')
    .attr('cx', ballRadius + stickLength)
    .attr('r', ballRadius)
  directionLegendChild
    .append('rect')
    .attr('width', stickLength)
    .attr('height', stickHeight)
    .attr('y', -stickHeight / 2)
  const startPointText = directionLegendChild
    .append('text')
    .text(directionStartLabel)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'end')
    .style('font-size', 10)
    .attr('transform', `translate(${-gapForText}, 0)`)

  directionLegendChild.attr(
    'transform',
    `translate(${
      startPointText.node().getBBox().width + gapForText
    }, ${singleMaceSectionHeight})`,
  )

  directionLegendChild
    .append('text')
    .text(directionEndLabel)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'start')
    .attr(
      'transform',
      `translate(${stickLength + ballRadius * 2 + gapForText}, 0)`,
    )
    .style('font-size', 10)

  const directionLegendBoundingBox = directionLegendMain.node().getBBox()
  directionLegend
    .attr('height', directionLegendBoundingBox.height)
    .attr('width', directionLegendBoundingBox.width)

  // x-axis
  const xAxis = coreChart
    .append('g')
    .attr('class', 'x-axis-bottom')
    .attr('transform', `translate(0, ${height + 30})`)
  xAxis.call(
    xAxisTickValues
      ? d3.axisBottom(xScale).tickValues(xAxisTickValues)
      : d3.axisBottom(xScale),
  )

  xAxis
    .append('g')
    .append('text')
    .attr('class', 'text-xs font-semibold tracking-wider')
    .text(xAxisTitle)
    .attr('fill', '#333')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2}, 30)`)

  // y-axis
  const yAxis = coreChart
    .append('g')
    .attr('class', 'text-xs y-axis-right')
    .attr('transform', `translate(${width}, 0)`)
  yAxis
    .call(d3.axisRight(yScale).ticks(5).tickSize(-width))
    .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2))
    .call(g => g.select('.domain').remove())

  yAxis
    .append('g')
    .append('text')
    .attr('class', 'font-semibold tracking-wider')
    .text(yAxisTitle)
    .attr('fill', '#333')
    .attr('text-anchor', 'end')
    .attr('transform', 'translate(8, -20)')

  const cGroup = coreChart
    .append('g')
    .selectAll('g')
    .data(dataParsed)
    .join('g')
    .attr('class', 'mace')
    .attr('opacity', opacityInactive)

  cGroup
    .append('path')
    .attr('d', d =>
      d3.line()([
        [xScale(d[xFieldStart]), yScale(d[yFieldStart])],
        [xScale(d[xFieldEnd]), yScale(d[yFieldEnd])],
      ]),
    )
    .style('stroke', d => colorScale(d.slope))
    .attr('stroke-width', d => lineWidthScale(d[sizeField]))

  cGroup
    .append('circle')
    .attr('cx', d => xScale(d[xFieldEnd]))
    .attr('cy', d => yScale(d[yFieldEnd]))
    .attr('r', d => circleSizeScale(d.population))
    .style('fill', d => colorScale(d.slope))
  cGroup
    .on('mouseover', (e, d) => {
      // d3.select(e.target).classed('mace-active', true)
      // debugger
      d3.select(e.target.parentNode).attr('opacity', opacityActive).raise()

      tooltipDiv.transition().duration(200).style('opacity', 1)

      tooltipDiv.html(
        `${d[nameField]}
        <br/>
        ${xFieldType}: ${d3.format('.2f')(d[xFieldStart])} → ${d3.format('.2f')(
          d[xFieldEnd],
        )}
        <br />
        ${yFieldType}: ${d3.format('.2f')(d[yFieldStart])} → ${d3.format('.2f')(
          d[yFieldEnd],
        )}
        `,
      )
      tooltipDiv
        .style('left', `${e.clientX}px`)
        .style('top', `${e.clientY + 20 + window.scrollY}px`)
    })
    .on('mouseout', (e, d) => {
      d3.select(e.target.parentNode).attr('opacity', opacityInactive).lower()
      tooltipDiv
        .style('left', '-300px')
        .transition()
        .duration(500)
        .style('opacity', 0)
    })
})
