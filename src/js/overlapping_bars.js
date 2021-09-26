;(function () {
  const margin = { top: 30, right: 10, bottom: 40, left: 10 }
  const svgParentWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = svgWidth / 2

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
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSFUIZUoc1n5b_T4T1sU5eUAtKxcCNJUw4E3I2IY7XnUJyglxmxExnwYp7RbDcLFDI_vaTbFP8F_LBM/pub?gid=53397147&single=true&output=csv',
  ).then(data => {
    const xField = 'Rating'
    const yField1 = 'Series 1'
    const yField2 = 'Series 2'

    const dataParsed = data.map(el => {
      const elParsed = { ...el }
      elParsed[yField1] = Number.parseFloat(el[yField1])
      elParsed[yField2] = Number.parseFloat(el[yField2])
      return elParsed
    })

    const xDomain = dataParsed.map(d => d[xField])
    const xScale = d3
      .scaleBand()
      .range([0, width])
      .domain(xDomain)
      .paddingInner(0.2)

    const yDomain1 = dataParsed.map(d => d[yField1])
    const yDomain2 = dataParsed.map(d => d[yField2])
    const yMax = d3.max([...yDomain1, ...yDomain2])
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, yMax])

    coreChart
      .append('g')
      .selectAll('rect')
      .data(dataParsed)
      .join('rect')
      .attr('x', d => xScale(d[xField]))
      .attr('y', d => yScale(d[yField1]))
      .attr('height', d => yScale(0) - yScale(d[yField1]))
      .attr('width', xScale.bandwidth())
      .attr('fill', '#8c8d85')
      .attr('opacity', 0.5)

    coreChart
      .append('g')
      .selectAll('rect')
      .data(dataParsed)
      .join('rect')
      .attr('x', d => xScale(d[xField]))
      .attr('y', d => yScale(d[yField2]))
      .attr('height', d => yScale(0) - yScale(d[yField2]))
      .attr('width', xScale.bandwidth())
      .attr('fill', '#29b1c4')
      .attr('opacity', 0.5)

    const xAxis = d3.axisBottom(xScale).tickValues(
      xScale.domain().filter(function (d, i) {
        return !(i % 10)
      }),
    )

    const svgXAxis = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top + height})`)

    svgXAxis
      .append('g')
      .call(xAxis)
      .style('color', 'gray')
      .attr('class', 'x-axis')
  })
})()
