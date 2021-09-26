/******************************* Start Config { *************************************/
const margin = { top: 10, right: 0, bottom: 10, left: 0, gap: 20 }
const alignOptions = {
  justified: 'sankeyJustify',
  left: 'sankeyLeft',
  right: 'sankeyRight',
  centered: 'sankeyCenter',
}
const units = 'TWh'
const chosenAlign = alignOptions.justified
const verticalGapBetweenNodes = 10
const nodeWidth = 20

const linkColorBy = {
  input: 'input',
  output: 'output',
  inputOutput: 'inputOutput',
  none: 'none',
}

const chosenLinkColor = linkColorBy.inputOutput

// Color Scheme
/******************************* } End Config *********************************/

const pw = d3.select('#svg-container').node().getBoundingClientRect().width

const containerWidth = d3
  .select('#svg-container')
  .node()
  .getBoundingClientRect().width

const svgWidth = containerWidth,
  svgHeight = 600

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

const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)

d3.csv('data/sankey.csv').then((links) => {
  // Sankey data is a list of links (source, target and thickness of each link)

  // Extract all unique nodes (sources and targets) from list of links
  const nodes = Array.from(
    new Set(links.flatMap((l) => [l.source, l.target])),
    (name) => ({
      name,
      category: name.replace(/ .*/, ''),
    })
  )

  // console.log(nodes)
  // console.log(nodes.map((d) => Object.assign({}, d)))
  // console.log(nodes.map((d) => ({ ...d })))

  const sankeyGenerator = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeAlign(d3[chosenAlign])
    .nodeWidth(nodeWidth)
    .nodePadding(verticalGapBetweenNodes)
    // space taken up by sankey diagram
    .extent([
      [0, 0],
      [innerWidth, innerHeight],
    ])

  const sankeyfied = sankeyGenerator({
    nodes: nodes.map((d) => Object.assign({}, d)),
    links: links.map((d) => Object.assign({}, d)),
    units,
  })

  console.log(sankeyfied)

  // const jsonenodes = sankeyfied.nodes.map((n) => ({
  //   name: n.name,
  //   id: `n-${n.index}`,
  // }))

  // const jsonelinks = sankeyfied.links.map((l) => ({
  //   source: l.source.index,
  //   target: l.target.index,
  //   value: parseFloat(l.value),
  // }))

  // const jsonexportsankeydata = { nodes: jsonenodes, links: jsonelinks }

  // console.log(JSON.stringify(jsonexportsankeydata))

  const color = (d) =>
    colorScheme(d.category === undefined ? d.name : d.category)

  function getConnections(o, direction) {
    if (o.source && o.target) {
      return getConnectionsLink(o, direction)
    } else {
      return getConnectionsNode(o, direction)
    }
  }

  function getConnectionsLink(o, direction) {
    var links = [o]
    direction = direction || 'both'

    if (direction == 'source' || direction == 'both') {
      links = links.concat(getConnectionsNode(o.source, 'source'))
    }
    if (direction == 'target' || direction == 'both') {
      links = links.concat(getConnectionsNode(o.target, 'target'))
    }

    return links
  }

  function getConnectionsNode(o, direction) {
    var links = [o]
    direction = direction || 'both'

    if (
      // (direction == 'source' && o.sourceLinks.length < 2) ||
      direction == 'source' ||
      direction == 'both'
    ) {
      o.targetLinks.forEach(function (p) {
        links = links.concat(getConnectionsLink(p, direction))
      })
    }
    if (
      // (direction == 'target' && o.targetLinks.length < 2) ||
      direction == 'target' ||
      direction == 'both'
    ) {
      o.sourceLinks.forEach(function (p) {
        links = links.concat(getConnectionsLink(p, direction))
      })
    }

    return links
  }

  const link = svg
    .append('g')
    .attr('class', 'sankey-links')
    .attr('fill', 'none')
    .attr('stroke-opacity', 0.5)
    .selectAll('g')
    .data(sankeyfied.links)
    .join('g')
    .attr('id', (d) => `iv-link-${d.index}`)
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

      sel.forEach((item) => {
        // if sel item is a link
        if (item.source && item.target) {
          d3.select(`#iv-link-${item.index}`).classed('active', true)
        } else {
          // else item is a node
          d3.select(`#iv-node-${item.index}`).classed('active', true)
        }
      })
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

      sel.forEach((item) => {
        // if sel item is a link
        if (item.source && item.target) {
          d3.select(`#iv-link-${item.index}`).classed('active', false)
        } else {
          // else item is a node
          d3.select(`#iv-node-${item.index}`).classed('active', false)
        }
      })
    })

  if (chosenLinkColor === linkColorBy.inputOutput) {
    const gradient = link
      .append('linearGradient')
      .attr('id', (d) => `iv-link-gradient-${d.index}`)

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', (d) => color(d.source))

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', (d) => color(d.target))
  }

  link
    .append('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke', (d) => {
      return `url(#iv-link-gradient-${d.index})`
    })
    .attr('stroke-width', (d) => Math.max(1, d.width))
    .attr('stroke-opacity', 0.5)
  // .attr('text', (d) => console.log(d))

  const node = svg
    .append('g')
    // .attr("stroke", "#0004")
    .attr('class', 'sankey-nodes')
    .selectAll('g')
    .data(sankeyfied.nodes)
    .join('g')
    .attr('id', (d) => `iv-node-${d.index}`)

  node
    .append('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('fill', (d) => color(d))
    .on('mouseover', (e, thisNode) => {
      const sel = [thisNode]
      sel.forEach(function (o) {
        getConnections(o).forEach(function (p) {
          sel.push(p)
        })
      })

      d3.select('.sankey-nodes').classed('hovering', true)
      d3.select('.sankey-links').classed('hovering', true)

      sel.forEach((item) => {
        // if sel item is a link
        if (item.source && item.target) {
          d3.select(`#iv-link-${item.index}`).classed('active', true)
        } else {
          // else item is a node
          d3.select(`#iv-node-${item.index}`).classed('active', true)
        }
      })
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

      sel.forEach((item) => {
        // if sel item is a link
        if (item.source && item.target) {
          d3.select(`#iv-link-${item.index}`).classed('active', false)
        } else {
          // else item is a node
          d3.select(`#iv-node-${item.index}`).classed('active', false)
        }
      })
    })

  node
    .append('text')
    .text((d) => d.name)
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('x', (d) => (d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', (d) => (d.x0 < innerWidth / 2 ? 'start' : 'end'))

  // svg
  //   .append('g')
  //   .attr('font-family', 'sans-serif')
  //   .attr('font-size', 10)
  //   .selectAll('text')
  //   .data(sankeyfied.nodes)
  //   .join('text')
  //   .attr('x', (d) => (d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6))
  //   .attr('y', (d) => (d.y1 + d.y0) / 2)
  //   .attr('dy', '0.35em')
  //   .attr('text-anchor', (d) => (d.x0 < innerWidth / 2 ? 'start' : 'end'))
  //   .text((d) => d.name)
})
