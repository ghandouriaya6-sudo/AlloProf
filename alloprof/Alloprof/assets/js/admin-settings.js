// ============================================================================
// admin-settings.js
// Paramètres généraux du site (document "settings/general").
// ============================================================================

import { requireAdmin } from "../../firebase/auth.js";
import { initAdminLayout } from "./admin-layout.js";
import { getSettings, saveSettings } from "./firestore.js";
import { toastSuccess, toastError } from "./toast.js";

init();

async function init() {
  let profile;
  try {
    ({ profile } = await requireAdmin());
  } catch {
    return;
  }

  initAdminLayout({
    activeKey: "settings",
    pageTitle: "Paramètres",
    breadcrumb: ["Admin", "Paramètres"],
    profile,
  });

  document.getElementById("settings-form").addEventListener("submit", onSubmit);
  document.getElementById("rib-form").addEventListener("submit", onRibSubmit);

  try {
    const settings = await getSettings();
    if (settings) {
      document.getElementById("f-siteName").value = settings.siteName || "AlloProf";
      document.getElementById("f-adminEmail").value = settings.adminEmail || "";
      document.getElementById("f-contactPhone").value = settings.contactPhone || "";
      document.getElementById("f-maintenance").checked = !!settings.maintenance;
      document.getElementById("f-bankName").value = settings.bankName || "";
      document.getElementById("f-ribHolder").value = settings.ribHolder || "";
      document.getElementById("f-ribNumber").value = settings.ribNumber || "";
      document.getElementById("f-ribIban").value = settings.ribIban || "";
    }
  } catch (err) {
    console.error(err);
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const data = {
    siteName: document.getElementById("f-siteName").value.trim(),
    adminEmail: document.getElementById("f-adminEmail").value.trim(),
    contactPhone: document.getElementById("f-contactPhone").value.trim(),
    maintenance: document.getElementById("f-maintenance").checked,
  };

  const submitBtn = document.getElementById("btn-submit");
  submitBtn.disabled = true;
  try {
    await saveSettings(data);
    toastSuccess("Paramètres enregistrés.");
  } catch (err) {
    console.error(err);
    toastError("Erreur lors de l'enregistrement.");
  } finally {
    submitBtn.disabled = false;
  }
}

async function onRibSubmit(e) {
  e.preventDefault();
  const data = {
    bankName: document.getElementById("f-bankName").value.trim(),
    ribHolder: document.getElementById("f-ribHolder").value.trim(),
    ribNumber: document.getElementById("f-ribNumber").value.trim(),
    ribIban: document.getElementById("f-ribIban").value.trim(),
  };

  const submitBtn = document.getElementById("btn-submit-rib");
  submitBtn.disabled = true;
  try {
    await saveSettings(data);
    toastSuccess("Coordonnées bancaires enregistrées.");
  } catch (err) {
    console.error(err);
    toastError("Erreur lors de l'enregistrement.");
  } finally {
    submitBtn.disabled = false;
  }
}