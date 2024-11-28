let titleText = document.getElementById('titleText');
let subText = document.getElementById('subText');
let scrollText = document.getElementById('scrollText');
let arrowDown = document.getElementById('arrowDown');

window.addEventListener('scroll', () => {
    let value = window.scrollY;

    // Move the title text up as you scroll
    titleText.style.marginTop = value * 2.5 + 'px';

    // Move subText, scrollText, and arrowDown up as you scroll
    subText.style.marginTop = (350 - value * 1.5) + 'px'; 
    scrollText.style.marginTop = (700 - value * 1.5) + 'px'; 
    arrowDown.style.marginBottom = (-800 + value * 1.5) + 'px'; 

    // Make subText, scrollText, and arrowDown fade out as you scroll
    const maxScroll = 200;
    const opacity = Math.max(1 - value / maxScroll, 0);
    subText.style.opacity = opacity;
    scrollText.style.opacity = opacity;
    arrowDown.style.opacity = opacity;
});

window.addEventListener('scroll', function() {
    const titleText = document.getElementById('titleText');
    const maxScroll = 200;
    const scrollPos = window.scrollY;

    const opacity = Math.max(1 - scrollPos / maxScroll, 0);
    titleText.style.opacity = opacity;
});

// // Initialize the map and add a heatmap layer
// var map = L.map('map').setView([-37.87, 175.475], 11);

// // OpenStreetMap tile layer
// var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// });
// osm.addTo(map);

// // Process the address points for the heatmap
// addressPoints = addressPoints.map(function (p) { return [p[0], p[1]]; });

// // Create a heat layer and add it to the map
// var heat = L.heatLayer(addressPoints, {
//     radius: 20, // Customize the radius of the heat spots
//     blur: 15, // Customize the blur intensity
//     maxZoom: 10
// }).addTo(map);