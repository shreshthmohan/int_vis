;(function () {
  // Size & Margins
  var margin = { top: 60, right: 50, bottom: 20, left: 50, gap: 20 }

  const pw = d3.select('#svg-container').node().getBoundingClientRect().width

  var svgWidth = pw * 0.7,
    svgHeight = 1600,
    width = svgWidth - margin.left - margin.right - margin.gap,
    height = svgHeight - margin.top - margin.bottom

  var search = d3.select('#search')

  // Append svg
  var svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  var div = d3
    .select('body')
    .append('div')
    .attr(
      'class',
      'dom-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border',
    )
    .style('opacity', 0)

  var svgc = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // Scales
  var y = d3
    .scaleBand()
    .range([0, height])
    .paddingInner(0.8)
    .paddingOuter(0.1)
    .align(0.5)
  var x = d3.scaleLinear().range([0, width])
  // var color = d3.scaleOrdinal().range(d3.schemeCategory10);
  // var color = d3.scaleSequential().range(d3.interpolateTurbo);

  const sizeValues = [1, 5, 10, 20]
  const gapInRects = 25
  const moveSizeObjectDownBy = 15

  const sizeLegend = d3
    .select('#size-legend')
    .append('svg')
    .attr('width', 200)
    .attr('height', 66)

  sizeLegend
    .append('g')
    .attr('class', 'g-size-container')
    .attr('transform', `translate(0, ${moveSizeObjectDownBy})`)
    .selectAll('.g-size-dominos')
    .data(sizeValues)
    .enter()
    .append('g')
    .attr('class', 'g-size-dominos')
    .append('rect')
    .style('fill', '#bebebe')
    .style('stroke-width', 1)
    .style('stroke', 'gray')
    .attr('width', d => d)
    .attr('height', 25)
    .attr('x', (d, i) => d + i * gapInRects)

  sizeLegend
    .selectAll('.g-size-dominos')
    .append('text')
    .attr('dy', 35)
    .attr('dx', (d, i) => 1.5 * d + i * gapInRects)
    .attr('text-anchor', 'middle')
    .style('font-size', 8)
    .text(d => d)

  sizeLegend
    .append('text')
    .attr('alignment-baseline', 'hanging')
    // .attr("transform", "translate(0, 8)")
    .style('font-size', 10)
    .style('font-weight', 600)
    .text('Call Volume')

  Promise.all([d3.csv('data/q1.csv'), d3.csv('data/state_codes.csv')]).then(
    function ([data, stateCodes]) {
      const stateCodeMap = {}
      stateCodes.forEach(sc => {
        stateCodeMap[sc.state.toLowerCase()] = sc.code
      })

      data.reverse()

      var yDomain = _.chain(data).map('quarter').uniq().value()
      var states = _.chain(data).map('queue').uniq().value()
      var frustration = _.chain(data)
        .map('frustration')
        .uniq()
        .value()
        .map(f => parseFloat(f))
      // console.log(frustration);
      const dataForQuantile = data.map(d => parseFloat(d.unemployment))
      // const colorScale = d3
      //   .scaleSequential((t) => d3.interpolateSpectral(1 - t))
      //   .domain([0, 1]);

      // const cc = d3.schemeRdYlGn[9];
      // const colorScale = d3
      //   .scaleQuantile()
      //   .domain(dataForQuantile.sort())
      //   .range(d3.schemeSpectral[9].slice().reverse());
      // // .range(d3.schemeRdYlBu[4].reverse());
      // // .range([cc[7], cc[4], cc[1]]);
      // const chooseColors = [0, 1, 2, 7];
      // const chooseColors = [1, 2, 3, 7];
      const chooseColors = [0, 2, 3, 6]
      const customSchemeSpectral = d3.schemeSpectral[9].filter(
        (c, i) => chooseColors.indexOf(i) > -1,
      )

      const colorScale = d3
        .scaleQuantile()
        // .domain(colorDomain.sort())
        .domain(dataForQuantile.sort())
        .range(customSchemeSpectral.slice().reverse())
      // .range(customSchemeSpectral);

      // console.log(d3.schemeRdYlBu[9]);

      var xDomain = d3.extent(frustration)
      var lastX = xDomain[xDomain.length - 1]

      y.domain(yDomain)
      // x.domain(xDomain);
      x.domain([0, 100])

      svgc
        .append('g')
        .append('text')
        .attr('class', 'font-sans')
        .text('Frustration index')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        // .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr('transform', `translate(${width / 2}, -40)`)
        .attr('style', 'font-size: 12px; font-weight: 600;')

      svgc
        .append('g')
        .attr('transform', `translate(0, ${y(yDomain[0]) - 30})`)
        .call(d3.axisTop(x).tickSize(-height))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2))

      svgc
        .append('g')
        .attr('transform', `translate(${x(100) + 20}, 0)`)
        .call(d3.axisRight(y).tickSize(0))
        .call(g => g.select('.domain').remove())

      svgc
        .append('g')
        .attr('class', 'g-dominos')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', d => {
          const code = stateCodeMap[d.queue.toLowerCase()]
          return `rect-${code}`
        })
        .attr('x', (d, i) => {
          return x(+d.frustration)
        })
        .attr('y', d => {
          return y(d.quarter)
        })
        .attr('width', d => +d.size)
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(parseFloat(d.unemployment)))
        .attr('stroke', 'gray')
        .attr('opacity', 1)
        .on('mouseover', (e, d) => {
          div.transition().duration(200).style('opacity', 1)

          div.html(
            `<div> <span class="font-bold">${d.queue}</span> (${d.quarter})</div>
             <div class="flex space-between">
               <div>Frustration index:</div>
               <div class="pl-2 font-bold">${d.frustration}</div>
             </div>`,
          )

          d3.select(e.target).raise()

          const cd = stateCodeMap[d.queue.toLowerCase()]
          d3.select(`.band-${cd}`).classed('b-active', true)
          d3.selectAll(`.rect-${cd}`).raise().classed('r-active', true)
          d3.select('.g-links').classed('hovered', true)

          div
            .style('left', e.clientX + 'px')
            .style('top', e.clientY + 20 + window.scrollY + 'px')
        })
        .on('mouseout', (e, d) => {
          div.transition().duration(500).style('opacity', 0)
          const cd = stateCodeMap[d.queue.toLowerCase()]
          d3.select(`.band-${cd}`).classed('b-active', false)
          d3.selectAll(`.rect-${cd}`).classed('r-active', false)
          d3.select('.g-links').classed('hovered', false)
        })

      const stateWiseData = states.map(state =>
        _.filter(data, { queue: state }),
      )
      console.log(stateWiseData)

      const defs = svgc.append('defs')

      const allLinks = svgc.append('g').attr('class', 'g-links')
      stateWiseData.forEach(stateData => {
        const stateCode = stateCodeMap[stateData[0].queue.toLowerCase()]
        allLinks
          .append('g')
          .attr('class', `band-${stateCode}`)
          .selectAll('path')
          .data(stateData)
          .enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke-width', d => +d.size)
          .attr('opacity', 0.1)
          .attr('data-base-opacity', 0.1)
          .attr('stroke', (d, i) => {
            if ((i + 1) % yDomain.length == 0) {
              return
            }
            const startColor = colorScale(parseFloat(d.unemployment))
            const stopColor = colorScale(
              parseFloat(stateData[i + 1].unemployment),
            )
            const startHex = d3.color(startColor).formatHex().replace('#', '')
            const stopHex = d3.color(stopColor).formatHex().replace('#', '')

            // Linear gradient doesn't work if both colors are the same
            if (startHex == stopHex) {
              return `#${startHex}`
            }
            return `url(#g-${startHex}-${stopHex})`
          })
          .attr('d', (d, i) => {
            if ((i + 1) % yDomain.length == 0) {
              return
            }

            const startColor = colorScale(parseFloat(d.unemployment))
            const stopColor = colorScale(
              parseFloat(stateData[i + 1].unemployment),
            )
            const startHex = d3.color(startColor).formatHex().replace('#', '')
            const stopHex = d3.color(stopColor).formatHex().replace('#', '')

            const gid = `g-${startHex}-${stopHex}`

            if (d3.select('#' + gid).empty() && startHex !== stopHex) {
              var gradient = defs
                .append('linearGradient')
                .attr('id', gid)
                .attr('x1', '100%')
                .attr('x2', '100%')
                .attr('y1', '0%')
                .attr('y2', '100%')

              gradient
                .append('stop')
                .attr('class', 'start')
                .attr('offset', '0%')
                .attr('stop-color', startColor)
                .attr('stop-opacity', 1)

              gradient
                .append('stop')
                .attr('class', 'end')
                .attr('offset', '100%')
                .attr('stop-color', stopColor)
                .attr('stop-opacity', 1)
            }
            return d3.line().curve(d3.curveBumpY)([
              [x(d.frustration) + +d.size / 2, y(d.quarter) + y.bandwidth()],
              [
                x(stateData[i + 1].frustration) + +d.size / 2,
                y(stateData[i + 1].quarter),
              ],
            ])
          })
          .on('mouseover', (e, d) => {
            d3.select(`.band-${stateCode}`).classed('b-active', true)
            d3.select('.g-links').classed('hovered', true)

            d3.selectAll(`.rect-${stateCode}`).raise().classed('r-active', true)

            div.transition().duration(200).style('opacity', 1)

            div.html(
              `<div> <span class="font-bold">${d.queue}</span> (${d.quarter})</div>
               <div class="flex space-between">
                 <div>Frustration index:</div>
                 <div class="pl-2 font-bold">${d.frustration}</div>
               </div>`,
            )

            div
              .style('left', e.clientX + 'px')
              .style('top', e.clientY + window.scrollY + 15 + 'px')
          })
          .on('mouseout', (e, d) => {
            d3.select(`.band-${stateCode}`).classed('b-active', false)
            div.transition().duration(500).style('opacity', 0)
            d3.select('.g-links').classed('hovered', false)
            d3.selectAll(`.rect-${stateCode}`).classed('r-active', false)
          })
      })

      const clearSearchButton = d3.select('#clear-search')
      clearSearchButton.style('visibility', 'hidden')
      search.on('keyup', e => {
        const qstr = e.target.value
        if (qstr) {
          clearSearchButton.style('visibility', 'visible')
          // stateCodes
          // stateCodeMap
          const lqstr = qstr.toLowerCase()
          stateCodes.forEach(sc => {
            if (sc.state.toLowerCase().includes(lqstr)) {
              d3.select(`.band-${sc.code}`).classed('b-active', true)
              d3.select('.g-links').classed('searching', true)
            } else {
              d3.select(`.band-${sc.code}`).classed('b-active', false)
            }
          })
        } else {
          stateCodes.forEach(sc => {
            d3.select(`.band-${sc.code}`).classed('b-active', false)
          })
          d3.select('.g-links').classed('searching', false)
          clearSearchButton.style('visibility', 'hidden')
        }
      })

      clearSearchButton.on('click', () => {
        stateCodes.forEach(sc => {
          d3.select(`.band-${sc.code}`).classed('b-active', false)
        })
        d3.select('.g-links').classed('searching', false)
        search.node().value = ''
        clearSearchButton.style('visibility', 'hidden')
      })
    },
  )
})()
