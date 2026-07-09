// ============================================================================
// admin-users.js
// Gestion des utilisateurs : liste, Premium on/off, rôle, suppression.
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import { getAllUsers, setUserPremium, setUserRole, deleteUser } from "./firestore.js";
import { toastSuccess, toastError } from "./toast.js";
import { confirmDelete } from "../../firebase/modal.js";

let users = [];

init();

async function init() {
  let profile;
  try {
    ({ profile } = await requireAdmin());
  } catch {
    return;
  }

  initAdminLayout({
    activeKey: "users",
    pageTitle: "Gestion des utilisateurs",
    breadcrumb: ["Admin", "Utilisateurs"],
    profile,
  });

  document.getElementById("searchUser").addEventListener("input", renderTable);
  await loadUsers();
}

async function loadUsers() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = `<tr class="skeleton-row"><td colspan="9"><div class="skeleton"></div></td></tr>`.repeat(5);
  try {
    users = await getAllUsers();
  } catch (err) {
    console.error(err);
    users = [];
    toastError("Impossible de charger les utilisateurs.");
  }
  renderTable();
}

function renderTable() {
  const term = document.getElementById("searchUser").value.trim().toLowerCase();
  const filtered = term
    ? users.filter(u => `${u.prenom || ""} ${u.nom || ""} ${u.email || ""}`.toLowerCase().includes(term))
    : users;

  const tbody = document.getElementById("usersTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="emoji">👥</div>Aucun utilisateur trouvé.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => `
    <tr>
  <td>${escapeHtml(`${u.prenom || ""} ${u.nom || ""}`.trim() || "—")}</td>
  <td>${escapeHtml(u.email || "—")}</td>
  <td>${escapeHtml(u.telephone || "—")}</td>
  <td>${escapeHtml(u.region || "—")}</td>
  <td>${escapeHtml(u.ville || "—")}</td>
  <td>${escapeHtml(u.niveau || "—")}</td>

  <td>
      
        <select class="role-select" data-uid="${u.id}" style="border:1px solid var(--border); border-radius:8px; padding:4px 8px; background:var(--paper); color:var(--ink);">
          <option value="user" ${u.role !== "admin" ? "selected" : ""}>Utilisateur</option>
          <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </td>
      <td>${u.premium ? '<span class="badge badge-amber">⭐ Premium</span>' : '<span class="badge badge-emerald">Gratuit</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-secondary btn-sm" data-toggle-premium="${u.id}" data-premium="${!!u.premium}">
          ${u.premium ? "Retirer Premium" : "Activer Premium"}
        </button>
        <button class="btn btn-danger btn-sm" data-delete="${u.id}">Supprimer</button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-toggle-premium]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.togglePremium;
      const isPremium = btn.dataset.premium === "true";
      btn.disabled = true;
      try {
        await setUserPremium(uid, !isPremium);
        toastSuccess("Statut Premium mis à jour.");
        await loadUsers();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la mise à jour.");
        btn.disabled = false;
      }
    }));

  tbody.querySelectorAll(".role-select").forEach(sel =>
    sel.addEventListener("change", async () => {
      try {
        await setUserRole(sel.dataset.uid, sel.value);
        toastSuccess("Rôle mis à jour.");
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la mise à jour du rôle.");
      }
    }));

  tbody.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const user = users.find(u => u.id === btn.dataset.delete);
      const ok = await confirmDelete(`Supprimer l'utilisateur « ${user?.email || ""} » ? Cette action est irréversible.`);
      if (!ok) return;
      try {
        await deleteUser(user.id);
        toastSuccess("Utilisateur supprimé.");
        await loadUsers();
      } catch (err) {
        console.error(err);
        toastError("Erreur lors de la suppression.");
      }
    }));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}