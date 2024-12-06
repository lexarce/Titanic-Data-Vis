var margin = { top: 170, right: 140, bottom: 100, left: 140 },
    width = 800,
    height = 650;

var color = d3.scaleOrdinal().range(["#EDC951", "#00A0B0", "#CC333F"]); // Yellow, Blue, Red

document.addEventListener('DOMContentLoaded', () => {
    d3.csv('data/Titanic-Dataset.csv').then((rawData) => {
        // Process data: Aggregate by class
        const processedData = d3.groups(rawData, d => d.Pclass)
            .sort(([a], [b]) => a - b)
            .map(([pclass, group]) => {
            const survivalRate = d3.mean(group, d => +d.Survived);
            const averageAge = d3.mean(group, d => +d.Age);
            const averageFare = d3.mean(group, d => +d.Fare);
            return [
                { axis: "Survival Rate", value: survivalRate },
                { axis: "Average Age", value: averageAge / 100 }, 
                { axis: "Average Fare", value: averageFare / 100 } 
            ];
        });

       // Draw radar chart
        var radarChartOptions = {
            w: width,
            h: height,
            margin: margin,
            maxValue: 1.0, // Adjusted for scaling
            levels: 5,
            roundStrokes: true,
            color: color
        };

        // Call function to draw the Radar chart
        RadarChart(".radarChart", processedData, radarChartOptions);

        // Add a legend
        var legendData = ["First Class", "Second Class", "Third Class"];

        var svg = d3.select(".radarChart svg");

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 10},${margin.top})`);

        legend.selectAll("rect")
            .data(legendData)
            .join("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 25)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", (d, i) => color(i));

        legend.selectAll("text")
            .data(legendData)
            .join("text")
            .attr("x", 30)
            .attr("y", (d, i) => i * 25 + 15)
            .text(d => d)
            .style("font-size", "14px")
            .style("fill", "black");
    });
});

function RadarChart(id, data, options) {
    var cfg = {
        w: 600,
        h: 600,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        levels: 3,
        maxValue: 0,
        labelFactor: 1.25,
        wrapWidth: 60,
        opacityArea: 0.35,
        dotRadius: 4,
        opacityCircles: 0.1,
        strokeWidth: 2,
        roundStrokes: false,
        color: d3.scaleOrdinal()
    };

    if (options) {
        Object.keys(options).forEach(function (key) {
            if (options[key] !== undefined) {
                cfg[key] = options[key];
            }
        });
    }

    var maxValue = Math.max(
        cfg.maxValue,
        d3.max(data, function (i) {
            return d3.max(
                i.map(function (o) {
                    return o.value;
                })
            );
        })
    );

    var allAxis = data[0].map(function (i) {
            return i.axis;
        }),
        total = allAxis.length,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        Format = d3.format('%'),
        angleSlice = (Math.PI * 2) / total;

    var rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

    d3.select(id).select("svg").remove();

    var svg = d3
        .select(id)
        .append("svg")
        .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
        .attr("class", "radarChart");

    // Add chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", cfg.w / 2 + cfg.margin.left) 
        .attr("y", cfg.margin.top / 2 - 70) 
        .attr("text-anchor", "middle") 
        .style("font-size", "20px") 
        .style("font-weight", "bold") 
        .text("Comparison of Titanic Survival Rates by Class: Average Fare, Age, and Survival Rate");

    var g = svg
        .append("g")
        .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

    var filter = g.append("defs").append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    var axisGrid = g.append("g").attr("class", "axisWrapper");

    axisGrid
        .selectAll(".levels")
        .data(d3.range(1, cfg.levels + 1).reverse())
        .join("circle")
        .attr("class", "gridCircle")
        .attr("r", function (d, i) {
            return (radius / cfg.levels) * d;
        })
        .style("fill", "#CDCDCD")
        .style("stroke", "#737373") 
        .style("stroke-width", ".25px") 
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter", "url(#glow)");

    axisGrid
        .selectAll(".axisLabel")
        .data(d3.range(1, cfg.levels + 1).reverse())
        .join("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", function (d) {
            return (-d * radius) / cfg.levels;
        })
        .attr("dy", "0.4em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text(function (d, i) {
            return Format((maxValue * d) / cfg.levels);
        });

    var axis = axisGrid
        .selectAll(".axis")
        .data(allAxis)
        .join("g")
        .attr("class", "axis");

    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function (d, i) {
            return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("y2", function (d, i) {
            return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style("stroke", "#737373") 
        .style("stroke-width", "1.5px"); 

    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function (d, i) {
            return rScale(maxValue * 1.15) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("y", function (d, i) {
            return rScale(maxValue * 1.15) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .text(function (d) {
            return d;
        });

    var radarLine = d3.lineRadial()
        .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed)
        .radius(function (d) {
            return rScale(d.value);
        })
        .angle(function (d, i) {
            return i * angleSlice;
        });

    var blobWrapper = g
        .selectAll(".radarWrapper")
        .data(data)
        .join("g")
        .attr("class", "radarWrapper");

    blobWrapper
        .append("path")
        .attr("class", "radarShape")
        .attr("d", function (d) {
            return radarLine(d);
        })
        .style("fill", function (d, i) {
            return cfg.color(i);
        })
        .style("fill-opacity", cfg.opacityArea)
        .style("stroke", function (d, i) {
            return cfg.color(i);
        })
        .style("stroke-width", cfg.strokeWidth)
        .on("mouseover", function (event, d) {
            d3.selectAll(".radarShape").transition().duration(200).style("fill-opacity", 0.1);
            d3.select(this).transition().duration(200).style("fill-opacity", 0.7);
        })
        .on("mouseout", function () {
            d3.selectAll(".radarShape").transition().duration(200).style("fill-opacity", cfg.opacityArea);
        });

    blobWrapper
        .selectAll(".radarCircle")
        .data(function (d) {
            return d;
        })
        .enter()
        .append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function (d, i) {
            return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("cy", function (d, i) {
            return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style("fill", function (d, i, j) {
            return cfg.color(j);
        })
        .style("fill-opacity", 0.8);

    // Wrap text to avoid overlap
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineHeight = 1.1,
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text
                    .text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
            while ((word = words.pop())) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++dy + "em").text(word);
                }
            }
        });
    }
}

