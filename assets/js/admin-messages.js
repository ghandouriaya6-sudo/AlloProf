// ============================================================================
// admin-messages.js
// Gestion des messages reçus via le formulaire Contact — page admin-messages.html
// Modèle Firestore ("messages") : { nom, email, sujet, message, lu, createdAt }
// Utilise onSnapshot() pour un affichage temps réel (aucun rechargement requis).
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import {
  subscribeMessages,
  markMessageRead,
  deleteMessage,
} from "./firestore.js";
import { toastSuccess, toastError } from "./toast.js";
import { openModal, closeModal, bindOverlayClose, confirmDelete } from "../../firebase/modal.js";

let messages = [];
let unsubscribe = null;

init();

async function init() {
  let profile;
  try {
    ({ profile } = await requireAdmin());
  } catch {
    return;
  }

  initAdminLayout({
    activeKey: "messages",
    pageTitle: "Messages",
    breadcrumb: ["Admin", "Messages"],
    profile,
  });

  bindOverlayClose("view-modal");
  document.getElementById("btn-close-view-modal").addEventListener("click", () => closeModal("view-modal"));
  document.getElementById("btn-close-view").addEventListener("click", () => closeModal("view-modal"));
  document.getElementById("searchMessage").addEventListener("input", renderTable);

  // Écoute temps réel : les nouveaux messages apparaissent sans recharger la page.
  const tbody = document.getElementById("messagesTableBody");
  tbody.innerHTML = `<tr class="skeleton-row"><td colspan="6"><div class="skeleton"></div></td></tr>`.repeat(4);

  unsubscribe = subscribeMessages((list) => {
    messages = list;
    renderTable();
  });

  window.addEventListener("beforeunload", () => unsubscribe && unsubscribe());
}

function renderTable() {
  const term = document.getElementById("searchMessage").value.trim().toLowerCase();
  const filtered = term
    ? messages.filter(m =>
        (m.nom || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term) ||
        (m.sujet || "").toLowerCase().includes(term))
    : messages;

  const tbody = document.getElementById("messagesTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="emoji">✉️</div>Aucun message pour le moment.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(m => `
    <tr style="${m.lu ? "" : "font-weight:600;"}">
      <td>${escapeHtml(m.nom || "—")}</td>
      <td>${escapeHtml(m.email || "—")}</td>
      <td>${escapeHtml(m.sujet || "—")}</td>
      <td>${formatDate(m.createdAt)}</td>
      <td>${m.lu ? '<span class="badge badge-emerald">Lu</span>' : '<span class="badge badge-rose">Non lu</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-secondary btn-sm" data-view="${m.id}">Voir</button>
        <button class="btn btn-danger btn-sm" data-delete="${m.id}">Supprimer</button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-view]").forEach(btn =>
    btn.addEventListener("click", () => openView(messages.find(m => m.id === btn.dataset.view))));

  tbody.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const msg = messages.find(m => m.id === btn.dataset.delete);
      const ok = await confirmDelete(`Supprimer le message de « ${msg?.nom || ""} » ?`);
      if (!ok) return;
      try {
        await deleteMessage(msg.id);
        toastSuccess("Message supprimé.");
        // Pas besoin de recharger : onSnapshot met à jour la liste automatiquement.
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la suppression.");
      }
    }));
}

async function openView(msg) {
  if (!msg) return;

  document.getElementById("view-nom").textContent = msg.nom || "—";
  document.getElementById("view-email").textContent = msg.email || "—";
  document.getElementById("view-sujet").textContent = msg.sujet || "—";
  document.getElementById("view-date").textContent = formatDate(msg.createdAt, true);
  document.getElementById("view-message").textContent = msg.message || "";

  const replyBtn = document.getElementById("btn-reply-email");
  const subject = encodeURIComponent(`Re: ${msg.sujet || "Votre message"}`);
  replyBtn.href = `mailto:${msg.email || ""}?subject=${subject}`;

  openModal("view-modal");

  // Marquer automatiquement comme lu à l'ouverture du modal.
  if (!msg.lu) {
    try {
      await markMessageRead(msg.id);
      // onSnapshot rafraîchira automatiquement le statut dans le tableau.
    } catch (err) {
      console.error(err);
    }
  }
}

function formatDate(ts, withTime = false) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return withTime
    ? d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}
