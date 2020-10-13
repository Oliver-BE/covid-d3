//
// bar chart
// viewbox

async function makeBar() {
    let svgBar = d3
        .select("#barplot-div")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    // .append("g")
    //   .attr("transform", "translate(" + 20 + "," + 20 + ")");

    const barData = await d3.csv("../covid-19-data/live/us-states.csv");

    for (var row in barData) {
        barData[row].deaths = parseInt(barData[row].deaths);
    }

    // max x value
    let maxXVal = d3.max(barData, function (d) {
        return +d.cases;
    });

    // X scale:
    let xScaleBar = d3
        .scaleLinear()
        .domain([0, maxXVal])
        .range([margin, width - margin]);

    // use xscale to generate x-axis
    var xAxis = d3.axisBottom().scale(xScaleBar).ticks(10); // number of ticks

    // set the parameters for the histogram
    var histogram = d3
        .histogram()
        .value(function (d) {
            return d.cases;
        }) // I need to give the vector of value
        .domain(xScaleBar.domain()) // then the domain of the graphic
        .thresholds(xScaleBar.ticks(15)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(barData);
    console.log(bins);

    // this is the domain for y
    let maxFreqCount = d3.max(bins, function (d) {
        return +d.length;
    });
    console.log(maxFreqCount);

    // y axis
    let yScaleBar = d3
        .scaleLinear()
        .domain([0, maxFreqCount])
        // d3.max(bins, function (d) { return d.length; })])
        .range([height - margin, margin]);

    var yAxis = d3.axisLeft().scale(yScaleBar).ticks(10);

    // add bars
    svgBar
        .append("g")
        .selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) {
            return "translate(" + xScaleBar(d.x0) + "," + yScaleBar(d.length) + ")";
        })
        .attr("width", function (d) {
            return xScaleBar(d.x1) - xScaleBar(d.x0) - 1;
        })
        .attr("height", function (d) {
            return height - margin - yScaleBar(d.length);
        })
        .style("fill", "#69b3a2");

    // add axes
    svgBar
        .append("g")
        // move x axis to the bottom
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(xAxis);

    svgBar
        .append("g")
        .attr("transform", "translate(" + margin + ",0)")
        .call(yAxis);
}
