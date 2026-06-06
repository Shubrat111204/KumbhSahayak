/**
 * KumbhSahayak - Smart Volunteer Deployment & Workforce Optimization
 * JavaScript Dashboard State & Simulation Engine
 */

// Global Dashboard State
const state = {
  volunteers: [],
  incidents: [],
  selectedIncidentId: null,
  activeTransits: [], // { volId, incId, startX, startY, currentX, currentY, targetX, targetY, speed }
  melaTime: new Date(),
  alertLevel: 'NORMAL',
  // Sector coordinates within the SVG viewBox="0 0 1000 700"
  sectors: {
    "Sector 1 (Sangam Confluence)": { x: 860, y: 435, name: "Sangam", density: "high" },
    "Sector 2 (Sangam Ghat East)": { x: 860, y: 340, name: "Ghat East", density: "medium" },
    "Sector 3 (Qila Ghat)": { x: 610, y: 410, name: "Qila Ghat", density: "low" },
    "Sector 4 (Railway Transit Hub)": { x: 160, y: 145, name: "Railway Hub", density: "medium" },
    "Sector 5 (Central Pilgrim Camp)": { x: 380, y: 250, name: "Pilgrim Camp", density: "high" },
    "Sector 6 (Pontoon Bridge North)": { x: 500, y: 130, name: "Bridge N", density: "low" },
    "Sector 7 (Pontoon Bridge South)": { x: 730, y: 270, name: "Bridge S", density: "medium" },
    "Sector 8 (Akshayavat Temple Area)": { x: 230, y: 540, name: "Temple Area", density: "low" }
  }
};

// Initial Seed Data (Volunteers)
const initialVolunteers = [
  { id: 1, name: "Shubham Kumar", skill: "Medical First Aid", lang: "Hindi", sector: "Sector 5 (Central Pilgrim Camp)", status: "Standby", phone: "+91 98765 43210" },
  { id: 2, name: "Rajesh Y.", skill: "Crowd Management", lang: "Telugu", sector: "Sector 4 (Railway Transit Hub)", status: "Standby", phone: "+91 94401 23456" },
  { id: 3, name: "Ananya Sen", skill: "Information & Lost/Found", lang: "Bengali", sector: "Sector 2 (Sangam Ghat East)", status: "Standby", phone: "+91 90012 34567" },
  { id: 4, name: "Priya Pillai", skill: "Medical First Aid", lang: "Tamil", sector: "Sector 1 (Sangam Confluence)", status: "Standby", phone: "+91 98840 98765" },
  { id: 5, name: "Amit Sharma", skill: "Emergency Response", lang: "Hindi", sector: "Sector 3 (Qila Ghat)", status: "Standby", phone: "+91 81234 56789" },
  { id: 6, name: "Suresh Gowda", skill: "Crowd Management", lang: "Kannada", sector: "Sector 6 (Pontoon Bridge North)", status: "Standby", phone: "+91 99000 88877" },
  { id: 7, name: "Neelam Mishra", skill: "Information & Lost/Found", lang: "Hindi", sector: "Sector 5 (Central Pilgrim Camp)", status: "Standby", phone: "+91 78901 23456" },
  { id: 8, name: "Vikram Reddy", skill: "Emergency Response", lang: "Telugu", sector: "Sector 7 (Pontoon Bridge South)", status: "Standby", phone: "+91 90520 11223" },
  { id: 9, name: "Sunita Patel", skill: "Medical First Aid", lang: "Hindi", sector: "Sector 8 (Akshayavat Temple Area)", status: "Standby", phone: "+91 95555 44433" },
  { id: 10, name: "K. R. Narayanan", skill: "Crowd Management", lang: "Tamil", sector: "Sector 4 (Railway Transit Hub)", status: "Standby", phone: "+91 97777 66655" },
  { id: 11, name: "Prashant Bose", skill: "Emergency Response", lang: "Bengali", sector: "Sector 1 (Sangam Confluence)", status: "Standby", phone: "+91 88888 99999" },
  { id: 12, name: "Harish Rao", skill: "Information & Lost/Found", lang: "Telugu", sector: "Sector 7 (Pontoon Bridge South)", status: "Standby", phone: "+91 91234 56789" }
];

