import { firebaseConfig } from './firebase-config.js';

const scriptUrl = new URL(import.meta.url);
const appBase = scriptUrl.pathname.replace(/\/?app\.js$/, '');
const normalizedBase = appBase === '/' ? '' : appBase;

const routes = [
  { path: '/', label: 'Accueil', icon: '⌂', primary: true },
  { path: '/reunions', label: 'Réunions', icon: '◷', primary: true },
  { path: '/affectations', label: 'Affectations', icon: '✓', primary: true },
  { path: '/documents', label: 'Documents', icon: '▣', primary: true },
  { path: '/sujets', label: 'Sujets', icon: '✎', more: true },
  { path: '/territoires', label: 'Territoires', icon: '◇', more: true },
  { path: '/annonces', label: 'Annonces', icon: '!', more: true },
  { path: '/annuaire', label: 'Annuaire', icon: '☏', more: true },
  { path: '/profil', label: 'Profil', icon: '◎', more: true },
  { path: '/admin', label: 'Admin', icon: '⚙', more: true, admin: true },
];

const demoUser = {
  uid: 'demo-user',
  firstName: 'Marc',
  lastName: 'Dubois',
  initials: 'MD',
  email: 'marc.dubois@assemblyhub.local',
  phone: '+33 6 00 00 00 00',
  group: 'Groupe 2',
  role: 'administrateur',
  active: true,
  editor: true,
  privileges: ['meetings', 'meetingAssignments', 'talks', 'territories', 'documents', 'announcements'],
};

let currentUser = demoUser;
let authState = {
  ready: false,
  mode: 'loading',
  firebaseUser: null,
  userDoc: null,
  users: [],
  error: '',
  notice: '',
};
let firebaseApi = null;

const roleLabels = {
  admin: 'Administrateur',
  ancien: 'Ancien',
  frere: 'Frère',
  proclamateur: 'Proclamateur',
};

const routePermissions = {
  '/': ['admin', 'ancien', 'frere', 'proclamateur'],
  '/reunions': ['admin', 'ancien', 'frere', 'proclamateur'],
  '/affectations': ['admin', 'ancien', 'frere', 'proclamateur'],
  '/documents': ['admin', 'ancien', 'frere', 'proclamateur'],
  '/annonces': ['admin', 'ancien', 'frere', 'proclamateur'],
  '/sujets': ['admin', 'ancien', 'frere'],
  '/territoires': ['admin', 'ancien', 'frere'],
  '/annuaire': ['admin', 'ancien', 'frere'],
  '/profil': ['admin', 'ancien', 'frere', 'proclamateur'],
  '/admin': ['admin'],
};

