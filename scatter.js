// to do
// FIX DATE
// fix resizing and positioning of buttons
// add to git
// deal with different margins(make top and right smaller)
// get width of body in a function
// on body.resize, redraw everything

// set global variables
// const width = 1000;
const height = 700;
const margin = 150;
const topMargin = margin / 8;
const rightMargin = margin / 10;
const buttonSize = 215;
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
let xAxisTicks = 5;
let yAxisTicks = 10;

// initialize state and dates
let currentState = "Illinois";
let cutoffDate = new Date(2020, 0, 1, 0, 0, 0, 0);
let earliestDate;

//https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv
//../covid-19-data/us-states.csv

function runApp() {
    d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", function (d) {
        return {
            date: d3.timeParse("%Y-%m-%d")(d.date),
            deaths: parseInt(d.deaths),
            state: d.state,
        };
    }).then(function (data) {
        makeScatter(data);
    });
}

runApp();


function makeScatter(data) {


    var width = parseInt(d3.select('body').style('width'), 10);
    width = width - buttonSize;

    // first make svg
    var svg = d3
        .select("#scatter-div")
        .append("svg")
        .attr("height", height)
        .attr("width", width);

    newData = cleanData(data, currentState);
    earliestDate = newData[0].date;

    updateText();

    // create scales
    var xScale = d3
        .scaleTime()
        .domain(
            d3.extent(newData, (d) => {
                return d.date;
            })
        )
        .range([margin, width - margin]);

    var deathsMax = d3.max(newData, (d) => {
        return +d.deaths;
    });

    // margin / 8 is top margin
    var yScale = d3
        .scaleLinear()
        .domain([0, deathsMax])
        .range([height - margin, topMargin]);


    /////////////////////////
    // create and add axes //
    /////////////////////////

    var xAxis = d3
        .axisBottom()
        .scale(xScale)
        .tickPadding(15)
        .ticks(xAxisTicks)
        .tickSize(-(height - margin - topMargin));

    var yAxis = d3
        .axisLeft()
        .scale(yScale)
        .tickPadding(10)
        .ticks(yAxisTicks)
        .tickSize(-(width - 2 * margin));

    // add and format x-axis
    svg.append("g").attr("id", "x-axis")
        // move x axis to the bottom
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(xAxis)
        // rotate labels
        .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-45)")
        .style("text-anchor", "end");

    // add and format y-axis
    svg.append("g").attr("id", "y-axis")
        .attr("transform", "translate(" + margin + ",0)")
        .call(yAxis);

    // text label for the y axis
    svg.append("text")
        .attr("id", "scatter-y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", (margin / 2) - 25)
        .attr("x", 0 - ((height - margin - topMargin) / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of deaths");

    // svg.append("text")
    //     .attr("id", "scatter-x-axis-label")
    //     .attr("text-anchor", "end")
    //     .attr("x", (width / 2))
    //     .attr("y", height - (margin / 2))
    //     .attr("dy", "1em")
    //     .text("Date");

    ////////////////////////////
    // create and add plots  //
    ///////////////////////////

    // Define the div for the tooltip
    let tip = d3.select("#scatter-div").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

    var scatterPlot = svg.append("g").attr("id", "scatter-plot");

    scatterPlot.selectAll("circle")
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx", (d) => {
            return xScale(d.date);
        })
        .attr("cy", (d) => {
            return yScale(d.deaths);
        })
        .attr("r", 0)
        .attr("fill", "red")
        // add tool tip on mouseover
        .on("mouseover", (d) => {
            tip.transition()
                .duration(200)
                .style("opacity", 0.9);

            let formatDate = d.date.toString().split(" ");
            let finalDate = formatDate[0] + ", " +
                formatDate[1] + " " + formatDate[2];

            // tooltip message
            tip.html("<i>" + finalDate + "</i>" + "<br/>" +
                "<b>" + d.deaths + " total deaths" + "</b>")
                .style("left", xScale(d.date) + 5 + "px")
                .style("top", yScale(d.deaths) + 10 + "px");
        })
        .on("mouseout", (d) => {
            tip.transition()
                .duration(200)
                .style("opacity", 0);
        });

    // for animation
    scatterPlot.selectAll("circle")
        .transition()
        .ease(d3.easeExp)
        .duration(1000)
        .attr("r", 4)
        .delay((d, i) => { return i * 10; });


    // var lineChart = svg.append("g").attr("id", "line-chart");
    // lineChart
    //     .append("path")
    //     .datum(newData)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 4)
    //     .attr(
    //         "d",
    //         d3
    //             .line()
    //             .x(function (d) {
    //                 return xScale(d.date);
    //             })
    //             .y(function (d) {
    //                 return yScale(d.deaths);
    //             })
    //     );


    ////////////////////////////
    // create and add buttons //
    ////////////////////////////
    // find unique states
    let uniqueStates = [];
    let items = [];

    data.forEach((d, i) => {
        items[i] = d.state;
    });

    uniqueStates = items.filter((d, i, self) => {
        return self.indexOf(d) === i;
    })

    uniqueStates.sort(function (a, b) {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
    })

    let selectButton = d3
        .select("#scatter-div")
        .append("select")
        .attr("id", "select-button")
        .attr("class", "form-control");

    d3.select("#select-button")
        .selectAll('myOptions')
        .data(uniqueStates)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("id", function (d) { return d; })
        .attr("value", function (d) { return d; }); // corresponding value returned by the button

    // set default selection
    d3.select("#" + currentState)
        .attr("selected", "selected");

    // update based on new selection
    d3.select("#select-button")
        .on("change", (d) => {
            let selectedOption = d3.select("#select-button").property("value");
            console.log(selectedOption);
            update(selectedOption);
        });

    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////
    // update our scatter plot based on selected state or date //
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////


    function update(selectedState) {

        // update global variables, data, and text
        currentState = selectedState;
        var updatedData = cleanData(data, currentState);
        earliestDate = updatedData[0].date;
        updateText();

        // recalculate scales
        xScale.domain(
            d3.extent(updatedData, (d) => {
                return d.date;
            })
        );

        yScale.domain([0, d3.max(updatedData, (d) => {
            return +d.deaths;
        })]
        );

        xAxis.scale(xScale);
        yAxis.scale(yScale);


        // for exisiting data points that need to change position
        scatterPlot.selectAll("circle")
            .data(updatedData)
            .transition()
            .duration(1000)
            .attr("cx", (d) => {
                return xScale(d.date);
            })
            .attr("cy", (d) => {
                return yScale(d.deaths);
            })
            .delay((d, i) => { return i * 10; });;

        // for new data points
        scatterPlot.selectAll("circle")
            .data(updatedData)
            .enter()
            .append("circle")
            // add tool tip on mouseover
            .on("mouseover", (d) => {
                tip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                // let formattedDate = d.date.toISOString().substring(0, 10);
                let formatDate = d.date.toString().split(" ");
                let finalDate = formatDate[0] + ", " +
                    formatDate[1] + " " + formatDate[2];
                // tooltip message
                tip.html("<i>" + finalDate + "</i>" + "<br/>" + "<b>" +
                    d.deaths + " total deaths" + "</b>")
                    .style("left", xScale(d.date) + 5 + "px")
                    .style("top", yScale(d.deaths) + 10 + "px");
            })
            .on("mouseout", (d) => {
                tip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .attr("cx", (d) => {
                return xScale(d.date);
            })
            .attr("cy", (d) => {
                return yScale(0);
            })
            .attr("r", 0)
            .attr("fill", "red")
            .transition()
            .duration(1000)
            .attr("r", 4)
            .attr("cy", (d) => {
                return yScale(d.deaths);
            })
            .delay((d, i) => { return i * 10; });


        // for old data points
        scatterPlot.selectAll("circle")
            .data(updatedData)
            .exit()
            .transition()
            .duration(1000)
            .attr("r", 0)
            .attr("cy", (d) => {
                return yScale(0);
            })
            .remove()
            .delay((d, i) => { return i * 10; });;

        svg.select("#x-axis") // change the x axis
            .transition()
            .duration(1000)
            .call(xAxis)
            // rotate labels
            .selectAll("text")
            .attr("transform", "translate(-10,10)rotate(-45)")
            .style("text-anchor", "end");

        svg.select("#y-axis") // change the y axis
            .transition()
            .duration(1000)
            .call(yAxis);
    }
}

// filter data by selected state and cutoff date
// returns newData
function cleanData(data, state) {
    // uses original data
    let returnData = data.filter(function (d) {
        return d.state === state;
    });

    returnData = returnData.filter(function (d) {
        return d.date >= cutoffDate;
    });

    return returnData;
}


// update text 
function updateText() {
    const scatterText = document.getElementById("scatter-text");
    scatterText.innerText = `COVID-19 deaths in ${currentState} since ${monthNames[earliestDate.getMonth()]} ${earliestDate.getDate()}`;
}


