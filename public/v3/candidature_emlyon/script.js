// Effet léger sur la navbar au scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 1)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});