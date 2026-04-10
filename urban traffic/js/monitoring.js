/* ===== Traffic Monitoring Module ===== */
const Monitoring = (() => {
  let speedChart = null;
  let densityChart = null;

  function initCharts() {
    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 6,
            padding: 16,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#1A202C',
          titleFont: { family: 'Inter', size: 13, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: { top: 10, bottom: 10, left: 14, right: 14 },
          cornerRadius: 8,
          displayColors: false
        }
      }
    };

    const historical = TrafficEngine.getHistorical();

    // Speed Trend Chart
    const speedCtx = document.getElementById('speedChart');
    if (speedCtx) {
      speedChart = new Chart(speedCtx, {
        type: 'line',
        data: {
          labels: historical.hours,
          datasets: [{
            label: 'Avg Speed (km/h)',
            data: historical.avgSpeeds,
            borderColor: '#3498DB',
            backgroundColor: 'rgba(52, 152, 219, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#3498DB',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2.5
          }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Inter', size: 11 }, color: '#A0AEC0' }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#F4F6F8', drawBorder: false },
              ticks: { font: { family: 'Inter', size: 11 }, color: '#A0AEC0' }
            }
          }
        }
      });
    }

    // Vehicle / Density Chart
    const densityCtx = document.getElementById('densityChart');
    if (densityCtx) {
      densityChart = new Chart(densityCtx, {
        type: 'bar',
        data: {
          labels: historical.hours,
          datasets: [{
            label: 'Vehicles',
            data: historical.vehicleCounts,
            backgroundColor: historical.vehicleCounts.map(v =>
              v >= 350 ? 'rgba(231, 76, 60, 0.7)' :
              v >= 250 ? 'rgba(243, 156, 18, 0.7)' :
              'rgba(46, 204, 113, 0.7)'
            ),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
          }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Inter', size: 11 }, color: '#A0AEC0' }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#F4F6F8', drawBorder: false },
              ticks: { font: { family: 'Inter', size: 11 }, color: '#A0AEC0' }
            }
          }
        }
      });
    }
  }

  function updateRoadCards(roads) {
    const grid = document.getElementById('road-status-grid');
    if (!grid) return;

    grid.innerHTML = roads.map(road => `
      <div class="road-card status-${road.statusColor}">
        <div class="road-card-header">
          <h4>${road.name}</h4>
          <span class="status-badge ${road.statusColor}">${road.level}</span>
        </div>
        <div class="road-card-stats">
          <div class="road-stat">
            <span class="label">Vehicles</span>
            <span class="value">${road.vehicleCount}</span>
          </div>
          <div class="road-stat">
            <span class="label">Speed</span>
            <span class="value">${road.speed} km/h</span>
          </div>
          <div class="road-stat">
            <span class="label">Density</span>
            <span class="value">${road.density}%</span>
          </div>
          <div class="road-stat">
            <span class="label">Green Time</span>
            <span class="value">${road.greenDuration}s</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function updateAlerts(roads) {
    const list = document.getElementById('alerts-list');
    if (!list) return;

    const alerts = [];
    roads.forEach(road => {
      if (road.level === 'Heavy') {
        alerts.push({
          type: 'critical',
          title: `${road.name} — Heavy congestion (${road.density}% density)`,
          time: 'Just now'
        });
      } else if (road.level === 'Moderate' && road.speed < 25) {
        alerts.push({
          type: 'warning',
          title: `${road.name} — Slow traffic (${road.speed} km/h)`,
          time: 'Just now'
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'All roads flowing smoothly — no alerts',
        time: 'Updated just now'
      });
    }

    list.innerHTML = alerts.slice(0, 5).map(alert => `
      <div class="alert-item">
        <div class="alert-dot ${alert.type}"></div>
        <div class="alert-content">
          <div class="title">${alert.title}</div>
          <div class="time">${alert.time}</div>
        </div>
      </div>
    `).join('');
  }

  return { initCharts, updateRoadCards, updateAlerts };
})();
