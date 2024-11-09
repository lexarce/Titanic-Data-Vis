let titleText = document.getElementById('titleText');

window.addEventListener('scroll', () => {
    let value = window.scrollY;

    // Move the title text up as you scroll
    titleText.style.marginTop = value * 2.5 + 'px';
});

window.addEventListener('scroll', function() {
    const titleText = document.getElementById('titleText');
    const maxScroll = 200;
    const scrollPos = window.scrollY;

    const opacity = Math.max(1 - scrollPos / maxScroll, 0);
    titleText.style.opacity = opacity;
});