let titleText = document.getElementById('titleText');
let subText = document.getElementById('subText');
let scrollText = document.getElementById('scrollText');
let arrowDown = document.getElementById('arrowDown');

let background = document.getElementById('background');
let stars = document.getElementById('stars');
let clouds = document.getElementById('clouds');
let ocean = document.getElementById('ocean');
let ship = document.getElementById('ship');
let iceberg = document.getElementById('iceberg');
let foreground = document.getElementById('foreground');


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

    // Move the background up as you scroll
    stars.style.left = value * 0.25 + 'px';
    clouds.style.left = value * 1.5 + 'px';
    iceberg.style.left = value * 0.5 + 'px';
    ship.style.left = -value * 1.05 + 'px';
});

window.addEventListener('scroll', function() {
    const titleText = document.getElementById('titleText');
    const maxScroll = 200;
    const scrollPos = window.scrollY;

    const opacity = Math.max(1 - scrollPos / maxScroll, 0);
    titleText.style.opacity = opacity;
});

// Select all graph containers for sequential animation
const graphSections = document.querySelectorAll('#graphs-section > .svg-container');

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
}, {
    threshold: 0.2
});

// Observe each graph section
graphSections.forEach(section => {
    section.classList.add('hidden'); 
    observer.observe(section);
});

const hiddenElements = document.querySelectorAll('.hidden');
