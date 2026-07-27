Projet : AssemblyHub

Objectif

Créer une application web moderne (PWA) destinée à une seule congrégation afin de centraliser la gestion des informations utiles à la vie de la congrégation.

L’application doit être accessible depuis un navigateur web, mais également installable sur téléphone (Android/iPhone) comme une application grâce à la technologie PWA.

Le projet est privé et destiné exclusivement aux membres de la congrégation autorisés à y accéder.

⸻

Stack technique

Frontend

* HTML5
* CSS3
* JavaScript Vanilla (sans framework)
* Responsive Design
* Progressive Web App (PWA)

Backend

* Firebase Authentication
* Cloud Firestore
* Firebase Storage

Hébergement

* GitHub Pages (frontend)
* Firebase (base de données et authentification)

⸻

Gestion des rôles

Administrateur

L’administrateur principal est le créateur de l’application.

Permissions :

* gestion complète des utilisateurs ;
* ajout/suppression d’éditeurs ;
* création/modification/suppression de toutes les données ;
* publication de documents ;
* gestion des réunions ;
* gestion des territoires ;
* accès à toutes les statistiques.

⸻

Éditeurs

Les éditeurs sont désignés par l’administrateur.

Permissions :

* modifier uniquement les modules qui leur sont attribués ;
* ajouter ou modifier des informations dans les modules autorisés.

Exemples :

* responsable territoires ;
* responsable réunions ;
* responsable documents.

⸻

Membres

Tous les frères et sœurs de la congrégation.

Permissions :

* consulter les informations ;
* consulter leurs affectations ;
* télécharger les documents autorisés ;
* consulter les territoires attribués.

Aucune modification des données.

⸻

Fonctionnalités V1

1. Tableau de bord

Afficher :

* prochaines réunions ;
* affectations personnelles ;
* nouveaux documents ;
* annonces importantes ;
* raccourcis vers les différents modules.

⸻

2. Gestion des utilisateurs

Chaque utilisateur possède :

* prénom ;
* nom ;
* email ;
* téléphone (facultatif) ;
* groupe ;
* rôle (membre, éditeur, administrateur) ;
* privilèges éventuels.

Fonctionnalités :

* création ;
* modification ;
* désactivation ;
* recherche.

⸻

3. Gestion des réunions

Création des réunions avec :

* date ;
* type de réunion ;
* commentaires éventuels.

Gestion des affectations :

* président ;
* lecteur ;
* son ;
* vidéo ;
* accueil ;
* micros ;
* prière ;
* autres responsabilités.

Affichage :

* vue liste ;
* vue calendrier ;
* vue mensuelle.

⸻

4. Gestion des sujets

Pour les parties de la réunion Vie et ministère.

Chaque sujet contient :

* date ;
* type de sujet ;
* personne assignée ;
* accompagnant ;
* statut.

Historique consultable.

⸻

5. Gestion des territoires

Pour chaque territoire :

* numéro ;
* description ;
* statut ;
* responsable ;
* date d’attribution ;
* date de retour ;
* notes.

Statuts possibles :

* disponible ;
* attribué ;
* en cours ;
* terminé.

⸻

6. Gestion documentaire

Stockage de documents dans Firebase Storage.

Catégories :

* réunions ;
* assemblées ;
* territoires ;
* annonces ;
* divers.

Fonctionnalités :

* recherche ;
* téléchargement ;
* aperçu ;
* classement par catégorie.

⸻

7. Annonces

Création d’annonces visibles sur le tableau de bord.

Exemples :

* changement d’horaire ;
* réunion spéciale ;
* information importante.

⸻

Fonctionnalités PWA

* installation sur téléphone ;
* mode hors ligne ;
* synchronisation automatique lors du retour de la connexion ;
* mise à jour automatique de l’application.

⸻

Structure Firestore

users/
uid

meetings/
meetingId

assignments/
assignmentId

talks/
talkId

territories/
territoryId

documents/
documentId

announcements/
announcementId

⸻

Interface utilisateur

Menu principal :

* Tableau de bord
* Réunions
* Affectations
* Sujets
* Territoires
* Documents
* Annonces
* Utilisateurs
* Paramètres

Design :

* moderne ;
* sobre ;
* professionnel ;
* optimisé mobile ;
* mode clair et sombre.

⸻

Sécurité

* authentification obligatoire ;
* contrôle des rôles via Firestore Security Rules ;
* seuls les administrateurs peuvent gérer les rôles ;
* les membres ne peuvent modifier aucune donnée ;
* journalisation des modifications importantes.

⸻

Version 1.0 (MVP)

Objectif :

Permettre à toute la congrégation de :

* se connecter ;
* consulter les réunions ;
* consulter leurs affectations ;
* consulter les documents ;
* consulter les annonces.

L’administrateur doit pouvoir :

* gérer les utilisateurs ;
* publier des documents ;
* gérer les réunions ;
* gérer les affectations.

⸻

Évolutions futures (V2)

* notifications push ;
* export PDF ;
* export Excel ;
* calendrier synchronisable ;
* statistiques ;
* gestion avancée des territoires ;
* carte interactive OpenStreetMap ;
* historique détaillé ;
* sauvegardes automatiques ;
* application multilingue (français, russe, anglais).

⸻

Nom du projet

AssemblyHub

Application PWA privée de gestion et d’organisation pour une congrégation, avec gestion des utilisateurs, réunions, affectations, territoires et documents, synchronisée via Firebase.
