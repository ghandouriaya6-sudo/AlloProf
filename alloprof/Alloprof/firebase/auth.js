// ===== AlloProf — firebase/auth.js =====
// Toute la logique Authentication + profil Firestore centralisée ici.
// Aucune donnée utilisateur en localStorage.

import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { uploadAvatarToCloudinary } from "../assets/js/cloudinary.js";

/* ---- Traduction des codes d'erreur Firebase en français ---- */
function firebaseErrorFR(code) {
  const map = {
    "auth/user-not-found":        "Aucun compte trouvé avec cet email.",
    "auth/wrong-password":        "Mot de passe incorrect.",
    "auth/invalid-credential":    "Email ou mot de passe incorrect.",
    "auth/email-already-in-use":  "Cet email est déjà utilisé par un autre compte.",
    "auth/weak-password":         "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/invalid-email":         "Adresse email invalide.",
    "auth/too-many-requests":     "Trop de tentatives échouées. Réessaie dans quelques minutes.",
    "auth/network-request-failed":"Erreur réseau. Vérifie ta connexion internet.",
    "auth/user-disabled":         "Ce compte a été désactivé. Contacte le support.",
    "auth/requires-recent-login": "Pour cette action, reconnecte-toi d'abord.",
    "auth/operation-not-allowed": "Cette méthode de connexion n'est pas activée."
  };
  return map[code] || "Une erreur s'est produite. Réessaie.";
}

/**
 * Inscription : crée le compte Firebase Auth + le document Firestore users/{uid}.
 * Collection : users/{uid} → { nom, prenom, email, niveau, premium, role, createdAt }
 */
async function registerUser(
  nom,
  prenom,
  email,
  password,
  niveau,
  telephone,
  region,
  ville
) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    const uid = credential.user.uid;

    console.log("Création document users/", uid);

    await setDoc(doc(db, "users", uid), {
  nom,
  prenom,
  email,
  telephone,
  region,
  ville,
  niveau,

  photoURL: "",

  premium: false,
  premiumPlan: null,
  premiumStart: null,
  premiumEnd: null,

  role: "user",
  progress: {},
  createdAt: serverTimestamp()
});

    console.log("Document créé.");

    await updateProfile(credential.user, {
      displayName: `${prenom} ${nom}`
    });

    return { user: credential.user, error: null };

  } catch (err) {
    console.error(err);
    return {
      user: null,
      error: firebaseErrorFR(err.code)
    };
  }
}

/**
 * Connexion email / mot de passe.
 */
async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (err) {
    return { user: null, error: firebaseErrorFR(err.code) };
  }
}

/**
 * Déconnexion.
 */
async function logoutUser() {
  await firebaseSignOut(auth);
}

/**
 * Mot de passe oublié — envoie un email de réinitialisation.
 */
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: firebaseErrorFR(err.code) };
  }
}

/**
 * Écoute les changements d'état de connexion.
 * callback(firebaseUser | null)
 */
function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Récupère le document Firestore users/{uid}.
 */
async function getUserProfile(uid) {
  try {
    console.log("UID:", uid);

    const snap = await getDoc(doc(db, "users", uid));

    console.log("Document exists:", snap.exists());

    if (snap.exists()) {
      console.log("Profile:", snap.data());
      return { uid, ...snap.data() };
    }

    console.log("Aucun document users/" + uid);
    return null;

  } catch (err) {
    console.error("Erreur Firestore:", err);
    return null;
  }
}

/**
 * Met à jour le document Firestore users/{uid}.
 */
async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}
/**
 * Upload la photo de profil vers Cloudinary (upload non-signé) puis
 * enregistre l'URL sécurisée (secure_url) dans Firestore (users/{uid}.photoURL).
 * @param {string} uid
 * @param {File} file
 * @returns {Promise<string>} secure_url renvoyée par Cloudinary
 */
async function uploadAvatar(uid, file) {

  const secureUrl = await uploadAvatarToCloudinary(file);

  await updateDoc(doc(db, "users", uid), {
    photoURL: secureUrl
  });

  return secureUrl;
}
/**
 * Récupère tous les utilisateurs (dashboard admin uniquement).
 * Nécessite des règles Firestore permettant la lecture à role=="admin".
 */
async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}
/**
 * Protège les pages admin-*.html : exige une session Firebase valide
 * ET un profil Firestore avec role === "admin".
 * Sinon, ferme une éventuelle session non-admin et redirige vers la
 * page de connexion dédiée à l'administration (admin-connexion.html),
 * totalement indépendante de la connexion utilisateur classique.
 */
export async function requireAdmin() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (!user) {
        window.location.href = "admin-connexion.html";
        return reject();
      }

      const profile = await getUserProfile(user.uid);

      if (!profile || profile.role !== "admin") {
        // Session valide mais compte non-admin : on la ferme pour ne pas
        // laisser un utilisateur normal "coincé" connecté sur l'espace admin.
        await firebaseSignOut(auth);
        window.location.href = "admin-connexion.html";
        return reject();
      }

      resolve({ user, profile });
    });
  });
}
export function onAuthReady(callback) {
  return onAuthStateChanged(auth, async (user) => {

    if (!user) {
      callback(null, null);
      return;
    }

    const profile = await getUserProfile(user.uid);

    callback(user, profile);

  });
}
export {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  listenAuthState,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getAllUsers,
  firebaseErrorFR
};