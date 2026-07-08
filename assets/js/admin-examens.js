// ============================================================================
// admin-examens.js
// Gestion des examens (bibliothèque PDF) — page admin-examens.html
// Modèle : { titre, description, matiere, niveau, pdf, premium, createdAt }
// Le PDF est envoyé directement à Cloudinary (upload non-signé) dès que
// l'administrateur sélectionne un fichier ; l'URL sécurisée (secure_url)
// retournée est enregistrée automatiquement dans Firestore. Aucune saisie
// manuelle d'URL n'est requise.
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import {
  getAllExamensLib,
  addExamenLib,
  updateExamenLib,
  deleteExamenLib,
} from "./firestore.js";
import { toastSuccess, toastError } from "./toast.js";
import { openModal, closeModal, bindOverlayClose, confirmDelete } from "../../firebase/modal.js";
import { uploadPdfToCloudinary } from "./cloudinary.js";

const MATIERES = (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.matieres : [];
const NIVEAUX  = (typeof ALLOPROF_DATA !== "undefined") ? ALLOPROF_DATA.niveaux  : [];

let exams = [];
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
    activeKey: "examens",
    pageTitle: "Gestion des examens",
    breadcrumb: ["Admin", "Examens"],
    profile,
  });

  fillSelect("f-matiere", MATIERES);
  fillSelect("f-niveau", NIVEAUX);

  bindOverlayClose("exam-modal");
  document.getElementById("btn-add-exam").addEventListener("click", () => openForm());
  document.getElementById("btn-close-modal").addEventListener("click", () => closeModal("exam-modal"));
  document.getElementById("btn-cancel").addEventListener("click", () => closeModal("exam-modal"));
  document.getElementById("exam-form").addEventListener("submit", onSubmit);
  document.getElementById("searchExam").addEventListener("input", renderTable);
  document.getElementById("f-pdf-file").addEventListener("change", onPdfFileChange);
  document.getElementById("btn-add-question").addEventListener("click", () =>
    document.getElementById("questions-list").appendChild(createQuestionRow()));

  await loadExams();
}

function fillSelect(id, items) {
  document.getElementById(id).innerHTML = items.map(i => `<option value="${i.id}">${i.nom}</option>`).join("");
}

async function loadExams() {
  const tbody = document.getElementById("examsTableBody");
  tbody.innerHTML = `<tr class="skeleton-row"><td colspan="7"><div class="skeleton"></div></td></tr>`.repeat(4);
  try {
    exams = await getAllExamensLib();
  } catch (err) {
    console.error(err);
    exams = [];
    toastError("Impossible de charger les examens.");
  }
  renderTable();
}

function renderTable() {
  const term = document.getElementById("searchExam").value.trim().toLowerCase();
  const filtered = term
    ? exams.filter(e =>
        (e.titre || "").toLowerCase().includes(term) ||
        nomMatiere(e.matiere).toLowerCase().includes(term) ||
        nomNiveau(e.niveau).toLowerCase().includes(term))
    : exams;

  const tbody = document.getElementById("examsTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">🎓</div>Aucun examen trouvé.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => `
    <tr>
      <td>${escapeHtml(e.titre || "Sans titre")}</td>
      <td>${escapeHtml(nomMatiere(e.matiere))}</td>
      <td>${escapeHtml(nomNiveau(e.niveau))}</td>
      <td>${e.premium ? '<span class="badge badge-amber">⭐ Premium</span>' : '<span class="badge badge-emerald">Gratuit</span>'}</td>
      <td>${e.questions?.length ? `<span class="badge badge-emerald">🎯 ${e.questions.length}</span>` : '<span class="badge">—</span>'}</td>
      <td>${formatDate(e.createdAt)}</td>
      <td class="row-actions">
        ${e.pdf ? `<a class="btn btn-secondary btn-sm" href="${e.pdf}" target="_blank" rel="noopener">PDF</a>` : ""}
        <button class="btn btn-secondary btn-sm" data-edit="${e.id}">Modifier</button>
        <button class="btn btn-danger btn-sm" data-delete="${e.id}">Supprimer</button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => openForm(exams.find(e => e.id === btn.dataset.edit))));

  tbody.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const ex = exams.find(e => e.id === btn.dataset.delete);
      const ok = await confirmDelete(`Supprimer l'examen « ${ex?.titre || ""} » ?`);
      if (!ok) return;
      try {
        await deleteExamenLib(ex.id, ex.titre);
        toastSuccess("Examen supprimé.");
        await loadExams();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la suppression.");
      }
    }));
}

