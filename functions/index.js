/**
 * AssemblyHub — Cloud Functions
 * Gestion sécurisée des utilisateurs (Firebase Auth + Firestore) réservée aux administrateurs.
 *
 * Fonctions exposées (région: europe-west1, mêmes noms que ceux appelés par app.js) :
 *   - createAssemblyHubUser
 *   - deleteAssemblyHubUser
 *   - disableAssemblyHubUser
 *   - enableAssemblyHubUser
 *   - resetAssemblyHubUserPassword
 *
 * Toutes les fonctions :
 *   1. Vérifient que l'appelant est authentifié.
 *   2. Vérifient que l'appelant possède un document /users/{uid} avec role admin/administrateur et active === true.
 *   3. Effectuent l'action via le SDK Admin (Auth + Firestore).
 *   4. Journalisent l'action dans /auditLogs.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

setGlobalOptions({ region: 'europe-west1' });

const ADMIN_ROLES = ['admin', 'administrateur'];
const db = admin.firestore();
const auth = admin.auth();

/**
 * Vérifie que l'appelant est un administrateur actif.
 * Retourne le document Firestore de l'appelant (avec son uid).
 */
async function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Vous devez être connecté.');
  }
  const callerUid = request.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new HttpsError('permission-denied', "Aucun profil AssemblyHub associé à ce compte.");
  }
  const callerData = callerSnap.data();
  if (callerData.active === false) {
    throw new HttpsError('permission-denied', 'Votre compte est désactivé.');
  }
  if (!ADMIN_ROLES.includes(callerData.role)) {
    throw new HttpsError('permission-denied', 'Action réservée aux administrateurs.');
  }
  return { uid: callerUid, ...callerData };
}

/** Écrit une entrée dans /auditLogs. Ne bloque jamais l'action principale en cas d'erreur de log. */
async function writeAuditLog({ action, targetUid, performedBy, details }) {
  try {
    await db.collection('auditLogs').add({
      action,
      targetUid: targetUid || null,
      performedBy,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: details || {},
    });
  } catch (error) {
    console.error('Échec de journalisation audit', error);
  }
}

function requireString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpsError('invalid-argument', `Le champ "${fieldName}" est requis.`);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// createAssemblyHubUser
// ---------------------------------------------------------------------------
exports.createAssemblyHubUser = onCall(async (request) => {
  const admin_ = await requireAdmin(request);
  const data = request.data || {};

  const email = requireString(data.email, 'email').toLowerCase();
  const firstName = requireString(data.firstName, 'firstName');
  const lastName = requireString(data.lastName, 'lastName');
  const role = requireString(data.role, 'role');
  const editor = data.editor === true;
  const privileges = Array.isArray(data.privileges) ? data.privileges : [];

  // Mot de passe temporaire : l'utilisateur devra le réinitialiser via le lien envoyé.
  const temporaryPassword = admin.firestore.Timestamp.now().toMillis().toString(36) + Math.random().toString(36).slice(2, 10);

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email,
      password: temporaryPassword,
      displayName: `${firstName} ${lastName}`.trim(),
      disabled: false,
    });
  } catch (error) {
    throw new HttpsError('already-exists', `Création du compte impossible : ${error.message}`);
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  try {
    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      prenom: firstName,
      nom: lastName,
      email,
      role,
      editor,
      privileges,
      active: true,
      createdAt: now,
      createdBy: admin_.uid,
      lastLogin: null,
    });
  } catch (error) {
    // Rollback du compte Auth si l'écriture Firestore échoue, pour rester synchronisé.
    await auth.deleteUser(userRecord.uid).catch(() => {});
    throw new HttpsError('internal', `Création du profil impossible : ${error.message}`);
  }

  let resetLink = null;
  try {
    resetLink = await auth.generatePasswordResetLink(email);
  } catch (error) {
    console.error('Génération du lien de réinitialisation impossible', error);
  }

  await writeAuditLog({
    action: 'createUser',
    targetUid: userRecord.uid,
    performedBy: admin_.uid,
    details: { email, role, editor },
  });

  return { uid: userRecord.uid, resetLink };
});

// ---------------------------------------------------------------------------
// deleteAssemblyHubUser
// ---------------------------------------------------------------------------
exports.deleteAssemblyHubUser = onCall(async (request) => {
  const admin_ = await requireAdmin(request);
  const uid = requireString((request.data || {}).uid, 'uid');

  if (uid === admin_.uid) {
    throw new HttpsError('failed-precondition', 'Vous ne pouvez pas supprimer votre propre compte.');
  }

  await auth.deleteUser(uid).catch((error) => {
    if (error.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', `Suppression du compte impossible : ${error.message}`);
    }
  });
  await db.collection('users').doc(uid).delete();

  await writeAuditLog({
    action: 'deleteUser',
    targetUid: uid,
    performedBy: admin_.uid,
  });

  return { success: true };
});

// ---------------------------------------------------------------------------
// disableAssemblyHubUser
// ---------------------------------------------------------------------------
exports.disableAssemblyHubUser = onCall(async (request) => {
  const admin_ = await requireAdmin(request);
  const uid = requireString((request.data || {}).uid, 'uid');

  if (uid === admin_.uid) {
    throw new HttpsError('failed-precondition', 'Vous ne pouvez pas désactiver votre propre compte.');
  }

  await auth.updateUser(uid, { disabled: true });
  await db.collection('users').doc(uid).update({ active: false });

  await writeAuditLog({
    action: 'disableUser',
    targetUid: uid,
    performedBy: admin_.uid,
  });

  return { success: true };
});

// ---------------------------------------------------------------------------
// enableAssemblyHubUser
// ---------------------------------------------------------------------------
exports.enableAssemblyHubUser = onCall(async (request) => {
  const admin_ = await requireAdmin(request);
  const uid = requireString((request.data || {}).uid, 'uid');

  await auth.updateUser(uid, { disabled: false });
  await db.collection('users').doc(uid).update({ active: true });

  await writeAuditLog({
    action: 'enableUser',
    targetUid: uid,
    performedBy: admin_.uid,
  });

  return { success: true };
});

// ---------------------------------------------------------------------------
// resetAssemblyHubUserPassword
// ---------------------------------------------------------------------------
exports.resetAssemblyHubUserPassword = onCall(async (request) => {
  const admin_ = await requireAdmin(request);
  const uid = requireString((request.data || {}).uid, 'uid');

  const userRecord = await auth.getUser(uid).catch(() => {
    throw new HttpsError('not-found', 'Utilisateur introuvable.');
  });

  const resetLink = await auth.generatePasswordResetLink(userRecord.email);

  await writeAuditLog({
    action: 'resetPassword',
    targetUid: uid,
    performedBy: admin_.uid,
    details: { email: userRecord.email },
  });

  return { resetLink, email: userRecord.email };
});
