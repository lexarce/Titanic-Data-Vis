
function createGraph(data) {

    //{ source: "p1", target: "Died"},
    //{ source: "p1", target: "Second-Class"}

    let endPointBallSize = 20;
    const graph = {
        nodes: [
            { id: "Survived", size: endPointBallSize , color: "green", layer: 0},
            { id: "Died", size: endPointBallSize, color: "red", layer: 0},

            { id: "First-Class", size: endPointBallSize , color: "gold", layer: 4},
            { id: "Second-Class", size: endPointBallSize , color: "silver", layer: 4},
            { id: "Third-Class", size: endPointBallSize , color: "brown", layer: 4},
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
        let color = d.Sex == "male" ? "blue" : "magenta";
        graph.nodes.push({id: d.Name, size: 6, color: color, layer: layer});
    }
    
    const svg = d3.select(".network-svg");
    const width = +svg.attr("width") + 600; //495
    const height = +svg.attr("height") + 490;

    
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(15)) //20
        .force("charge", d3.forceManyBody(graph.link).strength(-110)) //200
        .force("x", d3.forceX(d => d.layer * (height / 2)).strength(0.2)) //0.2
        .force("y", d3.forceY(width/2).strength(0.5)) //0.5
        .force("center", d3.forceCenter(width, height));

    
    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke-width", 2);

    
    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g");

    
    node.append("circle")
        .attr("class", "network-circle")
        .attr("fill", d => d.color)
        .attr("r", d => d.size);
    
    const tooltip = d3.select("#network-tooltip")

    node.on("mouseover", (event, d) => {
        d3.selectAll(".link")
            .classed("highlighted", link => link.source.id === d.id || link.target.id === d.id);
        
        d3.selectAll(".network-circle")
            .transition()
            .duration(300)
            .style("opacity", node => {
                const isConnected = graph.links.some(link =>
                    (link.source.id === d.id && link.target.id === node.id) ||
                    (link.target.id === d.id && link.source.id === node.id) ||
                    d.id === node.id 
                );
                return isConnected ? 1 : 0.65; 
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
        d3.selectAll(".link").classed("highlighted", false);
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
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
}



document.addEventListener('DOMContentLoaded', function () {
    console.log("preston's graph");

    let maleData = [];
    let femaleData = [];

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
        
        createGraph(maleData);
    });


});