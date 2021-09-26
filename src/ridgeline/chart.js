/* global dimensions, options */

// TODOs
// 1. x Axis
// 2. xField parser (need general time format parse support, see parseDate )
// 3. xScale (time [✅] / ordinal / linear?)
const {
  heading = '{{ heading }}',
  subheading = '{{ subheading }}',

  aspectRatio = 0.8,

  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,

  bgColor = '#eee',
  overlap = 1,
} = options
const {
  seriesField = 'chart_desc',
  xField = 'date',
  yField = 'readers',
  colorField = 'group',
} = dimensions

const coreChartWidth = 800
const coreChartHeight = coreChartWidth / aspectRatio

const viewBoxHeight = coreChartHeight + marginTop + marginBottom
const viewBoxWidth = coreChartWidth + marginLeft + marginRight

d3.select('#chart-heading').node().textContent = heading
d3.select('#chart-subheading').node().textContent = subheading

const svgParentNodeSelector = '#svg-container'

const svgParent = d3.select(svgParentNodeSelector)

const svg = svgParent
  .append('svg')
  .attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
  .style('background', bgColor)

const chartCore = svg
  .append('g')
  .attr('transform', `translate(${marginLeft}, ${marginTop})`)

d3.csv('data.csv').then(data => {
  const parsedData = data.map(d => ({
    ...d,
    [yField]: Number.parseFloat(d[yField]),
  }))

  parsedData.sort((a, b) => a[xField] - b[xField])

  const nestedData = d3
    .groups(parsedData, d => d[seriesField])
    .map(([key, values]) => ({
      [seriesField]: key,
      values,
      [colorField]: values[0][colorField],
    }))

  const parseDate = dt => {
    const yy = Number.parseInt(dt.slice(0, 2), 10) + 2000 // 18 -> 2018
    const mm = Number.parseInt(dt.slice(2, 4), 10) - 1 // 01; 0 is Jan, 1 is Feb
    const dd = Number.parseInt(dt.slice(4, 6), 10) // 01

    return new Date(yy, mm, dd)
  }

  const xDomain = d3.extent(
    _.chain(parsedData)
      // eslint-disable-next-line unicorn/no-array-callback-reference
      .map(xField)
      .uniq()
      .value()
      .map(d => parseDate(d)),
  )

  const xScale = d3.scaleTime([0, coreChartWidth]).domain(xDomain)

  const categoryDomain = nestedData.map(d => d[seriesField])
  const categoryScale = d3
    .scaleBand()
    .range([0, coreChartHeight])
    .domain(categoryDomain)
    .paddingInner(0)
    .paddingOuter(0)

  const yDomain = d3.extent(parsedData, d => d[yField])
  const yScale = d3
    .scaleLinear()
    .range([0, -(1 + overlap) * categoryScale.step()])
    .domain(yDomain)

  const seriesGroup = chartCore
    .append('g')
    .selectAll('.series')
    .data(nestedData)
    .join('g')
    .attr(
      'transform',
      d =>
        `translate(0, ${
          categoryScale(d[seriesField]) + categoryScale.bandwidth()
        })`,
    )

  // eslint-disable-next-line unicorn/no-array-callback-reference
  const colorDomain = _.chain(parsedData).map(colorField).uniq().value()

  const area = d3
    .area()
    // .curve(d3.curveBasis)
    .x(d => xScale(parseDate(d[xField])))
    .y1(d => yScale(d[yField]))
    .y0(yScale(0))

  const fillColorScale = d3
    .scaleOrdinal()
    // .range(d3.schemeSpectral[9])
    // .range(d3.schemeCategory10)
    // .range(d3.schemeAccent)
    .range(d3.schemeTableau10)

    .domain(colorDomain)
  seriesGroup
    .append('path')
    .attr('fill', d => {
      return d3.rgb(fillColorScale(d[colorField])).brighter(0.2)
    })
    .datum(d => d.values)
    .attr('d', area)

  seriesGroup
    .append('path')
    // .attr('stroke-width', 2)
    .attr('fill', 'none')
    .datum(d => d.values)
    .attr('d', area.lineY1())
    .attr('stroke', d => {
      return d3.rgb(fillColorScale(d[0][colorField])).darker(0.5)
    })
  seriesGroup
    .append('text')
    .text(d => d[seriesField])
    .attr('text-anchor', 'end')
    .attr('transform', 'translate(-5, 0)')
    .style('font-size', 10)

  // adjust svg to prevent overflows
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
