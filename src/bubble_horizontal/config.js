const inbuiltSchemeOptions = [
  'schemeBrBG',
  'schemePRGn',
  'schemePiYG',
  'schemePuOr',
  'schemeRdBu',
  'schemeRdGy',
  'schemeRdYlBu',
  'schemeRdYlGn',
  'schemeSpectral',
  'schemeBuGn',
  'schemeBuPu',
  'schemeGnBu',
  'schemeOrRd',
  'schemePuBuGn',
  'schemePuBu',
  'schemePuRd',
  'schemeRdPu',
  'schemeYlGnBu',
  'schemeYlGn',
  'schemeYlOrBr',
  'schemeYlOrRd',
  'schemeBlues',
  'schemeGreens',
  'schemeGreys',
  'schemePurples',
  'schemeReds',
  'schemeOranges',
]
const options = {
  marginTop: 30,
  marginRight: 50,
  marginBottom: 30,
  marginLeft: 170,

  bgColor: 'transparent',

  collisionDistance: 0.5,

  xDomainCustom: [0, 45],

  sizeRange: [2, 15],

  sizeLegendValues: [10e3, 50e3, 10e4, 25e4],
  sizeLegendTitle: 'size legend title',

  xAxisLabel: 'x-axis label',

  colorLegendTitle: 'color legend label',

  combinedSegmentLabel: 'combined segment label',
  segmentType: 'segment type', // use this if it's the same for both split and combined modes
  segmentTypeCombined: 'segment type (combined)',
  segmentTypeSplit: 'segment type (split)',

  // customColorScheme: ['red', 'blue', 'green', 'black', 'gray'],
  inbuiltScheme: 'schemePuRd',
  // inbuiltSchemeOptions[0], // 0, 27
  numberOfColors: 5, // minumum: 3, maximum: 9

  // headers
  heading: 'This is a heading for the chart',
  subheading: 'This is a subheading for the chart describing it in more detail',
}

const dimensions = {
  sizeField: 'capitalization',
  xField: 'taxRate',
  nameField: 'name',

  segmentField: 'sector',
}
