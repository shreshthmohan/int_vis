/* global dimensions, options */
const { xField, yFields, yBandFields } = dimensions

const {
  heading = '{{ heading }}',
  subheading = '{{ subheading }}',
  aspectRatio = 2,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  bgColor = 'transparent',
  xAxisLabel = xField,
  yAxisLabel = '',
  yLineColors,
  yBandColors,

  highlightRanges,
  highlightRangeColors,
} = options

d3.select('#chart-heading').node().textContent = heading
d3.select('#chart-subheading').node().textContent = subheading

const coreChartWidth = 800
const coreChartHeight = coreChartWidth / aspectRatio

const viewBoxHeight = coreChartHeight + marginTop + marginBottom
const viewBoxWidth = coreChartWidth + marginLeft + marginRight

const svgParentNodeSelector = '#svg-container'

const svgParent = d3.select(svgParentNodeSelector)

const svg = svgParent
  .append('svg')
  .attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
  .style('background', bgColor)

d3.csv(
  // 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTfk5ELixoKzYE8Mcjja487XDH95hu_JCAyvhmbq1LYlko5hXjyQL3MWuIfovDjMPfjnixd73ONdDc-/pub?gid=1267101693&single=true&output=csv',
  'data.csv',
).then(dataRaw => {
  // console.log({ dataRaw })

  const allYValues = []

  const data = dataRaw.map(d => {
    const parsedDataRow = { ...d }
    yFields.forEach(yf => {
      const dyf = Number.parseFloat(d[yf])
      parsedDataRow[yf] = dyf
      allYValues.push(dyf)
    })
    yBandFields.flat().forEach(ybf => {
      const dybf = Number.parseFloat(d[ybf])
      parsedDataRow[ybf] = dybf
      allYValues.push(dybf)
    })
    return parsedDataRow
  })

  const yDomain = d3.extent(allYValues)
  // console.log({ yDomain })

  const xDomain = d3.extent(data.map(d => d[xField]))
  // console.log({ xDomain })

  const xScale = d3.scaleLinear().range([0, coreChartWidth]).domain(xDomain)
  const yScale = d3
    .scaleLinear()
    .range([coreChartHeight, 0])
    .domain(yDomain)
    .nice()

  const yAxisTickSizeOffset = 20

  const chartCore = svg
    .append('g')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)

  const yAxis = chartCore
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${coreChartWidth + yAxisTickSizeOffset}, 0)`)

  yAxis
    .call(d3.axisRight(yScale).tickSize(-coreChartWidth - yAxisTickSizeOffset))
    .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2))
    .call(g => g.selectAll('.tick text').attr('fill', '#333'))
    .call(g => g.select('.domain').remove())

  yAxis
    .append('text')
    .text(yAxisLabel)
    .attr('fill', '#333')
    .attr('text-anchor', 'end')
    .style('font-weight', 'bold')
    .attr('transform', `translate(${30}, -10)`)

  // highlightRange
  highlightRanges.forEach((hr, i) => {
    console.log('hr:', Math.abs(xScale(hr[1] - xScale(hr[0]))))
    chartCore
      .append('rect')
      .attr('x', d3.min([xScale(hr[0], xScale(hr[1]))]))
      .attr('y', 0)
      .attr('height', coreChartHeight)
      .attr('width', Math.abs(xScale(hr[1]) - xScale(hr[0])))
      .attr('fill', highlightRangeColors[i])
    // .attr('opacity', 0.2)
  })

  const lineForField = field => {
    return d3
      .line()
      .curve(d3.curveBasis)
      .defined(d => !Number.isNaN(d[field]))
      .x(d => xScale(d[xField]))
      .y(d => yScale(d[field]))
  }

  const areaForBand = ([bandMin, bandMax]) => {
    return d3
      .area()
      .curve(d3.curveBasis)
      .defined(d => !Number.isNaN(d[bandMin]) && !Number.isNaN(d[bandMax]))
      .x(d => xScale(d[xField]))
      .y0(d => yScale(d[bandMin]))
      .y1(d => yScale(d[bandMax]))
  }

  yBandFields.forEach((ybf, i) => {
    chartCore
      .append('path')
      .datum(data)
      .attr('fill', yBandColors[i])
      .attr('d', areaForBand(ybf))
  })
  yFields.forEach((yf, i) => {
    chartCore
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', yLineColors[i])
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineForField(yf))
  })

  // x axis
  const xAxis = chartCore
    .append('g')
    .attr('id', 'x-axis')
    // .attr('fill', '#333')
    // .attr('opacity', 0.3)
    // .attr('stroke', '#333')
    .attr('transform', `translate(0, ${coreChartHeight})`)

  xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format('d'))).call(g => {
    g.selectAll('.domain').attr('stroke', '#333')
    g.selectAll('.tick line').attr('stroke', '#333')
    g.selectAll('.tick text').attr('fill', '#333')
  })

  xAxis
    .append('text')
    .text(xAxisLabel)
    .attr('fill', '#333')
    .attr('font-weight', 'bold')
    .attr('transform', `translate(${coreChartWidth / 2}, 30)`)
    .attr('text-anchor', 'middle')

  const chartCoreBox = chartCore.node().getBBox()

  const safetyMargin = 20

  const updatedViewBoxWidth =
    chartCoreBox.width + safetyMargin + marginLeft + marginRight // - chartCoreDim.x
  const updatedViewBoxHeight =
    chartCoreBox.height + safetyMargin + marginTop + marginBottom
  svg.attr('viewBox', `0 0 ${updatedViewBoxWidth} ${updatedViewBoxHeight}`)

  const chartCoreDim = chartCore.node().getBBox()
  chartCore.attr(
    'transform',
    `translate(${-chartCoreDim.x + safetyMargin / 2 + marginLeft}, ${
      -chartCoreDim.y + safetyMargin / 2 + marginTop
    })`,
  )
})
