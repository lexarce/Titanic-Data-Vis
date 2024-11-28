
function createGraph() {
// Data for nodes and links
const graph = {
        nodes: [
            { id: "Survived", size: 50, color: "green", layer: 0},
            { id: "Died", size: 50, color: "red", layer: 0},

            { id: "First-Class", size: 25, color: "brown", layer: 3},
            { id: "Second-Class", size: 25, color: "brown", layer: 3},
            { id: "Third-Class", size: 25, color: "brown", layer: 3},

            { id: "p1", size: 10, color: "blue", layer: 1},
            { id: "p2", size: 10, color: "blue", layer: 1},
            { id: "p3", size: 10, color: "magenta", layer: 2},
            { id: "p4", size: 10, color: "blue", layer: 1},
            { id: "p5", size: 10, color: "magenta", layer: 2},
        ],
        links: [
            { source: "p1", target: "Died", dist: 150 },
            { source: "p1", target: "Second-Class", dist: 550 },

            { source: "p2", target: "Survived", dist: 150 },
            { source: "p2", target: "First-Class", dist: 550 },

            { source: "p3", target: "Survived", dist: 150 },
            { source: "p3", target: "Third-Class", dist: 550 },
            
            { source: "p4", target: "Died", dist: 150 },
            { source: "p4", target: "Second-Class", dist: 550 },

            { source: "p5", target: "Died", dist: 150 },
            { source: "p5", target: "Third-Class", dist: 550 },
        ]
    };

    // Create an SVG container
    const svg = d3.select(".network-svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

        // Define the simulation
        const simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink(graph.links).id(d => d.id).distance(200))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("x", d3.forceX(520/2).strength(0))
            .force("y", d3.forceY(d => d.layer * (520 / 2)).strength(1))
            .force("center", d3.forceCenter(520, 520));

        // Add links
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke-width", 2);

        // Add nodes
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter()
            .append("g");

        // Add circles to nodes
        node.append("circle")
            .attr("fill", d => d.color)
            .attr("r", d => d.size);

        // Add labels to nodes
        node.append("text")
            .text(d => d.id)
            .attr("x", 12)
            .attr("y", 4);

        // Update node and link positions during the simulation
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
    
    console.log("preston graph");

    Promise.all([d3.csv('data/Titanic-Dataset.csv')])
    .then(function (data) {

        
        createGraph();
    });


});