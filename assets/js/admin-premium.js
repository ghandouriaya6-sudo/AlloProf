// ============================================================================
// admin-premium.js
// Gestion des offres Premium (collection "premium_plans") + gestion des
// abonnements des utilisateurs (collection "users").
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import {
  getPremiumPlans,
  savePremiumPlan,
  deletePremiumPlan,
  togglePremiumPlan,
  getPremiumSubscriptions,
  updateSubscription,
  getPremiumRequests,
  approvePremiumRequest,
  rejectPremiumRequest,
} from "./firestore.js";
import { toastSuccess, toastError } from "./toast.js";
import { openModal, closeModal, bindOverlayClose, confirmDelete } from "../../firebase/modal.js";

let plans = [];
let subs = [];
let requests = [];
let editingId = null;
let editingSubUid = null;

init();

async function init() {
  let profile;
  try {
    ({ profile } = await requireAdmin());
  } catch {
    return;
  }

  initAdminLayout({
    activeKey: "premium",
    pageTitle: "Gestion Premium",
    breadcrumb: ["Admin", "Premium"],
    profile,
  });

  bindOverlayClose("plan-modal");
  document.getElementById("btn-add-plan").addEventListener("click", () => openForm());
  document.getElementById("btn-close-modal").addEventListener("click", () => closeModal("plan-modal"));
  document.getElementById("btn-cancel").addEventListener("click", () => closeModal("plan-modal"));
  document.getElementById("plan-form").addEventListener("submit", onSubmit);

  bindOverlayClose("sub-modal");
  document.getElementById("btn-close-sub-modal").addEventListener("click", () => closeModal("sub-modal"));
  document.getElementById("btn-cancel-sub").addEventListener("click", () => closeModal("sub-modal"));
  document.getElementById("sub-form").addEventListener("submit", onSubEndSubmit);

  document.getElementById("searchSub").addEventListener("input", renderSubs);
  document.getElementById("searchReq").addEventListener("input", renderRequests);

  await loadPlans();
  await loadSubs();
  await loadRequests();
}

/* ============================== OFFRES ============================== */

async function loadPlans() {
  const wrap = document.getElementById("plans-wrap");
  wrap.innerHTML = `<div class="loader"></div>`;
  try {
    plans = await getPremiumPlans();
  } catch (err) {
    console.error(err);
    plans = [];
    toastError("Impossible de charger les offres Premium.");
  }
  renderPlans();
}

function renderPlans() {
  const wrap = document.getElementById("plans-wrap");

  if (!plans.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="emoji">⭐</div>Aucune offre Premium configurée pour le moment.</div>`;
    return;
  }

  wrap.innerHTML = `<div class="grid-stats">` + plans.map(p => `
    <div class="stat-card" data-accent="amber">
      <div class="stat-card__label">${escapeHtml(p.nom || "Offre sans nom")} ${p.actif === false ? '<span class="badge badge-rose">Inactive</span>' : '<span class="badge badge-emerald">Active</span>'}</div>
      <div class="stat-card__value">${p.prix ?? "—"} MAD<span style="font-size:0.9rem; color:var(--ink-soft);">/${escapeHtml(p.periode || "mois")}</span></div>
      <p style="font-size:0.82rem; color:var(--ink-soft); margin:10px 0 14px;">${escapeHtml(p.description || "")}</p>
      <div class="row-actions">
        <button class="btn btn-secondary btn-sm" data-edit="${p.id}">Modifier</button>
        <button class="btn btn-secondary btn-sm" data-toggle="${p.id}" data-actif="${p.actif !== false}">${p.actif === false ? "Activer" : "Désactiver"}</button>
        <button class="btn btn-danger btn-sm" data-delete="${p.id}">Supprimer</button>
      </div>
    </div>`).join("") + `</div>`;

  wrap.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => openForm(plans.find(p => p.id === btn.dataset.edit))));

  wrap.querySelectorAll("[data-toggle]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const isActif = btn.dataset.actif === "true";
      try {
        await togglePremiumPlan(btn.dataset.toggle, !isActif);
        toastSuccess(isActif ? "Offre désactivée." : "Offre activée.");
        await loadPlans();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la mise à jour.");
      }
    }));

  wrap.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const plan = plans.find(p => p.id === btn.dataset.delete);
      const ok = await confirmDelete(`Supprimer l'offre « ${plan?.nom || ""} » ?`);
      if (!ok) return;
      try {
        await deletePremiumPlan(plan.id, plan.nom);
        toastSuccess("Offre supprimée.");
        await loadPlans();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la suppression.");
      }
    }));
}

