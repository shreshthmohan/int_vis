// Map data columns to chart dimensions here
const dimensions = {
  beforeField: 'before',
  afterField: 'after',
  topicField: 'topic'
}

const options = {
  /* Headers */
  heading:
    'Comparison chart to compare entities arcoss a metric. Can be used for before-after analysis as well.',
  subheading:
    'Analysis of emotion of tweets appearing choronological vs. recommended by algorithm.',

  /* Chart Area */
  aspectRatio: 0.8,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  bgColor: '#EEEEEE',

  /* Series Colors */
  beforeFieldColor: 'red',
  afterFieldColor: 'green',
  // linkColor:

  /* Glyphs */
  glyphSize: 7,
  connectorSize: 4,
  opacityActive: 0.6,
  opacityInactive: 0.2,

  /* Legends */
  beforeLegendLabel: 'Before',
  afterLegendLabel: 'After',

  /* Axes */
  xAxisTitle: 'Emotion Score',
  xAxisLabelOffset: 30,
  xDomainCustom: [-0.8, 0.8],

  // oppositeDirectionColor: '#ee4e34',
  // sameDirectionColor: '#44a8c1',
  // yAxisTitle: 'Happiness',
  // // xAxisTitle: 'GDP per capita (PPP US$)',
  // directionStartLabel: '2008',
  // directionEndLabel: '2018',
  // sizeLegendValues: [1e6, 1e8, 1e9],
  // sizeLegendMoveSizeObjectDownBy: 0,
  // sizeLegendTitle: 'Population',

  // xFieldType: 'GDP per capita',
  // yFieldType: 'Happiness',

  // xAxisTickValues: [400, 1000, 3000, 8000, 25000, 60000, 160000], // comment this for automatic tick values

  // xScaleLogOrLinear: 'log', // linear or log
  // xScaleLogBase: Math.E, // applicable only if log scale
}