// Helper: Add coordinate jitter so markers don't overlap perfectly at center of sector
function getSectorCoordinates(sectorName) {
  const base = state.sectors[sectorName];
  if (!base) return { x: 100, y: 100 };
  return {
    x: base.x + (Math.random() * 30 - 15),
    y: base.y + (Math.random() * 30 - 15)
  };
}

// Initializing state coordinates
function initData() {
  state.volunteers = initialVolunteers.map(v => {
    const coords = getSectorCoordinates(v.sector);
    return {
      ...v,
      x: coords.x,
      y: coords.y,
      homeSector: v.sector
    };
  });
}

// Comm Log Helper
function logComms(type, text) {
  const commsLog = document.getElementById('comms-log');
  if (!commsLog) return;
  
  const timeStr = state.melaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const item = document.createElement('div');
  item.className = `log-item ${type}`;
  item.innerHTML = `<span class="log-time">[${timeStr}]</span> ${text}`;
  
  commsLog.appendChild(item);
  commsLog.scrollTop = commsLog.scrollHeight;
}

// Update Top Metrics UI
function updateMetrics() {
  const totalForce = state.volunteers.length;
  const activeMissions = state.volunteers.filter(v => v.status === 'Responding').length;
  const unresolvedAlerts = state.incidents.filter(i => i.status === 'Critical' || i.status === 'High' || i.status === 'Medium' || i.status === 'Low').length;

  document.getElementById('stat-total-volunteers').innerText = totalForce;
  document.getElementById('stat-active-missions').innerText = activeMissions;
  document.getElementById('stat-unresolved-incidents').innerText = unresolvedAlerts;
  document.getElementById('alert-feed-count').innerText = unresolvedAlerts;

  // Dynamically set Global Alert level
  let level = 'NORMAL';
  let levelClass = 'text-green-glow';
  
  const criticals = state.incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const highs = state.incidents.filter(i => i.severity === 'High' && i.status !== 'Resolved').length;
  
  if (criticals > 0) {
    level = 'CRITICAL ALERT';
    levelClass = 'text-red';
  } else if (highs > 1) {
    level = 'HIGH WORKLOAD';
    levelClass = 'text-orange';
  }
  
  const alertEl = document.getElementById('stat-alert-level');
  alertEl.innerText = level;
  alertEl.className = `stat-value ${levelClass}`;
}

