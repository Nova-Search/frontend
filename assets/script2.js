const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

window.addEventListener('load', () => {
    const icon = document.getElementById('icon');
    if (icon) {
        const updateIconColor = () => {
            icon.setAttribute('fill', prefersDarkScheme.matches ? 'white' : 'black');
        };

        updateIconColor(); // Set initial color
        prefersDarkScheme.addEventListener('change', updateIconColor); // Update color on theme change
    }
});