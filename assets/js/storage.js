// ============================================================================
// storage.js
// Fonctions d'upload / suppression de fichiers dans Firebase Storage.
// Organisation des dossiers :
//   /courses/{courseId}/image.{ext}
//   /courses/{courseId}/video.{ext}
// Remarque : les PDF (exercices, examens, cours) et les avatars ne passent
// plus par Storage — ce sont des URL Cloudinary enregistrées directement
// dans Firestore.
// ============================================================================

import { storage } from "../../firebase/firebase.js";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/**
 * Upload générique : envoie un fichier vers un chemin donné et
 * retourne son URL de téléchargement publique.
 * @param {File} file
 * @param {string} path - chemin complet dans le bucket
 * @returns {Promise<string>} downloadURL
 */
async function uploadFile(file, path) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/**
 * Supprime un fichier à partir de son URL de téléchargement Firebase.
 * Ne lève pas d'erreur si le fichier n'existe déjà plus.
 * @param {string} url
 */
async function deleteFileByUrl(url) {
  if (!url) return;
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (err) {
    // Fichier déjà supprimé ou URL externe : on ignore silencieusement
    console.warn("deleteFileByUrl: suppression ignorée ->", err.message);
  }
}

/**
 * Upload générique avec suivi de progression : envoie un fichier vers un
 * chemin donné et retourne son URL de téléchargement publique.
 * @param {File} file
 * @param {string} path
 * @param {(pct:number)=>void} [onProgress] - callback 0-100
 * @returns {Promise<string>} downloadURL
 */
function uploadFileWithProgress(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, path);
    const task = uploadBytesResumable(fileRef, file);
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/** Upload l'image de couverture d'un cours. */
export async function uploadCourseImage(courseId, file) {
  const ext = file.name.split(".").pop();
  return uploadFile(file, `courses/${courseId}/image.${ext}`);
}

/** Supprime l'image de couverture d'un cours. */
export function deleteCourseImage(imageUrl) {
  return deleteFileByUrl(imageUrl);
}

/** Upload la vidéo associée à un cours (avec progression). */
export async function uploadCourseVideo(courseId, file, onProgress) {
  const ext = file.name.split(".").pop();
  return uploadFileWithProgress(file, `courses/${courseId}/video.${ext}`, onProgress);
}

/** Supprime la vidéo associée à un cours. */
export function deleteCourseVideo(videoUrl) {
  return deleteFileByUrl(videoUrl);
}

// Remarque : l'avatar (photo de profil) n'est plus géré ici — il passe
// désormais par Cloudinary (voir firebase/auth.js / cloudinary.js) et
// n'utilise plus Firebase Storage.