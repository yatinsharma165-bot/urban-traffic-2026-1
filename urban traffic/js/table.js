/* ===== Data Table Module ===== */
const DataTable = (() => {

  function render(roads) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    tbody.innerHTML = roads.map(road => {
      const actionType = road.suggestedAction.type;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:8px;height:8px;border-radius:50%;background:var(--color-${road.statusColor});"></div>
              <strong>${road.name}</strong>
            </div>
          </td>
          <td>${road.location}</td>
          <td><strong>${road.vehicleCount}</strong></td>
          <td>${road.speed} km/h</td>
          <td>${timeStr}</td>
          <td><span class="status-badge ${road.statusColor}">${road.level}</span></td>
          <td><strong>${road.greenDuration}s</strong></td>
          <td><span class="table-action-badge ${actionType}">${road.suggestedAction.text}</span></td>
        </tr>
      `;
    }).join('');
  }

  function initSearch() {
    const input = document.getElementById('table-search');
    if (!input) return;

    input.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#table-body tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  return { render, initSearch };
})();