const store = {
  meetings: [
    { id: 'm1', date: '2026-08-02', period: 'weekend', type: 'Réunion du week-end', chairman: 'Paul Martin', reader: 'Samuel Leroy', sound: 'Marc Dubois', video: 'Nina Moreau', welcome: 'Famille Petit', mics: 'Hugo et Léa', prayer: 'David Bernard', note: 'Accueil renforcé pour les invités.' },
    { id: 'm2', date: '2026-08-06', period: 'week', type: 'Vie et ministère', chairman: 'Jean Caron', reader: 'Noé Fabre', sound: 'Éric Blanc', video: 'Marc Dubois', welcome: 'Sophie Laurent', mics: 'Lucas et Amir', prayer: 'Michel Rey', note: 'Répétitions élèves à confirmer.' },
    { id: 'm3', date: '2026-08-09', period: 'weekend', type: 'Réunion du week-end', chairman: 'Olivier Simon', reader: 'Thomas Garnier', sound: 'Marc Dubois', video: 'Nina Moreau', welcome: 'Groupe 1', mics: 'Jules et Adam', prayer: 'Daniel Lopez', note: 'Discours spécial.' },
  ],
  assignments: [
    { id: 'a1', person: 'Marc Dubois', module: 'Réunions', role: 'Son', date: '2026-08-02', status: 'Confirmé' },
    { id: 'a2', person: 'Marc Dubois', module: 'Réunions', role: 'Vidéo', date: '2026-08-06', status: 'À préparer' },
    { id: 'a3', person: 'Marc Dubois', module: 'Sujets', role: 'Exposé biblique', date: '2026-07-12', status: 'Terminé' },
  ],
  talks: [
    { id: 't1', date: '2026-08-06', type: 'Discussion', assigned: 'Nicolas Bernard', assistant: 'Amir Hassan', status: 'Planifié' },
    { id: 't2', date: '2026-08-13', type: 'Première conversation', assigned: 'Léa Morel', assistant: 'Sophie Laurent', status: 'À confirmer' },
    { id: 't3', date: '2026-07-23', type: 'Discours', assigned: 'Marc Dubois', assistant: '—', status: 'Terminé' },
  ],
  territories: [
    { id: 'tr1', number: 'T-14', description: 'Centre-ville nord', status: 'attribué', owner: 'Groupe 1', assignedAt: '2026-07-12', returnedAt: '—', notes: 'Immeubles avec accès le samedi matin.' },
    { id: 'tr2', number: 'T-22', description: 'Quartier gare', status: 'disponible', owner: 'Non attribué', assignedAt: '—', returnedAt: '2026-07-18', notes: 'À remettre à jour avant la prochaine attribution.' },
    { id: 'tr3', number: 'T-31', description: 'Zone résidentielle est', status: 'en cours', owner: 'Groupe 3', assignedAt: '2026-07-21', returnedAt: '—', notes: 'Prévoir une carte numérique.' },
  ],
  documents: [
    { id: 'd1', title: 'Planning mensuel août', category: 'réunions', publishedAt: '2026-07-25', size: '240 Ko' },
    { id: 'd2', title: 'Carte territoire T-14', category: 'territoires', publishedAt: '2026-07-22', size: '1,2 Mo' },
    { id: 'd3', title: 'Informations assemblée', category: 'assemblées', publishedAt: '2026-07-19', size: '380 Ko' },
    { id: 'd4', title: 'Annonce campagne spéciale', category: 'annonces', publishedAt: '2026-07-14', size: '180 Ko' },
  ],
  announcements: [
    { id: 'n1', title: 'Changement d’horaire', message: 'La réunion du jeudi commencera à 19h15 cette semaine.', priority: 'urgent', archived: false, publishedAt: '2026-07-25' },
    { id: 'n2', title: 'Campagne spéciale', message: 'Une sortie supplémentaire est organisée samedi à 9h30.', priority: 'important', archived: false, publishedAt: '2026-07-24' },
    { id: 'n3', title: 'Nettoyage de la salle', message: 'Le groupe 2 est responsable du nettoyage samedi matin.', priority: 'info', archived: true, publishedAt: '2026-07-10' },
  ],
  directory: [
    { firstName: 'Marc', lastName: 'Dubois', group: 'Groupe 2', phone: '+33 6 00 00 00 00' },
    { firstName: 'Sophie', lastName: 'Laurent', group: 'Groupe 1', phone: '+33 6 11 11 11 11' },
    { firstName: 'Nicolas', lastName: 'Bernard', group: 'Groupe 3', phone: 'Non partagé' },
  ],
  auditLogs: [
    { user: 'Admin principal', date: '2026-07-25 18:20', action: 'Publication', module: 'documents', before: '—', after: 'Planning mensuel août' },
    { user: 'Admin principal', date: '2026-07-24 20:05', action: 'Création', module: 'announcements', before: '—', after: 'Campagne spéciale' },
  ],
};

const app = document.querySelector('#app');
const desktopNav = document.querySelector('#desktop-nav');
const bottomNav = document.querySelector('#bottom-nav');
const moreSheet = document.querySelector('#more-sheet');

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' });
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
const formatDate = (value) => value === '—' ? value : dateFormatter.format(new Date(value));
const shortDate = (value) => shortDateFormatter.format(new Date(value));
const isFuture = (value) => new Date(value) >= new Date('2026-07-27T00:00:00Z');


function userRole() {
  return authState.userDoc?.role || currentUser.role || 'proclamateur';
}

function isAdmin() {
  return userRole() === 'admin';
}

function canEdit() {
  return isAdmin() || authState.userDoc?.editor === true;
}

function canAccessRoute(path) {
  return (routePermissions[path] || routePermissions['/']).includes(userRole());
}

function userDisplayName() {
  return `${currentUser.prenom || currentUser.firstName || ''} ${currentUser.nom || currentUser.lastName || ''}`.trim() || currentUser.email || 'Utilisateur';
}

function initialsFor(user) {
  const first = user.prenom || user.firstName || '';
  const last = user.nom || user.lastName || '';
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || 'AH';
}

function mapUserDoc(firebaseUser, data = {}) {
  return {
    uid: firebaseUser?.uid || data.uid || 'demo-user',
    firstName: data.prenom || data.firstName || 'Utilisateur',
    lastName: data.nom || data.lastName || '',
    prenom: data.prenom || data.firstName || 'Utilisateur',
    nom: data.nom || data.lastName || '',
    initials: initialsFor(data),
    email: data.email || firebaseUser?.email || '',
    phone: data.telephone || data.phone || '',
    group: data.groupe || data.group || '',
    role: data.role || 'proclamateur',
    editor: data.editor === true,
    active: data.active !== false,
    privileges: data.privileges || [],
  };
}

function appMessage(type, message) {
  const tone = type === 'error' ? 'badge--danger' : 'badge--success';
  return message ? `<div class="auth-message ${tone}">${message}</div>` : '';
}

function routeToUrl(path) {
  if (path === '/') return `${normalizedBase || '/'}${normalizedBase ? '/' : ''}`;
  return `${normalizedBase}${path}/`;
}