function openForm(ex = null) {
  editingId = ex?.id || null;
  document.getElementById("modal-title").textContent = ex ? "Modifier l'examen" : "Ajouter un examen";
  document.getElementById("f-titre").value = ex?.titre || "";
  document.getElementById("f-description").value = ex?.description || "";
  document.getElementById("f-matiere").value = ex?.matiere || (MATIERES[0]?.id ?? "");
  document.getElementById("f-niveau").value = ex?.niveau || (NIVEAUX[0]?.id ?? "");
  document.getElementById("f-pdf").value = ex?.pdf || "";
  document.getElementById("f-pdf-file").value = "";
  document.getElementById("pdfUploadStatus").textContent = ex?.pdf ? "PDF actuel conservé si aucun nouveau fichier n'est choisi." : "";
  document.getElementById("f-premium").checked = !!ex?.premium;
  renderQuestions(ex?.questions || []);
  openModal("exam-modal");
}

/* ---- Sélection d'un nouveau PDF : simple indication du nom de fichier ---- */
function onPdfFileChange(e) {
  const file = e.target.files?.[0];
  const status = document.getElementById("pdfUploadStatus");
  if (!file) return;
  status.textContent = `Fichier sélectionné : ${file.name}`;
}

async function onSubmit(e) {
  e.preventDefault();
  const titre = document.getElementById("f-titre").value.trim();
  if (!titre) return;

  const submitBtn = document.getElementById("btn-submit");
  const pdfStatus = document.getElementById("pdfUploadStatus");
  const pdfFile = document.getElementById("f-pdf-file").files[0];

  submitBtn.disabled = true;
  let pdfUrl = document.getElementById("f-pdf").value.trim();

  try {
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
      pdf: pdfUrl,
      premium: document.getElementById("f-premium").checked,
      questions: collectQuestions(),
    };

    if (editingId) {
      await updateExamenLib(editingId, data);
      toastSuccess("Examen mis à jour.");
    } else {
      await addExamenLib(data);
      toastSuccess("Examen ajouté.");
    }
    closeModal("exam-modal");
    await loadExams();
  } catch (err) {
    console.error(err);
    pdfStatus.textContent = "";
    toastError(err?.message || "Erreur lors de l'enregistrement.");
  } finally {
    submitBtn.disabled = false;
  }
}

function nomMatiere(id) { return MATIERES.find(m => m.id === id)?.nom || id || "—"; }
function nomNiveau(id)  { return NIVEAUX.find(n => n.id === id)?.nom || id || "—"; }

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}

/* ============================== QUIZ (QCM) ============================== */

let questionIdCounter = 0;

function createQuestionRow(q = null) {
  const id = `q${++questionIdCounter}`;
  const row = document.createElement("div");
  row.className = "question-row";
  row.dataset.qid = id;
  row.style.cssText = "border:1px solid var(--border,#e5e7eb); border-radius:10px; padding:14px; margin-bottom:10px;";

  const correct = q?.correct ?? 0;
  const opts = q?.options || ["", "", "", ""];

  row.innerHTML = `
    <div class="field full">
      <label>Question</label>
      <input type="text" class="q-text" placeholder="Énoncé de la question" value="${escapeAttr(q?.q || "")}">
    </div>
    <div class="form-grid">
      <div class="field"><label>Option A</label><input type="text" class="q-opt" data-idx="0" value="${escapeAttr(opts[0] || "")}"></div>
      <div class="field"><label>Option B</label><input type="text" class="q-opt" data-idx="1" value="${escapeAttr(opts[1] || "")}"></div>
      <div class="field"><label>Option C</label><input type="text" class="q-opt" data-idx="2" value="${escapeAttr(opts[2] || "")}"></div>
      <div class="field"><label>Option D</label><input type="text" class="q-opt" data-idx="3" value="${escapeAttr(opts[3] || "")}"></div>
    </div>
    <div class="form-grid">
      <div class="field">
        <label>Bonne réponse</label>
        <select class="q-correct">
          <option value="0" ${correct == 0 ? "selected" : ""}>Option A</option>
          <option value="1" ${correct == 1 ? "selected" : ""}>Option B</option>
          <option value="2" ${correct == 2 ? "selected" : ""}>Option C</option>
          <option value="3" ${correct == 3 ? "selected" : ""}>Option D</option>
        </select>
      </div>
      <div class="field">
        <label>Explication (optionnel)</label>
        <input type="text" class="q-explication" value="${escapeAttr(q?.explication || "")}">
      </div>
    </div>
    <button type="button" class="btn btn-danger btn-sm btn-remove-question" style="margin-top:6px;">Supprimer la question</button>
  `;

  row.querySelector(".btn-remove-question").addEventListener("click", () => row.remove());
  return row;
}

function renderQuestions(questions = []) {
  const list = document.getElementById("questions-list");
  list.innerHTML = "";
  questions.forEach(q => list.appendChild(createQuestionRow(q)));
}

function collectQuestions() {
  const rows = document.querySelectorAll("#questions-list .question-row");
  const questions = [];
  rows.forEach(row => {
    const text = row.querySelector(".q-text").value.trim();
    if (!text) return;
    const options = Array.from(row.querySelectorAll(".q-opt")).map(i => i.value.trim());
    const correct = Number(row.querySelector(".q-correct").value);
    const explication = row.querySelector(".q-explication").value.trim();
    questions.push({ q: text, options, correct, explication });
  });
  return questions;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

