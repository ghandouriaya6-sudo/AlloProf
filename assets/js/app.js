// ===== AlloProf — assets/js/app.js =====
// Module partagé par toutes les pages.
// Gère : Firebase Auth state, navbar réactive, footer, thème, toasts, helpers UI.

import { listenAuthState, getUserProfile, logoutUser } from "../../firebase/auth.js";

/* ---- Chemin racine selon l'emplacement de la page ---- */
const ROOT = location.pathname.includes("/pages/") ? ".." : ".";

/* ---- État global en mémoire (jamais dans localStorage) ---- */
let _fbUser    = null;   // firebase.User | null
let _profile   = null;   // document Firestore users/{uid} | null
let _authReady = false;
const _callbacks = [];

/**
 * onAuthReady(cb) — s'abonne à l'état Firebase Auth + profil Firestore.
 * Le callback est appelé dès que l'état est connu (ou immédiatement si déjà résolu).
 * Signature : cb(firebaseUser | null, firestoreProfile | null)
 */
function onAuthReady(cb) {
  if (_authReady) {
    cb(_fbUser, _profile);
  } else {
    _callbacks.push(cb);
  }
}

/* ---- Thème clair / sombre (seule préférence stockée en localStorage) ---- */
function _initTheme() {
  const saved = localStorage.getItem("allo_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("allo_theme", next);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = next === "dark" ? "☀️" : "🌙";
}

/* ---- Toasts ---- */
function showToast(msg, duration = 3500) {
  let box = document.querySelector(".toast-container");
  if (!box) {
    box = document.createElement("div");
    box.className = "toast-container";
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* ---- Navbar ---- */
function _renderNavbar(user, profile) {
  const mount = document.getElementById("navbar-mount");
  if (!mount) return;

  const initials = profile
    ? (profile.prenom ? profile.prenom.charAt(0) : "") + (profile.nom ? profile.nom.charAt(0) : "")
    : "";

  mount.innerHTML = `
  <header class="navbar">
    <div class="container">
      <a href="${ROOT}/index.html" class="nav-logo">
        <img src="${ROOT}/assets/img/logoo.png" alt="AlloProf" class="nav-logo__icon">
        <span class="logo-allo">Allo</span><span class="logo-prof">prof</span>
      </a>
      <nav class="nav-links" id="navLinks">
        <a href="${ROOT}/index.html"><span class="nav-flip" data-text="Accueil"><span class="nav-flip-face">Accueil</span></span></a>
        <a href="${ROOT}/pages/cours.html"><span class="nav-flip" data-text="Cours"><span class="nav-flip-face">Cours</span></span></a>
        <a href="${ROOT}/pages/exercices.html"><span class="nav-flip" data-text="Exercices"><span class="nav-flip-face">Exercices</span></span></a>
        <a href="${ROOT}/pages/examens.html"><span class="nav-flip" data-text="Examens"><span class="nav-flip-face">Examens</span></span></a>
        <a href="${ROOT}/pages/premium.html"><span class="nav-flip" data-text="Premium"><span class="nav-flip-face">Premium</span></span></a>
        <a href="${ROOT}/pages/contact.html"><span class="nav-flip" data-text="Contact"><span class="nav-flip-face">Contact</span></span></a>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn" id="themeToggle" aria-label="Changer le thème">🌙</button>
        ${user
          ? `<a href="${ROOT}/pages/dashboard-utilisateur.html"
                class="nav-avatar icon-btn"
                title="${profile?.prenom || ""} ${profile?.nom || user.email}"
                aria-label="Mon espace">${profile?.premium ? "⭐" : (initials || "👤")}</a>
             <button class="btn btn-ghost btn-sm" id="navLogoutBtn">Déconnexion</button>`
          : `<a href="${ROOT}/pages/connexion.html"  class="btn btn-secondary btn-sm">Connexion</a>
             <a href="${ROOT}/pages/inscription.html" class="btn btn-primary   btn-sm">Inscription</a>`
        }
        <button class="icon-btn nav-toggle" id="navToggle" aria-label="Ouvrir le menu">☰</button>
      </div>
    </div>
  </header>`;

  /* thème */
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
  themeBtn.addEventListener("click", toggleTheme);

  /* menu mobile */
  document.getElementById("navToggle").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

  /* déconnexion */
  document.getElementById("navLogoutBtn")?.addEventListener("click", async () => {
    await logoutUser();
    showToast("Déconnexion réussie.");
    setTimeout(() => window.location.href = `${ROOT}/index.html`, 700);
  });

  /* lien actif */
  mount.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href").split("/").pop();
    if (location.pathname.endsWith(href)) a.classList.add("active");
  });
}

/* ---- Footer ---- */
function _renderFooter() {
  const mount = document.getElementById("footer-mount");
  if (!mount) return;
  mount.innerHTML = `
  <footer class="footer">
    <div class="container">
      <div>
        <a href="${ROOT}/index.html" class="nav-logo">
          <img src="${ROOT}/assets/img/logoo.png" alt="AlloProf" class="nav-logo__icon">
          <span class="logo-allo">Allo</span><span class="logo-prof">prof</span>
        </a>
        <p style="margin-top:14px;max-width:320px;color:#94A3B8;">
          La plateforme éducative marocaine qui accompagne les élèves du Primaire au Lycée.
        </p>
      </div>
      <div>
        <h4>Plateforme</h4>
        <a href="${ROOT}/pages/cours.html">Cours</a>
        <a href="${ROOT}/pages/exercices.html">Exercices</a>
        <a href="${ROOT}/pages/examens.html">Examens</a>
        <a href="${ROOT}/pages/premium.html">Premium</a>
      </div>
      <div>
        <h4>Entreprise</h4>
        <a href="${ROOT}/pages/apropos.html">À propos</a>
        <a href="${ROOT}/pages/contact.html">Contact</a>
        <a href="${ROOT}/pages/faq.html">FAQ</a>
      </div>
      <div>
        <h4>Légal</h4>
        <a href="${ROOT}/pages/confidentialite.html">Confidentialité</a>
        <a href="${ROOT}/pages/conditions.html">Conditions d'utilisation</a>
      </div>
    </div>
    <div class="footer-bottom">© ${new Date().getFullYear()} AlloProf — Tous droits réservés.</div>
  </footer>`;
}

/* ---- Micro-interactions : révélation au scroll + navbar au scroll ----
   Purement additif : n'affecte aucune fonctionnalité existante. */
function _initScrollReveal() {
  const els = document.querySelectorAll(
    ".section-title, .section-subtitle, .card:not(.fade-in), .form-card"
  );

  document.querySelectorAll(".grid").forEach(g => g.classList.add("reveal-group"));

  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach(el => el.classList.add("reveal", "in-view"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });

  els.forEach(el => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

function _initNavbarScroll() {
  const onScroll = () => {
    const nav = document.querySelector(".navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---- Léger effet 3D d'ensemble sur la navbar (parallax au mouvement de la souris) ---- */
function _initNavbarParallax() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  let raf = null;
  window.addEventListener("mousemove", (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const inner = document.querySelector(".navbar .container");
      if (!inner) return;
      const rx = (e.clientX / window.innerWidth - .5) * 2; // -1..1
      inner.style.transform = `perspective(1200px) rotateY(${rx * 1.4}deg)`;
    });
  }, { passive: true });
}

/* ---- Barre de progression (lecture au scroll + retour visuel lors d'un changement de page) ---- */
function _ensureProgressBar() {
  let bar = document.getElementById("pageProgress");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "pageProgress";
    document.body.appendChild(bar);
  }
  return bar;
}

function _initScrollProgress() {
  const bar = _ensureProgressBar();
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.opacity = pct > .5 ? "1" : "0";
    bar.style.width = pct + "%";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---- Tilt 3D + reflet lumineux sur les cartes (souris fine uniquement) ---- */
function _initCardTilt() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer  = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion || !finePointer) return;

  let raf = null;
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - .5) * -8;
      const ry = (px - .5) * 8;
      card.style.transform = `translateY(-8px) scale(1.015) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty("--glare-x", `${px * 100}%`);
      card.style.setProperty("--glare-y", `${py * 100}%`);
      card.style.setProperty("--tilt-shadow", `${-ry * 2.2}px ${-rx * 2.2 + 14}px 28px rgba(37,99,235,.28)`);
    });
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".card");
    if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
    card.style.transform = "";
  });
}

/* ---- Transitions entre pages (fondu cohérent partout, natif quand disponible) ---- */
function _initPageTransitions() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nativeSupport = window.CSS?.supports?.("selector(::view-transition-old(root))");
  const bar = _ensureProgressBar();

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

    const href = a.getAttribute("href");
    if (!href || /^(#|mailto:|tel:|javascript:)/.test(href)) return;

    let url;
    try { url = new URL(href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; // ancre interne

    // Le navigateur gère déjà un joli fondu natif : on laisse faire, on ajoute juste la barre.
    if (nativeSupport) {
      bar.style.opacity = "1";
      bar.style.width = "70%";
      return;
    }

    if (reduceMotion) return; // navigation immédiate, sans fondu

    e.preventDefault();
    bar.style.opacity = "1";
    bar.style.width = "80%";
    document.documentElement.classList.add("page-leaving");
    setTimeout(() => { window.location.href = url.href; }, 200);
  });
}

/* ---- Helpers UI ---- */
function matiereNom(id) {
  if (typeof ALLOPROF_DATA === "undefined") return id;
  return ALLOPROF_DATA.matieres.find(m => m.id === id)?.nom || id;
}
function matiereIcone(id) {
  if (typeof ALLOPROF_DATA === "undefined") return "📚";
  return ALLOPROF_DATA.matieres.find(m => m.id === id)?.icone || "📚";
}
function niveauNom(id) {
  if (typeof ALLOPROF_DATA === "undefined") return id;
  return ALLOPROF_DATA.niveaux.find(n => n.id === id)?.nom || id;
}

function courseCardHTML(c, progress = {}) {

  const pct = progress[c.id] ?? c.progression ?? 0;

  return `
  <a href="${ROOT}/pages/cours-detail.html?id=${c.id}" class="card fade-in">
    <div class="card-thumb">
      <span>${matiereIcone(c.matiere)}</span>
    </div>

    <div class="card-body">

      <div class="card-meta">
        <span class="badge badge-level">${niveauNom(c.niveau)}</span>
        ${
          c.premium
            ? '<span class="badge badge-premium">⭐ Premium</span>'
            : '<span class="badge badge-free">Gratuit</span>'
        }
      </div>

      <h3 class="card-title">
        ${c.titre || "Sans titre"}
      </h3>

      <p class="card-desc">
        ${c.description || ""}
      </p>

      ${
        pct > 0
          ? `
            <div class="card-progress">
              <div style="width:${pct}%"></div>
            </div>
            <small style="color:var(--gray)">
              ${pct}% terminé
            </small>
          `
          : `
            <small style="color:var(--gray)">
              ${matiereNom(c.matiere)} · ${c.duree || ""}
            </small>
          `
      }

    </div>
  </a>`;
}

/* ---- Validation formulaire ---- */
function validateField(input, rules = {}) {
  const group = input.closest(".form-group");
  let valid = true;
  if (rules.required && !input.value.trim())                              valid = false;
  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value))   valid = false;
  if (rules.minLength && input.value.length < rules.minLength)            valid = false;
  group?.classList.toggle("invalid", !valid);
  return valid;
}

/* ---- Protection de page (redirige si non connecté) ---- */
function requireAuth(redirectTo = null) {
  onAuthReady((user) => {
    if (!user) {
      const target = redirectTo || `${ROOT}/pages/connexion.html`;
      window.location.href = target;
    }
  });
}

/* =========================================================
   Initialisation — s'exécute dès le chargement du module
   ========================================================= */
_initTheme();

document.addEventListener("DOMContentLoaded", () => {
  _renderFooter();
  _initScrollReveal();
  _initNavbarScroll();
  _initNavbarParallax();
  _initScrollProgress();
  _initCardTilt();
  _initPageTransitions();
});

// Écoute Firebase Auth : résout le profil Firestore puis notifie toutes les pages
listenAuthState(async (user) => {
  _fbUser  = user;
  _profile = user ? await getUserProfile(user.uid) : null;
  _authReady = true;

  const notify = () => {
    _renderNavbar(_fbUser, _profile);
    _callbacks.splice(0).forEach(cb => cb(_fbUser, _profile));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", notify, { once: true });
  } else {
    notify();
  }
});

/* ---- Exports publics ---- */
export {
  onAuthReady,
  requireAuth,
  showToast,
  toggleTheme,
  matiereNom,
  matiereIcone,
  niveauNom,
  courseCardHTML,
  validateField
};