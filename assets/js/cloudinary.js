// ============================================================================
// cloudinary.js
// Upload non-signé (unsigned) de fichiers PDF vers Cloudinary.
// Utilisé par admin-cours.js, admin-exercices.js et admin-examens.js afin que
// l'administrateur n'ait jamais à copier/coller une URL de PDF manuellement :
// il sélectionne un fichier, celui-ci est envoyé à Cloudinary, et l'URL
// sécurisée (secure_url) retournée est enregistrée automatiquement dans
// Firestore.
// ============================================================================

const CLOUDINARY_CLOUD_NAME = "swefzpas";
const CLOUDINARY_UPLOAD_PRESET = "alloprof_premium";
const CLOUDINARY_PDF_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
const CLOUDINARY_IMAGE_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Envoie un fichier PDF vers Cloudinary (upload preset non-signé) et
 * retourne son secure_url.
 * @param {File} file
 * @returns {Promise<string>} secure_url renvoyée par Cloudinary
 */
export async function uploadPdfToCloudinary(file) {
  if (!file) throw new Error("Aucun fichier PDF sélectionné.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let res;
  try {
    res = await fetch(CLOUDINARY_PDF_UPLOAD_URL, { method: "POST", body: formData });
  } catch (networkErr) {
    console.error("Erreur réseau Cloudinary :", networkErr);
    throw new Error("Impossible de contacter Cloudinary. Vérifie ta connexion internet.");
  }

  let data;
  try {
    data = await res.json();
  } catch (_) {
    throw new Error("Réponse Cloudinary illisible.");
  }

  if (!res.ok) {
    console.error("Erreur Cloudinary :", data);
    throw new Error(data?.error?.message || "Échec de l'envoi du PDF vers Cloudinary.");
  }
  if (!data.secure_url) {
    throw new Error("Réponse Cloudinary invalide (secure_url manquant).");
  }
  return data.secure_url;
}

/**
 * Envoie une photo de profil (avatar) vers Cloudinary (upload preset
 * non-signé) et retourne son secure_url.
 * @param {File} file
 * @returns {Promise<string>} secure_url renvoyée par Cloudinary
 */
export async function uploadAvatarToCloudinary(file) {
  if (!file) throw new Error("Aucune image sélectionnée.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let res;
  try {
    res = await fetch(CLOUDINARY_IMAGE_UPLOAD_URL, { method: "POST", body: formData });
  } catch (networkErr) {
    console.error("Erreur réseau Cloudinary :", networkErr);
    throw new Error("Impossible de contacter Cloudinary. Vérifie ta connexion internet.");
  }

  let data;
  try {
    data = await res.json();
  } catch (_) {
    throw new Error("Réponse Cloudinary illisible.");
  }

  if (!res.ok) {
    console.error("Erreur Cloudinary :", data);
    throw new Error(data?.error?.message || "Échec de l'envoi de la photo de profil vers Cloudinary.");
  }
  if (!data.secure_url) {
    throw new Error("Réponse Cloudinary invalide (secure_url manquant).");
  }
  return data.secure_url;
}
