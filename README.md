# AssemblyHub

AssemblyHub est une application web privée (PWA) destinée à une seule congrégation. Le projet est pensé comme une application mobile moderne : l’accueil reste volontairement minimal, et chaque fonctionnalité dispose de sa page indépendante.

## Vision

L’objectif n’est pas de créer un tableau de bord unique, mais une expérience fluide pour les membres connectés : consulter rapidement les informations importantes, ouvrir une page dédiée lorsqu’un module nécessite plus de détails, puis laisser les administrateurs et éditeurs gérer uniquement ce qui correspond à leurs autorisations.

## Stack technique

- **Frontend** : HTML5, CSS3, JavaScript Vanilla, responsive design, PWA.
- **Backend prévu** : Firebase Authentication, Cloud Firestore, Firebase Storage.
- **Hébergement** : GitHub Pages pour le frontend, Firebase pour l’authentification, la base de données et le stockage.

## Navigation et pages

- `/` : accueil personnel minimal avec mes affectations, annonces importantes, nouveaux documents et prochaines réunions.
- `/reunions` : liste, vue calendrier, vue mensuelle et détail des responsabilités.
- `/affectations` : affectations futures et passées.
- `/sujets` : parties Vie et Ministère avec historique.
- `/territoires` : cartes de territoires avec statut, responsable, dates et notes.
- `/documents` : bibliothèque avec recherche, filtre, aperçu et téléchargement.
- `/annonces` : annonces complètes, archives et recherche.
- `/annuaire` : recherche rapide des membres connectés.
- `/profil` : informations personnelles et actions de compte.
- `/admin` : espace réservé aux administrateurs.

Sur mobile, la navigation principale est une barre inférieure fixe : Accueil, Réunions, Affectations, Documents et Plus. Le menu Plus contient Sujets, Territoires, Annonces, Annuaire, Profil et Admin.

## Fonctionnalités incluses dans ce socle

- Routage Vanilla JavaScript avec URL dédiées.
- Accueil épuré orienté informations personnelles.
- Pages indépendantes pour chaque fonctionnalité demandée.
- Navigation mobile inférieure prioritaire et menu Plus en feuille modale.
- Interface moderne avec cartes, animations discrètes, responsive design et thèmes clair/sombre.
- Recherche et filtres locaux pour documents, annonces, annuaire et affectations.
- Manifest PWA, service worker, cache des routes et fallback hors ligne.
- Règles Firestore et Storage de départ pour les rôles administrateur, éditeur et membre.
- Fichier d’exemple de configuration Firebase.

## Structure du projet

```text
.
├── index.html              # Shell applicatif mobile-first
├── 404.html                # Redirection GitHub Pages vers le routage SPA
├── reunions/               # Entrée statique pour /reunions
├── affectations/           # Entrée statique pour /affectations
├── sujets/                 # Entrée statique pour /sujets
├── territoires/            # Entrée statique pour /territoires
├── documents/              # Entrée statique pour /documents
├── annonces/               # Entrée statique pour /annonces
├── annuaire/               # Entrée statique pour /annuaire
├── profil/                 # Entrée statique pour /profil
├── admin/                  # Entrée statique pour /admin
├── styles.css              # Design responsive clair/sombre
├── app.js                  # Pages, routage, données de démonstration et interactions
├── service-worker.js       # Cache PWA et routes hors ligne
├── manifest.webmanifest    # Métadonnées d’installation PWA
├── firebase.example.js     # Modèle de configuration Firebase
├── firestore.rules         # Règles Firestore proposées
├── storage.rules           # Règles Firebase Storage proposées
└── assets/icon.svg         # Icône de l’application
```

## Lancer localement

Servez le dossier avec un serveur statique :

```bash
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.


## Compatibilité GitHub Pages

Les fichiers HTML utilisent des chemins relatifs (`styles.css`, `../styles.css`, `app.js`, `../app.js`) afin que le site fonctionne aussi bien en local qu’une fois publié sous le sous-chemin GitHub Pages du dépôt, par exemple `/AssemblyHub/`. Le routeur JavaScript détecte automatiquement ce sous-chemin avant de générer les liens internes.

## Brancher Firebase

1. Créez un projet Firebase.
2. Activez Firebase Authentication, Cloud Firestore et Firebase Storage.
3. Copiez `firebase.example.js` vers `firebase-config.js`.
4. Remplacez les valeurs d’exemple par la configuration réelle du projet.
5. Déployez `firestore.rules` et `storage.rules` avec la Firebase CLI.
6. Remplacez progressivement les données de démonstration de `app.js` par des appels Firebase.

## Collections Firestore prévues

- `users/{uid}`
- `meetings/{meetingId}`
- `meetingAssignments/{assignmentId}`
- `talks/{talkId}`
- `territories/{territoryId}`
- `documents/{documentId}`
- `announcements/{announcementId}`
- `auditLogs/{logId}`
- `settings/{settingId}`

## Rôles

- **Administrateur** : gestion complète, modules, rôles, statistiques et journaux d’activité.
- **Éditeur** : création et modification limitées aux modules attribués.
- **Membre** : consultation uniquement des informations autorisées.

## Journalisation prévue

La collection `auditLogs` doit enregistrer l’utilisateur, la date, l’action, le module concerné, l’ancienne valeur et la nouvelle valeur pour les changements importants.

## Évolutions futures

- Notifications push.
- Export PDF et Excel.
- Synchronisation calendrier.
- Statistiques.
- Carte OpenStreetMap.
- Gestion avancée des territoires.
- Sauvegardes automatiques.
- Interface multilingue : français, russe, anglais.
