#### Chart Description
* This chart is used to visualize swing in data corresponding to an entity over a period of time.
* Each domino is an entity. Horizontal axis is the metric along which swing is to be visualized. Vertical axis is the time period.

#### Chart Dimensions
* There are 5 available dimensions:
  * domino:
    * Mapping - Entity whose swing is to be visualized
    * Type - Categorical
  * x-axis: 
    * Mapping - Metric across which swing is measured
    * Type - Numeric
  * y-axis: 
    * Mapping - Time period. 
    * Type - Categorical
  * size:
    * Mapping - Metric denoting the size of domino in that time period
    * Type - Numeric
  * color:
    * Mapping - Secondary metric capturing some other information. x-axis can be used as default.
    * Type - Numeric
* It is recommended that color & x-axis should be mapped to the same metric/column for better readability.

# Example use-case
* We can visualize the frustration of customer calls from each state over a period of time.
* Each domino is a state. The horizontal axis is call frustration rate. The vertical axis is quarter of the year.
* As we move up along quarters, each domino swings horizontally along the frustration index.
* The size of each domino is the call volume from that state. Color here is the frustration index. But other columns like unemployment rate can be used for color dimension.

# Data structure
* Data is unique on domino & y-axis dimensions i.e. one row per combination of domino & y-axis.

# To-dos
- [ ] Get datasets 
- [x] Make x-axis as default color field in the absence of color field