function pathFromLocation() {
  let pathname = window.location.pathname;
  if (normalizedBase && pathname.startsWith(`${normalizedBase}/`)) {
    pathname = pathname.slice(normalizedBase.length);
  }
  return pathname.replace(/\/$/, '') || '/';
}

function navigate(path) {
  if (pathFromLocation() !== path) {
    window.history.pushState({}, '', routeToUrl(path));
  }
  renderRoute();
}

function normalizePath() {
  const redirectedPath = sessionStorage.getItem('redirect');
  if (redirectedPath) {
    sessionStorage.removeItem('redirect');
    window.history.replaceState({}, '', routeToUrl(redirectedPath));
  }
}

function routeForPath() {
  const pathname = pathFromLocation();
  return routes.find((route) => route.path === pathname) || routes[0];
}


function pathToRoute(pathname) {
  if (normalizedBase && pathname.startsWith(`${normalizedBase}/`)) {
    pathname = pathname.slice(normalizedBase.length);
  }
  return pathname.replace(/\/$/, '') || '/';
}

function bindLinks(root = document) {
  root.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      closeMoreSheet();
      navigate(link.dataset.route || pathToRoute(new URL(link.href).pathname));
    });
  });
}

function renderNavigation() {
  desktopNav.innerHTML = visibleRoutes().map((route) => navLink(route)).join('');
  bottomNav.innerHTML = visibleRoutes().filter((route) => route.primary).map((route) => navLink(route, true)).join('') + `
    <button type="button" id="open-more" aria-pressed="false">
      <span class="tab-icon">☰</span><span>Plus</span>
    </button>`;
  document.querySelector('#more-grid').innerHTML = visibleRoutes().filter((route) => route.more).map((route) => `
    <a href="${routeToUrl(route.path)}" data-route="${route.path}" data-link><span>${route.icon}</span> ${route.label}</a>`).join('');
  document.querySelector('#open-more').addEventListener('click', openMoreSheet);
  document.querySelector('#close-more').addEventListener('click', closeMoreSheet);
  moreSheet.addEventListener('click', (event) => {
    if (event.target === moreSheet) closeMoreSheet();
  });
  bindLinks(document);
}

function visibleRoutes() {
  if (!authState.firebaseUser) return routes.filter((route) => route.path === '/');
  return routes.filter((route) => canAccessRoute(route.path));
}

function navLink(route, compact = false) {
  const active = route.path === routeForPath().path ? 'aria-current="page"' : '';
  if (compact) {
    return `<a href="${routeToUrl(route.path)}" data-route="${route.path}" data-link ${active}><span class="tab-icon">${route.icon}</span><span>${route.label}</span></a>`;
  }
  return `<a href="${routeToUrl(route.path)}" data-route="${route.path}" data-link ${active}>${route.icon} ${route.label}</a>`;
}

function openMoreSheet() {
  moreSheet.classList.add('is-open');
  moreSheet.setAttribute('aria-hidden', 'false');
  document.querySelector('#open-more')?.setAttribute('aria-pressed', 'true');
}

function closeMoreSheet() {
  moreSheet.classList.remove('is-open');
  moreSheet.setAttribute('aria-hidden', 'true');
  document.querySelector('#open-more')?.setAttribute('aria-pressed', 'false');
}

function pageShell(title, intro, content, kicker = 'AssemblyHub') {
  return `
    <section class="page-hero">
      <p class="kicker">${kicker}</p>
      <h1>${title}</h1>
      <p class="lead">${intro}</p>
    </section>
    ${content}`;
}

function infoCard(title, body, meta = []) {
  return `
    <article class="info-card">
      <h3>${title}</h3>
      <p>${body}</p>
      ${meta.length ? `<div class="card__meta">${meta.map((item) => `<span class="badge ${item.tone ? `badge--${item.tone}` : ''}">${item.label}</span>`).join('')}</div>` : ''}
    </article>`;
}

