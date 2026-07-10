// ============================================================================
// admin-cours.js
// Gestion des cours (liste, ajout, modification, suppression) — page admin-cours.html
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import { getAllCourses, addCourse, updateCourse, deleteCourse } from "./firestore.js";
import { toastSuccess, toastError } from "./toast.js";
import { openModal, closeModal, bindOverlayClose, confirmDelete } from "../../firebase/modal.js";
import { uploadPdfToCloudinary } from "./cloudinary.js";

/* ---- Configuration Cloudinary (upload non-signé, sans backend) ---- */
const CLOUDINARY_CLOUD_NAME = "swefzpas";
const CLOUDINARY_UPLOAD_PRESET = "alloprof_premium";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/swefzpas/image/upload";

const MATIERES = (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.matieres : [];
const NIVEAUX  = (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.niveaux  : [];

let courses = [];
let editingId = null;

init();

async function init() {
  let profile;
  try {
    ({ profile } = await requireAdmin());
  } catch {
    return;
  }

  initAdminLayout({
    activeKey: "cours",
    pageTitle: "Gestion des cours",
    breadcrumb: ["Admin", "Cours"],
    profile,
  });

  fillSelect("f-matiere", MATIERES);
  fillSelect("f-niveau", NIVEAUX);

  bindOverlayClose("course-modal");
  document.getElementById("btn-add-course").addEventListener("click", () => openCourseForm());
  document.getElementById("btn-close-modal").addEventListener("click", () => closeModal("course-modal"));
  document.getElementById("btn-cancel").addEventListener("click", () => closeModal("course-modal"));
  document.getElementById("course-form").addEventListener("submit", onSubmit);
  document.getElementById("searchCourse").addEventListener("input", renderTable);
  document.getElementById("f-image-file").addEventListener("change", onImageFileChange);
  document.getElementById("f-pdf-file").addEventListener("change", onPdfFileChange);

  await loadCourses();
}

function fillSelect(id, items) {
  const el = document.getElementById(id);
  el.innerHTML = items.map(i => `<option value="${i.id}">${i.nom}</option>`).join("");
}

async function loadCourses() {
  const tbody = document.getElementById("coursesTableBody");
  tbody.innerHTML = `<tr class="skeleton-row"><td colspan="5"><div class="skeleton"></div></td></tr>`.repeat(4);
  try {
    courses = await getAllCourses();
  } catch (err) {
    console.error(err);
    courses = [];
    toastError("Impossible de charger les cours.");
  }
  renderTable();
}

function renderTable() {
  const term = document.getElementById("searchCourse").value.trim().toLowerCase();
  const filtered = term
    ? courses.filter(c => (c.titre || "").toLowerCase().includes(term))
    : courses;

  const tbody = document.getElementById("coursesTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="emoji">📚</div>Aucun cours trouvé.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>${escapeHtml(c.titre || "Sans titre")}</td>
      <td>${nomMatiere(c.matiere)}</td>
      <td>${nomNiveau(c.niveau)}</td>
      <td>${c.premium ? '<span class="badge badge-amber">⭐ Premium</span>' : '<span class="badge badge-emerald">Gratuit</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-secondary btn-sm" data-edit="${c.id}">Modifier</button>
        <button class="btn btn-danger btn-sm" data-delete="${c.id}">Supprimer</button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => openCourseForm(courses.find(c => c.id === btn.dataset.edit))));

  tbody.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const course = courses.find(c => c.id === btn.dataset.delete);
      const ok = await confirmDelete(`Supprimer le cours « ${course?.titre || ""} » ? Cette action est irréversible.`);
      if (!ok) return;
      try {
        await deleteCourse(course.id, course.titre);
        toastSuccess("Cours supprimé.");
        await loadCourses();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la suppression.");
      }
    }));
}

