// eslint-disable-next-line no-unused-vars
const dimensions = {
  xField: 'year',

  yFields: ['series1', 'series1a', 'series2'], // lines will be in the foreground (rendered in order as in the array)
  yBandFields: [
    ['series1min', 'series1max'],
    ['series1amin', 'series1amax'],
  ], // bands will be in the background
}

// eslint-disable-next-line no-unused-vars
const options = {
  heading: 'Global area burned',
  subheading:
    'The total area burned per year has fallen steadily. Rural development has made fires less pervasive in poor countries',

  aspectRatio: 2,

  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,

  bgColor: 'transparent',

  xAxisLabel: 'Year',
  yAxisLabel: 'Area burned, thousand km²',

  // TODO: line and band color customization
  // Also, yLineColors.length should match yFieldsLength (similarly for yBandColors)

  yLineColors: ['#878770', '#ed3833', '#f29474'],
  yBandColors: ['#d0d1c3', '#f9d6c6'],
  highlightRanges: [
    ['1880', '2019'],
    // ['2019', '2100'],
  ],
  highlightRangeColors: [
    '#46474512',
    // '#ff000012'
  ],
  // TODO: provide inbuilt color scheme
}