function renderHome() {
  const futureAssignments = store.assignments.filter((item) => isFuture(item.date)).slice(0, 2);
  const nextWeek = store.meetings.find((meeting) => meeting.period === 'week');
  const nextWeekend = store.meetings.find((meeting) => meeting.period === 'weekend');
  return `
    <section class="home-welcome">
      <div>
        <p class="kicker">Bonjour ${currentUser.firstName}</p>
        <h1>Vos informations essentielles, sans surcharge.</h1>
        <p class="lead">L’accueil affiche uniquement ce qui est personnel, récent ou important pour rester lisible sur smartphone.</p>
      </div>
      <div class="today-pill">${formatDate('2026-07-27')}</div>
    </section>
    <div class="section-stack" style="margin-top:18px">
      <section class="panel">
        <div class="panel-header"><h2>Mes affectations</h2><a class="action-button action-button--soft" href="${routeToUrl('/affectations')}" data-route="/affectations" data-link>Tout voir</a></div>
        <div class="card-list">${futureAssignments.map((item) => infoCard(item.role, `${item.module} · ${formatDate(item.date)}`, [{ label: item.status, tone: item.status === 'Confirmé' ? 'success' : 'warning' }])).join('')}</div>
      </section>
      <section class="grid">
        <div class="panel span-6">
          <div class="panel-header"><h2>Annonces importantes</h2><a class="action-button action-button--soft" href="${routeToUrl('/annonces')}" data-route="/annonces" data-link>Ouvrir</a></div>
          <div class="card-list">${store.announcements.filter((item) => !item.archived && item.priority !== 'info').slice(0, 2).map((item) => infoCard(item.title, item.message, [{ label: item.priority, tone: item.priority === 'urgent' ? 'danger' : 'warning' }])).join('')}</div>
        </div>
        <div class="panel span-6">
          <div class="panel-header"><h2>Nouveaux documents</h2><a class="action-button action-button--soft" href="${routeToUrl('/documents')}" data-route="/documents" data-link>Bibliothèque</a></div>
          <div class="card-list">${store.documents.slice(0, 2).map((item) => infoCard(item.title, `Publié le ${formatDate(item.publishedAt)}`, [{ label: item.category }, { label: item.size }])).join('')}</div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Prochaines réunions</h2><a class="action-button action-button--soft" href="${routeToUrl('/reunions')}" data-route="/reunions" data-link>Calendrier</a></div>
        <div class="grid">
          <div class="span-6">${infoCard(nextWeek.type, `${formatDate(nextWeek.date)} · Président : ${nextWeek.chairman}`, [{ label: 'Semaine' }])}</div>
          <div class="span-6">${infoCard(nextWeekend.type, `${formatDate(nextWeekend.date)} · Président : ${nextWeekend.chairman}`, [{ label: 'Week-end' }])}</div>
        </div>
      </section>
    </div>`;
}

function renderMeetings() {
  return pageShell('Réunions', 'Consultez la liste, une vue calendrier synthétique et le détail des responsabilités prévues.', `
    <div class="tabs" data-tabs="meetings"><button class="is-active" data-view="list">Liste</button><button data-view="calendar">Calendrier</button><button data-view="month">Vue mensuelle</button></div>
    <section class="panel" style="margin-top:16px"><div class="timeline">${store.meetings.map((meeting) => infoCard(`${shortDate(meeting.date)} · ${meeting.type}`, meeting.note, [
      { label: `Président : ${meeting.chairman}` }, { label: `Lecteur : ${meeting.reader}` }, { label: `Son : ${meeting.sound}` }, { label: `Vidéo : ${meeting.video}` }, { label: `Accueil : ${meeting.welcome}` }, { label: `Micros : ${meeting.mics}` }, { label: `Prière : ${meeting.prayer}` },
    ])).join('')}</div></section>
  `, '/reunions');
}

function renderAssignments() {
  return pageShell('Affectations', 'Retrouvez vos affectations futures et votre historique personnel avec un filtre simple.', `
    <div class="segmented" data-filter="assignments"><button class="is-active" data-assignment-filter="future">Futures</button><button data-assignment-filter="past">Passées</button></div>
    <section class="panel" style="margin-top:16px"><div class="card-list" id="assignment-results"></div></section>
  `, '/affectations');
}

function renderTalks() {
  return pageShell('Sujets', 'Suivi des parties Vie et Ministère avec assigné, accompagnant, statut et historique.', `
    <section class="panel"><div class="timeline">${store.talks.map((talk) => infoCard(`${talk.type} · ${formatDate(talk.date)}`, `Assigné : ${talk.assigned} · Accompagnant : ${talk.assistant}`, [{ label: talk.status, tone: talk.status === 'Terminé' ? 'success' : 'warning' }])).join('')}</div></section>
  `, '/sujets');
}

function renderTerritories() {
  return pageShell('Territoires', 'Cartes modernes pour connaître le statut, le responsable, les dates et les notes de chaque territoire.', `
    <section class="grid">${store.territories.map((territory) => `<div class="span-4">${infoCard(`${territory.number} · ${territory.description}`, territory.notes, [{ label: territory.status }, { label: territory.owner }, { label: `Attribué : ${formatDate(territory.assignedAt)}` }, { label: `Retour : ${formatDate(territory.returnedAt)}` }])}</div>`).join('')}</section>
  `, '/territoires');
}

function renderDocuments() {
  return pageShell('Documents', 'Bibliothèque documentaire avec recherche, filtre par catégorie, aperçu et téléchargement.', `
    <div class="controls"><input class="search" id="document-search" type="search" placeholder="Rechercher un document" /><select class="select" id="document-category"><option value="all">Toutes les catégories</option><option>réunions</option><option>assemblées</option><option>territoires</option><option>annonces</option><option>divers</option></select></div>
    <section class="panel"><div class="card-list" id="document-results"></div></section>
  `, '/documents');
}