function openCourseForm(course = null) {
  editingId = course?.id || null;
  document.getElementById("modal-title").textContent = course ? "Modifier le cours" : "Ajouter un cours";
  document.getElementById("f-titre").value = course?.titre || "";
  document.getElementById("f-description").value = course?.description || "";
  document.getElementById("f-matiere").value = course?.matiere || (MATIERES[0]?.id ?? "");
  document.getElementById("f-niveau").value = course?.niveau || (NIVEAUX[0]?.id ?? "");
  document.getElementById("f-image").value = course?.image || "";
  document.getElementById("f-pdf").value = course?.pdf || "";
  document.getElementById("f-youtube").value = course?.youtube || "";
  document.getElementById("f-premium").checked = !!course?.premium;

  document.getElementById("f-image-file").value = "";
  document.getElementById("imageUploadStatus").textContent = "";
  document.getElementById("f-pdf-file").value = "";
  document.getElementById("pdfUploadStatus").textContent = course?.pdf ? "PDF actuel conservé si aucun nouveau fichier n'est choisi." : "";
  const previewWrap = document.getElementById("imagePreviewWrap");
  const preview = document.getElementById("imagePreview");
  if (course?.image) {
    preview.src = course.image;
    previewWrap.style.display = "block";
  } else {
    preview.src = "";
    previewWrap.style.display = "none";
  }

  openModal("course-modal");
}

/* ---- Aperçu local de l'image choisie ---- */
function onImageFileChange(e) {
  const file = e.target.files?.[0];
  const previewWrap = document.getElementById("imagePreviewWrap");
  const preview = document.getElementById("imagePreview");
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    previewWrap.style.display = "block";
  };
  reader.readAsDataURL(file);
}

/* ---- Sélection d'un nouveau PDF : simple indication du nom de fichier ---- */
function onPdfFileChange(e) {
  const file = e.target.files?.[0];
  const status = document.getElementById("pdfUploadStatus");
  if (!file) return;
  status.textContent = `Fichier sélectionné : ${file.name}`;
}

/* ---- Upload non-signé vers Cloudinary ---- */
async function uploadCourseImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let res;
  try {
    res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
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
    throw new Error(data?.error?.message || "Échec de l'envoi de l'image vers Cloudinary.");
  }
  if (!data.secure_url) {
    throw new Error("Réponse Cloudinary invalide (secure_url manquant).");
  }
  return data.secure_url;
}

async function onSubmit(e) {
  e.preventDefault();
  const titre = document.getElementById("f-titre").value.trim();
  if (!titre) return;

  const submitBtn = document.getElementById("btn-submit");
  const uploadStatus = document.getElementById("imageUploadStatus");
  const pdfStatus = document.getElementById("pdfUploadStatus");
  const imageFile = document.getElementById("f-image-file").files[0];
  const pdfFile = document.getElementById("f-pdf-file").files[0];

  submitBtn.disabled = true;

  let imageUrl = document.getElementById("f-image").value.trim();
  let pdfUrl = document.getElementById("f-pdf").value.trim();

  try {
    if (imageFile) {
      uploadStatus.textContent = "Envoi de l'image en cours…";
      imageUrl = await uploadCourseImage(imageFile);
      uploadStatus.textContent = "";
    }

    if (pdfFile) {
      pdfStatus.textContent = "Envoi du PDF en cours…";
      pdfUrl = await uploadPdfToCloudinary(pdfFile);
      pdfStatus.textContent = "";
    }

    const data = {
      titre,
      description: document.getElementById("f-description").value.trim(),
      matiere: document.getElementById("f-matiere").value,
      niveau: document.getElementById("f-niveau").value,
      image: imageUrl,
      pdf: pdfUrl,
      youtube: document.getElementById("f-youtube").value.trim(),
      premium: document.getElementById("f-premium").checked,
    };

    if (editingId) {
      await updateCourse(editingId, data);
      toastSuccess("Cours mis à jour.");
    } else {
      await addCourse(data);
      toastSuccess("Cours ajouté.");
    }
    closeModal("course-modal");
    await loadCourses();
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "";
    pdfStatus.textContent = "";
    toastError(err?.message || "Erreur lors de l'enregistrement.");
  } finally {
    submitBtn.disabled = false;
  }
}

function nomMatiere(id) { return MATIERES.find(m => m.id === id)?.nom || id || "—"; }
function nomNiveau(id)  { return NIVEAUX.find(n => n.id === id)?.nom || id || "—"; }
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}