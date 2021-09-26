;(function () {
  const margin = { top: 550, right: 10, bottom: 10, left: 150 }
  const svgParentWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = svgWidth * 2

  const width = svgWidth - margin.left - margin.right
  const height = svgHeight - margin.top - margin.bottom

  const bgColor = 'transparent'

  const svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('background', bgColor)

  const coreChart = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  d3.csv(
    // 'https://raw.githubusercontent.com/halhen/viz-pub/master/sports-time-of-day/activity.tsv',
    // 'https://raw.githubusercontent.com/zonination/perceptions/master/probly.csv',
    'data.csv',
    // 'activity.tsv',
  ).then(data => {
    // console.log(data)

    // const categoryField = 'activity'
    // const xField = 'time'
    // const yField = 'p'

    const categoryField = 'chart_desc'
    const xField = 'date'
    const yField = 'readers'
    const colorField = 'group'

    const parsedData = data.map(el => {
      const parsedEl = {}
      Object.keys(el).forEach(k => {
        parsedEl[k] = Number.isNaN(Number.parseFloat(el[k]))
          ? el[k]
          : Number.parseFloat(el[k])
      })
      return parsedEl
    })

    parsedData.sort(function (a, b) {
      return a[xField] - b[xField]
    })

    // normalizedData = parsedData.map()

    const nestedData = d3
      .groups(parsedData, function (d) {
        return d[categoryField]
      })
      .map(([key, values]) => {
        return {
          [categoryField]: key,
          values,
          [colorField]: values[0][colorField],
        }
      })

    console.log('nd:', nestedData)

    // const xDomain = _.map(parsedData, d => d[xField])
    const parseDate = dt => {
      const dateString = dt.toString()
      // YYMMDD
      const yy = Number.parseInt(dateString.slice(0, 2), 10) + 2000 // 18 -> 2018
      const mm = Number.parseInt(dateString.slice(2, 4), 10) - 1 // 01; 0 is Jan, 1 is Feb
      const dd = Number.parseInt(dateString.slice(4, 6), 10) // 01

      return new Date(yy, mm, dd)
    }
    const xDomain = d3.extent(
      _.chain(parsedData)
        .map(xField)
        .uniq()
        .value()
        .map(d => parseDate(d)),
    )
    console.log({ xDomain })

    const xScale = d3.scaleTime([0, width]).domain(xDomain)

    const categoryDomain = nestedData.map(d => d[categoryField])
    console.log(categoryDomain)
    const categoryScale = d3
      .scaleBand()
      // .scalePoint()
      .range([0, height])
      .domain(categoryDomain)
      .paddingInner(0)
      .paddingOuter(0)
    console.log(categoryScale.bandwidth())

    const overlap = 8

    console.log('os', categoryScale.step())

    // console.lo
    // Individual ridges
    const yDomain = d3.extent(parsedData, d => d[yField])
    const yScale = d3
      .scaleLinear()
      .range([0, -(1 + overlap) * categoryScale.step()])
      .domain(yDomain)
    console.log(nestedData)

    const gCategory = coreChart
      .append('g')
      .selectAll('.category')
      .data(nestedData)
      .join('g')
      .attr(
        'transform',
        d =>
          `translate(0, ${
            categoryScale(d[categoryField]) + categoryScale.bandwidth()
          })`,
      )
      // .attr('stroke', 'black')
      .on('mouseover', (e, d) => {
        console.log(d)
      })

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
      .range(d3.schemeSpectral[9])
      .domain(colorDomain)
    gCategory
      .append('path')
      .attr('fill', d => {
        // console.log(d)
        return fillColorScale(d[colorField])
        // return 'red'
      })
      .datum(d => d.values)
      .attr('d', area)

    gCategory
      .append('path')
      .attr('stroke', '#333')
      .attr('fill', 'none')
      .datum(d => d.values)
      .attr('d', area.lineY1())

    gCategory
      .append('text')
      .text(d => d[categoryField])
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(-5, 0)')
      .style('font-size', 10)
  })
})()
