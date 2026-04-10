/* ===== Dashboard Module ===== */
const Dashboard = (() => {
  let map = null;
  let markers = [];

  function initMap(roads) {
    // Initialize Leaflet map
    map = L.map('traffic-map', {
      zoomControl: false
    }).setView([12.9716, 77.5946], 13);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Use a clean, premium tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    // Add markers for each road
    roads.forEach(road => {
      const marker = createMarker(road);
      markers.push({ id: road.id, marker });
    });
  }

  function createMarker(road) {
    const color = road.statusColor === 'green' ? '#2ECC71' :
                  road.statusColor === 'amber' ? '#F39C12' : '#E74C3C';

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 24px; height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 12px ${color}40;
        transition: all 0.5s ease;
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([road.lat, road.lng], { icon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 180px; padding: 4px;">
        <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${road.name}</h4>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #4A5568;">
          <div>🚗 Vehicles: <strong>${road.vehicleCount}</strong></div>
          <div>⚡ Speed: <strong>${road.speed} km/h</strong></div>
          <div>📊 Density: <strong>${road.density}%</strong></div>
          <div>🚦 Signal: <strong style="color: ${color}">${road.signalState.toUpperCase()}</strong></div>
        </div>
      </div>
    `);

    return marker;
  }

  function updateMapMarkers(roads) {
    roads.forEach(road => {
      const markerObj = markers.find(m => m.id === road.id);
      if (markerObj) {
        const color = road.statusColor === 'green' ? '#2ECC71' :
                      road.statusColor === 'amber' ? '#F39C12' : '#E74C3C';

        markerObj.marker.setIcon(L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 24px; height: 24px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 12px ${color}40;
            transition: all 0.5s ease;
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        }));

        markerObj.marker.setPopupContent(`
          <div style="font-family: Inter, sans-serif; min-width: 180px; padding: 4px;">
            <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${road.name}</h4>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #4A5568;">
              <div>🚗 Vehicles: <strong>${road.vehicleCount}</strong></div>
              <div>⚡ Speed: <strong>${road.speed} km/h</strong></div>
              <div>📊 Density: <strong>${road.density}%</strong></div>
              <div>🚦 Signal: <strong style="color: ${color}">${road.signalState.toUpperCase()}</strong></div>
            </div>
          </div>
        `);
      }
    });
  }

  function updateStats(summary) {
    animateValue('stat-vehicles', summary.totalVehicles);
    animateValue('stat-speed', summary.avgSpeed, ' km/h');
    updateCongestionLevel(summary.congestionLevel, summary.statusColor);
    animateValue('stat-intersections', summary.activeIntersections);
  }

  function animateValue(id, value, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = typeof value === 'number' ? value.toLocaleString() + suffix : value;
  }

  function updateCongestionLevel(level, color) {
    const el = document.getElementById('stat-congestion');
    if (!el) return;
    el.textContent = level;
    el.className = `stat-value ${color}`;
  }

  function updateSignalPanel(roads) {
    const list = document.getElementById('signal-list');
    if (!list) return;

    list.innerHTML = roads.map(road => `
      <div class="signal-item">
        <div class="signal-light ${road.signalState}"></div>
        <div class="signal-info">
          <div class="name">${road.name}</div>
          <div class="detail">${road.vehicleCount} vehicles • ${road.speed} km/h</div>
        </div>
        <div class="signal-timer" style="color: var(--color-${road.signalState === 'amber' ? 'amber' : road.signalState}-dark)">${road.greenDuration}s</div>
      </div>
    `).join('');
  }

  function updateRecommendations(roads) {
    const container = document.getElementById('recommendations-grid');
    if (!container) return;

    const heavyRoads = roads.filter(r => r.level === 'Heavy');
    const moderateRoads = roads.filter(r => r.level === 'Moderate');

    const recs = [];

    if (heavyRoads.length > 0) {
      recs.push({
        priority: 'high',
        icon: '🚨',
        iconBg: 'var(--color-red-light)',
        title: 'High Congestion Alert',
        desc: `${heavyRoads.map(r => r.name).join(', ')} ${heavyRoads.length > 1 ? 'are' : 'is'} experiencing heavy traffic. Green signal extended to ${heavyRoads[0].greenDuration}s.`
      });
    }

    if (moderateRoads.length > 0) {
      recs.push({
        priority: 'medium',
        icon: '⚡',
        iconBg: 'var(--color-amber-light)',
        title: 'Signal Optimization',
        desc: `AI recommends adjusting signal timing for ${moderateRoads.length} intersection${moderateRoads.length > 1 ? 's' : ''} with moderate traffic.`
      });
    }

    const lowCount = roads.filter(r => r.level === 'Low').length;
    if (lowCount > 0) {
      recs.push({
        priority: 'low',
        icon: '✅',
        iconBg: 'var(--color-green-light)',
        title: 'Smooth Flow',
        desc: `${lowCount} intersection${lowCount > 1 ? 's' : ''} running smoothly with low traffic. Signal duration reduced for efficiency.`
      });
    }

    container.innerHTML = recs.map(rec => `
      <div class="rec-card priority-${rec.priority}">
        <div class="rec-card-header">
          <div class="rec-icon" style="background: ${rec.iconBg}">
            <span style="font-size: 20px;">${rec.icon}</span>
          </div>
          <h4>${rec.title}</h4>
        </div>
        <p>${rec.desc}</p>
      </div>
    `).join('');
  }

  return { initMap, updateMapMarkers, updateStats, updateSignalPanel, updateRecommendations };
})();
