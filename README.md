D3 Reusable Line Chart
=======================
This implementation uses d3 v3. Upgrade to v4 to come.

The D3 Reusable Line Chart was created while at [Spotfund](http://www.spotfund.com) to display time series information about Key Performance Indicators.

It can take any type of data in a time series, so long as the first column is the date.

The chart loads data from a JSON API, but can easily be modified to load data from any source.

##How to Use the Chart

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
```

##Bells and Whistles
The best part of the line chart, aside from its dynamic loading of data, is its less-noticeable features.  They make the graph look sharper.
- `tooltips` - each data point displays a tooltip on mouseover
- `quick-changing fields` - change displayed data without reloading data from a new file
- `dynamic y-axis label and title` - y-axis and chart title change on data change
- `trend line` - a trend line that can be turned off by calling `chart.removeTrendLine()`, and added back by calling `chart.addTrendLine()`.  Default is on.  The two functions enable you to easily make the trend line toggleable.

##Recommended Use
The line chart is best used with dropdown buttons to choose date ranges and fields that you want loaded.  The fields button would ideally call `chart.updateFromLocal(i)`, and the date ranges would call `chart.updateFromDB(url)`

The following margins are best suited for accomodating the titles and axis labels: `margin = {top: 30, right: 30, bottom: 100, left: 80}`
If you plan on placing your chart inside a container div, you can make it always fit inside of the div by setting `width` and `height` to:
```css
width = parseInt($('div.content.container').css('width'), 10) - margin.left - margin.right - 20,
height = parseInt($('div.content.container').css('width'), 10)*0.60 - margin.top - margin.bottom;
```

The CSS file includes basic styling, and can be easily changed to fit the look you want.
