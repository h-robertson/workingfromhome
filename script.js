// ----------------------------------
// ------ Density chart ---------
// ----------------------------------


// Change analysis text on dropdown selection 
function showAnalysis() {
    console.log(document.getElementById("densitySelect").value);
    if (document.getElementById("densitySelect").value == "Working") {
        document.getElementById("analysisText").innerHTML = "<b>Most non-remote workers spend a routine 6 - 10 hours of their day working, while the schedules of remote workers are far more variable.</b>";
    } else if (document.getElementById("densitySelect").value == "Doing housework") {
        document.getElementById("analysisText").innerHTML = "<b>Neither remote nor non-remote workers spend a lot of time doing housework in the normal workday. But a small amount of those working remotely do up to 2.5 hours of housework.</b>";
    } else if (document.getElementById("densitySelect").value == "Travelling") {
        document.getElementById("analysisText").innerHTML = "<b>Most non-remote workers spend around a hour travelling, but a lot of remote workers don’t travel at all during their workday.</b>";
    } else if (document.getElementById("densitySelect").value == "Exercising") {
        document.getElementById("analysisText").innerHTML = "<b>Not many workers - remote or non-remote - find time to exercise during their workday. Some fit in up to 20 minutes of exercise, and a small proportion exercise for longer.</b>";
    } else if (document.getElementById("densitySelect").value == "Eating & Drinking") {
        document.getElementById("analysisText").innerHTML = "<b>Remote workers - who generally have more flexible working hours - find more time to eat and drink than non-remote workers.</b>";
    } else if (document.getElementById("densitySelect").value == "Socialising & relaxing") {
        document.getElementById("analysisText").innerHTML = "<b>Most workers get around four or five hours of leisure time, but some remote workers spend as much as thirteen hours socialising and relaxing.</b>";
    } else if (document.getElementById("densitySelect").value == "Sleeping") {
        document.getElementById("analysisText").innerHTML = "<b>Remote workers get 20 minutes more sleep a night, on average, than non-remote workers.</b>";
    }
}

// set the dimensions and margins of the graph
var margin = {
        top: 30,
        right: 30,
        bottom: 50,
        left: 90
    },
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg 
var densitySVG = d3.select("#densityChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv('density.csv', function (data) {

    // List of activities
    var allGroup = d3.map(data, function (d) {
        return (d.newAct)
    }).keys();

    // add options to the density button
    d3.select("#densitySelect")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        });

    selectElement('densitySelect', 'Working')

    function selectElement(id, valueToSelect) {
        let element = document.getElementById(id);
        element.value = valueToSelect;
    }

    // add the x Axis
    var xMax = 1440;
    var x = d3.scaleLinear()
        .domain([0, xMax])
        .range([0, width]);

    var xAxis = d3.axisBottom(x);

    densitySVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "x-axis")
        .call(xAxis);

    // add the y Axis
    var yMax = 0.005;
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yMax]);
    var yAxis = d3.axisLeft(y)

    densitySVG.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    // Compute kernel density estimation
    var kde = kernelDensityEstimator(kernelEpanechnikov(14), x.ticks(12))
    var density1 = kde(data
        .filter(function (d) {
            return (d.remote === "Remote" & d.newAct === "Working")
        })
        .map(function (d) {
            return d.TUACTDUR24;
        }))
    var density2 = kde(data
        .filter(function (d) {
            return (d.remote === "Non-remote" & d.newAct === "Working")
        })
        .map(function (d) {
            return d.TUACTDUR24;
        }))

    // Plot non-remote area
    var nremdensity = densitySVG.append("path")
        .attr("class", "mypath2")
        .datum(density2)
        .attr("fill", "#4f8c9d")
        .attr("opacity", ".6")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.area()
            .curve(d3.curveBasis)
            .x(function (d) {
                return x(d[0]);
            })
            .y1(function (d) {
                return y(d[1]);
            })
            .y0(y(0))
        )
        .on("mouseover", function (d) {
            d3.select(this)
                .attr('opacity', 0.8);
            remdensity
                .attr('opacity', 0.2);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .attr('opacity', 0.6);
            remdensity
                .attr('opacity', 0.6);
        })

    // Plot remote area
    var remdensity = densitySVG.append("path")
        .attr("class", "mypath")
        .datum(density1)
        .attr("fill", "#a73358")
        .attr("opacity", 0.6)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.area()
            .curve(d3.curveBasis)
            .x(function (d) {
                return x(d[0]);
            })
            .y1(function (d) {
                return y(d[1]);
            })
            .y0(y(0))
        )
        .on("mouseover", function (d) {
            d3.select(this)
                .attr('opacity', 0.7);
            nremdensity
                .attr('opacity', 0.3);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .attr('opacity', 0.6);
            nremdensity
                .attr('opacity', 0.6);
        })

    // Dictionary of scale domains for different activities
    var scaleDict = {
        x: {
            'Working': 1200,
            'Eating & Drinking': 500,
            'Doing housework': 200,
            'Sleeping': 1200,
            'Socialising & relaxing': 1200,
            'Travelling': 600,
            'Exercising': 200
        },
        y: {
            'Working': 0.005,
            'Eating & Drinking': 0.01,
            'Doing housework': 0.05,
            'Sleeping': 0.005,
            'Socialising & relaxing': 0.005,
            'Travelling': 0.016,
            'Exercising': 0.045
        }
    };

    // Update chart function (adjust scales, re-call axes, transition density plot areas, change analysis text)
    function updateChart(selectedGroup) {

        yMax = scaleDict.y[selectedGroup]
        y.domain([0, yMax]);

        var axisY = d3.select("#y-axis")

        axisY.transition()
            .duration(800)
            .call(yAxis);

        xMax = scaleDict.x[selectedGroup]
        x.domain([0, scaleDict.x[selectedGroup]]);

        var axisX = d3.selectAll('#x-axis')

        axisX.transition()
            .duration(800)
            .call(xAxis);

        // recompute density estimation
        kde = kernelDensityEstimator(kernelEpanechnikov(14), x.ticks(12))

        var remote = kde(data
            .filter(function (d) {
                return (d.remote == "Remote" & d.newAct == selectedGroup)
            })
            .map(function (d) {
                return d.TUACTDUR24;
            })
        )
        var nremote = kde(data
            .filter(function (d) {
                return (d.remote == "Non-remote" & d.newAct == selectedGroup)
            })
            .map(function (d) {
                return d.TUACTDUR24;
            })
        )

        nremdensity
            .datum(nremote)
            .transition()
            .duration(1000)
            .attr("d", d3.area()
                .curve(d3.curveBasis)
                .x(function (d) {
                    return x(d[0]);
                })
                .y1(function (d) {
                    return y(d[1]);
                })
                .y0(y(0))
            );

        remdensity
            .datum(remote)
            .transition()
            .duration(1000)
            .attr("d", d3.area()
                .curve(d3.curveBasis)
                .x(function (d) {
                    return x(d[0]);
                })
                .y1(function (d) {
                    return y(d[1]);
                })
                .y0(y(0))
            );
        showAnalysis()
    }

    // Listen to the dropdown changes
    d3.select("#densitySelect").on("change", function (d) {
        selectedGroup = this.value;
        updateChart(selectedGroup);
    })

});

