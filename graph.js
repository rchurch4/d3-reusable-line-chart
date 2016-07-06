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
