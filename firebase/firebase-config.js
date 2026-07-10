// ===== Configuration Firebase (à compléter) =====
// 1. Crée un projet sur https://console.firebase.google.com
// 2. Active Authentication (Email/Password, Google...)
// 3. Active Firestore Database
// 4. Active Storage si besoin d'héberger des fichiers (PDF, images)
// 5. Remplace les valeurs ci-dessous par celles de TON projet Firebase.
// 6. Décommente les imports SDK dans index.html (ou pages concernées) :
//
//   <script type="module">
//     import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
//     import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
//     import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
//     import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
//
//     const app = initializeApp(firebaseConfig);
//     const auth = getAuth(app);
//     const db = getFirestore(app);
//     const storage = getStorage(app);
//   </script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKprhunSs6kt4GOO0IzC-gpekkUnXxMG0",
  authDomain: "alloprof-95212.firebaseapp.com",
  projectId: "alloprof-95212",
  storageBucket: "alloprof-95212.firebasestorage.app",
  messagingSenderId: "851522175223",
  appId: "1:851522175223:web:2b8a3f89c2a74ebb8e53f2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// Structure Firestore recommandée :
//
// /users/{uid}            -> { nom, email, photoURL, premium: bool, progression: {} }
// /courses/{courseId}     -> { titre, description, matiere, niveau, premium, chapitres: [] }
// /exercises/{exerciseId} -> { coursId, titre, questions: [] }
// /exams/{examId}         -> { titre, matiere, niveau, duree, questions: [] }
// /results/{resultId}     -> { uid, examId, score, date }

export { firebaseConfig };