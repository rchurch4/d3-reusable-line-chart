// Fully Modular Graph Function for Multi-Field Data
//   Supports changing fields that have already been loaded
//     as well as loading new data given a URL
//   Date must be the first field. Easily changeable if you understand d3
//
// This module was written in d3 v3, not v4.


function createChart(margin, width, height, url, div, fields) {
    var chart = d3.select(div).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ')');

    var yScale = d3.scale.linear()
        .range([height, 0]);
    var xScale = d3.time.scale()
        .range([0, width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        // .innerTickSize(-height)
        .orient('bottom')
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .innerTickSize(-width)
        .orient('left')
    var line = d3.svg.line()
        .x(function(d) { return xScale(moment(d.date).utc()); })
        .y(function(d) { return yScale(d[current_field]); });
    var div = d3.select(div).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var decimalFormat = d3.format("0.2f");

    var dataset;
    var current_field = fields[1];
    var dateInterval;
    var formattedDateInterval = function(dateInterval) {
        return dateInterval[0].format('MMMM Do, YYYY') + ' to ' + dateInterval[1].format('MMMM Do, YYYY');
    };

    function formatLabel(string) {
        function toTitleCase(str)
        {
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }
        string = string.replace(/_/g, ' ')
        string = toTitleCase(string)
        return string
    }

    function loadFromDB(data_url) {
        d3.json(data_url, function(error, data_points) {
            data_points = JSON.parse(data_points)
            dataset = data_points
            dateInterval = d3.extent(data_points, function(d) { return moment(d.date).utc(); })
            xScale.domain(dateInterval);
            yScale.domain( [0, d3.max(data_points, function(d) { return d[current_field]; }) + 1] );

            chart.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                // .style('fill', 'red');
            chart.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                // .style('fill', 'red');
            chart.selectAll('.x.axis text')
                .attr("transform", function(d) {
                    return "translate(" + this.getBBox().height*-2 + ',' + this.getBBox().height + ")rotate(-45)";
                });

            chart.append('text')
                .attr('class', 'labely')
                .attr('text-anchor', 'middle')
                .attr("transform", "translate("+ (0 - margin.left/2) +","+(height/2)+")rotate(-90)")
                .text(formatLabel(current_field));

            chart.append('text')
                .attr('class', 'labelx')
                .attr('text-anchor', 'middle')
                .attr("transform", "translate("+ (width/2) +","+(height + margin.top*2.5)+")")
                .text(formatLabel(fields[0]))

            chart.append('text')
                .attr('class', 'title')
                .attr('text-anchor', 'middle')
                .attr("transform", "translate("+ (width/2) +","+(-5)+")")
                .text(formatLabel(current_field + ' from ' +  formattedDateInterval(dateInterval)))

            chart.append("path")
                .data(data_points)
                .attr("class", "line")
                .attr("d", line(data_points));

            chart.selectAll(".dot")
                .data(data_points)
              .enter().append("circle")
                .attr('class', 'dot')
                .attr("r", 4)
                .attr("cx", function(d) { return xScale(moment(d.date).utc()); })
                .attr("cy", function(d) { return yScale(d[current_field]); })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div .html((moment(d.date).utc().format('MMM Do')) + "<hr class='hrtooltip'> Total: "  + d[current_field] )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            if (dataset.length > 1) {
                chart.addTrendLine();
            } else {
                chart.removeTrendLine();
            }
        });
    }

    chart.updateFromDB = function (data_url) {
        d3.json(data_url, function(error, data_points) {
            data_points = JSON.parse(data_points);
            dataset = data_points;
            dateInterval = d3.extent(data_points, function(d) { return moment(d.date).utc(); });
            xScale.domain(dateInterval);
            yScale.domain( [0, d3.max(data_points, function(d) { return d[current_field]; }) + 1] );

            chart.select("path.line")
                .transition()
                .duration(750)
                .attr("d", line(data_points));
            chart.select(".x.axis")
                .transition()
                .duration(750)
                .call(xAxis)
            chart.selectAll('.x.axis text')
                .attr("transform", function(d) {
                    return "translate(" + this.getBBox().height*-2 + ',' + this.getBBox().height + ")rotate(-45)";
                });
            chart.select(".y.axis")
                .transition()
                .duration(750)
                .call(yAxis)

            chart.select('text.labely')
                .text(formatLabel(current_field));

            chart.append('text.labelx')
                .text(formatLabel(fields[0]))

            chart.select('text.title')
                .text(formatLabel(current_field + ' from ' +  formattedDateInterval(dateInterval)))

            var circles = chart.selectAll(".dot").data(dataset, function(d) {return moment(d.date).utc(); });
            circles.enter().append("circle")
                .attr('class', 'dot')
                .attr("r", 4)
                .attr("cx", function(d) { return xScale(moment(d.date).utc()); })
                .attr("cy", function(d) { return yScale(d[current_field]); })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div .html((moment(d.date).utc().format('MMM Do')) + "<hr class='hrtooltip'> Total: "  + d[current_field] )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            circles
                .transition()
                .duration(750)
                .attr('cy', function(d) { return yScale(d[current_field]); })
                .attr('cx', function(d) { return xScale(moment(d.date).utc()); })

            circles.exit()
                .remove();

            if (dataset.length > 1) {
                chart.addTrendLine();
            } else {
                chart.removeTrendLine();
            }
        });
    }

    chart.updateFromLocal = function (index) {
        current_field = fields[index];
        yScale.domain( [0, d3.max(dataset, function(d) { return d[current_field]; }) + 1] );
        chart.select("path.line")
            .transition()
            .duration(750)
            .attr('d', line(dataset))
        chart.select(".y.axis")
            .transition()
            .duration(750)
            .call(yAxis)
        chart.select('text.labely')
            .text(formatLabel(current_field));
        chart.select('.title')
            .text(formatLabel(current_field + ' from ' +  formattedDateInterval(dateInterval)));

        chart.selectAll(".dot")
            .data(dataset, function(d) {return moment(d.date).utc(); })
            .transition()
            .duration(750)
            .attr('cy', function(d) { return yScale(d[current_field]); })

        if (dataset.length > 1) {
            chart.addTrendLine();
        } else {
            chart.removeTrendLine();
        }
    }

    chart.getCurrentField = function() {
        return current_field;
    }

    chart.addTrendLine = function() {
        var xSeries = d3.range(1, dataset.length+1);
        var ySeries = dataset.map(function(d) { return parseFloat(d[current_field])})

        var leastSquaresCoeff = leastSquares(xSeries, ySeries)

        var x1 = dataset[0]['date']
        var x2 = dataset[dataset.length -1]['date']
        var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
        var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];

        var trendData = [[x1, y1, x2, y2]]

        var trendLine = chart.selectAll('.trendline')
            .data(trendData)

        trendLine.enter()
            .append('line')
            .attr('class', 'trendline')
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        trendLine
            .transition()
            .duration(750)
            .attr('x1', function(d) { return xScale(moment(d[0]).utc()); })
            .attr("y1", function(d) { return yScale(d[1]); })
            .attr("x2", function(d) { return xScale(moment(d[2]).utc()); })
            .attr("y2", function(d) { return yScale(d[3]); })

        //label
        var equation = chart.selectAll('.text-label-eq')
            .data([1])

        equation.enter()
            .append('text')
            .attr("class", "text-label-eq")

        equation
            .transition()
            .duration(750)
            .text("eq: " + decimalFormat(leastSquaresCoeff[0]) + "x + " +
                decimalFormat(leastSquaresCoeff[1]))
            .attr("x", function(d) {return xScale(moment(x2).utc()) - 90;})
            .attr("y", function(d) {return yScale(y2) - 50;});

        var r = chart.selectAll('text.text-label-r')
            .data([1])

        r.enter()
            .append("text")
            .attr("class", "text-label-r")

        r
            .transition()
            .duration(750)
            .text("r-sq: " + decimalFormat(leastSquaresCoeff[2]))
            .attr("x", function(d) {return xScale(moment(x2).utc()) - 90;})
            .attr("y", function(d) {return yScale(y2) - 30;});
    }

    chart.removeTrendLine = function() {
        var trendLine = chart.selectAll('.trendline')
            .data([])
        trendLine.exit().remove();

        var equation = chart.selectAll('.text-label-eq')
            .data([])
        equation.exit().remove();

        var r = chart.selectAll('text.text-label-r')
            .data([])
        r.exit().remove();
    }

    // returns slope, intercept and r-square of the line
    function leastSquares(xSeries, ySeries) {
        var reduceSumFunc = function(prev, cur) { return prev + cur; };

        var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
        var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

        var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
            .reduce(reduceSumFunc);

        var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
            .reduce(reduceSumFunc);

        var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
            .reduce(reduceSumFunc);

        var slope = ssXY / ssXX;
        var intercept = yBar - (xBar * slope);
        var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return [slope, intercept, rSquare];
    }

    loadFromDB(url);
    return chart;
}
// Fully Modular Graph Function for Multi-Field Data
//   Supports changing fields that have already been loaded
//     as well as loading new data given a URL
//   Date must be the first field. Easily changeable if you understand d3
//
// This module was written in d3 v3, not v4.