function renderAnnouncements() {
  return pageShell('Annonces', 'Toutes les annonces, y compris les archives, avec recherche rapide.', `
    <div class="controls"><input class="search" id="announcement-search" type="search" placeholder="Rechercher une annonce" /></div>
    <section class="panel"><div class="card-list" id="announcement-results"></div></section>
  `, '/annonces');
}

function renderDirectory() {
  return pageShell('Annuaire', 'Recherche rapide des membres connectés avec affichage du téléphone uniquement si autorisé.', `
    <div class="controls"><input class="search" id="directory-search" type="search" placeholder="Rechercher un membre" /></div>
    <section class="panel"><div class="card-list" id="directory-results"></div></section>
  `, '/annuaire');
}

function renderProfile() {
  return pageShell('Mon profil', 'Vos informations personnelles et les actions de sécurité du compte.', `
    <section class="grid">
      <div class="span-8">${infoCard(`${currentUser.firstName} ${currentUser.lastName}`, `${currentUser.email}<br>${currentUser.phone}<br>${currentUser.group}`, [{ label: currentUser.role }, { label: 'Modifier mes informations' }])}</div>
      <div class="panel span-4"><h2>Sécurité</h2><p class="lead">Le changement de mot de passe sera relié à Firebase Authentication.</p><button class="action-button" type="button">Changer mon mot de passe</button></div>
    </section>
  `, '/profil');
}

function renderAdmin() {
  return pageShell('Administration', 'Espace réservé aux administrateurs pour gérer les utilisateurs, les modules, les paramètres et les journaux d’activité.', `
    <section class="grid">
      <div class="panel span-8">
        <div class="panel-header"><h2>Utilisateurs</h2><button class="action-button" type="button" id="refresh-users">Actualiser</button></div>
        <div class="card-list" id="admin-users-list">${renderUsersList()}</div>
      </div>
      <form class="panel span-4" id="create-user-form">
        <h2>Ajouter un utilisateur</h2>
        <p class="lead">La création du compte Auth doit passer par une Cloud Function sécurisée. Le frontend appelle <code>createAssemblyHubUser</code> si elle est déployée.</p>
        <label class="field"><span>Prénom</span><input name="prenom" required /></label>
        <label class="field"><span>Nom</span><input name="nom" required /></label>
        <label class="field"><span>Email</span><input name="email" type="email" required /></label>
        <label class="field"><span>Rôle</span><select name="role"><option value="proclamateur">Proclamateur</option><option value="frere">Frère</option><option value="ancien">Ancien</option><option value="admin">Admin</option></select></label>
        <label class="check-row"><input name="editor" type="checkbox" /> <span>Éditeur autorisé</span></label>
        <button class="action-button" type="submit">Créer et envoyer l’email</button>
      </form>
    </section>
    <section class="admin-grid" style="margin-top:16px">${['Réunions', 'Affectations', 'Sujets', 'Territoires', 'Documents', 'Annonces', 'Paramètres', 'Journaux d’activité'].map((label) => `<article class="admin-tile"><h3>${label}</h3><p class="lead">Gestion ${label.toLowerCase()}</p></article>`).join('')}</section>
    <section class="panel" style="margin-top:16px"><div class="panel-header"><h2>Derniers journaux</h2></div><div class="card-list">${store.auditLogs.map((log) => infoCard(`${log.action} · ${log.module}`, `${log.user} · ${log.date}`, [{ label: `Ancien : ${log.before}` }, { label: `Nouveau : ${log.after}` }])).join('')}</div></section>
  `, '/admin');
}

function renderUsersList() {
  if (!authState.users.length) {
    return '<div class="empty-state">Aucun utilisateur chargé pour le moment.</div>';
  }

  return authState.users.map((user) => `
    <article class="info-card user-row" data-user-id="${user.uid}">
      <div>
        <h3>${user.prenom || ''} ${user.nom || ''}</h3>
        <p>${user.email} · ${user.groupe || 'Aucun groupe'}</p>
        <div class="card__meta"><span class="badge">${roleLabels[user.role] || user.role}</span><span class="badge ${user.editor ? 'badge--success' : ''}">${user.editor ? 'Éditeur' : 'Lecture'}</span><span class="badge ${user.active === false ? 'badge--danger' : 'badge--success'}">${user.active === false ? 'Désactivé' : 'Actif'}</span></div>
      </div>
      <div class="user-actions">
        <button class="action-button action-button--soft" type="button" data-user-action="toggle" data-user-id="${user.uid}">${user.active === false ? 'Activer' : 'Désactiver'}</button>
        <button class="action-button action-button--soft" type="button" data-user-action="editor" data-user-id="${user.uid}">${user.editor ? 'Retirer éditeur' : 'Rendre éditeur'}</button>
        <button class="action-button action-button--danger" type="button" data-user-action="delete" data-user-id="${user.uid}">Supprimer</button>
      </div>
    </article>`).join('');
}


