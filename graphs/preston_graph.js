
const LEGEND_DATA = new Map([
    ["Survived", {color: "#3E5526", name: "Survived"}],
    ["Died", {color: "#D12420", name: "Died"}],

    ["First-Class", {color: "#F8B936", name: "First-Class"}],
    ["Second-Class", {color: "#C65B23", name: "Second-Class"}],
    ["Third-Class", {color: "#683D08", name: "Third-Class"}],

    ["male", {color: "#044cb1", name: "Male"}],
    ["female", {color: "#c72972", name: "Female"}],
]);

function createGraph() {
    const svg = d3.select(".network-svg");
    //make links holder
    svg.append("g")
        .attr("class", "links")
    //make nodes holder
    svg.append("g")
        .attr("class", "nodes")

    //create legend
    const legend = d3.select("svg")
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(50, 50)`);

    const legendItems = legend.selectAll(".legend-item")
        .data(Array.from(LEGEND_DATA.values()))
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems
        .append("circle")
        .attr("r", 10)
        .attr("fill", d => d.color)

    legendItems
        .append("text")
        .attr("x", 20) 
        .attr("dy", "0.35em")
        .text(d => d.name.toUpperCase())
        .style("font-size", "14px")
        .style("font-family", "Arial, sans-serif");

}


function getCircleColor(str) {
    return LEGEND_DATA.get(str).color
}

function updateGraph(data) {

    //{ source: "p1", target: "Died"},
    //{ source: "p1", target: "Second-Class"}

    let endPointBallSize = 21;
    const graph = {
        nodes: [
            { id: "Survived", size: endPointBallSize , color: getCircleColor("Survived"), layer: 0},
            { id: "Died", size: endPointBallSize, color: getCircleColor("Died"), layer: 0},

            { id: "First-Class", size: endPointBallSize , color: getCircleColor("First-Class"), layer: 4},
            { id: "Second-Class", size: endPointBallSize , color: getCircleColor("Second-Class"), layer: 4},
            { id: "Third-Class", size: endPointBallSize , color: getCircleColor("Third-Class"), layer: 4},
        ],
        links: []
    };

    for (d of data) {
        let layer = 0;

        if (+d.Survived == 1) {
            graph.links.push({source: d.Name, target: "Survived"});
        } 
        else {
            graph.links.push({source: d.Name, target: "Died"});
        }

        if (+d.Pclass == 1) {
            graph.links.push({source: d.Name, target: "First-Class"});
            layer = 1;
        }
        else if (+d.Pclass == 2) {
            graph.links.push({source: d.Name, target: "Second-Class"});
            layer = 2;
        } 
        else {
            graph.links.push({source: d.Name, target: "Third-Class"});
            layer = 3
        }
        let color = getCircleColor(d.Sex)
        graph.nodes.push({id: d.Name, size: 7, color: color, layer: layer});
    }
    
    const svg = d3.select(".network-svg");
    const width = +svg.attr("width") + 600; //495
    const height = +svg.attr("height") + 400;

    
    const simulation = d3.forceSimulation(graph.nodes)
        .alpha(0.95)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(15)) //20
        .force("charge", d3.forceManyBody(graph.link).strength(-110)) //200
        .force("x", d3.forceX(d => d.layer * (height / 2)).strength(0.2)) //0.2
        .force("y", d3.forceY(width/2).strength(0.5)) //0.5
        .force("center", d3.forceCenter(width, height));

    svg.selectAll(".link").remove();

    const link = svg.select(".links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke-width", 2);

    
    const node = svg.select(".nodes")
        .selectAll("g")
        /*.data(graph.nodes)
        .enter()
        .append("g");*/
        
    const tooltip = d3.select("#network-tooltip");
    
   // const node = svg.selectAll("nodes").data(graph.nodes);
    
    node.data(graph.nodes).join(
        enter => enter
            .append("g")
            .attr("transform", d => `translate(${width},${height-2000})`)
            .append("circle") 
            .attr("class", "network-circle")
            //.attr("opacity", 0) 
            .attr("opacity", 1)
            .attr("fill", d => d.color)
            .attr("r", 0) 
            .transition()
            .duration(800)
            //.delay((d,i)=> i*4)
            .attr("opacity", 1)
            .attr("r", d => d.size),
        update => update
            .select("circle")
            //.transition()
            //.duration(300)
            .attr("fill", d => d.color)
            .attr("r", d => d.size),
        exit => {
            exit
                .transition()
                .duration(1000)
                .attr("transform", d => `translate(${width},${height-2000})`)
                .remove()

        }
    );
     
   /*
    node.append("circle")
        .attr("class", "network-circle")
        .attr("fill", d => d.color)
        .attr("r", d => d.size);
    */

    svg.select(".nodes").selectAll("g")
    .on("mouseover", (event, d) => {
            
        d3.selectAll(".link")
            .classed("highlighted", link => link.source.id === d.id || link.target.id === d.id)
            .classed("not-highlighted", link => link.source.id !== d.id && link.target.id !== d.id);

        d3.selectAll(".network-circle")
            .transition()
            .duration(300)
            .style("opacity", node => {
                const isConnected = graph.links.some(link =>
                    (link.source.id === d.id && link.target.id === node.id) ||
                    (link.target.id === d.id && link.source.id === node.id) ||
                    d.id === node.id 
                );
                return isConnected ? 1 : 0.2; 
            })

        tooltip
            .transition()
            .duration(300)
            .style("opacity", 1)
            .style("left", (event.pageX + 18) + "px")
            .style("top", (event.pageY - 35) + "px");
        
        tooltip.html(`${d.id.toUpperCase()}`);

    })
    .on("mousemove", () => {
        tooltip
            .style("left", (event.pageX + 18) + "px")
            .style("top", (event.pageY - 35) + "px");
    })
    .on("mouseout", () => {
        d3.selectAll(".link")
            .classed("highlighted", false)
            .classed("not-highlighted", false)

        d3.selectAll(".network-circle")
            .transition()
            .duration(200)
            .style("opacity", 1);
        tooltip
            .transition()
            .duration(300)
            .style("opacity", 0) 
    });
    
    simulation.on("tick", () => {
        svg.select(".links")
            .selectAll(".link")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        svg.select(".nodes")
            .selectAll("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
}



document.addEventListener('DOMContentLoaded', function () {
    //console.log("preston's graph");

    createGraph();

    let maleData = [];
    let femaleData = [];

    const networkSelector = document.getElementById("network-selector"); 
    let updGraph = function() {
        updateGraph(networkSelector.value === "male" ? maleData : femaleData);
    }

    Promise.all([d3.csv('data/Titanic-Dataset.csv')])
    .then(function (data) {
        
        for (d of data[0]) {
            if (d.Sex == "male") {
                maleData.push(d);
            }
            else {
                femaleData.push(d);
            }
        }
        
        updGraph();
    });

    networkSelector.addEventListener('change', function(event) {
        updGraph();
    })
});