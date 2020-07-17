// add toggle between cases and deaths
// add histogram of deaths per day
// add scatterplot with static axes of deaths per capita
// add scatterplot of rate of change
// add commas to tool tips
// add an about page
// add a footer with links to data
// add labels to the selection buttons
// add button to change isStateDataSelected
///// get dots back on top of the axis

// merge selections like so::
// var myData = ['A', 'B', 'C', 'D', 'E'];

// var u = d3.select('#content')
//   .selectAll('div')
//   .data(myData);

// u.enter()
//   .append('div')
//   .merge(u)
//   .text(function(d) {
//     return d;
//   });


/// add searching to selection boxes
/// remove duplicate county names
/// speed up finding unique counties

////////////////////////////////////
//    set  global variables       //
////////////////////////////////////
// constant global variables
// const width = 1000;
// const margin = 150;
let margin = { top: 150, right: 135, bottom: 150, left: 150 };
// for phone screens we want the right margin to be dynamic
margin["right"] = +getComputedStyle(document.body).getPropertyValue("--margin-right");
const navBarHeight = parseInt(d3.select("#navbarDiv").style("height"), 10);
const height = window.innerHeight - navBarHeight - margin.top - margin.bottom;
// const height = 800 - margin.top - margin.bottom;
const circleRadius = 4;
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
const yAxisTicks = 10;
const pathToDataByState = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv";
const pathToDataByCounty = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";

// global variables that may change
// let cutoffDate = new Date(2020, 0, 1, 0, 0, 0, 0);

let earliestDate;
// let width = parseInt(d3.select('body').style('width'), 10) - margin.right - margin.left;
let width = window.innerWidth - margin.right - margin.left;
// this reads the value set in :root in CSS
let xAxisTicks = +getComputedStyle(document.body).getPropertyValue("--x-axis-ticks");
let isStateDataSelected = true;
// initialize state/county
let currentStateOrCounty;
if (isStateDataSelected) { currentStateOrCounty = "Illinois"; }
else {  currentStateOrCounty = "Cook"; }


// svg initialization
let svg = d3.select("#scatterDiv")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.right + margin.left)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// define the div for the tooltip
let tip = d3.select("#scatterDiv")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

// define scatterplot
/* let scatterPlot = svg.append("g")
    .attr("id", "data-points"); */


////////////////////////////////////////
//  read in data and run application  //
////////////////////////////////////////
function runApp() {
    d3.csv(pathToDataByState, d => {
            return {
                date: d3.timeParse("%Y-%m-%d")(d.date),
                deaths: +d.deaths,
                cases: +d.cases,
                state: d.state
            };
        }).then(d => {
            addStateButton(d);
            console.log("Added state button")
        });
    
    // maybe change it so the if/then runs inside of the .then function
    // and initializeScatter is only called if it needs to

    // d3.csv(pathToDataByCounty, d => {
    //         return {
    //             date: d3.timeParse("%Y-%m-%d")(d.date),
    //             deaths: +d.deaths,
    //             cases: +d.cases,
    //             state: d.state,
    //             county: d.county
    //         };
    //     }).then(d => {
    //         addCountyButton(d);
    //         console.log("Added county button")
    //     });


    if (isStateDataSelected) {
        d3.csv(pathToDataByState, d => {
            return {
                date: d3.timeParse("%Y-%m-%d")(d.date),
                deaths: +d.deaths,
                cases: +d.cases,
                state: d.state
            };
        }).then(d => {
            initializeScatter(d);
        });
    }
    else {
        d3.csv(pathToDataByCounty, d => {
            return {
                date: d3.timeParse("%Y-%m-%d")(d.date),
                deaths: +d.deaths,
                cases: +d.cases,
                state: d.state,
                county: d.county
            };
        }).then(d => {
            initializeScatter(d);
        });
    }
}

runApp();