function renderLoading() {
  return `<section class="auth-layout"><div class="auth-card"><p class="kicker">AssemblyHub</p><h1>Chargement sécurisé…</h1><p class="lead">Connexion à Firebase Authentication et Firestore.</p></div></section>`;
}

function renderLogin() {
  return `<section class="auth-layout">
    <form class="auth-card" id="login-form">
      <p class="kicker">Connexion privée</p>
      <h1>Bienvenue sur AssemblyHub</h1>
      <p class="lead">Connectez-vous avec le compte fourni par un administrateur. Les inscriptions publiques sont désactivées.</p>
      ${appMessage('error', authState.error)}${appMessage('notice', authState.notice)}
      <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required /></label>
      <label class="field"><span>Mot de passe</span><input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="action-button" type="submit">Se connecter</button>
      <button class="link-button" id="forgot-password" type="button">Mot de passe oublié</button>
    </form>
  </section>`;
}

function renderSetup() {
  return `<section class="auth-layout">
    <form class="auth-card" id="setup-form">
      <p class="kicker">Configuration initiale</p>
      <h1>Créer le premier administrateur</h1>
      <p class="lead">Aucun compte admin n’a été trouvé dans Firestore. Ce formulaire apparaît uniquement au premier lancement.</p>
      ${appMessage('error', authState.error)}
      <label class="field"><span>Prénom</span><input name="prenom" required /></label>
      <label class="field"><span>Nom</span><input name="nom" required /></label>
      <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required /></label>
      <label class="field"><span>Mot de passe initial</span><input name="password" type="password" minlength="8" autocomplete="new-password" required /></label>
      <button class="action-button" type="submit">Créer l’administrateur</button>
    </form>
  </section>`;
}

function renderAccessDenied(message) {
  return `<section class="auth-layout"><div class="auth-card"><p class="kicker">Accès impossible</p><h1>${message}</h1><button class="action-button" id="logout-button" type="button">Se déconnecter</button></div></section>`;
}

const routeRenderers = {
  '/': renderHome,
  '/reunions': renderMeetings,
  '/affectations': renderAssignments,
  '/sujets': renderTalks,
  '/territoires': renderTerritories,
  '/documents': renderDocuments,
  '/annonces': renderAnnouncements,
  '/annuaire': renderDirectory,
  '/profil': renderProfile,
  '/admin': renderAdmin,
};

function renderRoute() {
  if (!authState.ready) {
    document.title = 'Chargement · AssemblyHub';
    app.innerHTML = renderLoading();
    return;
  }

  if (authState.mode === 'setup') {
    document.title = 'Configuration initiale · AssemblyHub';
    app.innerHTML = renderSetup();
    bindAuthInteractions();
    return;
  }

  if (!authState.firebaseUser) {
    document.title = 'Connexion · AssemblyHub';
    app.innerHTML = renderLogin();
    bindAuthInteractions();
    return;
  }

  if (authState.userDoc?.active === false) {
    document.title = 'Compte désactivé · AssemblyHub';
    app.innerHTML = renderAccessDenied('Votre compte est désactivé. Contactez un administrateur.');
    bindAuthInteractions();
    return;
  }

  let route = routeForPath();
  if (!canAccessRoute(route.path)) {
    route = routes[0];
    window.history.replaceState({}, '', routeToUrl('/'));
    authState.notice = 'Vous avez été redirigé vers l’accueil car cette page est réservée à un autre rôle.';
  }

  document.title = `${route.label} · AssemblyHub`;
  app.innerHTML = `${authState.notice ? appMessage('notice', authState.notice) : ''}${routeRenderers[route.path]()}`;
  authState.notice = '';
  app.focus({ preventScroll: true });
  renderNavigationState();
  bindLinks(app);
  bindPageInteractions(route.path);
}

function renderNavigationState() {
  desktopNav.innerHTML = visibleRoutes().map((route) => navLink(route)).join('');
  bottomNav.innerHTML = visibleRoutes().filter((route) => route.primary).map((route) => navLink(route, true)).join('') + `
    <button type="button" id="open-more" aria-pressed="false">
      <span class="tab-icon">☰</span><span>Plus</span>
    </button>`;
  document.querySelector('#open-more').addEventListener('click', openMoreSheet);
  bindLinks(desktopNav);
  bindLinks(bottomNav);
}

