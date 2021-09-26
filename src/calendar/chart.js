/* global legend, options, dimensions */
const {
  heading = '{{ heading }}',
  subheading = '{{ subheading }}',
  aspectRatio = 0.8,
  inbuiltScheme = 'schemeRdYlGn',
  marginTop = 40,
  marginRight = 20,
  marginBottom = 20,
  marginLeft = 20,
  bgColor = '#eee',
  descending = true,
  colorLegendTitle = 'Palmer Drought Severity Index',
} = options

const { xGridField, yGridField, xField, nameField, yFields } = dimensions

const coreChartWidth = 1200
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

d3.tsv('./data.tsv').then(data => {
  let maxSum = 0

  data.forEach(el => {
    let elBucketSum = 0
    yFields.forEach(b => {
      elBucketSum += Number.parseFloat(el[b])
    })

    if (elBucketSum > maxSum) {
      maxSum = elBucketSum
    }
  })

  const maxY = maxSum
  const yDomain = [0, maxY]

  const xGridDomain = _.uniq(data.map(d => d[xGridField])).sort()

  const xGridScale = d3
    .scaleBand()
    .domain(xGridDomain)
    .range([0, coreChartWidth])
    .paddingInner(0.02)

  const xDomain = _.uniq(data.map(d => d[xField])).sort()

  const xScale = d3
    .scaleBand()
    .domain(xDomain)
    .range([0, xGridScale.bandwidth()])

  const yGridDomain = _.uniq(data.map(d => d[yGridField]))
  const yGridRange = [0, coreChartHeight]

  const yGridScale = d3
    .scaleBand()
    .domain(yGridDomain)
    .range(descending ? yGridRange.reverse() : yGridRange)
    .paddingInner(0.5)

  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .range([yGridScale.bandwidth(), 0])

  // const stackedData = d3.stack().keys(yFields)(data)
  // console.log('stacked data:', stackedData)

  const dataByYear = {}
  data.forEach(sd => {
    const year = sd[nameField]
    if (dataByYear[year]) {
      dataByYear[year].push(sd)
    } else {
      dataByYear[year] = [sd]
    }
  })

  // console.log('data by year:', dataByYear)
  const stackedDataByYear = {}
  Object.keys(dataByYear).forEach(yr => {
    stackedDataByYear[yr] = d3.stack().keys(yFields)(dataByYear[yr])
  })

  const colorScale = d3
    .scaleOrdinal(d3[inbuiltScheme][yFields.length])
    .domain(yFields)

  // console.log('stacked data by year:', stackedDataByYear)

  const names = _.uniqBy(
    data.map(d => ({
      [nameField]: d[nameField],
      [xGridField]: d[xGridField],
      [yGridField]: d[yGridField],
    })),
    nameField,
  )

  chartCore
    .selectAll('g.year')
    .data(names) // [1895, [5, 1890]]
    .join('g')
    .attr(
      'transform',
      d =>
        `translate(
            ${xGridScale(d[xGridField])},
            ${yGridScale(d[yGridField])}
          )`,
    )

    .each(function (d) {
      d3.select(this)
        .selectAll('g')
        .data(stackedDataByYear[d[nameField]])
        .enter()
        .append('g')
        .attr('fill', dd => colorScale(dd.key))
        .selectAll('rect')
        .data(dd => dd)
        .enter()
        .append('rect')
        .attr('x', dd => xScale(dd.data[xField]))
        .attr('y', dd => yScale(dd[1]))
        .attr('height', dd => yScale(dd[0]) - yScale(dd[1]))
        .attr('width', xScale.bandwidth())
    })
    .append('text')
    .text(d => d[nameField])
    .attr('transform', 'translate(0, -5)')
    .attr('font-size', 14)

  d3.select('#color-legend')
    .append('svg')
    .attr('width', 260)
    .attr('height', 66)
    .append(() =>
      legend({
        color: colorScale,
        title: colorLegendTitle,
        width: 260,
        tickSize: 0,
      }),
    )
})