//Legend
densitySVG.append("circle").attr("cx", 450).attr("cy", 30).attr("r", 6).style("fill", "#a73358")
densitySVG.append("circle").attr("cx", 450).attr("cy", 60).attr("r", 6).style("fill", "#4f8c9d")
densitySVG.append("text").attr("x", 470).attr("y", 30).text("Remote workers").style("font-size", "15px").attr("alignment-baseline", "middle")
densitySVG.append("text").attr("x", 470).attr("y", 60).text("Non-remote workers").style("font-size", "15px").attr("alignment-baseline", "middle")

// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3.mean(V, function (v) {
                return kernel(x - v);
            })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}


// ----------------------------------
// ------ Stacked bar chart ---------
// ----------------------------------

// add the options to the bar buttons
d3.select("#barSelectSex")
    .selectAll('myOptions')
    .data(['female', 'male'])
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    }) // text showed in the menu
    .attr("value", function (d) {
        return d;
    });

d3.select("#barSelectAge")
    .selectAll('myOptions')
    .data(['18 to 34', '35 to 54', '55+'])
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    }) // text showed in the menu
    .attr("value", function (d) {
        return d;
    });

d3.select("#barSelectChild")
    .selectAll('myOptions')
    .data(['does not have', 'has'])
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    }) // text showed in the menu
    .attr("value", function (d) {
        return d;
    });

// Set svg size
var widthBar = 1150 - margin.left - margin.right;
var heightBar = 500 - margin.top - margin.bottom;

