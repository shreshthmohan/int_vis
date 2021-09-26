;(function () {
  var margin = { top: 20, right: 0, left: 0, bottom: 0 }

  const containerWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = containerWidth * 0.8,
    svgHeight = 1800

  const innerWidth = svgWidth - margin.left - margin.right
  const innerHeight = svgHeight - margin.top - margin.bottom

  const svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  const chartCore = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  d3.tsv('data/drought.tsv').then(data => {
    // console.log(data)

    // Assuming the following:
    // 1. There are no missing values

    let maxSum = 0

    // const buckets = ['0', '1', '2', '3', '4', '5', '6']
    const buckets = data.columns.slice(1)
    console.log('buckets:', buckets)

    data.forEach(el => {
      let elBucketSum = 0
      buckets.forEach(b => {
        elBucketSum += parseFloat(el[b])
      })
      // console.log('el:', el)

      if (elBucketSum > maxSum) {
        maxSum = elBucketSum
      }
    })

    const maxY = maxSum
    // console.log('maxY:', maxY)
    const barHeight = 50

    renderChart({ data, maxY, barHeight, buckets })
  })

  function renderChart({ data, maxY, barHeight, buckets }) {
    const yDomain = [0, maxY]
    const yRange = [barHeight, 0]
    const yScale = d3.scaleLinear().domain(yDomain).range(yRange)

    // Grid scale for each 10 year block is the same
    const xGridDomain = _.uniq(data.map(d => dateToXGrid(d.key))).sort()

    const xGridScale = d3
      .scaleBand()
      .domain(xGridDomain)
      .range([0, innerWidth])
      .paddingInner(0.02)

    // Extract month from key
    // key looks like YYYYMM (e.g. key = 201203 - 2012 March)
    const xDomain = _.uniq(data.map(d => d.key.slice(4))).sort()
    // We get a sorted list of unique MM values

    const xScale = d3
      .scaleBand()
      .domain(xDomain)
      .range([0, xGridScale.bandwidth()])

    const yearList = _.uniq(data.map(d => d.key.slice(0, 4))).sort()

    const decades = _.uniq(
      yearList.map(yr => (Math.floor(parseInt(yr, 10) / 10) * 10).toString()),
    )

    const yGridScale = d3.scaleBand().domain(decades).range([0, innerHeight])

    // const stackedData = d3.stack().keys(buckets)(data)
    // console.log('stacked data:', stackedData)

    const dataByYear = {}
    data.forEach(sd => {
      const year = sd.key.slice(0, 4)
      if (dataByYear[year]) {
        dataByYear[year].push(sd)
      } else {
        dataByYear[year] = [sd]
      }
    })

    // console.log('data by year:', dataByYear)
    const stackedDataByYear = {}
    Object.keys(dataByYear).forEach(yr => {
      stackedDataByYear[yr] = d3.stack().keys(buckets)(dataByYear[yr])
    })

    const colorScale = d3.scaleOrdinal(d3.schemeRdYlGn[7]).domain(buckets)

    // console.log('stacked data by year:', stackedDataByYear)

    chartCore
      .selectAll('g.year')
      .data(yearList)
      .enter()
      .append('g')
      .attr(
        'transform',
        d =>
          `translate(
            ${xGridScale(d.slice(3, 4))},
            ${yGridScale(d.slice(0, 3) + '0')}
          )`,
      )

      .each(function (d) {
        d3.select(this)
          .selectAll('g')
          .data(stackedDataByYear[d])
          .enter()
          .append('g')
          .attr('fill', d => colorScale(d.key))
          .selectAll('rect')
          .data(d => d)
          .enter()
          .append('rect')
          .attr('x', d => xScale(d.data.key.slice(4)))
          // .attr('data-id', d => d.data.key)
          // .attr('x', d=> console.log(yScale(d[1])))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]))
          // // .attr('height', 3)
          .attr('width', xScale.bandwidth())
      })
      .append('text')
      .text(d => d)
  }

  function dateToXGrid(date) {
    // data format: YYYYMM, eg 189501 is January 1895
    // Year ending with 0 is 0
    // Year ending with 9 is 9
    const yearLastDigit = date.slice(3, 4)

    // e.g. returns 0 for the year 1890
    return yearLastDigit
  }
})()
