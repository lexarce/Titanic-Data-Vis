
function createGraph(data, color) {

    //{ source: "p1", target: "Died"},
    //{ source: "p1", target: "Second-Class"}

    let endPointBallSize = 15;
    const graph = {
        nodes: [
            { id: "Survived", size: endPointBallSize , color: "green", layer: 0},
            { id: "Died", size: endPointBallSize, color: "red", layer: 0},

            { id: "First-Class", size: endPointBallSize , color: "brown", layer: 2},
            { id: "Second-Class", size: endPointBallSize , color: "brown", layer: 2},
            { id: "Third-Class", size: endPointBallSize , color: "brown", layer: 2},
        ],
        links: []
    };

    for (d of data) {
        console.log(d);
        graph.nodes.push({id: d.Name, size: 5, color: color, layer: 1},);
        if (+d.Survived == 1) {
            graph.links.push({source: d.Name, target: "Survived"});
        } 
        else {
            graph.links.push({source: d.Name, target: "Died"});
        }

        if (+d.Pclass == 1) {
            graph.links.push({source: d.Name, target: "First-Class"});
        }
        else if (+d.Pclass == 2) {
            graph.links.push({source: d.Name, target: "Second-Class"});
        } 
        else {
            graph.links.push({source: d.Name, target: "Third-Class"});
        }
    }
    
    const svg = d3.select(".network-svg");
    const width = +svg.attr("width") + 500;
    const height = +svg.attr("height") + 490;

    
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(5))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("x", d3.forceX(d => d.layer * (height / 2)).strength(0.75))
        .force("y", d3.forceY(width/2).strength(0.5))
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
        .attr("fill", d => d.color)
        .attr("r", d => d.size);

    /*
    node.append("text")
        .text(d => d.id)
        .attr("x", 12)
        .attr("y", 4);
    */
    
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
        
        createGraph(maleData, "blue");
    });


});