// append svg & set margins 
var barSVG = d3.select("#barChart")
    .append("svg")
    .attr("width", widthBar + margin.left + margin.right)
    .attr("height", heightBar + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("barChartData.csv", function (data) {

    // List activities
    var subgroups = data.columns.slice(4)

    // List of 'groups' (remote and non-remote)
    var groups = d3.map(data, function (d) {
        return (d.remote)
    }).keys();

    // Add X axis
    var yBar = d3.scaleBand()
        .domain(groups)
        .range([heightBar, 0])
        .padding([0.2])


    // Add Y axis
    var xBar = d3.scaleLinear()
        .domain([0, 1440])
        .range([0, widthBar - 250]);
    barSVG.append("g")
        .call(d3.axisBottom(xBar))
        .attr("transform", "translate(0," + height + ")")

    // color palette
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#adc16d", "#1c5b5a", "#7fd6c5", "#a73358", "#4f8c9d", "#c77856", "#a4badd", "#49406e"])

    // Filter data for initial selection
    var start = data.filter(function (d) {
        return (d.sex == 'female' & d.ageband == "18 to 34" & d.children == "does not have")
    })


    // Normalize the data -> sum of each group = 1440 (minutes in the day, in case of rounding issues to maintain uniformity)
    start.forEach(function (d) {
        // Compute the total
        tot = 0
        for (i in subgroups) {
            name = subgroups[i];
            tot += +d[name]
        }

        for (i in subgroups) {
            name = subgroups[i];
            d[name] = d[name] / tot * 1440
        }
    })


    //stack remote & non-remote groups
    var stackedData = d3.stack()
        .keys(subgroups)
        (start)

    // Tooltip functions
    var mouseover = function (d) {
        tooltip.style("display", null);
    };

    var mouseout = function () {
        tooltip.style("display", "none");
    };

    var mousemove = function (d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        tooltip
            .select("text").text((subgroupName + ": " + Math.round(subgroupValue) + " minutes"))
            .style("opacity", 1);
        var xPosition = d3.mouse(this)[0] - 5;
        var yPosition = d3.mouse(this)[1] - 5;
        tooltip.
        attr("transform", "translate(" + xPosition + "," + yPosition + ")");
    };

    // Show the bars
    var barGroup = barSVG.append("g")
        .attr("class", "barGroup")

    var bars = barGroup
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("class", "barPair")
        .attr("fill", function (d) {
            return color(d.key);
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("y", function (d) {
            return yBar(d.data.remote);
        })
        .attr("x", function (d) {
            return xBar(d[0]);
        })
        .style("opacity", 1)
        .attr("width", function (d) {
            return xBar(d[1]) - xBar(d[0]);
        })
        .attr("height", yBar.bandwidth())
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);

    // Re-call y-axis to lay over bars
    var yAxisBar = barSVG.append("g")
        .call(d3.axisLeft(yBar).tickSizeOuter(0));

    // Add tooltips
    var tooltip = barSVG.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("x", 30)
        .attr("width", 275)
        .attr("height", 25)
        .attr("fill", "white")
        .style("opacity", 0.8);

    tooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .attr("font-size", "1em")
        .attr("font-weight", "bold")
        .attr("class", "tooltip")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")

    // Add legend
    var barLegend = barSVG.append('g')
        .attr('class', 'legend')

    var activities = data.columns.slice(4)
    var colors = ["#adc16d", "#1c5b5a", "#7fd6c5", "#a73358", "#4f8c9d", "#c77856", "#a4badd", "#49406e"]

    barLegend.selectAll('rect')
        .data(activities)
        .enter()
        .append('rect')
        .attr('x', 830)
        .attr('y', function (d, i) {
            return 90 + i * 30;
        })
        .attr('width', 30)
        .attr('height', 20)
        .attr('fill', function (d, i) {
            return colors[i];
        });

    barLegend.selectAll('text')
        .data(activities)
        .enter()
        .append('text')
        .text(function (d) {
            return d;
        })
        .attr('x', 880)
        .attr('y', function (d, i) {
            return 93 + i * 30;
        })
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'hanging');


    // Update chart (filter data on selection changes)
    function updateBarChart(selectedSex, selectedAge, selectedChild) {

        var newData = data.filter(function (d) {
            return (d.sex == selectedSex & d.ageband == selectedAge & d.children == selectedChild);
        });

        // Re-normalize the data
        console.log(newData)
        newData.forEach(function (d) {
            tot = 0
            for (i in subgroups) {
                name = subgroups[i];
                tot += +d[name]
            }
            for (i in subgroups) {
                name = subgroups[i];
                d[name] = d[name] / tot * 1440
            }
        })

        //Re-stack per subgroup
        stackedData = d3.stack()
            .keys(subgroups)
            (newData)

        //Re-show the bars
        console.log(bars)
        var barPairs = d3.selectAll('.barPair')
        barPairs.remove();
        bars = barGroup
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("class", "barPair")
            .attr("fill", function (d) {
                return color(d.key);
            })

        var barRects = bars
            .selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("y", function (d) {
                return yBar(d.data.remote);
            })

            .attr("height", yBar.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove)
            .transition()
            .ease(d3.easeCubic)
            .duration(1500)
            .attr("width", function (d) {
                return xBar(d[1]) - xBar(d[0]);
            })
            .attr("x", function (d) {
                return xBar(d[0]);
            })

        // Re-call y axis to lay over bars
        yAxisBar.remove()
        yAxisBar = barSVG.append("g")
            .call(d3.axisLeft(yBar).tickSizeOuter(0));
    }

    // Listen to the dropdowns
    var sexValue = d3.select('#barSelectSex').node().value;
    var ageValue = d3.select('#barSelectAge').node().value;
    var childValue = d3.select('#barSelectChild').node().value;

    const getValues = function () {
        sexValue = d3.select('#barSelectSex').node().value;
        ageValue = d3.select('#barSelectAge').node().value;
        childValue = d3.select('#barSelectChild').node().value;
    }

    d3.select("#barSelectSex").on("change", function (d) {
        getValues()
        selectedSex = this.value;
        updateBarChart(selectedSex, ageValue, childValue);
    });

    d3.select("#barSelectAge").on("change", function (d) {
        getValues()
        selectedAge = this.value;
        updateBarChart(sexValue, selectedAge, childValue);
    })

    d3.select("#barSelectChild").on("change", function (d) {
        getValues()
        selectedChild = this.value;
        updateBarChart(sexValue, ageValue, selectedChild);
    })
})