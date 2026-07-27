const navigationItems = [
  ['dashboard', 'Tableau de bord'],
  ['meetings', 'Réunions'],
  ['assignments', 'Affectations'],
  ['talks', 'Sujets'],
  ['territories', 'Territoires'],
  ['documents', 'Documents'],
  ['announcements', 'Annonces'],
  ['users', 'Utilisateurs'],
  ['settings', 'Paramètres'],
];

const data = {
  meetings: [
    { date: '2026-08-02', type: 'Réunion publique', note: 'Accueil renforcé pour les invités', assignments: ['Président', 'Son', 'Accueil'] },
    { date: '2026-08-06', type: 'Vie et ministère', note: 'Répétitions élèves à confirmer', assignments: ['Lecteur', 'Micros', 'Vidéo'] },
    { date: '2026-08-09', type: 'Réunion publique', note: 'Discours spécial', assignments: ['Président', 'Prière'] },
  ],
  assignments: [
    { person: 'Marc D.', role: 'Son', date: '2026-08-02', status: 'Confirmé' },
    { person: 'Sophie L.', role: 'Accueil', date: '2026-08-02', status: 'Confirmé' },
    { person: 'Nicolas B.', role: 'Lecteur', date: '2026-08-06', status: 'À confirmer' },
  ],
  announcements: [
    { title: 'Changement d’horaire', message: 'La réunion du jeudi commencera à 19h15 cette semaine.', priority: 'Important' },
    { title: 'Nettoyage de la salle', message: 'Le groupe 2 est responsable du nettoyage samedi matin.', priority: 'Info' },
  ],
  documents: [
    { title: 'Planning mensuel', category: 'réunions', size: '240 Ko' },
    { title: 'Carte territoire 14', category: 'territoires', size: '1,2 Mo' },
    { title: 'Annonce assemblée', category: 'assemblées', size: '380 Ko' },
  ],
  territories: [
    { number: 'T-14', description: 'Centre-ville nord', status: 'attribué', owner: 'Groupe 1' },
    { number: 'T-22', description: 'Quartier gare', status: 'disponible', owner: 'Non attribué' },
    { number: 'T-31', description: 'Zone résidentielle est', status: 'en cours', owner: 'Groupe 3' },
  ],
  roles: [
    { role: 'Administrateur', description: 'Gestion complète des utilisateurs, données, rôles et statistiques.' },
    { role: 'Éditeur', description: 'Modification limitée aux modules attribués par l’administrateur.' },
    { role: 'Membre', description: 'Consultation des informations, affectations et documents autorisés.' },
  ],
};

const formatDate = (value) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(new Date(value));

function renderNavigation() {
  const nav = document.querySelector('#main-navigation');
  nav.innerHTML = navigationItems.map(([id, label], index) => `<a href="#${id}" ${index === 0 ? 'aria-current="page"' : ''}>${label}</a>`).join('');
}

function renderMeetings() {
  document.querySelector('#meetings-list').innerHTML = data.meetings.map((meeting) => `
    <article class="item-card">
      <h3>${meeting.type}</h3>
      <p>${formatDate(meeting.date)}</p>
      <p>${meeting.note}</p>
      <div class="meta-row">${meeting.assignments.map((item) => `<span class="badge">${item}</span>`).join('')}</div>
    </article>`).join('');
}

function renderAssignments() {
  document.querySelector('#assignments-list').innerHTML = data.assignments.map((assignment) => `
    <article class="item-card">
      <h3>${assignment.role}</h3>
      <p>${assignment.person} · ${formatDate(assignment.date)}</p>
      <span class="badge ${assignment.status === 'Confirmé' ? 'badge--success' : 'badge--warning'}">${assignment.status}</span>
    </article>`).join('');
}

function renderAnnouncements() {
  document.querySelector('#announcements-list').innerHTML = data.announcements.map((announcement) => `
    <article class="item-card">
      <h3>${announcement.title}</h3>
      <p>${announcement.message}</p>
      <span class="badge badge--warning">${announcement.priority}</span>
    </article>`).join('');
}

function renderDocuments(filter = '') {
  const normalizedFilter = filter.trim().toLowerCase();
  const documents = data.documents.filter((document) => `${document.title} ${document.category}`.toLowerCase().includes(normalizedFilter));
  document.querySelector('#documents-list').innerHTML = documents.map((document) => `
    <article class="item-card">
      <h3>${document.title}</h3>
      <p>Catégorie : ${document.category}</p>
      <div class="meta-row"><span class="badge">${document.size}</span><span class="badge">Aperçu</span><span class="badge">Télécharger</span></div>
    </article>`).join('') || '<p>Aucun document ne correspond à la recherche.</p>';
}

function renderTerritories() {
  document.querySelector('#territories-list').innerHTML = data.territories.map((territory) => `
    <article class="item-card">
      <h3>${territory.number} · ${territory.description}</h3>
      <p>Responsable : ${territory.owner}</p>
      <span class="badge">${territory.status}</span>
    </article>`).join('');
}

function renderRoles() {
  document.querySelector('#roles-list').innerHTML = data.roles.map((role) => `
    <article class="item-card">
      <h3>${role.role}</h3>
      <p>${role.description}</p>
    </article>`).join('');
}

function updateCounts() {
  document.querySelector('#meeting-count').textContent = data.meetings.length;
  document.querySelector('#assignment-count').textContent = data.assignments.length;
  document.querySelector('#document-count').textContent = data.documents.length;
  document.querySelector('#territory-count').textContent = data.territories.length;
}

function initializeInteractions() {
  const sidebar = document.querySelector('.sidebar');
  document.querySelector('#menu-button').addEventListener('click', () => sidebar.classList.toggle('is-open'));
  document.querySelector('#document-search').addEventListener('input', (event) => renderDocuments(event.target.value));
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('assemblyhub-theme', nextTheme);
  });
  document.querySelectorAll('.nav a').forEach((link) => {
    link.addEventListener('click', () => sidebar.classList.remove('is-open'));
  });
}

function initializeOfflineBanner() {
  const banner = document.querySelector('#offline-banner');
  const update = () => { banner.hidden = navigator.onLine; };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register('./service-worker.js');
  } catch (error) {
    console.warn('Service worker registration failed', error);
  }
}

const savedTheme = localStorage.getItem('assemblyhub-theme');
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}

renderNavigation();
renderMeetings();
renderAssignments();
renderAnnouncements();
renderDocuments();
renderTerritories();
renderRoles();
updateCounts();
initializeInteractions();
initializeOfflineBanner();
registerServiceWorker();