function openForm(plan = null) {
  editingId = plan?.id || null;
  document.getElementById("modal-title").textContent = plan ? "Modifier l'offre" : "Ajouter une offre";
  document.getElementById("f-nom").value = plan?.nom || "";
  document.getElementById("f-prix").value = plan?.prix ?? "";
  document.getElementById("f-periode").value = plan?.periode || "mois";
  document.getElementById("f-ordre").value = plan?.ordre ?? 0;
  document.getElementById("f-actif").checked = plan?.actif !== false;
  document.getElementById("f-description").value = plan?.description || "";
  openModal("plan-modal");
}

async function onSubmit(e) {
  e.preventDefault();
  const nom = document.getElementById("f-nom").value.trim();
  if (!nom) return;

  const data = {
    nom,
    prix: Number(document.getElementById("f-prix").value) || 0,
    periode: document.getElementById("f-periode").value,
    ordre: Number(document.getElementById("f-ordre").value) || 0,
    actif: document.getElementById("f-actif").checked,
    description: document.getElementById("f-description").value.trim(),
  };

  const submitBtn = document.getElementById("btn-submit");
  submitBtn.disabled = true;
  try {
    await savePremiumPlan(editingId, data);
    toastSuccess(editingId ? "Offre mise à jour." : "Offre ajoutée.");
    closeModal("plan-modal");
    await loadPlans();
  } catch (err) {
    console.error(err);
    toastError("Erreur lors de l'enregistrement.");
  } finally {
    submitBtn.disabled = false;
  }
}

/* ============================ ABONNEMENTS ============================ */

async function loadSubs() {
  const tbody = document.getElementById("subsTableBody");
  tbody.innerHTML = `<tr class="skeleton-row"><td colspan="7"><div class="skeleton"></div></td></tr>`.repeat(4);
  try {
    subs = await getPremiumSubscriptions();
  } catch (err) {
    console.error(err);
    subs = [];
    toastError("Impossible de charger les abonnements.");
  }
  renderSubs();
}

function renderSubs() {
  const term = document.getElementById("searchSub").value.trim().toLowerCase();
  const filtered = term
    ? subs.filter(u => `${u.prenom || ""} ${u.nom || ""} ${u.email || ""}`.toLowerCase().includes(term))
    : subs;

  const tbody = document.getElementById("subsTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">⭐</div>Aucun abonné trouvé.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td>${escapeHtml(`${u.prenom || ""} ${u.nom || ""}`.trim() || "—")}</td>
      <td>${escapeHtml(u.email || "—")}</td>
      <td>${escapeHtml(u.premiumPlan || "—")}</td>
      <td>${formatDate(u.premiumStart)}</td>
      <td>${formatDate(u.premiumEnd)}</td>
      <td>${u.premium ? '<span class="badge badge-amber">⭐ Actif</span>' : '<span class="badge badge-emerald">Inactif</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-secondary btn-sm" data-toggle-sub="${u.uid}" data-premium="${!!u.premium}">
          ${u.premium ? "Désactiver" : "Activer"}
        </button>
        <button class="btn btn-secondary btn-sm" data-edit-end="${u.uid}">Date de fin</button>
        <button class="btn btn-primary btn-sm" data-renew="${u.uid}">Renouveler</button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-toggle-sub]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.toggleSub;
      const isPremium = btn.dataset.premium === "true";
      btn.disabled = true;
      try {
        const payload = isPremium
          ? { premium: false }
          : { premium: true, premiumStart: subs.find(u => u.uid === uid)?.premiumStart || new Date().toISOString() };
        await updateSubscription(uid, payload);
        toastSuccess("Abonnement mis à jour.");
        await loadSubs();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la mise à jour.");
        btn.disabled = false;
      }
    }));

  tbody.querySelectorAll("[data-edit-end]").forEach(btn =>
    btn.addEventListener("click", () => {
      editingSubUid = btn.dataset.editEnd;
      const user = subs.find(u => u.uid === editingSubUid);
      const current = toDateInputValue(user?.premiumEnd);
      document.getElementById("f-sub-end").value = current;
      openModal("sub-modal");
    }));

  tbody.querySelectorAll("[data-renew]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.renew;
      const user = subs.find(u => u.uid === uid);
      btn.disabled = true;
      try {
        const plan = plans.find(p => p.nom === user?.premiumPlan);
        const durationDays = plan?.periode === "an" ? 365 : 30;
        const base = user?.premiumEnd ? new Date(toJsDate(user.premiumEnd)) : new Date();
        const start = base < new Date() ? new Date() : base;
        const newEnd = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
        await updateSubscription(uid, {
          premium: true,
          premiumStart: user?.premiumStart || new Date().toISOString(),
          premiumEnd: newEnd.toISOString(),
        });
        toastSuccess("Abonnement renouvelé.");
        await loadSubs();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors du renouvellement.");
        btn.disabled = false;
      }
    }));
}