// -------------------------------------------------------------
// RENDER INTERACTIVE SVG MAP MARKERS
// -------------------------------------------------------------
function renderMap() {
  const incidentsLayer = document.getElementById('map-incidents-layer');
  const volunteersLayer = document.getElementById('map-volunteers-layer');
  const routesLayer = document.getElementById('map-dispatch-routes');
  
  if (!incidentsLayer || !volunteersLayer || !routesLayer) return;

  // Clear layers
  incidentsLayer.innerHTML = '';
  volunteersLayer.innerHTML = '';
  routesLayer.innerHTML = '';

  // Draw Route lines
  state.activeTransits.forEach(transit => {
    const route = document.createElementNS("http://www.w3.org/2000/svg", "line");
    route.setAttribute("x1", transit.startX);
    route.setAttribute("y1", transit.startY);
    route.setAttribute("x2", transit.targetX);
    route.setAttribute("y2", transit.targetY);
    route.setAttribute("stroke", "var(--saffron)");
    route.setAttribute("stroke-width", "2");
    route.setAttribute("stroke-opacity", "0.5");
    route.setAttribute("class", "dispatch-route-line");
    routesLayer.appendChild(route);
  });

  // Draw Incidents
  state.incidents.forEach(inc => {
    if (inc.status === 'Resolved') return;

    // Pulse outer ring
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", inc.x);
    ring.setAttribute("cy", inc.y);
    ring.setAttribute("r", "12");
    
    let color = "var(--red)";
    if (inc.severity === "High") color = "#fb923c";
    else if (inc.severity === "Medium") color = "var(--amber)";
    else if (inc.severity === "Low") color = "var(--cyan)";

    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", color);
    ring.setAttribute("class", "inc-glow-ring");
    
    // Core incident dot
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", inc.x);
    dot.setAttribute("cy", inc.y);
    dot.setAttribute("r", inc.status === 'Responding' ? "6" : "8");
    dot.setAttribute("fill", inc.status === 'Responding' ? "var(--saffron)" : color);
    dot.setAttribute("stroke", "#ffffff");
    dot.setAttribute("stroke-width", "1.5");
    dot.setAttribute("class", "svg-inc-marker");
    
    // Group and add event listener
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.appendChild(ring);
    group.appendChild(dot);
    
    group.addEventListener('click', () => {
      selectIncident(inc.id);
    });

    incidentsLayer.appendChild(group);
  });

  // Draw Volunteers
  state.volunteers.forEach(vol => {
    const volCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    volCircle.setAttribute("cx", vol.x);
    volCircle.setAttribute("cy", vol.y);
    volCircle.setAttribute("r", "7");
    
    let color = "var(--emerald)";
    if (vol.status === "Responding") {
      color = "var(--saffron)";
    }
    volCircle.setAttribute("fill", color);
    volCircle.setAttribute("stroke", "#070814");
    volCircle.setAttribute("stroke-width", "1.5");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", vol.x);
    text.setAttribute("y", vol.y - 10);
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", "9px");
    text.setAttribute("font-family", "var(--font-headings)");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-weight", "bold");
    
    // Simple initials
    const initials = vol.name.split(' ').map(n => n[0]).join('');
    text.textContent = initials;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "svg-vol-marker");
    group.appendChild(volCircle);
    group.appendChild(text);

    // Tooltip trigger
    group.addEventListener('mouseenter', (e) => {
      const overlay = document.getElementById('map-sector-details');
      overlay.querySelector('h4').innerText = vol.name;
      overlay.querySelector('#overlay-sector-density').innerText = vol.status;
      overlay.querySelector('#overlay-sector-density').className = `badge ${vol.status === 'Standby' ? 'badge-emerald' : 'badge-orange'}`;
      overlay.querySelector('#overlay-sector-volunteers').innerText = vol.skill;
      overlay.querySelector('#overlay-sector-incidents').innerText = vol.lang;
    });

    volunteersLayer.appendChild(group);
  });
}

// -------------------------------------------------------------
// SECTOR HOVER LOGIC ON MAP
// -------------------------------------------------------------
function initSectorHover() {
  const sectors = document.querySelectorAll('.sector-poly');
  const detailsCard = document.getElementById('map-sector-details');
  
  sectors.forEach(s => {
    s.addEventListener('mouseenter', () => {
      const id = s.getAttribute('data-id');
      const details = state.sectors[id];
      if (!details) return;

      // Highlight polygon
      s.classList.add('selected');

      // Count stats in this sector
      const vols = state.volunteers.filter(v => v.sector === id).length;
      const incs = state.incidents.filter(i => i.sector === id && i.status !== 'Resolved').length;

      document.getElementById('overlay-sector-name').innerText = details.name;
      const densityBadge = document.getElementById('overlay-sector-density');
      densityBadge.innerText = s.getAttribute('data-density').toUpperCase();
      
      let badgeClass = 'badge-emerald';
      if (details.density === 'high') badgeClass = 'badge-red';
      else if (details.density === 'medium') badgeClass = 'badge-amber';
      densityBadge.className = `badge ${badgeClass}`;

      document.getElementById('overlay-sector-volunteers').innerText = vols;
      document.getElementById('overlay-sector-incidents').innerText = incs;
    });

    s.addEventListener('mouseleave', () => {
      s.classList.remove('selected');
    });
  });
}

