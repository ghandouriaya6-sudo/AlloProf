// ============================================================================
// admin-layout.js
// Construit la sidebar + topbar communes à toutes les pages admin, pour éviter
// de dupliquer ce HTML dans chaque fichier admin-*.html.
// Chaque page admin appelle initAdminLayout({ activeKey, pageTitle, breadcrumb, profile })
// ============================================================================

import { logoutUser } from "../../firebase/auth.js";
import { subscribeUnreadMessagesCount } from "./firestore.js";

const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", href: "dashboard-admin.html", icon: "📊" },
  { key: "cours", label: "Cours", href: "admin-cours.html", icon: "📚" },
  { key: "exercices", label: "Exercices", href: "admin-exercices.html", icon: "✏️" },
  { key: "examens", label: "Examens", href: "admin-examens.html", icon: "📝" },
  { key: "users", label: "Utilisateurs", href: "admin-users.html", icon: "👥" },
  { key: "premium", label: "Premium", href: "admin-premium.html", icon: "⭐" },
  { key: "messages", label: "Messages", href: "admin-messages.html", icon: "✉️", badge: true },
  { key: "settings", label: "Paramètres", href: "admin-settings.html", icon: "⚙️" },
];

/**
 * Initialise la mise en page admin (sidebar + topbar) dans les conteneurs
 * #sidebar-root et #topbar-root présents dans chaque page admin-*.html.
 * @param {Object} opts
 * @param {string} opts.activeKey - clé du lien actif (voir NAV_ITEMS)
 * @param {string} opts.pageTitle - titre affiché dans la topbar
 * @param {string[]} opts.breadcrumb - ex: ["Admin", "Cours"]
 * @param {Object} opts.profile - profil Firestore de l'admin connecté
 */
export function initAdminLayout({ activeKey, pageTitle, breadcrumb = [], profile = {} }) {
  renderSidebar(activeKey);
  renderTopbar(pageTitle, breadcrumb, profile);
  initThemeToggle();
  initMobileToggle();
  initMessagesBadge();
}

function renderSidebar(activeKey) {
  const root = document.getElementById("sidebar-root");
  if (!root) return;

  const links = NAV_ITEMS.map(
    (item) => `
      <li>
        <a class="sidebar__link ${item.key === activeKey ? "active" : ""}" href="${item.href}">
          <span class="sidebar__icon">${item.icon}</span> ${item.label}
          ${item.badge ? `<span id="badge-${item.key}" style="display:none; margin-left:auto; background:#dc2626; color:#fff; font-size:.72rem; font-weight:700; line-height:1; padding:3px 7px; border-radius:999px;"></span>` : ""}
        </a>
      </li>`
  ).join("");

  root.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__brand"><span class="dot"></span> AlloProf <span style="opacity:.5; font-weight:500;">Admin</span></div>
      <div class="sidebar__section-label">Contenu</div>
      <ul class="sidebar__nav">${links}</ul>
      <div class="sidebar__footer">
        <button class="sidebar__signout" id="btn-signout">↩ Déconnexion</button>
      </div>
    </aside>`;

  document.getElementById("btn-signout")?.addEventListener("click", async () => {
  await logoutUser();
  window.location.href = "admin-connexion.html";
});
}

function renderTopbar(pageTitle, breadcrumb, profile) {
  const root = document.getElementById("topbar-root");
  if (!root) return;

  const crumbHtml = breadcrumb
    .map((c, i) => `<span>${c}</span>${i < breadcrumb.length - 1 ? '<span class="sep">/</span>' : ""}`)
    .join("");

  const initials = (profile.prenom?.[0] || "") + (profile.nom?.[0] || "A");

  root.innerHTML = `
    <header class="topbar">
      <div style="display:flex; align-items:center; gap:14px;">
        <button class="icon-btn" id="btn-mobile-menu" style="display:none;">☰</button>
        <div class="topbar__left">
          <div class="breadcrumb">${crumbHtml}</div>
          <div class="topbar__title">${pageTitle}</div>
        </div>
      </div>
      <div class="topbar__search">
        🔍 <input type="text" placeholder="Recherche globale…" id="global-search" />
      </div>
      <div class="topbar__right">
        <button class="icon-btn" id="btn-theme-toggle" title="Basculer le mode sombre">🌙</button>
        <div class="avatar" title="${profile.email ?? ""}">${initials.toUpperCase() || "A"}</div>
      </div>
    </header>`;
}

function initThemeToggle() {
  const btn = document.getElementById("btn-theme-toggle");
  if (!btn) return;

  const saved = document.documentElement.getAttribute("data-theme");
  btn.textContent = saved === "dark" ? "☀️" : "🌙";

  btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    btn.textContent = isDark ? "🌙" : "☀️";
    // Remarque : pas de localStorage pour les données utilisateur métier,
    // mais une préférence d'affichage UI pure reste acceptable ici.
    // Si tu veux la persister par utilisateur, stocke-la dans users/{uid}.themePref.
  });
}

function initMessagesBadge() {
  const badge = document.getElementById("badge-messages");
  if (!badge) return;
  subscribeUnreadMessagesCount((count) => {
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  });
}

function initMobileToggle() {
  const btn = document.getElementById("btn-mobile-menu");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;
  btn.style.display = "grid";
  btn.addEventListener("click", () => sidebar.classList.toggle("open"));
}