;(function () {
  const margin = { top: 30, right: 10, bottom: 0, left: 10 }
  const svgParentWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = svgWidth * 0.7

  const width = svgWidth - margin.left - margin.right
  const height = svgHeight - margin.top - margin.bottom

  const symbolOptions = [
    'circle',
    'cross',
    'diamond',
    'square',
    'star',
    'triangle',
    'wye',
  ]

  const chosenSymbolIndex = symbolOptions.indexOf('triangle')

  const markerSymbol = d3.symbol().type(d3.symbols[chosenSymbolIndex])

  const svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  const coreChart = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  d3.csv('data/comparison.csv').then(data => {
    console.log(data)

    const yDomain = data.map(el => el.Dimension)
    const yScale = d3
      .scaleBand()
      .range([0, height])
      .domain(yDomain)
      .paddingInner(0.8)
      .paddingOuter(0.7)

    // max republican value
    const maxRight = d3.max(data.map(el => Number.parseFloat(el.Republican)))
    const maxLeft = d3.max(data.map(el => Number.parseFloat(el.Democratic)))
    const maxOverall = d3.max([maxLeft, maxRight])

    // console.log(maxRight, maxLeft)

    const xStart = 50

    const xScaleLeft = d3
      .scaleLinear()
      .range([width / 2, 0])
      .domain([xStart, maxOverall])
    const xScaleRight = d3
      .scaleLinear()
      .range([width / 2, width])
      .domain([xStart, maxOverall])

    const symbolSize = yScale.bandwidth() ** 2 * 1
    const testSymbol = coreChart
      .append('g')
      .attr('class', 'test-symbol')
      .append('path')
      .attr('d', markerSymbol.size(symbolSize))
    const testSymbolDimensions = testSymbol.node().getBBox()
    const triangleOffset = (testSymbolDimensions.height * 2) / 3
    testSymbol.remove()

    const leftBars = coreChart.append('g').attr('class', 'left-bars')

    leftBars
      .selectAll('rect')
      .data(data)
      .join('rect')
      // .attr('x', d => xScaleLeft(d.Democratic))
      .attr('x', d => xScaleLeft(d.Democratic) + triangleOffset)
      .attr('y', d => yScale(d.Dimension))
      .attr('height', yScale.bandwidth())
      .attr(
        'width',
        // d => xScaleLeft(0) - xScaleLeft(d.Democratic),
        d => xScaleLeft(xStart) - xScaleLeft(d.Democratic) - triangleOffset,
      )
      .attr('fill', '#3077aa')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
    // .attr('opacity', 0.7)

    leftBars.append('g').call(d3.axisTop(xScaleLeft))

    leftBars
      .append('g')
      .selectAll('text')
      .data(data)
      .join('text')
      .text(d => d['Democratic Label'])
      .attr('text-anchor', 'end')
      .style('dominant-baseline', 'middle')
      .attr('x', d => xScaleLeft(d.Democratic) - 5)
      .attr('y', d => yScale(d.Dimension) + yScale.bandwidth() / 2)
      .style('font-size', '14px')

    // Left Symbols
    leftBars
      .append('g')
      .selectAll('path')
      .data(data)
      .join('g')
      .attr(
        'transform',
        d =>
          `translate(${xScaleLeft(d.Democratic) + triangleOffset}, ${
            yScale(d.Dimension) + yScale.bandwidth() / 2
          })
         rotate(-90)`,
      )
      .append('path')
      .attr('d', markerSymbol.size(symbolSize))
      .attr('fill', '#3077aa')
    // .attr('opacity', 0.7)

    const rightBars = coreChart.append('g').attr('class', 'right-bars')

    rightBars
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', xScaleRight(xStart))
      //  d => xScaleRight(d.Republican))
      .attr('y', d => yScale(d.Dimension))
      .attr('height', yScale.bandwidth())
      .attr(
        'width',
        d => -xScaleRight(xStart) + xScaleRight(d.Republican) - triangleOffset,
      )
      .attr('fill', '#ed3833')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
    // .attr('opacity', 0.7)

    rightBars.append('g').call(d3.axisTop(xScaleRight))

    // Right Symbols
    rightBars
      .append('g')
      .selectAll('path')
      .data(data)
      .join('g')
      .attr(
        'transform',
        d =>
          `translate(${xScaleRight(d.Republican) - triangleOffset}, ${
            yScale(d.Dimension) + yScale.bandwidth() / 2
          })
         rotate(90)`,
      )
      .append('path')
      .attr('d', markerSymbol.size(symbolSize))
      .attr('fill', '#ed3833')
    // .attr('opacity', 0.7)

    rightBars
      .append('g')
      .selectAll('text')
      .data(data)
      .join('text')
      .text(d => d['Republican Label'])
      .attr('text-anchor', 'start')
      .style('dominant-baseline', 'middle')
      .attr('x', d => xScaleRight(d.Republican) + 5)
      .attr('y', d => yScale(d.Dimension) + yScale.bandwidth() / 2)
      .style('font-size', '14px')

    // Dimension Labels
    coreChart
      .append('g')
      .selectAll('text')
      .data(data)
      .join('text')
      .text(d => d.Dimension)
      .attr('x', width / 2)
      .attr('y', d => yScale(d.Dimension) - 7)
      .attr('text-anchor', 'middle')
      .attr('fill', '#444')
  })
})()
