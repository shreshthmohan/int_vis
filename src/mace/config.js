const options = {
  aspectRatio: 2,

  marginTop: 60,
  marginRight: 90,
  marginBottom: 70,
  marginLeft: 10,

  // background-color
  bgColor: 'transparent',

  oppositeDirectionColor: '#ee4e34',
  sameDirectionColor: '#44a8c1',
  yAxisTitle: 'Happiness',
  xAxisTitle: 'GDP per capita (PPP US$)',
  directionStartLabel: '2008',
  directionEndLabel: '2018',
  sizeLegendValues: [1e6, 1e8, 1e9],
  sizeLegendMoveSizeObjectDownBy: 0,
  sizeLegendTitle: 'Population',

  xFieldType: 'GDP per capita',
  yFieldType: 'Happiness',

  xAxisTickValues: [400, 1000, 3000, 8000, 25000, 60000, 160000], // comment this for automatic tick values

  xScaleLogOrLinear: 'log', // linear or log
  xScaleLogBase: Math.E, // applicable only if log scale

  heading: 'This is a heading for the chart',
  subheading: 'This is a subheading for the chart describing it in more detail',
}

const dimensions = {
  xFieldStart: 'gdp_pc_start',
  xFieldEnd: 'gdp_pc_end',
  yFieldStart: 'happiness_start',
  yFieldEnd: 'happiness_end',
  sizeField: 'population',
  nameField: 'country',
}
