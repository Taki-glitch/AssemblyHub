# AssemblyHub

AssemblyHub est une application web moderne (PWA) privée destinée à une seule congrégation. Elle centralise les informations utiles à la vie de la congrégation : réunions, affectations, sujets, territoires, documents, annonces et utilisateurs.

## Objectif du MVP 1.0

Permettre aux membres autorisés de :

- se connecter ;
- consulter les réunions ;
- consulter leurs affectations ;
- consulter les documents ;
- consulter les annonces.

L’administrateur peut gérer les utilisateurs, publier des documents, gérer les réunions et gérer les affectations.

## Stack technique

- **Frontend** : HTML5, CSS3, JavaScript Vanilla, responsive design, PWA.
- **Backend prévu** : Firebase Authentication, Cloud Firestore, Firebase Storage.
- **Hébergement** : GitHub Pages pour le frontend, Firebase pour les données et l’authentification.

## Fonctionnalités incluses dans ce socle

- Tableau de bord avec indicateurs clés.
- Navigation principale : tableau de bord, réunions, affectations, sujets, territoires, documents, annonces, utilisateurs et paramètres.
- Cartes de réunions, affectations, annonces, documents, territoires et rôles.
- Recherche locale dans les documents.
- Mode clair / sombre avec persistance dans `localStorage`.
- Manifest PWA et service worker pour l’installation et le cache hors ligne.
- Règles Firestore et Storage de départ pour le contrôle d’accès par rôle.
- Fichier d’exemple de configuration Firebase.

## Structure du projet

```text
.
├── index.html              # Interface principale de la PWA
├── styles.css              # Design responsive clair/sombre
├── app.js                  # Rendu Vanilla JS et interactions
├── service-worker.js       # Cache PWA et fallback hors ligne
├── manifest.webmanifest    # Métadonnées d’installation PWA
├── firebase.example.js     # Modèle de configuration Firebase
├── firestore.rules         # Règles Firestore proposées
├── storage.rules           # Règles Firebase Storage proposées
└── assets/icon.svg         # Icône de l’application
```

## Lancer localement

Servez le dossier avec un serveur statique afin que le service worker fonctionne correctement :

```bash
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

## Brancher Firebase

1. Créez un projet Firebase.
2. Activez Firebase Authentication, Cloud Firestore et Firebase Storage.
3. Copiez `firebase.example.js` vers `firebase-config.js`.
4. Remplacez les valeurs d’exemple par la configuration réelle du projet.
5. Déployez `firestore.rules` et `storage.rules` avec la Firebase CLI.
6. Ajoutez ensuite les appels SDK dans `app.js` pour remplacer les données de démonstration.

## Collections Firestore prévues

- `users/{uid}`
- `meetings/{meetingId}`
- `assignments/{assignmentId}`
- `talks/{talkId}`
- `territories/{territoryId}`
- `documents/{documentId}`
- `announcements/{announcementId}`
- `auditLogs/{logId}`

## Rôles

- **Administrateur** : gestion complète des utilisateurs, rôles, données, documents, réunions, territoires et statistiques.
- **Éditeur** : modification limitée aux modules attribués par l’administrateur.
- **Membre** : consultation uniquement des informations autorisées.

## Évolutions futures

- Notifications push.
- Export PDF et Excel.
- Calendrier synchronisable.
- Statistiques.
- Gestion avancée des territoires.
- Carte interactive OpenStreetMap.
- Historique détaillé.
- Sauvegardes automatiques.
- Interface multilingue : français, russe, anglais.
