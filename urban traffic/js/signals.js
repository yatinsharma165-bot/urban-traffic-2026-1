/* ===== Smart Signals Module ===== */
const Signals = (() => {

  function updateTrafficLights(roads) {
    const container = document.getElementById('traffic-lights');
    if (!container) return;

    // Show first 4 roads as traffic light visuals
    const displayRoads = roads.slice(0, 4);

    container.innerHTML = displayRoads.map(road => {
      const isGreen = road.signalState === 'green';
      const isAmber = road.signalState === 'amber';
      const isRed = road.signalState === 'red';

      return `
        <div class="traffic-light-card">
          <div class="traffic-light-visual">
            <div class="light-bulb ${isRed ? 'red-on' : ''}"></div>
            <div class="light-bulb ${isAmber ? 'amber-on' : ''}"></div>
            <div class="light-bulb ${isGreen ? 'green-on' : ''}"></div>
          </div>
          <div class="road-name">${road.name}</div>
          <div class="signal-status">${road.vehicleCount} vehicles • ${road.density}% density</div>
          <div class="timer ${road.signalState}">${road.greenDuration}s</div>
        </div>
      `;
    }).join('');
  }

  function updateMetrics(summary) {
    // Before metrics (traditional system)
    const beforeData = {
      avgWait: '90s',
      throughput: '850 veh/hr',
      congestion: '68%',
      fuelWaste: 'High',
      emissions: '4.2 tons/day'
    };

    // After metrics (AI system) — dynamically calculated
    const afterData = {
      avgWait: Math.max(20, 90 - Math.round(summary.avgSpeed * 0.8)) + 's',
      throughput: (850 + Math.round(summary.avgSpeed * 15)).toLocaleString() + ' veh/hr',
      congestion: Math.max(15, summary.avgDensity - 20) + '%',
      fuelWaste: summary.avgDensity < 40 ? 'Low' : summary.avgDensity < 65 ? 'Medium' : 'Moderate',
      emissions: (4.2 - (summary.avgSpeed * 0.03)).toFixed(1) + ' tons/day'
    };

    // Calculate improvement
    const waitImprovement = Math.round((1 - parseInt(afterData.avgWait) / 90) * 100);

    const beforeEl = document.getElementById('metrics-before');
    const afterEl = document.getElementById('metrics-after');
    const improvementEl = document.getElementById('improvement-value');

    if (beforeEl) {
      beforeEl.innerHTML = `
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Traditional System
        </h4>
        <div class="metric-row"><span class="metric-label">Avg Wait Time</span><span class="metric-value">${beforeData.avgWait}</span></div>
        <div class="metric-row"><span class="metric-label">Throughput</span><span class="metric-value">${beforeData.throughput}</span></div>
        <div class="metric-row"><span class="metric-label">Congestion</span><span class="metric-value">${beforeData.congestion}</span></div>
        <div class="metric-row"><span class="metric-label">Fuel Waste</span><span class="metric-value">${beforeData.fuelWaste}</span></div>
        <div class="metric-row"><span class="metric-label">Emissions</span><span class="metric-value">${beforeData.emissions}</span></div>
      `;
    }

    if (afterEl) {
      afterEl.innerHTML = `
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          AI-Powered System
        </h4>
        <div class="metric-row"><span class="metric-label">Avg Wait Time</span><span class="metric-value" style="color: var(--color-green-dark)">${afterData.avgWait}</span></div>
        <div class="metric-row"><span class="metric-label">Throughput</span><span class="metric-value" style="color: var(--color-green-dark)">${afterData.throughput}</span></div>
        <div class="metric-row"><span class="metric-label">Congestion</span><span class="metric-value" style="color: var(--color-green-dark)">${afterData.congestion}</span></div>
        <div class="metric-row"><span class="metric-label">Fuel Waste</span><span class="metric-value" style="color: var(--color-green-dark)">${afterData.fuelWaste}</span></div>
        <div class="metric-row"><span class="metric-label">Emissions</span><span class="metric-value" style="color: var(--color-green-dark)">${afterData.emissions}</span></div>
      `;
    }

    if (improvementEl) {
      improvementEl.textContent = `${waitImprovement}% Better`;
    }
  }

  return { updateTrafficLights, updateMetrics };
})();
