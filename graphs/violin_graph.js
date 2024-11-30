//Makes the age "0" if there is no age
//Changes the names of the data categories to make it easier to understand
function processData(data) {
    data.forEach(function(d) {
        if (d.Age === "" || d.Age === undefined) {
            d.Age = 0;
        } else {
            d.Age = +d.Age; 
        }

        if (d.Pclass === "1") {
            d.Pclass = "First Class";
        } else if (d.Pclass === "2") {
            d.Pclass = "Second Class";
        } else if (d.Pclass === "3") {
            d.Pclass = "Third Class";
        }

        if (d.Embarked === "S") {
            d.Embarked = "Southampton";
        } else if (d.Embarked === "Q") {
            d.Embarked = "Queenstown";
        } else if (d.Embarked === "C") {
            d.Embarked = "Cherbourg";
        } else if (!d.Embarked) { 
            d.Embarked = "Unknown";
        }

        if (d.Survived === "0") {
            d.Survived = "No";
        } else if (d.Survived === "1") {
            d.Survived = "Yes";
        }

    });
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("violin graph");

    const violin = d3.select('#violin-graph');
    violin.style('height', '850px'); 

    // Load the Titanic dataset and preprocess it
    d3.csv("data/Titanic-Dataset.csv").then(function(data) {

        processData(data);
        
        //Dropdown buttons and event listeners
        const xColumnDropdown = document.getElementById('x-column');
        const yColumnDropdown = document.getElementById('y-column');

        xColumnDropdown.addEventListener('change', function() {
            createViolinGraph(data, xColumnDropdown.value, yColumnDropdown.value);
        });

        yColumnDropdown.addEventListener('change', function() {
            createViolinGraph(data, xColumnDropdown.value, yColumnDropdown.value);
        });

        //Initial violin graph
        createViolinGraph(data, xColumnDropdown.value, yColumnDropdown.value);
        
    });
});

//Function to create the violin graph
function createViolinGraph(data, xColumn, yColumn) {

    //margins
    var margin = { top: 100, right: 30, bottom: 200, left: 70 },
        width = 1000 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    //remove old graph
    d3.select("#violin-graph").selectAll("svg").remove();

    //x axis categories
    var xDomain = Array.from(new Set(data.map(d => d[xColumn])));

    var svg = d3.select("#violin-graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //x and y axis
    var y = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d[yColumn]; }), d3.max(data, function(d) { return d[yColumn]; })])
        .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    var x = d3.scaleBand()
        .range([0, width])
        .domain(xDomain)
        .padding(0.1);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + 60)  
        .style("text-anchor", "middle")
        .style("font-size", "16px")  
        .style("font-weight", "bold") 
        .text(xColumn); 

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10) 
        .style("text-anchor", "middle")
        .style("font-size", "16px")  
        .style("font-weight", "bold")  
        .text(yColumn);  


    //A bunch of violin stuff from https://d3-graph-gallery.com/graph/violin_basicDens.html
    var kde = kernelDensityEstimator(kernelEpanechnikov(0.5), y.ticks(50));

    var sumstat = d3.group(data, function(d) { return d[xColumn]; });

    sumstat = Array.from(sumstat, function([key, value]) {
        var input = value.map(function(d) { return d[yColumn]; });
        return { key: key, value: kde(input) };
    });

    var maxNum = 0;
    for (var i in sumstat) {
        var allBins = sumstat[i].value;
        var kdeValues = allBins.map(function (a) { return a[1]; });
        var biggest = d3.max(kdeValues);
        if (biggest > maxNum) { maxNum = biggest; }
    }

    var xNum = d3.scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxNum, maxNum]);

    svg.selectAll("myViolin")
        .data(sumstat)
        .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d.key) + ",0)"; })
        .append("path")
        .datum(function (d) { return d.value; })
        .style("stroke", "none")
        .style("fill", "#0d65a8")
        .attr("d", d3.area()
            .x0(function (d) { return xNum(-d[1]); })
            .x1(function (d) { return xNum(d[1]); })
            .y(function (d) { return y(d[0]); })
            .curve(d3.curveCatmullRom)
        );
}

//More violin stuff from https://d3-graph-gallery.com/graph/violin_basicDens.html
function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3.mean(V, function (v) { return kernel(x - v); })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}