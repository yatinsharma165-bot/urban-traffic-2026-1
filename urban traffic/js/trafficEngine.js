/* ===== Simulated Traffic Data Engine ===== */

const TrafficEngine = (() => {
  // Road / intersection data
  const roads = [
    { id: 1, name: 'MG Road Junction',       location: 'Central Zone',   lat: 12.9716, lng: 77.5946 },
    { id: 2, name: 'Ring Road Flyover',       location: 'North Zone',     lat: 12.9850, lng: 77.5700 },
    { id: 3, name: 'Station Square',          location: 'East Zone',      lat: 12.9780, lng: 77.6100 },
    { id: 4, name: 'Tech Park Crossing',      location: 'South Zone',     lat: 12.9600, lng: 77.6400 },
    { id: 5, name: 'Market Road',             location: 'Central Zone',   lat: 12.9700, lng: 77.5800 },
    { id: 6, name: 'University Avenue',       location: 'West Zone',      lat: 12.9550, lng: 77.5500 },
    { id: 7, name: 'Hospital Road',           location: 'North Zone',     lat: 12.9900, lng: 77.5850 },
    { id: 8, name: 'Industrial Area Gate',    location: 'East Zone',      lat: 12.9650, lng: 77.6200 },
  ];

  // Current state for each road
  let roadStates = [];
  let listeners = [];
  let updateInterval = null;

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getCurrentTimeSlot() {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 10) return 'Morning Rush';
    if (hour >= 10 && hour < 12) return 'Late Morning';
    if (hour >= 12 && hour < 14) return 'Lunch Hour';
    if (hour >= 14 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 20) return 'Evening Rush';
    if (hour >= 20 && hour < 23) return 'Night';
    return 'Late Night';
  }

  function getTrafficLevel(density) {
    if (density >= 75) return 'Heavy';
    if (density >= 40) return 'Moderate';
    return 'Low';
  }

  function getStatusColor(level) {
    if (level === 'Heavy') return 'red';
    if (level === 'Moderate') return 'amber';
    return 'green';
  }

  function calculateGreenDuration(density) {
    // Adaptive signal: high traffic → more green time
    if (density >= 80) return 90;
    if (density >= 60) return 75;
    if (density >= 40) return 60;
    if (density >= 20) return 45;
    return 30;
  }

  function getSuggestedAction(density, speed) {
    if (density >= 80) return { text: 'Extend Green', type: 'alert' };
    if (density >= 60) return { text: 'Optimize Signal', type: 'optimize' };
    if (density >= 40 && speed < 25) return { text: 'Monitor Speed', type: 'optimize' };
    return { text: 'Maintain', type: 'maintain' };
  }

  function getSignalState(road) {
    if (road.density >= 70) return 'green';  // high traffic gets green
    if (road.density >= 40) return 'amber';
    return 'red'; // low traffic can wait
  }

  function getPredictedCongestion(density, timeSlot) {
    let prediction = density;
    if (timeSlot === 'Morning Rush' || timeSlot === 'Evening Rush') prediction += 10;
    if (timeSlot === 'Late Night') prediction -= 20;
    return Math.max(0, Math.min(100, prediction));
  }

  function generateRoadState(road) {
    const vehicleCount = randomBetween(20, 350);
    const speed = randomBetween(8, 65);
    const density = Math.min(100, Math.round((vehicleCount / 350) * 100));
    const timeSlot = getCurrentTimeSlot();
    const level = getTrafficLevel(density);
    const greenDuration = calculateGreenDuration(density);

    return {
      ...road,
      vehicleCount,
      speed,
      density,
      timeSlot,
      level,
      statusColor: getStatusColor(level),
      signalState: getSignalState({ density }),
      greenDuration,
      suggestedAction: getSuggestedAction(density, speed),
      predictedCongestion: getPredictedCongestion(density, timeSlot),
      timestamp: new Date(),
    };
  }

  function smoothUpdate(prevState, newState) {
    // Smooth transitions — don't jump too far
    const maxVehicleChange = 40;
    const maxSpeedChange = 10;
    let vehicleCount = prevState.vehicleCount + randomBetween(-maxVehicleChange, maxVehicleChange);
    vehicleCount = Math.max(10, Math.min(400, vehicleCount));

    let speed = prevState.speed + randomBetween(-maxSpeedChange, maxSpeedChange);
    speed = Math.max(5, Math.min(70, speed));

    const density = Math.min(100, Math.round((vehicleCount / 350) * 100));
    const timeSlot = getCurrentTimeSlot();
    const level = getTrafficLevel(density);

    return {
      ...prevState,
      vehicleCount,
      speed,
      density,
      timeSlot,
      level,
      statusColor: getStatusColor(level),
      signalState: getSignalState({ density }),
      greenDuration: calculateGreenDuration(density),
      suggestedAction: getSuggestedAction(density, speed),
      predictedCongestion: getPredictedCongestion(density, timeSlot),
      timestamp: new Date(),
    };
  }

  function init() {
    roadStates = roads.map(generateRoadState);
    notifyListeners();
  }

  function update() {
    roadStates = roadStates.map(state => smoothUpdate(state, null));
    notifyListeners();
  }

  function start(intervalMs = 3000) {
    init();
    updateInterval = setInterval(update, intervalMs);
  }

  function stop() {
    if (updateInterval) clearInterval(updateInterval);
  }

  function subscribe(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  }

  function notifyListeners() {
    const data = getSnapshot();
    listeners.forEach(cb => cb(data));
  }

  function getSnapshot() {
    const totalVehicles = roadStates.reduce((sum, r) => sum + r.vehicleCount, 0);
    const avgSpeed = Math.round(roadStates.reduce((sum, r) => sum + r.speed, 0) / roadStates.length);
    const avgDensity = Math.round(roadStates.reduce((sum, r) => sum + r.density, 0) / roadStates.length);
    const congestionLevel = getTrafficLevel(avgDensity);
    const activeIntersections = roadStates.length;
    const heavyRoads = roadStates.filter(r => r.level === 'Heavy').length;

    return {
      roads: [...roadStates],
      summary: {
        totalVehicles,
        avgSpeed,
        avgDensity,
        congestionLevel,
        activeIntersections,
        heavyRoads,
        statusColor: getStatusColor(congestionLevel),
        timeSlot: getCurrentTimeSlot(),
      }
    };
  }

  function getHistorical() {
    // Simulated historical data for charts
    const hours = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
                   '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];

    const vehicleCounts = [120, 280, 380, 420, 310, 250, 290, 260, 230, 270, 320, 390, 410, 350, 200];
    const avgSpeeds =     [52,  32,  18,  15,  28,  35,  30,  33,  38,  34,  26,  20,  16,  25,  42];

    return { hours, vehicleCounts, avgSpeeds };
  }

  return { start, stop, subscribe, getSnapshot, getHistorical };
})();
