// ============================================================================
// admin-dashboard.js
// Logique du tableau de bord admin : garde de sécurité, statistiques,
// mini-graphique SVG, activité récente.
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import { getDashboardStats, getRecentActivity } from "./firestore.js";
import { toastError } from "./toast.js";

init();

async function init() {
  let profile;
  try {
    ({ profile } = await requireAdmin());
  } catch {
    return; // requireAdmin gère déjà la redirection
  }

  initAdminLayout({
    activeKey: "dashboard",
    pageTitle: "Tableau de bord",
    breadcrumb: ["Admin", "Tableau de bord"],
    profile,
  });

  renderStatsSkeleton();
  await Promise.all([loadStats(), loadActivity()]);
}

function renderStatsSkeleton() {
  const grid = document.getElementById("stats-grid");
  grid.innerHTML = Array.from({ length: 6 })
    .map(
      () => `
      <div class="stat-card">
        <div class="skeleton" style="height:12px; width:60%; margin-bottom:10px;"></div>
        <div class="skeleton" style="height:26px; width:40%;"></div>
      </div>`
    )
    .join("");
}

async function loadStats() {
  try {
    const stats = await getDashboardStats();

    const cards = [
      { label: "Utilisateurs", value: stats.totalUsers, accent: "brand", icon: "👥" },
      { label: "Utilisateurs Premium", value: stats.premiumUsers, accent: "amber", icon: "⭐" },
      { label: "Cours publiés", value: stats.totalCourses, accent: "sky", icon: "📚" },
      { label: "Exercices", value: stats.totalExercises, accent: "emerald", icon: "✏️" },
      { label: "Examens", value: stats.totalExams, accent: "rose", icon: "📝" },
      { label: "Examens passés", value: stats.examsTaken, accent: "brand", icon: "🎯" },
    ];

    document.getElementById("stats-grid").innerHTML = cards
      .map(
        (c) => `
        <div class="stat-card" data-accent="${c.accent}">
          <div class="stat-card__label">${c.icon} ${c.label}</div>
          <div class="stat-card__value">${c.value.toLocaleString("fr-FR")}</div>
        </div>`
      )
      .join("");

    renderChart(stats);
  } catch (err) {
    console.error(err);
    toastError("Impossible de charger les statistiques.");
  }
}

/** Petit graphique en barres SVG (aucune librairie externe requise). */
function renderChart(stats) {
  const data = [
    { label: "Cours", value: stats.totalCourses, color: "var(--sky)" },
    { label: "Exercices", value: stats.totalExercises, color: "var(--emerald)" },
    { label: "Examens", value: stats.totalExams, color: "var(--rose)" },
    { label: "Premium", value: stats.premiumUsers, color: "var(--amber)" },
  ];
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 60;
  const gap = 40;
  const chartHeight = 160;

  const bars = data
    .map((d, i) => {
      const h = Math.round((d.value / max) * chartHeight);
      const x = 30 + i * (barWidth + gap);
      const y = 180 - h;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="8" fill="${d.color}" />
        <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">${d.value}</text>
        <text x="${x + barWidth / 2}" y="205" text-anchor="middle" font-size="12" fill="var(--ink-soft)">${d.label}</text>
      `;
    })
    .join("");

  document.getElementById("chart-content").innerHTML = `
    <line x1="20" y1="180" x2="380" y2="180" stroke="var(--border)" stroke-width="1"/>
    ${bars}
  `;
}

async function loadActivity() {
  const list = document.getElementById("activity-list");
  try {
    const activity = await getRecentActivity(10);

    if (activity.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="emoji">🗒️</div>Aucune activité pour le moment.</div>`;
      return;
    }

    list.innerHTML = activity
      .map(
        (a) => `
        <div style="display:flex; gap:10px; align-items:flex-start;">
          <span class="badge ${badgeClass(a.type)}">${iconForType(a.type)}</span>
          <div style="flex:1;">
            <div style="font-size:0.86rem;">${a.message}</div>
            <div style="font-size:0.74rem; color:var(--ink-soft); margin-top:2px;">${formatDate(a.createdAt)}</div>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Erreur de chargement.</div>`;
  }
}

function badgeClass(type) {
  return {
    course: "badge-sky",
    exercise: "badge-emerald",
    exam: "badge-rose",
    user: "badge-brand",
    premium: "badge-amber",
  }[type] || "badge-brand";
}
function iconForType(type) {
  return { course: "📚", exercise: "✏️", exam: "📝", user: "👤", premium: "⭐" }[type] || "•";
}
function formatDate(ts) {
  if (!ts?.toDate) return "à l'instant";
  return ts.toDate().toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}