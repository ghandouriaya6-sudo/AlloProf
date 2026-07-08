// ===== AlloProf — firebase.js =====
// Fichier central : initialise Firebase App, Auth, Firestore et Storage.
// Toutes les autres parties du projet importent depuis ce fichier uniquement.

import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }     from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCKprhunSs6kt4GOO0IzC-gpekkUnXxMG0",
  authDomain:        "alloprof-95212.firebaseapp.com",
  projectId:         "alloprof-95212",
  storageBucket:     "alloprof-95212.firebasestorage.app",
  messagingSenderId: "851522175223",
  appId:             "1:851522175223:web:2b8a3f89c2a74ebb8e53f2"
};

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };