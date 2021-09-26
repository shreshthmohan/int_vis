// Dimension Mapping
// eslint-disable-next-line no-unused-vars
const dimensions = {
  seriesField: 'chart_desc',
  xField: 'date',
  yField: 'readers',
  colorField: 'group',
}

// Chart Options
// eslint-disable-next-line no-unused-vars
const options = {
  // headers
  heading:
    'Ridgline is used to compare relative distribution of a metric across various topics.',
  subheading:
    'Below chart shows readership (in hours) across relevant news articles',

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
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,

  // background-color
  // bgColor: 'transparent',
  bgColor: '#fafafa',

  overlap: 7,
}
