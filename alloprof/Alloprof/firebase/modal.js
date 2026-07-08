// ============================================================================
// modal.js
// Ouverture/fermeture générique de modals + boîte de confirmation réutilisable.
// ============================================================================

/** Ouvre un overlay de modal par son id. */
export function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}

/** Ferme un overlay de modal par son id. */
export function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
}

/** Ferme la modal si on clique sur l'overlay (en dehors de la boîte). */
export function bindOverlayClose(id) {
  const overlay = document.getElementById(id);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal(id);
  });
}

/**
 * Affiche une confirmation de suppression réutilisable.
 * Nécessite un overlay #confirm-modal déjà présent dans le HTML de la page
 * (structure fournie dans chaque page admin-*.html).
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export function confirmDelete(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-modal");
    const textEl = document.getElementById("confirm-message");
    const yesBtn = document.getElementById("confirm-yes");
    const noBtn = document.getElementById("confirm-no");
    if (!overlay) return resolve(window.confirm(message)); // fallback

    textEl.textContent = message;
    openModal("confirm-modal");

    const cleanup = (result) => {
      closeModal("confirm-modal");
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("click", onNo);
      resolve(result);
    };
    const onYes = () => cleanup(true);
    const onNo = () => cleanup(false);

    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}