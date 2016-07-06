D3 Reusable Line Chart
=======================

This implementation uses d3 v3. Upgrade to v4 to come.

The D3 Reusable Line Chart was created while at Spotfund to display time series information about Key Performance Indicators.

It can take any type of data in a time series, so long as the first column is the date.

The chart loads data from a JSON API, but can easily be modified to load data from any source.

##How to Use the Chart
=======================

```javascript
margin = {top: 30, right: 30, bottom: 100, left: 80}
width = 960
height = 540
url = 'https://www.example.com/api/'
div = 'div.container'
fields = ['date', 'y1', 'y2', ..., 'yN']

// load initial data
chart = createChart(margin, width, height, url, div, fields)

// change field from y1 to yI
chart.updateFromLocal(i)

url = 'https://www.example.com/api2/'
// load new data from API
chart.updateFromDB(url)

##Bells and Whistles
=======================

- `tooltips` - each data point displays a tooltip on mouseover
- `quick-changing fields` - change displayed data without reloading data from a new file
- `dynamic y-axis label and title` - y-axis and chart title change on data change
