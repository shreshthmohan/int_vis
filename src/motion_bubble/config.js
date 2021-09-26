// eslint-disable-next-line no-unused-vars
const dimensions = {
  sizeField: 'calls',
  xField: 'unemployment',
  yField: 'frustration',
  timeField: 'quarter',
  nameField: 'state',
  colorField: 'state',
}

// eslint-disable-next-line no-unused-vars
const options = {
  motionDelay: 500,
  marginTop: 40,
  marginRight: 50,
  marginBottom: 50,
  marginLeft: 40,
  bgColor: 'transparent',
  heading: 'This is a heading for the chart',
  subheading: 'This is a subheading for the chart describing it in more detail',
  aspectRatio: 2,
  sizeRange: [2, 20],
  xDomainCustom: [0, 30],
  yDomainCustom: [0, 8],
  inbuiltScheme: 'schemePuRd',
  numberOfColors: 9, // minumum: 3, maximum: 9,
  xAxisLabel: 'Unemployment',
  yAxisLabel: 'Frustration Index',
}
