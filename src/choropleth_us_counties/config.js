const inbuiltSchemeOptions = [
  'interpolateBrBG', // 0
  'interpolatePRGn', // 1
  'interpolatePiYG', // 2
  'interpolatePuOr', // 3
  'interpolateRdBu', // 4
  'interpolateRdGy', // 5
  'interpolateRdYlBu', // 6
  'interpolateRdYlGn', // 7
  'interpolateSpectral', // 8
  'interpolateBuGn', // 9
  'interpolateBuPu', // 10
  'interpolateGnBu', // 11
  'interpolateOrRd', // 12
  'interpolatePuBuGn', // 13
  'interpolatePuBu', // 14
  'interpolatePuRd', // 15
  'interpolateRdPu', // 16
  'interpolateYlGnBu', // 17
  'interpolateYlGn', // 18
  'interpolateYlOrBr', // 19
  'interpolateYlOrRd', // 20
  'interpolateBlues', // 21
  'interpolateGreens', // 22
  'interpolateGreys', // 23
  'interpolatePurples', // 24
  'interpolateReds', // 25
  'interpolateOranges', // 26
  'interpolateCividis', // 27
  'interpolateCubehelixDefault', // 28
  'interpolateRainbow', // 29
  'interpolateWarm', // 30
  'interpolateCool', // 31
  'interpolateSinebow', // 32
  'interpolateTurbo', // 33
  'interpolateViridis', // 34
  'interpolateMagma', // 35
  'interpolateInferno', // 36
  'interpolatePlasma', // 37
]

// eslint-disable-next-line no-unused-vars
const dimensions = {
  valueField: 'bachelorsOrHigher',
  fipsField: 'fips',
  countyNameField: 'area_name',
  stateField: 'state',
}

// eslint-disable-next-line no-unused-vars
const options = {
  colorLegendTitle: 'Higher education rate',
  interpolateScheme: inbuiltSchemeOptions[7], // see numbers in inbuiltSchemeOptions above for options

  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,

  bgColor: 'transparent', // try white, gray, black, #333

  heading: 'This is a heading for the chart',
  subheading: 'This is a subheading for the chart describing it in more detail',
}