async function onSubEndSubmit(e) {
  e.preventDefault();
  const value = document.getElementById("f-sub-end").value;
  if (!value || !editingSubUid) return;
  try {
    await updateSubscription(editingSubUid, { premiumEnd: new Date(value).toISOString() });
    toastSuccess("Date de fin mise à jour.");
    closeModal("sub-modal");
    await loadSubs();
  } catch (err) {
    console.error(err);
    toastError("Erreur lors de la mise à jour.");
  }
}

/* ========================== DEMANDES PREMIUM ========================== */

async function loadRequests() {
  const tbody = document.getElementById("requestsTableBody");
  tbody.innerHTML = `<tr class="skeleton-row"><td colspan="8"><div class="skeleton"></div></td></tr>`.repeat(4);
  try {
    requests = await getPremiumRequests();
  } catch (err) {
    console.error(err);
    requests = [];
    toastError("Impossible de charger les demandes Premium.");
  }
  renderRequests();
}

function renderRequests() {
  const term = document.getElementById("searchReq").value.trim().toLowerCase();
  const filtered = term
    ? requests.filter(r => `${r.nom || ""} ${r.email || ""}`.toLowerCase().includes(term))
    : requests;

  const tbody = document.getElementById("requestsTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="emoji">⭐</div>Aucune demande Premium pour le moment.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const plan = plans.find(p => p.id === r.planId);
    const prixAffiche = plan?.prix ?? "—";
    return `
    <tr>
      <td>${escapeHtml(r.nom || "—")}</td>
      <td>${escapeHtml(r.email || "—")}</td>
      <td>${escapeHtml(r.telephone || "—")}</td>
      <td>${escapeHtml(r.planName || "—")}</td>
      <td>${prixAffiche === "—" ? "—" : `${prixAffiche} MAD`}</td>
      <td>${renderReceiptCell(r.receiptUrl)}</td>
      <td>${statutBadge(r.statut)}</td>
      <td class="row-actions">
        ${r.receiptUrl ? `<button class="btn btn-secondary btn-sm" data-view-receipt="${escapeHtml(r.receiptUrl)}">Voir le reçu</button>` : ""}
        ${r.statut === "en_attente" ? `
          <button class="btn btn-secondary btn-sm" data-approve="${r.id}">✅ Valider</button>
          <button class="btn btn-danger btn-sm" data-reject="${r.id}">❌ Refuser</button>
        ` : ""}
      </td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("[data-view-receipt]").forEach(btn =>
    btn.addEventListener("click", () => {
      window.open(btn.dataset.viewReceipt, "_blank", "noopener");
    }));

  tbody.querySelectorAll("[data-approve]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const req = requests.find(r => r.id === btn.dataset.approve);
      if (!req) return;
      btn.disabled = true;
      try {
        await approvePremiumRequest(req.id, req);
        toastSuccess("Demande validée, Premium activé.");
        await loadRequests();
        await loadSubs();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la validation.");
        btn.disabled = false;
      }
    }));

  tbody.querySelectorAll("[data-reject]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const req = requests.find(r => r.id === btn.dataset.reject);
      if (!req) return;
      btn.disabled = true;
      try {
        await rejectPremiumRequest(req.id, req.nom);
        toastSuccess("Demande refusée.");
        await loadRequests();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors du refus.");
        btn.disabled = false;
      }
    }));
}

function renderReceiptCell(url) {
  if (!url) return "—";
  const safeUrl = escapeHtml(url);
  return `<a href="${safeUrl}" target="_blank" rel="noopener" title="Ouvrir le reçu dans un nouvel onglet">
    <img src="${safeUrl}" alt="Reçu" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--border);">
  </a>`;
}

function statutBadge(statut) {
  if (statut === "valide") return '<span class="badge badge-emerald">✅ Validée</span>';
  if (statut === "refuse") return '<span class="badge badge-rose">❌ Refusée</span>';
  return '<span class="badge badge-amber">⏳ En attente</span>';
}

/* ============================== UTILS ============================== */

function toJsDate(val) {
  if (!val) return new Date();
  if (val.toDate) return val.toDate();
  return new Date(val);
}

function formatDate(val) {
  if (!val) return "—";
  const d = toJsDate(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function toDateInputValue(val) {
  if (!val) return "";
  const d = toJsDate(val);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}