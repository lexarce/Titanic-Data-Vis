let map;
let heat;
let data, class1data, class2data, class3data;
let class1Coords, class2Coords, class3Coords, Coords;
let alt = 1;

document.addEventListener('DOMContentLoaded', () => {

    Promise.all([d3.csv('data/Titanic-Dataset.csv')])
    .then(function (values) {
        data = values[0].filter(d => d.Survived === '0');

        // Define the mapping of Embarked codes to coordinates
        const embarkedCoordinates = {
            'C': [49.63348098045927, -1.6167611907751493],  // Cherbourg
            'Q': [51.79300,-8.254611],  // Queenstown
            'S': [50.892373550503336, -1.3983326760095773]   // Southampton
        };

        // Iterate over each row in the dataset and update the Embarked column with coordinates
        data.forEach(function(d1) {
            const embarkationCode = d1.Embarked;

            // Check if the embarkation code exists in the coordinates map
            if (embarkedCoordinates[embarkationCode]) {
                // Replace the Embarked code with the coordinates
                d1.Latitude = embarkedCoordinates[embarkationCode][0] + seed(parseFloat(d1.PassengerId));
                d1.Longitude = embarkedCoordinates[embarkationCode][1] + seed(parseFloat(d1.PassengerId) + 1);
            }
        });

        class1data = data.filter(d => d.Pclass === '1');
        class2data = data.filter(d => d.Pclass === '2');
        class3data = data.filter(d => d.Pclass === '3');

        Coords = data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
        class1Coords = class1data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
        class2Coords = class2data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
        class3Coords = class3data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);


        drawHeatMap('1st Class');
        

    });

    // Select the heatmap-graph container
    const heatmapContainer = d3.select('#heatmap-graph');

    heatmapContainer.style('height', '800px'); // Adjust the height as needed

    heatmapContainer
        .append('text') // Create a text element
        .text('Fatalities from each port are visualized by class. Choose a class:') // The text you want to display
        .style('position', 'absolute')
        .style('top', '60px')
        .style('left', '18%')
        



    const dropdown = heatmapContainer
        .append('div')
        .style('position', 'absolute')
        .style('top', '100px')
        .style('left', '50%')
        .style('transform', 'translateX(-50%)')
        .append('select')
        .attr('id', 'dropdownMenu')
        .style('padding', '5px')
        .style('font-size', '14px')
        .on('change', function () {
            const selectedOption = d3.select(this).property('value');
            drawHeatMap(selectedOption);
        });

    // Add options to the dropdown
    const options = ['1st Class', '2nd Class', '3rd Class', 'All'];
    dropdown.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    
    // Initialize the map and add a heatmap layer
    map = L.map('map').setView([50.7256293573177, -5.151692391297452], 7);

    // OpenStreetMap tile layer
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    osm.addTo(map);

});

function seed(n) {
    // Convert input to a deterministic hash
    let hash = Math.sin(n) * 10000;
    
    // Extract fractional part to get a pseudo-random value between 0 and 1
    let randomFraction = hash - Math.floor(hash);
    
    // Scale to the range -0.09 to 0.09
    return (randomFraction * 0.80) - 0.40; // 0.18 is the range width
}

function drawHeatMap(selectedOption) {
    // Implement your heat map drawing logic here

    if (heat) {
        map.removeLayer(heat);
    }


    if (selectedOption == '1st Class') {
        addressPoints = class1Coords;
    }

    else if (selectedOption == '2nd Class') {
        addressPoints = class2Coords;

    }
    else if (selectedOption == '3rd Class') {
        addressPoints = class3Coords;

    }
    else if (selectedOption == 'All') {
        addressPoints = Coords

    }


    // Create a heat layer and add it to the map
    heat = L.heatLayer(addressPoints, {
        radius:12, // Customize the radius of the heat spots
        blur: 15, // Customize the blur intensity
        maxZoom: 10
    }).addTo(map);


}