function bindPageInteractions(path) {
  if (path === '/admin') {
    bindAdminInteractions();
  }

  if (path === '/affectations') {
    const renderAssignmentsList = (filter = 'future') => {
      const items = store.assignments.filter((assignment) => filter === 'future' ? isFuture(assignment.date) : !isFuture(assignment.date));
      document.querySelector('#assignment-results').innerHTML = items.map((assignment) => infoCard(assignment.role, `${assignment.module} · ${formatDate(assignment.date)}`, [{ label: assignment.status, tone: assignment.status === 'Terminé' ? 'success' : 'warning' }])).join('') || '<div class="empty-state">Aucune affectation pour ce filtre.</div>';
    };
    renderAssignmentsList();
    document.querySelectorAll('[data-assignment-filter]').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('[data-assignment-filter]').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      renderAssignmentsList(button.dataset.assignmentFilter);
    }));
  }

  if (path === '/documents') {
    const renderDocumentsList = () => {
      const search = document.querySelector('#document-search').value.toLowerCase();
      const category = document.querySelector('#document-category').value;
      const items = store.documents.filter((document) => (category === 'all' || document.category === category) && `${document.title} ${document.category}`.toLowerCase().includes(search));
      document.querySelector('#document-results').innerHTML = items.map((document) => infoCard(document.title, `Publié le ${formatDate(document.publishedAt)}`, [{ label: document.category }, { label: document.size }, { label: 'Aperçu' }, { label: 'Télécharger' }])).join('') || '<div class="empty-state">Aucun document trouvé.</div>';
    };
    document.querySelector('#document-search').addEventListener('input', renderDocumentsList);
    document.querySelector('#document-category').addEventListener('change', renderDocumentsList);
    renderDocumentsList();
  }

  if (path === '/annonces') {
    const renderAnnouncementList = () => {
      const search = document.querySelector('#announcement-search').value.toLowerCase();
      const items = store.announcements.filter((announcement) => `${announcement.title} ${announcement.message}`.toLowerCase().includes(search));
      document.querySelector('#announcement-results').innerHTML = items.map((announcement) => infoCard(announcement.title, announcement.message, [{ label: announcement.priority, tone: announcement.priority === 'urgent' ? 'danger' : 'warning' }, { label: announcement.archived ? 'Archivée' : 'Active' }])).join('') || '<div class="empty-state">Aucune annonce trouvée.</div>';
    };
    document.querySelector('#announcement-search').addEventListener('input', renderAnnouncementList);
    renderAnnouncementList();
  }

  if (path === '/annuaire') {
    const renderDirectoryList = () => {
      const search = document.querySelector('#directory-search').value.toLowerCase();
      const items = store.directory.filter((person) => `${person.firstName} ${person.lastName} ${person.group}`.toLowerCase().includes(search));
      document.querySelector('#directory-results').innerHTML = items.map((person) => infoCard(`${person.firstName} ${person.lastName}`, `${person.group} · ${person.phone}`)).join('') || '<div class="empty-state">Aucun membre trouvé.</div>';
    };
    document.querySelector('#directory-search').addEventListener('input', renderDirectoryList);
    renderDirectoryList();
  }
}


async function initializeFirebaseAuth() {
  try {
    const [appModule, authModule, firestoreModule, functionsModule] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js'),
    ]);
    const firebaseApp = appModule.initializeApp(firebaseConfig);
    const auth = authModule.getAuth(firebaseApp);
    const db = firestoreModule.getFirestore(firebaseApp);
    const functions = functionsModule.getFunctions(firebaseApp, 'europe-west1');
    firebaseApi = { authModule, firestoreModule, functionsModule, app: firebaseApp, auth, db, functions };
    await detectInitialMode();
    authModule.onAuthStateChanged(auth, handleAuthStateChanged);
  } catch (error) {
    authState = { ...authState, ready: true, mode: 'login', error: `Firebase est indisponible : ${error.message}` };
    renderRoute();
  }
}

async function detectInitialMode() {
  const { doc, getDoc } = firebaseApi.firestoreModule;
  const bootstrap = await getDoc(doc(firebaseApi.db, 'settings', 'bootstrap'));
  authState.ready = true;
  authState.mode = bootstrap.exists() && bootstrap.data().hasAdmin === true ? 'login' : 'setup';
}

async function handleAuthStateChanged(firebaseUser) {
  authState.firebaseUser = firebaseUser;
  authState.error = '';
  if (!firebaseUser) {
    currentUser = demoUser;
    authState.userDoc = null;
    authState.users = [];
    if (authState.mode !== 'setup') authState.mode = 'login';
    authState.ready = true;
    renderRoute();
    return;
  }

  const { doc, getDoc, serverTimestamp, updateDoc } = firebaseApi.firestoreModule;
  const ref = doc(firebaseApi.db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    if (authState.mode === 'setup') return;
    await firebaseApi.authModule.signOut(firebaseApi.auth);
    authState.error = 'Aucun profil AssemblyHub n’est associé à ce compte.';
    authState.mode = 'login';
    renderRoute();
    return;
  }

  authState.userDoc = { uid: firebaseUser.uid, ...snapshot.data() };
  currentUser = mapUserDoc(firebaseUser, authState.userDoc);
  await updateDoc(ref, { lastLogin: serverTimestamp() });
  authState.mode = 'app';
  if (isAdmin()) await loadUsers();
  renderRoute();
}

