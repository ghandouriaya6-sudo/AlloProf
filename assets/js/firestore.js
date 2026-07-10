// ===== AlloProf — assets/js/firestore.js =====
// Couche de données : lit depuis Firestore (courses, exercises, exams, results).
// Si une collection Firestore est vide, utilise les données statiques de data.js en fallback
// pour que le site fonctionne dès le premier démarrage, avant l'alimentation de la base.

import { db } from "../../firebase/firebase.js";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================================================
   COURS
   ========================================================= */

/**
 * Retourne la liste de tous les cours.
 * Priorité : Firestore `courses` → fallback ALLOPROF_DATA.cours
 */
export async function getCourses() {
  try {
    const snap = await getDocs(collection(db, "courses"));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (_) {}
  return (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.cours : [];
}

/**
 * Retourne un cours par son id.
 */
export async function getCourse(id) {
  try {
    const snap = await getDoc(doc(db, "courses", id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (_) {}
  // Fallback données statiques
  if (typeof ALLOPROF_DATA !== "undefined") {
    return ALLOPROF_DATA.cours.find(c => c.id === id) || null;
  }
  return null;
}

/* =========================================================
   EXERCICES
   ========================================================= */

export async function getExercises() {
  try {
    const snap = await getDocs(collection(db, "exercises"));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (_) {}
  return (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.exercices : [];
}

/* =========================================================
   EXAMENS
   ========================================================= */

export async function getExams() {
  try {
    const snap = await getDocs(collection(db, "exams"));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (_) {}
  return (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.examens : [];
}

/* =========================================================
   RÉSULTATS
   ========================================================= */

/**
 * Enregistre un résultat d'examen dans Firestore.
 * Collection : results → { uid, examId, examTitre, score, totalQuestions, timeUsed, date }
 */
export async function saveResult(uid, examId, examTitre, score, totalQuestions, timeUsedSeconds) {
  try {
    await addDoc(collection(db, "results"), {
      uid,
      examId,
      examTitre,
      score,
      totalQuestions,
      pourcentage: Math.round((score / totalQuestions) * 100),
      timeUsedSeconds,
      date: serverTimestamp()
    });
  } catch (err) {
    console.error("Erreur sauvegarde résultat :", err);
  }
}

/**
 * Récupère les résultats d'un utilisateur, triés par date décroissante.
 */
export async function getUserResults(uid) {
  try {
    const q = query(
      collection(db, "results"),
      where("uid", "==", uid),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (_) {
    return [];
  }
}

/* =========================================================
   PROGRESSION DES COURS (stockée dans users/{uid}.progress)
   ========================================================= */

/**
 * Récupère la map de progression d'un utilisateur : { courseId: pourcentage }
 */
export async function getUserProgress(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data().progress || {}) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Met à jour la progression d'un cours pour un utilisateur.
 */
export async function updateCourseProgress(uid, courseId, pourcentage) {
  try {
    await updateDoc(doc(db, "users", uid), {
      [`progress.${courseId}`]: pourcentage
    });
  } catch (err) {
    console.error("Erreur mise à jour progression :", err);
  }
}
export async function logActivity(type, message) {
  try {
    await addDoc(collection(db, "activity"), {
      type, // "course" | "exercise" | "exam" | "user" | "premium"
      message,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("logActivity a échoué (non bloquant) :", err.message);
  }
}
 
// ============================================================================
// COURS (collection "courses")
// ============================================================================
 
/**
 * Ajoute un nouveau cours.
 * @param {Object} data - {titre, description, contenu, matiere, niveau, duree,
 *                          premium, image, pdf, youtube}
 * @returns {Promise<string>} id du document créé
 */
export async function addCourse(data) {
  const ref = await addDoc(collection(db, "courses"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity("course", `Nouveau cours ajouté : "${data.titre}"`);
  return ref.id;
}
 
/**
 * Met à jour un cours existant.
 * @param {string} id
 * @param {Object} data
 */
export async function updateCourse(id, data) {
  await updateDoc(doc(db, "courses", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await logActivity("course", `Cours modifié : "${data.titre ?? id}"`);
}
 
/**
 * Supprime un cours.
 * @param {string} id
 * @param {string} titre - utilisé uniquement pour le journal d'activité
 */
export async function deleteCourse(id, titre = "") {
  await deleteDoc(doc(db, "courses", id));
  await logActivity("course", `Cours supprimé : "${titre || id}"`);
}
 
/** Récupère un cours par id. */

 
/**
 * Récupère tous les cours, triés par date de création décroissante.
 * Le filtrage/recherche/tri/pagination fins se font ensuite côté client
 * (voir admin-cours.js) car le volume de données reste raisonnable pour un CMS.
 */
export async function getAllCourses() {
  const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
 
// ============================================================================
// EXERCICES (collection "exercises")
// ============================================================================
 
export async function addExercise(data) {
  const ref = await addDoc(collection(db, "exercises"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity("exercise", `Nouvel exercice ajouté : "${data.titre}"`);
  return ref.id;
}
 
export async function updateExercise(id, data) {
  await updateDoc(doc(db, "exercises", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await logActivity("exercise", `Exercice modifié : "${data.titre ?? id}"`);
}
 
export async function deleteExercise(id, titre = "") {
  await deleteDoc(doc(db, "exercises", id));
  await logActivity("exercise", `Exercice supprimé : "${titre || id}"`);
}
 
export async function getAllExercises() {
  const q = query(collection(db, "exercises"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
 
// ============================================================================
// EXAMENS (collection "exams")
// ============================================================================
 
export async function addExam(data) {
  const ref = await addDoc(collection(db, "exams"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity("exam", `Nouvel examen ajouté : "${data.titre}"`);
  return ref.id;
}
 
export async function updateExam(id, data) {
  await updateDoc(doc(db, "exams", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await logActivity("exam", `Examen modifié : "${data.titre ?? id}"`);
}
 
export async function deleteExam(id, titre = "") {
  await deleteDoc(doc(db, "exams", id));
  await logActivity("exam", `Examen supprimé : "${titre || id}"`);
}
 
export async function getAllExams() {
  const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
 
// ============================================================================
// UTILISATEURS (collection "users") - lecture + actions admin
// ============================================================================
 
export async function getAllUsers() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
 
export async function setUserPremium(uid, isPremium) {
  await updateDoc(doc(db, "users", uid), { premium: isPremium });
  await logActivity(
    "premium",
    isPremium ? `Utilisateur passé Premium (${uid})` : `Premium retiré (${uid})`
  );
}
 
export async function setUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), { role });
  await logActivity("user", `Rôle changé pour ${uid} -> ${role}`);
}
 
export async function deleteUser(uid) {
  await deleteDoc(doc(db, "users", uid));
  await logActivity("user", `Utilisateur supprimé (${uid})`);
}
 
// ============================================================================
// STATISTIQUES DASHBOARD
// ============================================================================
 
/**
 * Calcule les statistiques globales affichées sur le dashboard admin.
 * Remarque : sur un très gros volume de données, ces comptages devraient être
 * dénormalisés dans un document "stats/summary" mis à jour par Cloud Functions.
 * Pour la taille actuelle du projet, un comptage direct est suffisant.
 * @returns {Promise<Object>}
 */
export async function getDashboardStats() {
  const [usersSnap, coursesSnap, exercisesSnap, examsSnap, resultsSnap] =
    await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "courses")),
      getDocs(collection(db, "exercices")),
      getDocs(collection(db, "examens")),
      getDocs(collection(db, "results")).catch(() => ({ docs: [] })),
    ]);
 
  const users = usersSnap.docs.map((d) => d.data());
  const premiumUsers = users.filter((u) => u.premium === true).length;
 
  return {
    totalUsers: usersSnap.size,
    premiumUsers,
    totalCourses: coursesSnap.size,
    totalExercises: exercisesSnap.size,
    totalExams: examsSnap.size,
    examsTaken: resultsSnap.docs ? resultsSnap.docs.length : 0,
  };
}
 
/**
 * Récupère les N dernières entrées du journal d'activité pour le dashboard.
 * @param {number} max
 */
export async function getRecentActivity(max = 10) {
  const q = query(
    collection(db, "activity"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
 
// ============================================================================
// EXERCICES (bibliothèque PDF) — collection "exercices"
// Modèle : { titre, description, matiere, niveau, pdf, premium, createdAt }
// ============================================================================

export async function getExercicesLib() {
  try {
    const q = query(collection(db, "exercices"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (_) {
    // Fallback sans tri si l'index/orderBy pose problème sur une collection vide
    const snap = await getDocs(collection(db, "exercices"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export const getAllExercicesLib = getExercicesLib;

export async function addExerciceLib(data) {
  const ref = await addDoc(collection(db, "exercices"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logActivity("exercise", `Nouvel exercice ajouté : "${data.titre}"`);
  return ref.id;
}

export async function updateExerciceLib(id, data) {
  await updateDoc(doc(db, "exercices", id), { ...data });
  await logActivity("exercise", `Exercice modifié : "${data.titre ?? id}"`);
}

export async function deleteExerciceLib(id, titre = "") {
  await deleteDoc(doc(db, "exercices", id));
  await logActivity("exercise", `Exercice supprimé : "${titre || id}"`);
}

// ============================================================================
// EXAMENS (bibliothèque PDF) — collection "examens"
// Modèle : { titre, description, matiere, niveau, pdf, premium, createdAt }
// ============================================================================

export async function getExamensLib() {
  try {
    const q = query(collection(db, "examens"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (_) {
    const snap = await getDocs(collection(db, "examens"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export const getAllExamensLib = getExamensLib;

export async function addExamenLib(data) {
  const ref = await addDoc(collection(db, "examens"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logActivity("exam", `Nouvel examen ajouté : "${data.titre}"`);
  return ref.id;
}

export async function updateExamenLib(id, data) {
  await updateDoc(doc(db, "examens", id), { ...data });
  await logActivity("exam", `Examen modifié : "${data.titre ?? id}"`);
}

export async function deleteExamenLib(id, titre = "") {
  await deleteDoc(doc(db, "examens", id));
  await logActivity("exam", `Examen supprimé : "${titre || id}"`);
}

// ============================================================================
// PREMIUM (collection "premium_plans")
// Modèle : { nom, prix, periode, description, actif, ordre }
// ============================================================================
 
export async function getPremiumPlans() {
  try {
    const q = query(collection(db, "premium_plans"), orderBy("ordre", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (_) {
    const snap = await getDocs(collection(db, "premium_plans"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

/** Offres actives uniquement, pour la page publique premium.html */
export async function getActivePremiumPlans() {
  const plans = await getPremiumPlans();
  return plans.filter((p) => p.actif !== false);
}
 
export async function savePremiumPlan(id, data) {
  if (id) {
    await updateDoc(doc(db, "premium_plans", id), data);
  } else {
    await addDoc(collection(db, "premium_plans"), data);
  }
  await logActivity("premium", `Offre Premium enregistrée : "${data.nom}"`);
}

export async function deletePremiumPlan(id, nom = "") {
  await deleteDoc(doc(db, "premium_plans", id));
  await logActivity("premium", `Offre Premium supprimée : "${nom || id}"`);
}

export async function togglePremiumPlan(id, actif) {
  await updateDoc(doc(db, "premium_plans", id), { actif });
  await logActivity("premium", `Offre Premium ${actif ? "activée" : "désactivée"} (${id})`);
}

// ============================================================================
// ABONNEMENTS PREMIUM (dashboard admin — basés sur la collection "users")
// ============================================================================

/** Liste des utilisateurs avec leurs informations d'abonnement Premium. */
export async function getPremiumSubscriptions() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }));
}

/**
 * Met à jour l'abonnement Premium d'un utilisateur.
 * @param {string} uid
 * @param {Object} data - {premium, premiumPlan, premiumStart, premiumEnd}
 */
export async function updateSubscription(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
  await logActivity("premium", `Abonnement mis à jour pour ${uid}`);
}
 
// ============================================================================
// DEMANDES PREMIUM (collection "premium_requests")
// Modèle : { uid, nom, email, telephone, planId, planName,
//            receiptUrl, receiptPublicId, receiptUploadedAt, statut, createdAt }
// statut : "en_attente" | "valide" | "refuse"
// receiptUrl / receiptPublicId proviennent de Cloudinary (upload non-signé,
// cloud "swefzpas", preset "alloprof_premium") — aucun fichier n'est stocké
// dans Firebase Storage pour les reçus.
// ============================================================================

/**
 * Crée une demande d'abonnement Premium avec preuve de virement
 * (formulaire demande-premium.html). Le reçu est déjà hébergé sur Cloudinary
 * au moment de l'appel ; seules les métadonnées sont enregistrées ici.
 * @param {Object} data - {uid, nom, email, telephone, planId, planName,
 *                          receiptUrl, receiptPublicId, receiptUploadedAt}
 * @returns {Promise<string>} id du document créé
 */
export async function createPremiumRequest(data) {
  const ref = await addDoc(collection(db, "premium_requests"), {
    uid: data.uid,
    nom: data.nom || "",
    email: data.email || "",
    telephone: data.telephone || "",
    planId: data.planId || "",
    planName: data.planName || "",
    receiptUrl: data.receiptUrl || "",
    receiptPublicId: data.receiptPublicId || "",
    receiptUploadedAt: data.receiptUploadedAt || new Date().toISOString(),
    statut: "en_attente",
    createdAt: serverTimestamp(),
  });
  await logActivity("premium", `Nouvelle demande Premium : "${data.nom}" (${data.planName})`);
  return ref.id;
}

/**
 * Récupère toutes les demandes Premium, triées par date décroissante.
 */
export async function getPremiumRequests() {
  try {
    const q = query(collection(db, "premium_requests"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (_) {
    const snap = await getDocs(collection(db, "premium_requests"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

/**
 * Valide une demande Premium :
 * - active le Premium sur users/{uid}
 * - calcule la date de fin selon la durée de l'offre (mois = 30j, an = 365j)
 * - marque la demande comme "valide"
 * @param {string} requestId
 * @param {Object} request - la demande complète (uid, planId, planName, nom, ...)
 */
export async function approvePremiumRequest(requestId, request) {
  let periode = "mois";
  let planNom = request.planName || "";

  try {
    const planSnap = await getDoc(doc(db, "premium_plans", request.planId));
    if (planSnap.exists()) {
      periode = planSnap.data().periode || "mois";
      planNom = planSnap.data().nom || planNom;
    }
  } catch (_) {}

  const durationDays = periode === "an" ? 365 : 30;
  const start = new Date();
  const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await updateDoc(doc(db, "users", request.uid), {
    premium: true,
    premiumPlan: planNom,
    premiumStart: start.toISOString(),
    premiumEnd: end.toISOString(),
  });

  await updateDoc(doc(db, "premium_requests", requestId), {
    statut: "valide",
  });

  await logActivity("premium", `Demande Premium validée : "${request.nom}" (${planNom})`);
}

/**
 * Refuse une demande Premium : marque la demande comme "refuse".
 * @param {string} requestId
 * @param {string} nom - utilisé uniquement pour le journal d'activité
 */
export async function rejectPremiumRequest(requestId, nom = "") {
  await updateDoc(doc(db, "premium_requests", requestId), {
    statut: "refuse",
  });
  await logActivity("premium", `Demande Premium refusée : "${nom || requestId}"`);
}

// ============================================================================
// PARAMÈTRES (document unique "settings/general")
// ============================================================================
 
export async function getSettings() {
  const snap = await getDoc(doc(db, "settings", "general"));
  return snap.exists() ? snap.data() : null;
}
 
export async function saveSettings(data) {
  await setDoc(
    doc(db, "settings", "general"),
    data,
    { merge: true }
  );
}

// ============================================================================
// MESSAGERIE INTERNE (collection "messages") — formulaire de contact
// Modèle : { nom, email, sujet, message, lu, createdAt }
// ============================================================================

/** Enregistre un message envoyé depuis le formulaire Contact. */
export async function addContactMessage(data) {
  await addDoc(collection(db, "messages"), {
    nom: data.nom || "",
    email: data.email || "",
    sujet: data.sujet || "",
    message: data.message || "",
    lu: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Écoute en temps réel la liste des messages (les plus récents en premier).
 * @param {(messages: Array) => void} callback
 * @returns {Function} unsubscribe
 */
export function subscribeMessages(callback) {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Écoute en temps réel le nombre de messages non lus (pour le badge sidebar).
 * @param {(count: number) => void} callback
 * @returns {Function} unsubscribe
 */
export function subscribeUnreadMessagesCount(callback) {
  const q = query(collection(db, "messages"), where("lu", "==", false));
  return onSnapshot(q, (snap) => callback(snap.size), () => callback(0));
}

/** Marque un message comme lu. */
export async function markMessageRead(id) {
  await updateDoc(doc(db, "messages", id), { lu: true });
}

/** Supprime un message. */
export async function deleteMessage(id) {
  await deleteDoc(doc(db, "messages", id));
}