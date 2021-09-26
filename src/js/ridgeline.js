;(function () {
  const margin = { top: 30, right: 10, bottom: 350, left: 130 }
  const svgParentWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = svgWidth * 2

  const width = svgWidth - margin.left - margin.right
  const height = svgHeight - margin.top - margin.bottom

  const svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  const coreChart = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  d3.csv(
    // 'https://raw.githubusercontent.com/halhen/viz-pub/master/sports-time-of-day/activity.tsv',
    // 'https://raw.githubusercontent.com/zonination/perceptions/master/probly.csv',
    './ridgeline/data.csv',
  ).then(data => {
    // console.log(data)

    const categoryField = 'chart_desc'
    const xField = 'date'
    const yField = 'readers'

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
    console.log({ parsedData })

    // normalizedData = parsedData.map()

    // JS Map
    const nestedData = d3.group(parsedData, function (d) {
      return d[categoryField]
    })

    const xDomain = d3.extent(parsedData, d => d[xField])
    const xScale = d3.scaleLinear().range([0, width]).domain(xDomain)

    const categoryDomain = [...nestedData.keys()]
    // console.log({ categoryDomain })
    const categoryScale = d3
      .scaleBand()
      .range([height, 0])
      .domain(categoryDomain)

    const overlap = 5
    const singleRidgeHeight = (1 + overlap) * categoryScale.step()

    // Individual ridges
    const yDomain = d3.extent(parsedData, d => d[yField])
    const yScale = d3
      .scaleLinear()
      .range([singleRidgeHeight, 0])
      .domain(yDomain)

    const gCategory = coreChart
      .append('g')
      .selectAll('.category')
      .data(nestedData)
      .join('g')
      .attr('transform', d => `translate(0, ${categoryScale(d[0])})`)
    console.log({ nestedData })

    const fillColorScale = d3
      .scaleOrdinal()
      .range(d3.schemeSpectral[9])
      .domain(categoryDomain)
    gCategory
      .append('path')
      .attr('fill', d => {
        return fillColorScale(d[0])
        // return 'red'
      })
      .attr('stroke', d => d3.rgb(fillColorScale(d[0])).darker(0.5))
      .datum(d => d[1])
      .attr(
        'd',
        d3
          .area()
          .x(d => xScale(d[xField]))
          .y1(d => yScale(d[yField]))
          .y0(yScale(0)),
      )
      .on('mouseover', (e, d) => {
        console.log(d[0].chart_desc)
      })
  })
})()
