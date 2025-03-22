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

document.addEventListener('DOMContentLoaded', async () => {
    const totalPagesElement = document.getElementById('totalPages');
    const crawledLast24hElement = document.getElementById('crawledLast24h');

    const animateNumber = (element, newValue) => {
        const currentValue = parseInt(element.textContent.replace(/,/g, ''), 10) || 0;
        const duration = 1000; // Animation duration in ms
        const frameRate = 60; // Frames per second
        const totalFrames = Math.round((duration / 1000) * frameRate);
        const increment = (newValue - currentValue) / totalFrames;

        let frame = 0;
        const animate = () => {
            frame++;
            const value = Math.round(currentValue + increment * frame);
            element.textContent = value.toLocaleString();

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = newValue.toLocaleString(); // Ensure final value is accurate
                element.classList.remove('animate'); // Remove animation class
            }
        };

        element.classList.add('animate'); // Add animation class
        animate();
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('https://api.novasearch.xyz/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const stats = await response.json();
            animateNumber(totalPagesElement, stats.total_pages);
            animateNumber(crawledLast24hElement, stats.crawled_last_24h);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Initial fetch
    await fetchStats();

    // Set up interval to fetch every 10 seconds
    setInterval(fetchStats, 10000);
});