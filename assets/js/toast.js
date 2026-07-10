// ============================================================================
// toast.js
// Petit module de notifications toast, réutilisable sur toutes les pages admin.
// Nécessite un conteneur <div id="toast-container"></div> dans le HTML.
// ============================================================================

function getContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Affiche un toast temporaire.
 * @param {string} message
 * @param {"success"|"error"|"info"} type
 */
export function showToast(message, type = "success") {
  const container = getContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${iconFor(type)}</span>
    <span class="toast__message">${message}</span>
  `;

  container.appendChild(toast);

  // Déclenche l'animation d'entrée
  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3500);
}

export const toastSuccess = (msg) => showToast(msg, "success");
export const toastError = (msg) => showToast(msg, "error");
export const toastInfo = (msg) => showToast(msg, "info");

function iconFor(type) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "ℹ";
}