async function loadUsers() {
  if (!isAdmin()) return;
  const { collection, getDocs, orderBy, query } = firebaseApi.firestoreModule;
  const usersQuery = query(collection(firebaseApi.db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(usersQuery);
  authState.users = snapshot.docs.map((entry) => ({ uid: entry.id, ...entry.data() }));
}

function bindAuthInteractions() {
  document.querySelector('#login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      authState.error = '';
      await firebaseApi.authModule.signInWithEmailAndPassword(firebaseApi.auth, form.get('email'), form.get('password'));
    } catch (error) {
      authState.error = friendlyFirebaseError(error);
      renderRoute();
    }
  });

  document.querySelector('#forgot-password')?.addEventListener('click', async () => {
    const email = document.querySelector('#login-form input[name="email"]')?.value;
    if (!email) {
      authState.error = 'Indiquez votre email avant de demander la réinitialisation.';
      renderRoute();
      return;
    }
    await firebaseApi.authModule.sendPasswordResetEmail(firebaseApi.auth, email);
    authState.notice = 'Email de réinitialisation envoyé si le compte existe.';
    renderRoute();
  });

  document.querySelector('#setup-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const credential = await firebaseApi.authModule.createUserWithEmailAndPassword(firebaseApi.auth, form.get('email'), form.get('password'));
      const { doc, serverTimestamp, setDoc } = firebaseApi.firestoreModule;
      const adminProfile = {
        prenom: form.get('prenom'),
        nom: form.get('nom'),
        email: form.get('email'),
        role: 'admin',
        editor: true,
        active: true,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(doc(firebaseApi.db, 'users', credential.user.uid), adminProfile);
      await setDoc(doc(firebaseApi.db, 'settings', 'bootstrap'), { hasAdmin: true, createdAt: serverTimestamp(), createdBy: credential.user.uid });
      authState.userDoc = { uid: credential.user.uid, ...adminProfile };
      currentUser = mapUserDoc(credential.user, authState.userDoc);
      authState.mode = 'app';
      authState.firebaseUser = credential.user;
      await loadUsers();
      renderRoute();
    } catch (error) {
      authState.error = friendlyFirebaseError(error);
      renderRoute();
    }
  });

  document.querySelector('#logout-button')?.addEventListener('click', () => firebaseApi.authModule.signOut(firebaseApi.auth));
}

async function bindAdminInteractions() {
  document.querySelector('#refresh-users')?.addEventListener('click', async () => {
    await loadUsers();
    renderRoute();
  });

  document.querySelector('#create-user-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const callable = firebaseApi.functionsModule.httpsCallable(firebaseApi.functions, 'createAssemblyHubUser');
      await callable({
        prenom: form.get('prenom'),
        nom: form.get('nom'),
        email: form.get('email'),
        role: form.get('role'),
        editor: form.get('editor') === 'on',
      });
      authState.notice = 'Utilisateur créé. Un email de définition du mot de passe doit être envoyé par la fonction sécurisée.';
      await loadUsers();
      renderRoute();
    } catch (error) {
      authState.error = `Création impossible : ${friendlyFirebaseError(error)}`;
      renderRoute();
    }
  });

  document.querySelectorAll('[data-user-action]').forEach((button) => button.addEventListener('click', async () => {
    const user = authState.users.find((entry) => entry.uid === button.dataset.userId);
    if (!user) return;
    const { deleteDoc, doc, updateDoc } = firebaseApi.firestoreModule;
    const ref = doc(firebaseApi.db, 'users', user.uid);
    if (button.dataset.userAction === 'toggle') await updateDoc(ref, { active: user.active === false });
    if (button.dataset.userAction === 'editor') await updateDoc(ref, { editor: !user.editor });
    if (button.dataset.userAction === 'delete' && confirm('Supprimer ce profil Firestore ? La suppression du compte Auth doit être faite côté serveur.')) await deleteDoc(ref);
    await loadUsers();
    renderRoute();
  }));
}

function friendlyFirebaseError(error) {
  const code = error?.code || '';
  if (code.includes('auth/invalid-credential')) return 'Email ou mot de passe incorrect.';
  if (code.includes('auth/email-already-in-use')) return 'Cet email est déjà utilisé.';
  if (code.includes('auth/weak-password')) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (code.includes('permission-denied')) return 'Permission refusée par les règles de sécurité.';
  return error?.message || 'Une erreur inconnue est survenue.';
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('assemblyhub-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('assemblyhub-theme', nextTheme);
  });
}

function initializeOfflineToast() {
  const toast = document.querySelector('#offline-toast');
  const update = () => { toast.hidden = navigator.onLine; };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register(`${normalizedBase}/service-worker.js`, { scope: `${normalizedBase || ''}/` });
  } catch (error) {
    console.warn('Service worker registration failed', error);
  }
}

window.addEventListener('popstate', renderRoute);
normalizePath();
renderNavigation();
initializeFirebaseAuth();
initializeTheme();
initializeOfflineToast();
renderRoute();
registerServiceWorker();
