/* global legend, dimensions, options */
// https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals

// SVG parent element CSS selector, preferably HTML id
// e.g. #svg-container
const svgParentNodeSelector = '#svg-container'

;(function () {
  const {
    aspectRatio,

    marginTop = 60,
    marginRight = 50,
    marginBottom = 20,
    marginLeft = 50,

    bgColor = 'transparent',

    sizeLegendLabelCustom,

    sizeLegendValues = [1, 5, 10, 20],
    sizeLegendGapInSymbols = 25,
    sizeLegendMoveSymbolsDownBy = 15,

    xDomainCustom,
    colorDomainCustom,
    colorRangeCustom,

    // xAxisLabelOffset = 0,
    // yAxisLabelOffset = 0,

    // xAxisLocations = ['top'],
    // yAxisLocations = ['left'],

    // hoverEnabled = true,
    // searchEnabled = true,

    sizeRangeCustom = [2, 20],

    // Opinionated (currently cannot be changed from options)
    yPaddingInner = 0.8,
    yPaddingOuter = 0.1,

    heading = '{{ Heading }}',
    subheading = '{{ Subheading }}',
  } = options

  const {
    xField = 'frustration', // number
    yField = 'quarter', // string
    dominoField = 'queue', // string
    sizeField = 'size', // number
    // colorField = 'unemployment', // number
  } = dimensions

  d3.select('#chart-heading').node().textContent = heading
  d3.select('#chart-subheading').node().textContent = subheading

  const svgParentWidth = d3
    .select(svgParentNodeSelector)
    .node()
    .getBoundingClientRect().width

  const svgWidth = svgParentWidth
  const svgHeight = svgWidth / aspectRatio

  const width = svgWidth - marginLeft - marginRight
  const height = svgHeight - marginTop - marginBottom

  const innerRadius = Math.min(width, height) * 0.5 - 20
  const outerRadius = innerRadius + 20

  const chord = d3
    .chordDirected()
    .padAngle(12 / innerRadius)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)

  const ribbon = d3
    .ribbonArrow()
    .radius(innerRadius - 0.5)
    .padAngle(1 / innerRadius)

  const formatValue = x => `${x.toFixed(0)}B`

  const svg = d3
    .select(svgParentNodeSelector)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('background', bgColor)

  const chartCore = svg
    .append('g')
    .attr(
      'transform',
      `translate(${marginLeft + width / 2}, ${marginTop + height / 2})`,
    )

  d3.csv('data.csv').then(data => {
    const names = _(data)
      .flatMap(d => [d.source, d.target])
      .uniq()
      .value()

    const color = d3.scaleOrdinal(names, d3.schemeCategory10)

    const matrix = _.chunk(
      _.times(_.multiply(names.length, names.length), _.constant(0)),
      names.length,
    )
    // const index = new Map(names.map((name, i) => [name, i]))
    const index = new Map(names.map((name, i) => [_.lowerCase(name), i]))
    _.forEach(data, ({ source, target, value }, key) => {
      matrix[index.get(_.lowerCase(source))][index.get(_.lowerCase(target))] =
        Number(value)
    })

    const chords = chord(matrix)
    const textId = 'arcId'

    chartCore
      .append('path')
      .attr('id', textId)
      .attr('fill', 'none')
      .attr(
        'd',
        d3.arc()({ outerRadius, startAngle: 0, endAngle: 2 * Math.PI }),
      )

    chartCore
      .append('g')
      .attr('fill-opacity', 0.75)
      .selectAll('g')
      .data(chords)
      .join('path')
      .attr('class', d => {
        return `ribbon ribbon-${d.source.index}-${d.target.index} ribbon-${d.source.index} ribbon-${d.target.index}`
      })
      .attr('d', ribbon)
      .attr('fill', d => color(names[d.target.index]))
      .attr('opacity', 0.3)
      .style('mix-blend-mode', 'multiply')
      .on('mouseover', (e, d) => {
        d3.selectAll('.ribbon').classed('ribbon-inactive', true)
        d3.select(`.ribbon-${d.source.index}-${d.target.index}`).classed(
          'ribbon-active',
          true,
        )
        d3.select(`.chord-${d.source.index}`).classed('chord-inactive', false)
        d3.select(`.chord-${d.target.index}`).classed('chord-inactive', false)
        d3.select(`.chord-${d.source.index}`).classed('chord-active', true)
        d3.select(`.chord-${d.target.index}`).classed('chord-active', true)
      })
      .on('mouseout', (e, d) => {
        d3.selectAll('.ribbon').classed('ribbon-inactive', false)
        d3.select(`.ribbon-${d.source.index}-${d.target.index}`).classed(
          'ribbon-active',
          false,
        )
        d3.select(`.chord-${d.source.index}`).classed('chord-active', false)
        d3.select(`.chord-${d.target.index}`).classed('chord-active', false)
        d3.select(`.chord-${d.source.index}`).classed('chord-inactive', true)
        d3.select(`.chord-${d.target.index}`).classed('chord-inactive', true)
      })
      .append('title')
      .text(
        d =>
          `${names[d.source.index]} owes ${names[d.target.index]} ${formatValue(
            d.source.value,
          )}`,
      )

    chartCore
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('g')
      .data(chords.groups)
      .join('g')
      .attr('class', d => {
        return `chord chord-${d.index}`
      })
      .attr('opacity', 0.3)
      .call(g =>
        g
          .append('path')
          .attr('d', arc)
          .attr('fill', d => color(names[d.index]))
          .attr('stroke', '#fff'),
      )
      .call(g =>
        g
          .append('text')
          .attr('dy', -3)
          .append('textPath')
          .attr('xlink:href', `#${textId}`)
          .attr('startOffset', d => d.startAngle * outerRadius)
          .style('font-size', '10px')
          .style('fill', 'black')
          .text(d => {
            // debugger
            return names[d.index]
          }),
      )
      .on('mouseover', (e, d) => {
        d3.select(`.chord-${d.index}`).classed('chord-active', true)
        d3.selectAll('.ribbon').classed('ribbon-inactive', true)
        d3.selectAll(`.ribbon-${d.index}`).classed('ribbon-active', true)
      })
      .on('mouseout', (e, d) => {
        d3.select(`.chord-${d.index}`).classed('chord-inactive', true)
        d3.select(`.chord-${d.index}`).classed('chord-active', false)
        d3.selectAll('.ribbon').classed('ribbon-inactive', false)
        d3.selectAll(`.ribbon-${d.index}`).classed('ribbon-active', false)
      })

    const clearSearchButton = d3.select('#clear-search')
    clearSearchButton.style('visibility', 'hidden')
    const search = d3.select('#search')
    search.attr('placeholder', `Find by country`)
    search.on('keyup', e => {
      const qstr = e.target.value
      if (qstr) {
        clearSearchButton.style('visibility', 'visible')
        const index_ = index.get(_.lowerCase(qstr))
        // debugger
        if (index_ !== undefined) {
          d3.select(`.chord-${index_}`).classed('chord-active', true)
          d3.select(`.chord-${index_}`).classed('chord-inactive', false)
          d3.selectAll('.ribbon').classed('ribbon-inactive', true)
          d3.selectAll(`.ribbon-${index_}`).classed('ribbon-active', true)
        } else {
          d3.select('.chord').classed('chord-active', false)
          d3.select('.chord').classed('chord-inactive', true)
          d3.selectAll('.ribbon').classed('ribbon-inactive', true)
          d3.selectAll('.ribbon').classed('ribbon-active', false)
        }
      } else {
        d3.select('.chord').classed('chord-active', false)
        d3.select('.chord').classed('chord-inactive', true)
        d3.selectAll('.ribbon').classed('ribbon-active', false)
        d3.selectAll('.ribbon').classed('ribbon-inactive', true)
      }
    })
  })
})()
