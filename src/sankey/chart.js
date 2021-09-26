/* global  dimensions, options */
const alignOptions = {
  justify: 'sankeyJustify',
  left: 'sankeyLeft',
  right: 'sankeyRight',
  center: 'sankeyCenter',
}

;(function () {
  const {
    aspectRatio = 2,

    marginTop = 10,
    marginRight = 0,
    marginBottom = 10,
    marginLeft = 50,

    bgColor = 'transparent',

    align = 'justify',

    verticalGapInNodes = 10,
    nodeWidth = 20,

    units = '',

    heading = '{{ Heading }}',
    subheading = '{{ Subheading }}',
  } = options

  const { sourceField, targetField, valueField } = dimensions

  const linkColorBy = {
    input: 'input',
    output: 'output',
    inputOutput: 'inputOutput',
    none: 'none',
  }

  d3.select('#chart-heading').node().textContent = heading
  d3.select('#chart-subheading').node().textContent = subheading

  const formatLinkThicknessValue = (val, unit) => {
    const format = d3.format(',.0f')
    return unit ? `${format(val)} ${unit}` : format(val)
  }

  const chosenAlign = alignOptions[align]

  // NOTE: Currently only 'inputOutput' is supported
  // Don't expose unless done
  const chosenLinkColor = linkColorBy.inputOutput

  const containerWidth = d3
    .select('#svg-container')
    .node()
    .getBoundingClientRect().width

  const svgWidth = containerWidth
  const svgHeight = svgWidth / aspectRatio

  const innerWidth = svgWidth - marginLeft - marginRight
  const innerHeight = svgHeight - marginTop - marginBottom

  const svg = d3
    .select('#svg-container')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('background', bgColor)

  const chartCore = svg
    .append('g')
    .attr('transform', `translate(${marginLeft}, ${marginTop})`)

  const tooltipDiv = d3
    .select('body')
    .append('div')
    .attr(
      'class',
      'dom-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border',
    )
    .style('opacity', 0)

  const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)

  d3.csv('data.csv').then(data => {
    // Sankey data is a list of links (source, target and thickness value of each link)
    const links = data.map(d => ({
      source: d[sourceField],
      target: d[targetField],
      value: d[valueField],
    }))

    // Extract all unique nodes (sources and targets) from list of links
    const nodes = [...new Set(links.flatMap(l => [l.source, l.target]))].map(
      name => ({
        name,
        category: name.replace(/ .*/, ''),
      }),
    )

    const sankeyGenerator = d3
      .sankey()
      .nodeId(d => d.name)
      .nodeAlign(d3[chosenAlign])
      .nodeWidth(nodeWidth)
      .nodePadding(verticalGapInNodes)
      // space taken up by sankey diagram
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])

    const sankeyfied = sankeyGenerator({
      nodes,
      // .map(d => ({ ...d })),
      links,
      // .map(d => ({ ...d })),
      units,
    })

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const color = d =>
      colorScheme(d.category === undefined ? d.name : d.category)

    function getConnections(o, direction) {
      return o.source && o.target
        ? getConnectionsLink(o, direction)
        : getConnectionsNode(o, direction)
    }

    function getConnectionsLink(o, direction = 'both') {
      let connections = [o]

      if (direction === 'source' || direction === 'both') {
        connections = [
          ...connections,
          ...getConnectionsNode(o.source, 'source'),
        ]
      }
      if (direction === 'target' || direction === 'both') {
        connections = [
          ...connections,
          ...getConnectionsNode(o.target, 'target'),
        ]
      }

      return connections
    }

    function getConnectionsNode(o, direction = 'both') {
      let connections = [o]

      if (direction === 'source' || direction === 'both') {
        o.targetLinks.forEach(function (p) {
          connections = [...connections, ...getConnectionsLink(p, direction)]
        })
      }
      if (direction === 'target' || direction === 'both') {
        o.sourceLinks.forEach(function (p) {
          connections = [...connections, ...getConnectionsLink(p, direction)]
        })
      }

      return connections
    }

    const link = chartCore
      .append('g')
      .attr('class', 'sankey-links')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .selectAll('g')
      .data(sankeyfied.links)
      .join('g')
      .attr('id', d => `iv-link-${d.index}`)
      .style('mix-blend-mode', 'multiply')
      .on('mouseover', (e, thisNode) => {
        const sel = [thisNode]
        sel.forEach(function (o) {
          getConnections(o).forEach(function (p) {
            sel.push(p)
          })
        })

        d3.select('.sankey-nodes').classed('hovering', true)
        d3.select('.sankey-links').classed('hovering', true)

        sel.forEach(item => {
          // if sel item is a link
          if (item.source && item.target) {
            d3.select(`#iv-link-${item.index}`).classed('active', true)
          } else {
            // else item is a node
            d3.select(`#iv-node-${item.index}`).classed('active', true)
          }
        })

        tooltipDiv.transition().duration(200).style('opacity', 1)
        tooltipDiv.html(
          `${thisNode.source.name} → ${
            thisNode.target.name
          }<br />${formatLinkThicknessValue(thisNode.value, units)} `,
        )
        // const tooltipDivWidth = tooltipDiv.node().getBoundingClientRect().width
        tooltipDiv
          .style('left', `${e.clientX}px`)
          .style('top', `${e.clientY + 20 + window.scrollY}px`)
      })
      .on('mouseout', (e, thisNode) => {
        const sel = [thisNode]
        sel.forEach(function (o) {
          getConnections(o).forEach(function (p) {
            sel.push(p)
          })
        })

        d3.select('.sankey-nodes').classed('hovering', false)
        d3.select('.sankey-links').classed('hovering', false)

        sel.forEach(item => {
          // if sel item is a link
          if (item.source && item.target) {
            d3.select(`#iv-link-${item.index}`).classed('active', false)
          } else {
            // else item is a node
            d3.select(`#iv-node-${item.index}`).classed('active', false)
          }
        })
        tooltipDiv
          .style('left', '-300px')
          .transition()
          .duration(500)
          .style('opacity', 0)
      })

    if (chosenLinkColor === linkColorBy.inputOutput) {
      const gradient = link
        .append('linearGradient')
        .attr('id', d => `iv-link-gradient-${d.index}`)

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d => color(d.source))

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d => color(d.target))
    }

    link
      .append('path')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke', d => {
        return `url(#iv-link-gradient-${d.index})`
      })
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('stroke-opacity', 0.5)
    // .attr('text', (d) => console.log(d))

    const node = chartCore
      .append('g')
      // .attr("stroke", "#0004")
      .attr('class', 'sankey-nodes')
      .selectAll('g')
      .data(sankeyfied.nodes)
      .join('g')
      .attr('id', d => `iv-node-${d.index}`)

    node
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => color(d))
      .on('mouseover', (e, thisNode) => {
        const sel = [thisNode]
        sel.forEach(function (o) {
          getConnections(o).forEach(function (p) {
            sel.push(p)
          })
        })

        d3.select('.sankey-nodes').classed('hovering', true)
        d3.select('.sankey-links').classed('hovering', true)

        sel.forEach(item => {
          // if sel item is a link
          if (item.source && item.target) {
            d3.select(`#iv-link-${item.index}`).classed('active', true)
          } else {
            // else item is a node
            d3.select(`#iv-node-${item.index}`).classed('active', true)
          }
        })

        tooltipDiv.transition().duration(200).style('opacity', 1)
        console.log(thisNode)
        tooltipDiv.html(
          `${thisNode.name}<br />${formatLinkThicknessValue(
            thisNode.value,
            units,
          )}`,
        )
        tooltipDiv
          .style('left', `${e.clientX}px`)
          .style('top', `${e.clientY + 20 + window.scrollY}px`)
      })
      .on('mouseout', (e, thisNode) => {
        const sel = [thisNode]
        sel.forEach(function (o) {
          getConnections(o).forEach(function (p) {
            sel.push(p)
          })
        })

        d3.select('.sankey-nodes').classed('hovering', false)
        d3.select('.sankey-links').classed('hovering', false)

        sel.forEach(item => {
          // if sel item is a link
          if (item.source && item.target) {
            d3.select(`#iv-link-${item.index}`).classed('active', false)
          } else {
            // else item is a node
            d3.select(`#iv-node-${item.index}`).classed('active', false)
          }
        })

        tooltipDiv
          .style('left', '-300px')
          .transition()
          .duration(500)
          .style('opacity', 0)
      })

    node
      .append('text')
      .text(d => d.name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('x', d => (d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 < innerWidth / 2 ? 'start' : 'end'))
  })
})()