function createChart(margin, width, height, url, div, fields) {
    var chart = d3.select(div).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ')');

    var yScale = d3.scale.linear()
        .range([height, 0]);
    var xScale = d3.time.scale()
        .range([0, width]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        // .innerTickSize(-height)
        .orient('bottom')
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .innerTickSize(-width)
        .orient('left')
    var line = d3.svg.line()
        .x(function(d) { return xScale(moment(d.date).utc()); })
        .y(function(d) { return yScale(d[current_field]); });
    var div = d3.select(div).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var dataset;
    var current_field = fields[1];
    var dateInterval;
    var formattedDateInterval = function(dateInterval) {
        return dateInterval[0].format('MMMM Do, YYYY') + ' to ' + dateInterval[1].format('MMMM Do, YYYY');
    };

    function formatLabel(string) {
        function toTitleCase(str)
        {
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }
        string = string.replace(/_/g, ' ')
        string = toTitleCase(string)
        return string
    }

    function loadFromDB(data_url) {
        d3.json(data_url, function(error, data_points) {
            data_points = JSON.parse(data_points)
            dataset = data_points
            dateInterval = d3.extent(data_points, function(d) { return moment(d.date).utc(); })
            xScale.domain(dateInterval);
            yScale.domain( [0, d3.max(data_points, function(d) { return d[current_field]; }) + 1] );

            chart.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                // .style('fill', 'red');
            chart.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                // .style('fill', 'red');
            chart.selectAll('.x.axis text')
                .attr("transform", function(d) {
                    return "translate(" + this.getBBox().height*-2 + ',' + this.getBBox().height + ")rotate(-45)";
                });

            chart.append('text')
                .attr('class', 'labely')
                .attr('text-anchor', 'middle')
                .attr("transform", "translate("+ (0 - margin.left/2) +","+(height/2)+")rotate(-90)")
                .text(formatLabel(current_field));

            chart.append('text')
                .attr('class', 'labelx')
                .attr('text-anchor', 'middle')
                .attr("transform", "translate("+ (width/2) +","+(height + margin.top*2.5)+")")
                .text(formatLabel(fields[0]))

            chart.append('text')
                .attr('class', 'title')
                .attr('text-anchor', 'middle')
                .attr("transform", "translate("+ (width/2) +","+(-5)+")")
                .text(formatLabel(current_field + ' from ' +  formattedDateInterval(dateInterval)))

            chart.append("path")
                .data(data_points)
                .attr("class", "line")
                .attr("d", line(data_points));

            chart.selectAll(".dot")
                .data(data_points)
              .enter().append("circle")
                .attr('class', 'dot')
                .attr("r", 4)
                .attr("cx", function(d) { return xScale(moment(d.date).utc()); })
                .attr("cy", function(d) { return yScale(d[current_field]); })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div .html((moment(d.date).utc().format('MMM Do')) + "<hr class='hrtooltip'> Total: "  + d[current_field] )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
    }

    chart.updateFromDB = function (data_url) {
        d3.json(data_url, function(error, data_points) {
            data_points = JSON.parse(data_points);
            dataset = data_points;
            dateInterval = d3.extent(data_points, function(d) { return moment(d.date).utc(); });
            xScale.domain(dateInterval);
            yScale.domain( [0, d3.max(data_points, function(d) { return d[current_field]; }) + 1] );

            chart.select("path.line")
                .transition()
                .duration(750)
                .attr("d", line(data_points));
            chart.select(".x.axis")
                .transition()
                .duration(750)
                .call(xAxis)
            chart.selectAll('.x.axis text')
                .attr("transform", function(d) {
                    return "translate(" + this.getBBox().height*-2 + ',' + this.getBBox().height + ")rotate(-45)";
                });
            chart.select(".y.axis")
                .transition()
                .duration(750)
                .call(yAxis)

            chart.select('text.labely')
                .text(formatLabel(current_field));

            chart.append('text.labelx')
                .text(formatLabel(fields[0]))

            chart.select('text.title')
                .text(formatLabel(current_field + ' from ' +  formattedDateInterval(dateInterval)))

            var circles = chart.selectAll(".dot").data(dataset, function(d) {return moment(d.date).utc(); });
            circles.enter().append("circle")
                .attr('class', 'dot')
                .attr("r", 4)
                .attr("cx", function(d) { return xScale(moment(d.date).utc()); })
                .attr("cy", function(d) { return yScale(d[current_field]); })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div .html((moment(d.date).utc().format('MMM Do')) + "<hr class='hrtooltip'> Total: "  + d[current_field] )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            circles
                .transition()
                .duration(750)
                .attr('cy', function(d) { return yScale(d[current_field]); })
                .attr('cx', function(d) { return xScale(moment(d.date).utc()); })

            circles.exit()
                .remove();

        });
    }

    chart.updateFromLocal = function (index) {
        current_field = fields[index];
        yScale.domain( [0, d3.max(dataset, function(d) { return d[current_field]; }) + 1] );
        chart.select("path.line")
            .transition()
            .duration(750)
            .attr('d', line(dataset))
        chart.select(".y.axis")
            .transition()
            .duration(750)
            .call(yAxis)
        chart.select('text.labely')
            .text(formatLabel(current_field));
        chart.select('.title')
            .text(formatLabel(current_field + ' from ' +  formattedDateInterval(dateInterval)));

        chart.selectAll(".dot")
            .data(dataset, function(d) {return moment(d.date).utc(); })
            .transition()
            .duration(750)
            .attr('cy', function(d) { return yScale(d[current_field]); })
    }

    chart.getCurrentField = function() {
        return current_field;
    }

    loadFromDB(url);
    return chart;
}