// -------------------------------------------------------------
// RENDER LIST OF INCIDENTS (ALERT FEED)
// -------------------------------------------------------------
function renderIncidentsFeed() {
  const container = document.getElementById('incidents-feed-container');
  if (!container) return;

  const activeIncs = state.incidents.filter(i => i.status !== 'Resolved');

  if (activeIncs.length === 0) {
    container.innerHTML = `
      <div class="feed-empty-state">
        <i class="fa-solid fa-circle-check text-emerald"></i>
        <p>All sectors secured. No open alerts.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';
  activeIncs.forEach(inc => {
    const card = document.createElement('div');
    card.className = `incident-card ${state.selectedIncidentId === inc.id ? 'active-match' : ''}`;
    card.setAttribute('data-severity', inc.severity);
    card.setAttribute('data-status', inc.status);
    
    let sevBadge = `badge-amber`;
    if (inc.severity === 'Critical') sevBadge = 'badge-red';
    else if (inc.severity === 'High') sevBadge = 'badge-orange';
    else if (inc.severity === 'Low') sevBadge = 'badge-cyan';

    const statusBadge = inc.status === 'Responding' ? `<span class="badge badge-orange">Responding</span>` : ``;

    card.innerHTML = `
      <div class="inc-card-header">
        <span class="badge ${sevBadge}">${inc.severity}</span>
        ${statusBadge}
        <span class="inc-card-meta"><i class="fa-solid fa-location-dot"></i> ${state.sectors[inc.sector].name}</span>
      </div>
      <div class="inc-card-title">${inc.category}</div>
      <div class="inc-card-desc">${inc.desc}</div>
      <div class="inc-card-footer">
        <span class="inc-card-meta"><i class="fa-solid fa-language"></i> Lang: ${inc.lang || 'Hindi'}</span>
        <span style="font-size: 10px; color: var(--saffron); font-weight: bold;">
          ${state.selectedIncidentId === inc.id ? 'Analyzing Match...' : 'Click to Match'}
        </span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectIncident(inc.id);
    });

    container.appendChild(card);
  });
}

