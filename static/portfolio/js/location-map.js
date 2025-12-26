/**
 * Location Map (Leaflet)
 * Handles the interactive world map with country borders and zoom functionality
 */

(function() {
    'use strict';

    let locationMap = null;
    
    function initLocationMap() {
        const mapElement = document.getElementById('location-map');
        if (!mapElement || locationMap) return;
        
        // Initialize map with world view and disable scroll wheel zoom
        locationMap = L.map('location-map', {
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false
        }).setView([0, 0], 2);
        
        // Add dark CartoDB basemap tiles with labels
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(locationMap);
        
        // Load & style country borders with neon glow
        let countryBorders = null;
        fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
            .then(response => response.json())
            .then(data => {
                countryBorders = L.geoJSON(data, {
                    style: function (feature) {
                        const zoom = locationMap.getZoom();
                        return getBorderStyle(zoom);
                    }
                }).addTo(locationMap);
                
                // Function to get border style based on zoom level
                function getBorderStyle(zoom) {
                    let weight = 1.5;
                    let opacity = 0.8;
                    
                    // Hide borders completely at very high zoom levels
                    if (zoom > 11) {
                        opacity = 0;
                    } else if (zoom > 10) {
                        weight = 0.5;
                        opacity = 0.3;
                    } else if (zoom > 8) {
                        weight = 1.0;
                        opacity = 0.6;
                    }
                    
                    return {
                        color: '#ffe014',
                        weight: weight,
                        opacity: opacity,
                        fillColor: '#000',
                        fillOpacity: 0
                    };
                }
                
                // Update border styles during zoom animation (not just at end)
                let zoomUpdateTimeout;
                locationMap.on('zoom', function() {
                    if (countryBorders) {
                        // Throttle updates to prevent performance issues
                        clearTimeout(zoomUpdateTimeout);
                        zoomUpdateTimeout = setTimeout(function() {
                            const zoom = locationMap.getZoom();
                            countryBorders.setStyle(function(feature) {
                                return getBorderStyle(zoom);
                            });
                        }, 50); // Update every 50ms during zoom
                    }
                });
                
                // Also update on zoom end to ensure final state
                locationMap.on('zoomend', function() {
                    if (countryBorders) {
                        const zoom = locationMap.getZoom();
                        countryBorders.setStyle(function(feature) {
                            return getBorderStyle(zoom);
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error loading country borders:', error);
            });
        
        // Add scroll prevention overlay
        const mapContainer = mapElement;
        let scrollTimeout;
        let isScrolling = false;
        
        // Detect when user is scrolling the page
        window.addEventListener('scroll', function() {
            isScrolling = true;
            mapContainer.style.pointerEvents = 'none';
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                isScrolling = false;
                mapContainer.style.pointerEvents = 'auto';
            }, 150);
        }, { passive: true });
        
        // Prevent map interaction during touch scroll
        let touchStartY = 0;
        mapContainer.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        mapContainer.addEventListener('touchmove', function(e) {
            const touchY = e.touches[0].clientY;
            const deltaY = Math.abs(touchY - touchStartY);
            
            // If vertical movement is significant, likely page scrolling
            if (deltaY > 10) {
                mapContainer.style.pointerEvents = 'none';
                setTimeout(function() {
                    mapContainer.style.pointerEvents = 'auto';
                }, 300);
            }
        }, { passive: true });
    }
    
    function zoomToGreenfields() {
        // Ensure map is initialized before zooming
        if (!locationMap) {
            initLocationMap();
            // Wait a moment for map to render before zooming
            setTimeout(() => {
                if (locationMap) {
                    // Coordinates for Greenfields, Western Australia
                    // Greenfields is a suburb of Mandurah, approximately -32.54, 115.76
                    locationMap.flyTo([-32.54, 115.76], 13, {
                        animate: true,
                        duration: 3 // Duration in seconds
                    });
                }
            }, 100);
        } else {
            // Coordinates for Greenfields, Western Australia
            locationMap.flyTo([-32.54, 115.76], 13, {
                animate: true,
                duration: 3 // Duration in seconds
            });
        }
    }
    
    // Make zoomToGreenfields available globally for onclick handler
    window.zoomToGreenfields = zoomToGreenfields;
    
    // Initialize map when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Use Intersection Observer to initialize map when section is visible
        const locationSection = document.querySelector('.location-section');
        if (locationSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !locationMap) {
                        initLocationMap();
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(locationSection);
        }
    });
})();

