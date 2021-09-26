const margin = { top: 40, right: 40, bottom: 40, left: 40, gap: 20 }
// const pw = d3.select('#svg-container').node().getBoundingClientRect().width

const containerWidth = d3
  .select('#svg-container')
  .node()
  .getBoundingClientRect().width

const svgWidth = 600
const svgHeight = 600

const innerWidth = svgWidth - margin.left - margin.right
const innerHeight = svgHeight - margin.top - margin.bottom

const svg = d3
  .select('#svg-container')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .attr('style', 'background: #1d1d1d')

const chartCore = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

const xScale = d3.scaleLinear().range([0, innerWidth]).domain([0, 100])

// A point is described by d, e, f where all three are <= 100 and d+e+f = 100
// d is the bottom edge of the triangle
// e is the right edge
// f is the left edge

const data = [
  // { d: 23, e: 45, f: 32 },
  { d: 100, e: 0, f: 0 },
  { d: 0, e: 100, f: 0 },
  { d: 0, e: 0, f: 100 },
  { d: 33, e: 34, f: 33 },
]

function getRandomIntInclusive(min, max) {
  const min_ = Math.ceil(min)
  const max_ = Math.floor(max)
  return Math.floor(Math.random() * (max_ - min_ + 1) + min_)
}

for (let i = 0; i < 10000; i++) {
  const d = getRandomIntInclusive(0, 100)
  const e = getRandomIntInclusive(0, 100)
  const f = getRandomIntInclusive(0, 100)
  // const f = 100 - e - d
  const s = (d + e + f) / 100
  data.push({ d: d / s, e: e / s, f: f / s })
}

const greater = function (t) {
  let maxDim = ''
  let maxVal = 0
  // TODO not handled case when two or more are equal
  Object.keys(t).forEach(dim => {
    if (t[dim] > maxVal) {
      maxVal = t[dim]
      maxDim = dim
    }
  })
  return maxDim
}

chartCore
  .append('g')
  .selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', t => xScale(t.d + t.e / 2))
  .attr('cy', t => ((xScale(100) - xScale(t.e)) * Math.sqrt(3)) / 2)
  .attr('r', 2)
  .attr('fill', t => {
    const maxDim = greater(t)
    switch (maxDim) {
      case 'd':
        return 'red'

      case 'e':
        return 'green'
      case 'f':
        return 'blue'
      default:
        return 'gray'
    }
  })
  .attr('opacity', 0.5)
