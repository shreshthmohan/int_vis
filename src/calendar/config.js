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

// eslint-disable-next-line no-unused-vars
const options = {
  heading: '{{ heading }}',
  subheading: '{{ subheading }}',
  aspectRatio: 0.8,
  inbuiltScheme: inbuiltSchemeOptions[7],
  marginTop: 40,
  marginRight: 20,
  marginBottom: 20,
  marginLeft: 20,
  bgColor: '#eee',
  descending: true,
  colorLegendTitle: 'Palmer Drought Severity Index',
}

// eslint-disable-next-line no-unused-vars
const dimensions = {
  xGridField: 'year_in_decade',
  yGridField: 'decade',
  xField: 'month',
  nameField: 'year',
  // barFields? stackField
  yFields: ['0', '1', '2', '3', '4', '5', '6'],
}
