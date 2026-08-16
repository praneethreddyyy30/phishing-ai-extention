// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load world countries GeoJSON
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(response => response.json())
    .then(data => {
        // Add GeoJSON layer to map
        L.geoJSON(data, {
            style: function(feature) {
                return {
                    fillColor: getColor(feature.properties.name),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    });

// Function to get color based on population (simplified)
function getColor(countryName) {
    // Since we can't know population without API call, use random colors for now
    const colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
    let hash = 0;
    for (let i = 0; i < countryName.length; i++) {
        hash = countryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Function to handle each feature (country)
function onEachFeature(feature, layer) {
    // Tooltip on hover
    layer.bindTooltip(feature.properties.name, {
        permanent: false,
        direction: 'auto'
    });

    // Click event
    layer.on('click', function(e) {
        const countryName = feature.properties.name;
        showCountryPanel(countryName);
    });

    // Hover effects
    layer.on('mouseover', function(e) {
        e.target.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.9
        });
    });

    layer.on('mouseout', function(e) {
        e.target.setStyle({
            weight: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        });
    });
}

// Function to show country panel
async function showCountryPanel(countryName) {
    try {
        // Fetch country data from REST Countries API
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
        const data = await response.json();
        const country = data[0];

        if (!country) {
            alert('Country data not found');
            return;
        }

        const totalPop = country.population;
        // Estimate gender distribution (approximate global average)
        const malePop = Math.round(totalPop * 0.49);
        const femalePop = totalPop - malePop;

        document.getElementById('countryName').textContent = country.name.common;
        document.getElementById('totalPop').textContent = totalPop.toLocaleString();
        document.getElementById('malePop').textContent = malePop.toLocaleString();
        document.getElementById('femalePop').textContent = femalePop.toLocaleString();

        // Calculate ratio
        const maleRatio = 49;
        const femaleRatio = 51;

        // Create or update chart
        const ctx = document.getElementById('genderChart').getContext('2d');
        if (window.genderChart) {
            window.genderChart.destroy();
        }
        window.genderChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [maleRatio, femaleRatio],
                    backgroundColor: ['#3498db', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });

        document.getElementById('countryPanel').classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching country data:', error);
        alert('Error loading country data. Please try again.');
    }
}

// Close panel
document.getElementById('closePanel').addEventListener('click', function() {
    document.getElementById('countryPanel').classList.add('hidden');
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    // In a real app, you might want to highlight or zoom to the country
    // For now, just log it
    console.log('Searching for:', searchTerm);
});

// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    const icon = this.textContent;
    this.textContent = icon === '🌙' ? '☀️' : '🌙';
});

// Make map responsive
window.addEventListener('resize', function() {
    map.invalidateSize();
});