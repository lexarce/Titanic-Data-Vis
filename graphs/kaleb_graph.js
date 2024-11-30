let map;
let heat;
let data, class1data, class2data, class3data;
let class1Coords, class2Coords, class3Coords, Coords;
let alt = 1;

document.addEventListener('DOMContentLoaded', () => {

    Promise.all([d3.csv('data/Titanic-Dataset.csv')])
    .then(function (values) {

        //Remove all rows with Survived value = 1
        data = values[0].filter(d => d.Survived === '0');

        //Map each port to a coordinate
        const embarkedCoordinates = {
            'C': [49.63348098045927, -1.6167611907751493],  //Cherbourg
            'Q': [51.79300,-8.254611],  //Queenstown
            'S': [50.892373550503336, -1.3983326760095773]   //Southampton
        };

        //Give each data value a coordinate with a "random" seed to make the coordinates slightly different
        data.forEach(function(d1) {
            const embarkationCode = d1.Embarked;


            if (embarkedCoordinates[embarkationCode]) {

                d1.Latitude = embarkedCoordinates[embarkationCode][0] + seed(parseFloat(d1.PassengerId));
                d1.Longitude = embarkedCoordinates[embarkationCode][1] + seed(parseFloat(d1.PassengerId) + 1);
            }
        });

        //Create lists of coordinates for each mapping choice
        class1data = data.filter(d => d.Pclass === '1');
        class2data = data.filter(d => d.Pclass === '2');
        class3data = data.filter(d => d.Pclass === '3');

        Coords = data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
        class1Coords = class1data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
        class2Coords = class2data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);
        class3Coords = class3data.map(d => [parseFloat(d.Latitude), parseFloat(d.Longitude)]);

        drawHeatMap('1st Class');
        

    });

    const heatmapContainer = d3.select('#heatmap-graph');
    heatmapContainer.style('height', '850px'); 

    //Description
    heatmapContainer
        .append('text') 
        .text('Fatalities from each port are visualized by class. Choose a class:') 
        .style('position', 'absolute')
        .style('top', '110px')
        .style('left', '18%')
        
    //Dropdown
    const dropdown = heatmapContainer
        .append('div')
        .style('position', 'absolute')
        .style('top', '150px')
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

    //Options for dropdown
    const options = ['1st Class', '2nd Class', '3rd Class', 'All'];
    dropdown.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    //Creates the map itself
    map = L.map('map').setView([50.7256293573177, -5.151692391297452], 7);

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    osm.addTo(map);

});

//Creates a value to add to the coordinates
function seed(n) {

    let hash = Math.sin(n) * 10000;
    
    let randomFraction = hash - Math.floor(hash);
    
    return (randomFraction * 0.80) - 0.40; 
}

//Draws the heatmap
function drawHeatMap(selectedOption) {

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

    heat = L.heatLayer(addressPoints, {
        radius:12, 
        blur: 15, 
        maxZoom: 10
    }).addTo(map);


}