////////////////////////////////////////
//  initialize the scatter plot       //
////////////////////////////////////////
function initializeScatter(originalData) {

    cleanedData = filterData(originalData, currentStateOrCounty);

    // create scales
    let xScale = d3
        .scaleTime()
        .domain(d3.extent(cleanedData, (d) => { return d.date; }))
        .range([0, width]);

    let yScale = d3
        .scaleLinear()
        .domain([0, d3.max(cleanedData, (d) => { return +d.deaths; })])
        .range([height, 0]);

    // create and add axes 
    let xAxis = d3
        .axisBottom()
        .scale(xScale)
        .tickPadding(15)
        .ticks(xAxisTicks)
        .tickSize(-height);

    let yAxis = d3
        .axisLeft()
        .scale(yScale)
        .tickPadding(10)
        .ticks(yAxisTicks)
        .tickSize(-width);

    // add and format x-axis
    svg.append("g")
        .attr("id", "x-axis")
        // move x axis to the bottom
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        // rotate labels
        .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-45)")
        .style("text-anchor", "end");

    // add and format y-axis 
     svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    // text label for the y axis
    svg.append("text")
        .attr("id", "scatter-y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -(margin.left / 1.4))
        .attr("x", -(height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of deaths");
    
    // graph title label 
    svg.append("text")
        .attr("id", "scatter-title")
        .attr("y", -(margin.top / 2))
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("width", width)
        .text(`COVID-19 deaths in ${currentStateOrCounty} since ${monthNames[earliestDate.getMonth()]} ${earliestDate.getDate()}`);


    ////////////////////////////
    // initialize scatterplot //
    ///////////////////////////
    let scatterPlot = svg.append("g")
        .attr("id", "data-points");
    
    scatterPlot.selectAll("circle")
        .data(cleanedData)
        .enter()
        .append("circle")
        .attr("cx", (d) => { return xScale(d.date); })
        .attr("cy", (d) => { return yScale(d.deaths); })
        .attr("r", 0)
        .attr("fill", "red")
        // add tool tip on mouseover
        .on("mouseover", addToolTip)
        .on("mouseout", removeToolTip)
        .transition("initial-transition")
        .ease(d3.easeExp)
        .duration(1000)
        .attr("r", circleRadius)
        .delay((d, i) => { return i * 10; });
    
    //////////////////////////////////////////////
    // keep track of changing button selections //
    //////////////////////////////////////////////
    // update based on new selection
    d3.select("#state-select-button")
        .on("change", (d) => {
            let selectedOption = d3.select("#state-select-button").property("value");
            console.log(selectedOption);
            updateScatter(selectedOption);
        });
    
    // update based on new selection
    d3.select("#county-select-button")
        .on("change", (d) => {
            let selectedOption = d3.select("#county-select-button").property("value");
            console.log(selectedOption);
            updateScatter(selectedOption);
        });
    // addStateButton();
    // addCountyButton();
    
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////
    //                     helper functions                    //
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////
    function addToolTip(d) {
        // add styling to circle being hovered over
        d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", "2.5px")
            .attr("r", circleRadius + 3)
            .style("cursor", "pointer");
        
        tip.transition()
            .duration(200)
            .style("opacity", 1);

        let formatDate = d.date.toString().split(" ");
        let finalDate = formatDate[0] + ", " +
            formatDate[1] + " " + formatDate[2];

        // tooltip message
        tip.html("<i>" + finalDate + "</i>" + "<br/>" +
            "<b>" + d.deaths + " total deaths" + "</b>")
            .style("left", xScale(d.date) + "px")
            .style("top", yScale(d.deaths) + margin.top + margin.bottom - 68 + "px");
    }

    function removeToolTip(d) {
        // reset circle styling 
        d3.select(this)
            .attr("stroke", "none")
            .attr("stroke-width", "0px")
            .attr("r", circleRadius);

        tip.transition()
            .duration(200)
            .style("opacity", 0);
    }
    
    // update our scatter plot based on selected state        
    function updateScatter(selectedState) {
        
        // update global variables, data, and text
        currentStateOrCounty = selectedState;
        var updatedData = filterData(originalData, currentStateOrCounty);
        updateText();

        // update scatterplot
        updateAxes();
        updateScatterPlot();
        
        function updateScatterPlot() {
            // bind new data to every circle
            /* var newScatterPlot = scatterPlot
                .selectAll("circle")
                .data(updatedData); */
            var newScatterPlot = svg.select("#data-points")
                .selectAll("circle")
                .data(updatedData);
    
            // update current points
            newScatterPlot
                .transition("current-points-transition")
                .duration(1000)
                .attr("cx", (d) => { return xScale(d.date); })
                .attr("cy", (d) => { return yScale(d.deaths); })
                .delay((d, i) => { return i * 10; });;
    
            // remove old data points
            newScatterPlot.exit()
                .transition("old-points-transition")
                .duration(1000)
                .attr("r", 0)
                .attr("cy", (d) => { return yScale(0); })
                .remove()
                .delay((d, i) => { return i * 10; });
    
            // add new data points
            newScatterPlot.enter()
                .append("circle")
                .on("mouseover", addToolTip)
                .on("mouseout", removeToolTip)
                // animation so new points rise up and grow in size
                .attr("cx", (d) => { return xScale(d.date); })
                .attr("cy", (d) => { return yScale(0); })
                .attr("r", 0)
                .attr("fill", "red")
                .transition("new-points-transition")
                .duration(1000)
                .attr("r", circleRadius)
                .attr("cy", (d) => { return yScale(d.deaths); })
                .delay((d, i) => { return i * 10; });
        }

        function updateAxes() {
            // recalculate scales
            xScale.domain( d3.extent(updatedData, (d) => { return d.date; }) );
            yScale.domain( [0, d3.max(updatedData, (d) => { return d.deaths; } )] );

            // apply scales to axes
            xAxis.scale(xScale);
            yAxis.scale(yScale);
            
            // change the x axis
            svg.select("#x-axis") 
                .transition("x-axis-transition")
                .duration(1000)
                .call(xAxis)
                // rotate labels
                .selectAll("text")
                .attr("transform", "translate(-10,10)rotate(-45)")
                .style("text-anchor", "end");

            // change the y axis
            svg.select("#y-axis") 
                .transition("y-axis-transition")
                .duration(1000)
                .call(yAxis);
        }
    }
}

function filterData(originalData, stateOrCounty) {

    //// going to need to pass in the current state and county
    let returnData;

    // uses original data
    if (isStateDataSelected) {
        returnData = originalData.filter(function (d) {
            return d.state === stateOrCounty;
        });
    }
    else {
        returnData = originalData.filter(function (d) {
            return d.county === stateOrCounty;
        });
    }
    // returnData = returnData.filter(function (d) {
    //     return d.date >= cutoffDate;
    // });
    // set earliest date of new data
    earliestDate = returnData[0].date;
    return returnData;
}

// update text 
function updateText() {
    // const scatterText = document.getElementById("scatter-title");
    // scatterText.innerText = `COVID-19 deaths in ${currentStateOrCounty} since ${monthNames[earliestDate.getMonth()]} ${earliestDate.getDate()}`;
    svg.select("#scatter-title")
        .text(`COVID-19 deaths in ${currentStateOrCounty} since ${monthNames[earliestDate.getMonth()]} ${earliestDate.getDate()}`);
}

function addStateButton(originalData) {
    // find unique states from original data
    let uniqueStates = [];
    let items = [];
    originalData.forEach((d, i) => {
        items[i] = d.state;
    });
    uniqueStates = items.filter((d, i, self) => {
        return self.indexOf(d) === i;
    });
    // sort the states alphabetically
    uniqueStates.sort(function (a, b) {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
    });

    let selectButton = d3.select("#state-select-button-container") //"#navbarDiv"
        .append("select")
        .attr("id", "state-select-button")
        .attr("class", "form-control");

    d3.select("#state-select-button")
        .selectAll('myOptions')
        .data(uniqueStates)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("id", function (d) { return d; })
        .attr("value", function (d) { return d; }); // corresponding value returned by the button

    // set default selection
    d3.select("#" + currentStateOrCounty)
        .attr("selected", "selected");
}


function addCountyButton(originalData) {
    // find unique counties from original data
    // let uniqueCounties = [];
    // let items = [];
    // originalData.forEach((d, i) => {
    //     items[i] = d.county;
    // });
    // uniqueCounties = items.filter((d, i, self) => {
    //     return self.indexOf(d) === i;
    // });
    // // sort the states alphabetically
    // uniqueCounties.sort(function (a, b) {
    //     if (a < b) { return -1; }
    //     if (a > b) { return 1; }
    //     return 0;
    // });

    let selectButton = d3.select("#county-select-button-container") //"#navbarDiv"
        .append("select")
        .attr("id", "county-select-button")
        .attr("class", "form-control");

    d3.select("#county-select-button")
        .selectAll('myOptions')
        // .data(uniqueCounties)
        .data(sortedCounties)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("id", function (d) { return d; })
        .attr("value", function (d) { return d; }); // corresponding value returned by the button

    // set default selection
    d3.select("#" + currentStateOrCounty)
        .attr("selected", "selected");
}


