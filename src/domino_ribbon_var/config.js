// Dimension Mapping
const dimensions = {
  xField: 'frustration', // Numeric
  yField: 'quarter', // Categorical / String
  dominoField: 'state', // string; this is also the search field
  sizeField: 'calls', // Numeric
  colorField: 'frustration', // Numeric
}

// Chart Options
const options = {
  /* Chart made responsive. 
  Hence width & height is redundant. 
  Container width cannot be chaged right now. 
  We might give an option to change it later */
  // width / height;
  aspectRatio: 0.8, // decrease this value to increase height

  // Margins
  // Margins are with respect to the core chart region
  // Core chart region doesn't include axes, or labels
  // So if you set all margins to 0, axes, or labels might not be visible
  marginTop: 60,
  marginRight: 90,
  marginBottom: 20,
  marginLeft: 50,

  // background-color
  bgColor: 'transparent',

  // scales
  xDomainCustom: [0, 100],
  colorDomainCustom: [0, 100],
  // colorRangeCustom: ['red', 'green', 'blue', 'black', 'yellow'],
  sizeRangeCustom: [2, 10],

  // legends
  sizeLegendLabelCustom: 'Call Volume',
  sizeLegendValues: [1, 5, 10, 20],
  sizeLegendGapInSymbols: 25,
  sizeLegendMoveSymbolsDownBy: 15,

  // headers
  heading: 'This is a heading for the chart',
  subheading: 'This is a subheading for the chart describing it in more detail',
}
