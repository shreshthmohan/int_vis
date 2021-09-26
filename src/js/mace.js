;(function () {
  const margin = { top: 30, right: 10, bottom: 0, left: 10 }
  const svgParentWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = (svgWidth * 1) / 2

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

  // d3.csv('data/happiness.csv').then(data => {
  console.log(data)
  // {country, gdp_start, gdp_end, happiness_start, happiness_end}
  const xFieldStart = 'gdp_start'
  const xFieldEnd = 'gdp_end'
  const yFieldStart = 'happiness_start'
  const yFieldEnd = 'happiness_end'
  const sizeField = 'population'
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
    .filter(d => !isNaN(d.slope))
  // console.log(dataParsed.map(d => d.slope))

  const yDomainStart = dataParsed.map(el => Number.parseFloat(el[yFieldStart]))
  const yDomainEnd = dataParsed.map(el => Number.parseFloat(el[yFieldEnd]))
  const yDomain = d3.extent([...yDomainStart, ...yDomainEnd])
  console.log({ yDomain })
  const yScale = d3.scaleLinear().range([height, 0]).domain(yDomain).nice()

  const xDomainStart = dataParsed.map(el => Number.parseFloat(el[xFieldStart]))
  const xDomainEnd = dataParsed.map(el => Number.parseFloat(el[xFieldEnd]))
  const xDomain = d3.extent([...xDomainStart, ...xDomainEnd])
  console.log({ xDomain })
  const xScale = d3.scaleLog().range([0, width]).domain(xDomain)

  // Area of circle should be proportional to the population
  const sizeMax = d3.max(dataParsed.map(el => Number.parseFloat(el[sizeField])))
  const circleSizeScale = d3.scaleSqrt().range([2, 30]).domain([0, sizeMax])
  const lineWidthScale = d3.scaleSqrt().range([2, 5]).domain([0, sizeMax])

  const colorDomain = d3.extent(dataParsed.map(el => el.slope))
  console.log({ colorDomain })
  const colorRange = ['#ee4e34', '#44a8c1']
  const colorScale = slope => (slope > 0 ? colorRange[1] : colorRange[0])

  const cGroup = coreChart
    .append('g')
    .selectAll('g')
    .data(dataParsed)
    .join('g')
    .attr('opacity', () => (Math.random() > 0.1 ? 0.2 : 1))

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
  // })

  // TODO: Refactor code to replace hard-coding to columns in source data.
  // to use field / dimension values instead
})()