// -------------------------------------------------------------
// VOLUNTEER DIRECTORY FILTERING & RENDER
// -------------------------------------------------------------
function renderDirectory() {
  const container = document.getElementById('volunteers-grid-container');
  if (!container) return;

  const searchQuery = document.getElementById('dir-search').value.toLowerCase();
  const filterStatus = document.getElementById('dir-filter-status').value;
  const filterSkill = document.getElementById('dir-filter-skill').value;

  const filtered = state.volunteers.filter(vol => {
    // Search filter
    const matchesSearch = vol.name.toLowerCase().includes(searchQuery) || 
                          vol.skill.toLowerCase().includes(searchQuery) ||
                          vol.lang.toLowerCase().includes(searchQuery);
    
    // Status filter
    const matchesStatus = filterStatus === 'All' || vol.status === filterStatus;

    // Skill filter
    const matchesSkill = filterSkill === 'All' || vol.skill === filterSkill;

    return matchesSearch && matchesStatus && matchesSkill;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No volunteers match filters.</p>`;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(vol => {
    const card = document.createElement('div');
    card.className = 'vol-card';
    card.setAttribute('data-status', vol.status);

    const initials = vol.name.split(' ').map(n => n[0]).join('');
    
    card.innerHTML = `
      <div class="vol-avatar">${initials}</div>
      <div class="vol-info">
        <div class="vol-info-header">
          <h4>${vol.name}</h4>
          <span class="badge ${vol.status === 'Standby' ? 'badge-emerald' : 'badge-orange'}">${vol.status}</span>
        </div>
        <div class="vol-details">
          <span><i class="fa-solid fa-location-dot"></i> ${state.sectors[vol.sector].name}</span> | 
          <span><i class="fa-solid fa-language"></i> ${vol.lang}</span>
        </div>
        <div class="vol-tags">
          <span class="vol-tag-skill">${vol.skill}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------
// AI MATCHING RECOMMENDATION ENGINE
// -------------------------------------------------------------
function selectIncident(incId) {
  state.selectedIncidentId = incId;
  renderIncidentsFeed();

  const activePanel = document.getElementById('console-active-panel');
  const placeholder = document.querySelector('.console-placeholder');
  
  if (!activePanel || !placeholder) return;

  const inc = state.incidents.find(i => i.id === incId);
  if (!inc || inc.status === 'Resolved') {
    state.selectedIncidentId = null;
    activePanel.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return;
  }

  // Show Active Console
  placeholder.classList.add('hidden');
  activePanel.classList.remove('hidden');

  // Set Incident Details in Console
  document.getElementById('console-inc-title').innerText = inc.category;
  document.getElementById('console-inc-desc').innerText = inc.desc;
  document.getElementById('console-inc-sector').innerText = state.sectors[inc.sector].name;
  document.getElementById('console-inc-lang').innerText = `Language Required: ${inc.lang || 'Hindi'}`;
  
  const sevEl = document.getElementById('console-inc-severity');
  sevEl.innerText = inc.severity;
  sevEl.className = `badge ${inc.severity === 'Critical' ? 'badge-red' : inc.severity === 'High' ? 'badge-orange' : 'badge-amber'}`;

  // Calculate Scores for Standby Volunteers
  const recommendations = calculateRecommendations(inc);

  // Render Match Cards
  const cardsContainer = document.getElementById('match-cards-list');
  cardsContainer.innerHTML = '';

  if (recommendations.length === 0) {
    cardsContainer.innerHTML = `<p style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 10px;">No available volunteers on standby.</p>`;
    return;
  }

  recommendations.slice(0, 3).forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
      <div class="match-score-radial">
        <span class="score-text">${match.score}%</span>
      </div>
      <div class="match-info-box">
        <div class="match-name-row">
          <h5>${match.vol.name}</h5>
          <span class="badge badge-emerald" style="font-size:8px;">${match.vol.lang}</span>
        </div>
        <div class="match-details-row">
          <span class="match-factor-badge">Dist: ${Math.round(match.distance)}m</span>
          <span class="match-factor-badge">${match.skillMatch ? 'Skill Match' : 'Auxiliary Match'}</span>
          <span class="match-factor-badge">Sect: ${state.sectors[match.vol.sector].name}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-deploy" data-vol-id="${match.vol.id}">Deploy</button>
    `;

    // Hook Deploy Button Click
    card.querySelector('.btn-deploy').addEventListener('click', () => {
      deployVolunteer(match.vol.id, inc.id);
    });

    cardsContainer.appendChild(card);
  });
}

// AI Matching Scoring Logic
function calculateRecommendations(incident) {
  const standbyVols = state.volunteers.filter(v => v.status === 'Standby');
  const scored = standbyVols.map(vol => {
    let score = 0;
    
    // 1. Proximity score (Max 40 points)
    // Compute pixel distance in SVG viewport
    const dx = vol.x - incident.x;
    const dy = vol.y - incident.y;
    const pixelDist = Math.sqrt(dx*dx + dy*dy);
    // Let's translate pixel distance to mock meters: e.g. 1 pixel = 1.5 meters
    const mockMeters = pixelDist * 1.5;
    
    // Scale points: 0 meters = 40 pts, 1000+ meters = 5 pts
    const distancePoints = Math.max(5, 40 - (mockMeters / 30));
    score += distancePoints;

    // 2. Skill Alignment score (Max 40 points)
    let skillMatch = false;
    if (vol.skill === incident.category) {
      score += 40;
      skillMatch = true;
    } else if (
      (incident.category === 'Medical First Aid' && vol.skill === 'Emergency Response') ||
      (incident.category === 'Emergency Response' && vol.skill === 'Crowd Management')
    ) {
      score += 25; // partial matching compatibility
    } else {
      score += 10;
    }

    // 3. Language compatibility score (Max 20 points)
    let langPoints = 0;
    if (!incident.lang || incident.lang === 'None' || incident.lang === vol.lang) {
      langPoints = 20;
    } else if (vol.lang === 'Hindi') {
      langPoints = 12; // Hindi is standard lingua franca
    } else {
      langPoints = 5;
    }
    score += langPoints;

    // Standardize score as a percentage rounded
    const finalPercent = Math.round(score);

    return {
      vol,
      score: finalPercent,
      distance: mockMeters,
      skillMatch
    };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score);
}

// -------------------------------------------------------------
// VOLUNTEER DISPATCH DEPLOYMENT SIMULATION
// -------------------------------------------------------------
function deployVolunteer(volId, incId) {
  const vol = state.volunteers.find(v => v.id === volId);
  const inc = state.incidents.find(i => i.id === incId);
  
  if (!vol || !inc) return;

  // Audio mock trigger
  const audio = document.getElementById('alert-sfx');
  if (audio) {
    audio.play().catch(() => {}); // prevent browser audio restrictions crashes
  }

  // Update Statuses
  vol.status = 'Responding';
  inc.status = 'Responding';
  
  // Create Animation path
  state.activeTransits.push({
    volId: vol.id,
    incId: inc.id,
    startX: vol.x,
    startY: vol.y,
    currentX: vol.x,
    currentY: vol.y,
    targetX: inc.x,
    targetY: inc.y,
    speed: 0.012 // speed increment ratio per tick
  });

  logComms('action', `AI Dispatch: Routing <strong>${vol.name}</strong> to <strong>${state.sectors[inc.sector].name}</strong> for ${inc.category} [Severity: ${inc.severity}].`);
  
  // Close Dispatch Console Panel
  state.selectedIncidentId = null;
  document.getElementById('console-active-panel').classList.add('hidden');
  document.querySelector('.console-placeholder').classList.remove('hidden');

  // Trigger Phone SMS Broadcast Log
  setTimeout(() => {
    logComms('system', `<i class="fa-solid fa-mobile-screen"></i> SMS sent to ${vol.name} (${vol.phone}): "Kumbh Alert: Dispatch to ${state.sectors[inc.sector].name} immediately. Responding to incident code ${inc.id}."`);
  }, 1000);

  renderIncidentsFeed();
  renderDirectory();
  renderMap();
  updateMetrics();
}

// -------------------------------------------------------------
// SIMULATOR HANDLERS
// -------------------------------------------------------------
function triggerIncidentPreset(type) {
  let category = '';
  let sectorList = Object.keys(state.sectors);
  let sector = '';
  let severity = 'Medium';
  let desc = '';
  let lang = 'Hindi';

  switch (type) {
    case 'medical':
      category = 'Medical First Aid';
      sector = sectorList[Math.floor(Math.random() * sectorList.length)];
      severity = Math.random() > 0.5 ? 'High' : 'Medium';
      desc = "Pilgrim reporting symptoms of severe dehydration/heat exhaustion near water kiosks.";
      lang = Math.random() > 0.6 ? 'Telugu' : 'Hindi';
      break;
    case 'crowd':
      category = 'Crowd Management';
      sector = "Sector 1 (Sangam Confluence)";
      severity = 'Critical';
      desc = "Heavy queue compression detected near main bathing ghat barrier gates.";
      lang = 'Hindi';
      
      // Trigger Broadcast Overlay Banner too
      document.getElementById('alert-broadcast-overlay').classList.remove('hidden');
      setTimeout(() => {
        document.getElementById('alert-broadcast-overlay').classList.add('hidden');
      }, 7000);
      break;
    case 'translator':
      category = 'Information & Lost/Found';
      sector = "Sector 4 (Railway Transit Hub)";
      severity = 'Low';
      desc = "Group of arriving pilgrims from South India require linguistic navigation support.";
      lang = Math.random() > 0.5 ? 'Tamil' : 'Telugu';
      break;
    case 'lost':
      category = 'Information & Lost/Found';
      sector = "Sector 5 (Central Pilgrim Camp)";
      severity = 'High';
      desc = "A 6-year-old child separated from family near Sector 5 main gate. Wearing yellow vest.";
      lang = 'Hindi';
      break;
  }

  createIncident(category, sector, severity, lang, desc);
}

function createIncident(category, sector, severity, lang, desc) {
  const id = state.incidents.length + 1;
  const coords = getSectorCoordinates(sector);
  
  const newInc = {
    id,
    category,
    sector,
    severity,
    lang,
    desc,
    status: 'Open',
    x: coords.x,
    y: coords.y
  };

  state.incidents.push(newInc);
  logComms('alert', `<strong class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> TACTICAL ALERT:</strong> New ${severity} Incident reported in <strong>${state.sectors[sector].name}</strong>: ${desc}`);
  
  renderIncidentsFeed();
  renderMap();
  updateMetrics();
}

// -------------------------------------------------------------
// TICK ANIMATION LOOP (Runs at 30fps)
// -------------------------------------------------------------
function simulationTick() {
  // Update Clock
  state.melaTime.setSeconds(state.melaTime.getSeconds() + 15); // simulate speeded up clock
  document.getElementById('mela-time-string').innerText = state.melaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Update Transits
  for (let i = state.activeTransits.length - 1; i >= 0; i--) {
    const transit = state.activeTransits[i];
    const vol = state.volunteers.find(v => v.id === transit.volId);
    const inc = state.incidents.find(inc => inc.id === transit.incId);

    // Vector math interpolation
    const dx = transit.targetX - transit.currentX;
    const dy = transit.targetY - transit.currentY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 4) {
      // Reached Target
      vol.x = transit.targetX;
      vol.y = transit.targetY;
      vol.sector = inc.sector; // Update current volunteer sector assignment

      logComms('info', `<i class="fa-solid fa-check-circle"></i> Destination Reached: <strong>${vol.name}</strong> arrived at site in <strong>${state.sectors[inc.sector].name}</strong>. Handling Incident.`);
      
      // Remove Transit
      state.activeTransits.splice(i, 1);

      // Simulate incident resolution time (4 seconds)
      resolveIncidentSimulated(vol, inc);
    } else {
      // Interpolate coordinate step
      vol.x += dx * transit.speed;
      vol.y += dy * transit.speed;
      transit.currentX = vol.x;
      transit.currentY = vol.y;
    }
  }

  // Draw Map Updates
  renderMap();
}

function resolveIncidentSimulated(vol, inc) {
  setTimeout(() => {
    inc.status = 'Resolved';
    vol.status = 'Standby';
    
    logComms('info', `<i class="fa-solid fa-square-check text-emerald"></i> Incident Resolved: ${inc.category} in <strong>${state.sectors[inc.sector].name}</strong> successfully mitigated by ${vol.name}.`);
    
    // Delete resolved incident from database to clean up memory
    // state.incidents = state.incidents.filter(i => i.id !== inc.id);

    renderIncidentsFeed();
    renderDirectory();
    renderMap();
    updateMetrics();
  }, 4000);
}

// -------------------------------------------------------------
// EVENT LISTENERS & SETUP
// -------------------------------------------------------------
function setupEventListeners() {
  // Tab Navigation toggles
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Simulator preset triggers
  document.querySelectorAll('.sim-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      triggerIncidentPreset(type);
    });
  });

  // New Incident Manual Form Handler
  document.getElementById('incident-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('inc-category').value;
    const sector = document.getElementById('inc-sector').value;
    const severity = document.getElementById('inc-severity').value;
    const lang = document.getElementById('inc-language').value;
    const desc = document.getElementById('inc-desc').value;

    createIncident(category, sector, severity, lang, desc);
    document.getElementById('incident-form').reset();
  });

  // Register New Volunteer Form Handler
  document.getElementById('volunteer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('vol-name').value;
    const skill = document.getElementById('vol-skill').value;
    const lang = document.getElementById('vol-lang').value;
    const sector = document.getElementById('vol-sector').value;

    const id = state.volunteers.length + 1;
    const coords = getSectorCoordinates(sector);
    const mockPhones = ["+91 91234 00000", "+91 99999 11111", "+91 88888 22222", "+91 77777 33333"];

    const newVol = {
      id,
      name,
      skill,
      lang,
      sector,
      status: 'Standby',
      phone: mockPhones[Math.floor(Math.random() * mockPhones.length)],
      x: coords.x,
      y: coords.y,
      homeSector: sector
    };

    state.volunteers.push(newVol);
    logComms('info', `<i class="fa-solid fa-user-plus text-cyan"></i> Registration: New volunteer <strong>${name}</strong> enrolled & deployed standby to <strong>${state.sectors[sector].name}</strong>.`);
    
    document.getElementById('volunteer-form').reset();
    renderDirectory();
    renderMap();
    updateMetrics();
  });

  // Volunteer Directory Search & Filter listeners
  document.getElementById('dir-search').addEventListener('input', renderDirectory);
  document.getElementById('dir-filter-status').addEventListener('change', renderDirectory);
  document.getElementById('dir-filter-skill').addEventListener('change', renderDirectory);
}

// -------------------------------------------------------------
// APP INITIALIZATION
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  // Initialize datasets
  initData();

  // Setup visual systems
  initSectorHover();
  setupEventListeners();

  // Initial renders
  renderMap();
  renderIncidentsFeed();
  renderDirectory();
  updateMetrics();

  // Start Simulation ticks (Runs every 100ms for smooth coordinate movement interpolation)
  setInterval(simulationTick, 100);

  // Trigger one default incident to showcase AI allocation engine instantly
  setTimeout(() => {
    createIncident(
      'Medical First Aid', 
      'Sector 6 (Pontoon Bridge North)', 
      'High', 
      'Telugu', 
      'A pilgrim complains of chest discomfort near sector bathing steps.'
    );
  }, 1000);
});
