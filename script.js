const APP_PASSWORD_STORAGE_KEY = "jp700AppPasswordHash";
const APP_AUTH_SESSION_KEY = "jp700AppAuthenticated";
const PASSWORD_RESET_EMAIL = "n.alhas@jesspumpen.de";

const authScreen = document.getElementById("authScreen");
const authForm = document.getElementById("authForm");
const authPassword = document.getElementById("authPassword");
const authTitle = document.getElementById("authTitle");
const authIntro = document.getElementById("authIntro");
const authPasswordLabel = document.getElementById("authPasswordLabel");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authMessage = document.getElementById("authMessage");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
let authMode = "login";

initPasswordGate();

function initPasswordGate() {
  if (!authScreen || !authForm) return;

  if (sessionStorage.getItem(APP_AUTH_SESSION_KEY) === "true" && localStorage.getItem(APP_PASSWORD_STORAGE_KEY)) {
    unlockApp();
    return;
  }

  if (!localStorage.getItem(APP_PASSWORD_STORAGE_KEY)) {
    setAuthMode("create");
  } else {
    setAuthMode("login");
  }

  authPassword.focus();
}

function setAuthMode(mode) {
  authMode = mode;
  authPassword.value = "";
  setAuthMessage("");

  if (mode === "create") {
    authTitle.textContent = "Create Access Password";
    authIntro.textContent = "Choose a 4-digit password for this browser.";
    authPasswordLabel.textContent = "New password";
    authSubmitBtn.textContent = "Save Password";
    forgotPasswordBtn.classList.add("hidden");
    resetPasswordBtn.classList.add("hidden");
    authPassword.autocomplete = "new-password";
    return;
  }

  if (mode === "reset") {
    authTitle.textContent = "Reset Password";
    authIntro.textContent = "Choose a new 4-digit password for this browser.";
    authPasswordLabel.textContent = "New password";
    authSubmitBtn.textContent = "Save New Password";
    forgotPasswordBtn.classList.remove("hidden");
    resetPasswordBtn.classList.add("hidden");
    authPassword.autocomplete = "new-password";
    return;
  }

  authTitle.textContent = "Pump Selector Access";
  authIntro.textContent = "Enter the 4-digit password to open the system.";
  authPasswordLabel.textContent = "Password";
  authSubmitBtn.textContent = "Unlock";
  forgotPasswordBtn.classList.remove("hidden");
  resetPasswordBtn.classList.add("hidden");
  authPassword.autocomplete = "current-password";
}

authForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const password = authPassword.value.trim();

  if (!/^\d{4}$/.test(password)) {
    setAuthMessage("Please enter a 4-digit password.", true);
    return;
  }

  if (authMode === "create" || authMode === "reset") {
    localStorage.setItem(APP_PASSWORD_STORAGE_KEY, await hashPassword(password));
    sessionStorage.setItem(APP_AUTH_SESSION_KEY, "true");
    setAuthMessage("Password saved.", false, true);
    unlockApp();
    return;
  }

  const savedHash = localStorage.getItem(APP_PASSWORD_STORAGE_KEY);
  const enteredHash = await hashPassword(password);

  if (enteredHash !== savedHash) {
    setAuthMessage("Password is incorrect.", true);
    authPassword.select();
    return;
  }

  sessionStorage.setItem(APP_AUTH_SESSION_KEY, "true");
  unlockApp();
});

forgotPasswordBtn?.addEventListener("click", () => {
  const subject = encodeURIComponent("JP700 password reset request");
  const body = encodeURIComponent("Hello, I forgot the JP700 Pump Selector password. Please send me a new 4-digit password or reset instructions.");
  window.location.href = "mailto:" + PASSWORD_RESET_EMAIL + "?subject=" + subject + "&body=" + body;
  resetPasswordBtn.classList.remove("hidden");
  setAuthMessage("A reset email draft was opened. After approval, use Set new password on this screen.");
});

resetPasswordBtn?.addEventListener("click", () => {
  setAuthMode("reset");
  authPassword.focus();
});

async function hashPassword(password) {
  const bytes = new TextEncoder().encode("jp700:" + password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function unlockApp() {
  document.body.classList.remove("auth-locked");
}

function setAuthMessage(message, isError = false, isSuccess = false) {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.classList.toggle("error", isError);
  authMessage.classList.toggle("success", isSuccess);
}

﻿const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
const IMAGE_CACHE_VERSION = "pump-images-2026-06-26-2";

const selections = {
  atex: "Non-ATEX",
  food: "Non-food",
  orientation: "Vertical"
};

const buttons = document.querySelectorAll(".option-btn");
const summaryText = document.getElementById("summaryText");
const dataInputPage = document.getElementById("dataInputPage");
const fluidPage = document.getElementById("fluidPage");
const calculateRotationBtn = document.getElementById("calculateRotationBtn");
const showRotationBtn = document.getElementById("showRotationBtn");
const backToDataBtn = document.getElementById("backToDataBtn");
const backToFluidBtn = document.getElementById("backToFluidBtn");
const backToRotationBtn = document.getElementById("backToRotationBtn");
const resetButtons = document.querySelectorAll("[id^='resetFrom']");
const rotationPage = document.getElementById("rotationPage");
const pumpDetailPage = document.getElementById("pumpFamilyPage");
const pumpFamilyContext = document.getElementById("pumpFamilyContext");
const pumpFamilyButtons = document.querySelectorAll(".pump-family-btn");
let selectedPumpModel = "";
const rpmTableBody = document.getElementById("rpmTableBody");
const rpmStatus = document.getElementById("rpmStatus");
const fluidReferenceTableBody = document.getElementById("fluidReferenceTableBody");
const fluidReferenceEditBtn = document.getElementById("fluidReferenceEditBtn");
const fluidReferenceSaveBtn = document.getElementById("fluidReferenceSaveBtn");
const fluidReferenceCancelBtn = document.getElementById("fluidReferenceCancelBtn");
const fluidReferenceStatus = document.getElementById("fluidReferenceStatus");
const FLUID_REFERENCE_START_ORDER = 15;
const FLUID_REFERENCE_END_ORDER = 100;
const FLUID_REFERENCE_LAYOUT_TABLE = "fluid_reference_layout";
let fluidReferenceRows = [];
let savedFluidReferenceRows = [];
let fluidReferenceEditMode = false;
let fluidReferenceColumns = { abrasivity: [], viscosity: [] };
let fluidReferenceModelByDisplayName = new Map();
const coefficientsTableBody = document.getElementById("coefficientsTableBody");
const coefficientsEditBtn = document.getElementById("coefficientsEditBtn");
const coefficientsSaveBtn = document.getElementById("coefficientsSaveBtn");
const coefficientsCancelBtn = document.getElementById("coefficientsCancelBtn");
const coefficientsStatus = document.getElementById("coefficientsStatus");
const efficiencyTableBody = document.getElementById("efficiencyTableBody");
const efficiencyEditBtn = document.getElementById("efficiencyEditBtn");
const efficiencySaveBtn = document.getElementById("efficiencySaveBtn");
const efficiencyCancelBtn = document.getElementById("efficiencyCancelBtn");
const efficiencyStatus = document.getElementById("efficiencyStatus");
let coefficientReferenceRows = [];
let savedCoefficientReferenceRows = [];
let coefficientsEditMode = false;
let efficiencyReferenceRows = [];
let savedEfficiencyReferenceRows = [];
let efficiencyEditMode = false;

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const group = button.dataset.group;
    const value = button.dataset.value;

    selections[group] = value;

    document
      .querySelectorAll(`.option-btn[data-group="${group}"]`)
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    updateSummary();
  });
});

function updateSummary() {
  let result = "";

  if (selections.atex === "Non-ATEX" && selections.food === "Non-food") {
    result = "Standard";
  } else if (selections.atex === "ATEX" && selections.food === "Non-food") {
    result = "ATEX";
  } else if (selections.atex === "Non-ATEX" && selections.food === "Food") {
    result = "Food";
  } else if (selections.atex === "ATEX" && selections.food === "Food") {
    result = "ATEX & Food";
  }

  summaryText.textContent = `${result} ${selections.orientation}`;
}

updateSummary();

const fluidSelections = {
  abrasivity: "group1",
  viscosity: "group1"
};

const propertyOptions = document.querySelectorAll(".property-option");

propertyOptions.forEach(option => {
  option.addEventListener("click", () => {
    const group = option.dataset.group;
    const value = option.dataset.value;

    fluidSelections[group] = value;

    document
      .querySelectorAll(`.property-option[data-group="${group}"]`)
      .forEach(button => button.classList.remove("active"));

    option.classList.add("active");
  });
});

initFluidReferenceEditor();
initRotationReferenceEditors();


function initRotationReferenceEditors() {
  coefficientsEditBtn?.addEventListener("click", () => {
    coefficientsEditMode = true;
    setReferenceEditorStatus(coefficientsStatus, "Edit mode is active. Change coefficient values, then save.");
    renderCoefficientReferenceRows();
  });

  coefficientsCancelBtn?.addEventListener("click", () => {
    coefficientsEditMode = false;
    coefficientReferenceRows = cloneCoefficientRows(savedCoefficientReferenceRows);
    setReferenceEditorStatus(coefficientsStatus, "");
    renderCoefficientReferenceRows();
  });

  coefficientsSaveBtn?.addEventListener("click", saveCoefficientReferenceRows);

  efficiencyEditBtn?.addEventListener("click", () => {
    efficiencyEditMode = true;
    setReferenceEditorStatus(efficiencyStatus, "Edit mode is active. Values are shown as percent.");
    renderEfficiencyReferenceRows();
  });

  efficiencyCancelBtn?.addEventListener("click", () => {
    efficiencyEditMode = false;
    efficiencyReferenceRows = cloneEfficiencyRows(savedEfficiencyReferenceRows);
    setReferenceEditorStatus(efficiencyStatus, "");
    renderEfficiencyReferenceRows();
  });

  efficiencySaveBtn?.addEventListener("click", saveEfficiencyReferenceRows);
}

function setRotationReferenceRows(coefficients, efficiencyRows) {
  coefficientReferenceRows = coefficients.map(row => ({
    model: String(row.model || "").trim(),
    constant: Number(row.constant),
    eccentricity: Number(row.eccentricity),
    rotor_diameter: Number(row.rotor_diameter),
    stator_pitch: Number(row.stator_pitch)
  }));
  savedCoefficientReferenceRows = cloneCoefficientRows(coefficientReferenceRows);

  efficiencyReferenceRows = buildEfficiencyReferenceRows(coefficientReferenceRows, efficiencyRows);
  savedEfficiencyReferenceRows = cloneEfficiencyRows(efficiencyReferenceRows);

  renderCoefficientReferenceRows();
  renderEfficiencyReferenceRows();
  setReferenceEditorStatus(coefficientsStatus, "Values loaded from Supabase.");
  setReferenceEditorStatus(efficiencyStatus, "Values loaded from Supabase.");
}

function renderCoefficientReferenceRows() {
  if (!coefficientsTableBody || coefficientReferenceRows.length === 0) return;

  coefficientsTableBody.innerHTML = "";
  coefficientsEditBtn?.classList.toggle("hidden", coefficientsEditMode);
  coefficientsSaveBtn?.classList.toggle("hidden", !coefficientsEditMode);
  coefficientsCancelBtn?.classList.toggle("hidden", !coefficientsEditMode);

  coefficientReferenceRows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    tr.className = "pump-reference-row";
    tr.appendChild(createTextCell(formatPumpDisplayName(row.model)));
    ["constant", "eccentricity", "rotor_diameter", "stator_pitch"].forEach(key => {
      tr.appendChild(createEditableNumberCell(row, key, rowIndex, coefficientReferenceRows, coefficientsEditMode));
    });
    coefficientsTableBody.appendChild(tr);
  });
}

function renderEfficiencyReferenceRows() {
  if (!efficiencyTableBody || efficiencyReferenceRows.length === 0) return;

  efficiencyTableBody.innerHTML = "";
  efficiencyEditBtn?.classList.toggle("hidden", efficiencyEditMode);
  efficiencySaveBtn?.classList.toggle("hidden", !efficiencyEditMode);
  efficiencyCancelBtn?.classList.toggle("hidden", !efficiencyEditMode);

  efficiencyReferenceRows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    tr.className = "pump-reference-row";
    tr.appendChild(createTextCell(formatPumpDisplayName(row.model)));

    row.values.forEach((value, pressureIndex) => {
      const cell = document.createElement("td");

      if (!efficiencyEditMode) {
        cell.textContent = formatEfficiencyPercent(value);
      } else {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.01";
        input.value = value === null ? "" : String(Math.round(Number(value) * 10000) / 100);
        input.addEventListener("input", () => {
          efficiencyReferenceRows[rowIndex].values[pressureIndex] = parseEfficiencyInput(input.value);
        });
        cell.appendChild(input);
      }

      tr.appendChild(cell);
    });

    efficiencyTableBody.appendChild(tr);
  });
}

function createTextCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function createEditableNumberCell(row, key, rowIndex, rows, isEditing) {
  const cell = document.createElement("td");

  if (!isEditing) {
    cell.textContent = formatReferenceValue(row[key]);
    return cell;
  }

  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.000001";
  input.value = row[key] === null ? "" : String(row[key]);
  input.addEventListener("input", () => {
    rows[rowIndex][key] = parseReferenceNumber(input.value);
  });
  cell.appendChild(input);
  return cell;
}

function buildEfficiencyReferenceRows(coefficients, efficiencyRows) {
  const efficiencyByModelAndPressure = indexEfficiencyRows(efficiencyRows);

  return coefficients.map(coefficient => ({
    model: coefficient.model,
    values: Array.from({ length: 25 }, (_, pressureStep) => {
      const value = efficiencyByModelAndPressure.get(getEfficiencyKey(coefficient.model, pressureStep));
      return Number.isFinite(value) ? value : null;
    })
  }));
}

async function saveCoefficientReferenceRows() {
  setReferenceEditorStatus(coefficientsStatus, "Saving coefficients to Supabase...");
  coefficientsSaveBtn.disabled = true;

  try {
    const supabaseClient = getSupabaseClient();
    const payload = coefficientReferenceRows.map(row => ({
      model: row.model,
      constant: row.constant,
      eccentricity: row.eccentricity,
      rotor_diameter: row.rotor_diameter,
      stator_pitch: row.stator_pitch
    }));

    const { error } = await supabaseClient
      .from("coefficients")
      .upsert(payload, { onConflict: "model" });

    if (error) throw error;

    coefficientsEditMode = false;
    savedCoefficientReferenceRows = cloneCoefficientRows(coefficientReferenceRows);
    renderCoefficientReferenceRows();
    setReferenceEditorStatus(coefficientsStatus, "Coefficients saved. Recalculate to use updated values.");
  } catch (error) {
    setReferenceEditorStatus(coefficientsStatus, error.message || "Coefficients could not be saved.", true);
  } finally {
    coefficientsSaveBtn.disabled = false;
  }
}

async function saveEfficiencyReferenceRows() {
  setReferenceEditorStatus(efficiencyStatus, "Saving efficiency values to Supabase...");
  efficiencySaveBtn.disabled = true;

  try {
    const supabaseClient = getSupabaseClient();
    const payload = efficiencyReferenceRows.flatMap(row =>
      row.values.map((value, pressureStep) => ({
        model: row.model,
        pressure_step: pressureStep,
        efficiency: value
      }))
    );

    const { error } = await supabaseClient
      .from("efficiency")
      .upsert(payload, { onConflict: "model,pressure_step" });

    if (error) throw error;

    efficiencyEditMode = false;
    savedEfficiencyReferenceRows = cloneEfficiencyRows(efficiencyReferenceRows);
    renderEfficiencyReferenceRows();
    setReferenceEditorStatus(efficiencyStatus, "Efficiency values saved. Recalculate to use updated values.");
  } catch (error) {
    setReferenceEditorStatus(efficiencyStatus, error.message || "Efficiency values could not be saved.", true);
  } finally {
    efficiencySaveBtn.disabled = false;
  }
}

function parseEfficiencyInput(value) {
  const number = parseReferenceNumber(value);
  if (number === null) return null;
  return number > 1 ? number / 100 : number;
}

function formatEfficiencyPercent(value) {
  if (value === null || value === undefined) return "-";
  return "%" + String(Math.round(Number(value) * 10000) / 100).replace(".", ",");
}

function cloneCoefficientRows(rows) {
  return rows.map(row => ({ ...row }));
}

function cloneEfficiencyRows(rows) {
  return rows.map(row => ({
    model: row.model,
    values: [...row.values]
  }));
}

function setReferenceEditorStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function initFluidReferenceEditor() {
  if (!fluidReferenceTableBody) return;

  savedFluidReferenceRows = readFluidReferenceRowsFromTable();
  fluidReferenceRows = cloneFluidReferenceRows(savedFluidReferenceRows);
  loadFluidReferenceRows();

  fluidReferenceEditBtn?.addEventListener("click", () => {
    fluidReferenceEditMode = true;
    setFluidReferenceStatus("Edit mode is active. Change values or move pump names, then save.");
    renderFluidReferenceRows();
  });

  fluidReferenceCancelBtn?.addEventListener("click", () => {
    fluidReferenceEditMode = false;
    fluidReferenceRows = cloneFluidReferenceRows(savedFluidReferenceRows);
    setFluidReferenceStatus("");
    renderFluidReferenceRows();
  });

  fluidReferenceSaveBtn?.addEventListener("click", saveFluidReferenceRows);

  fluidReferenceTableBody.addEventListener("click", event => {
    const moveButton = event.target.closest("[data-fluid-move]");
    if (!moveButton || !fluidReferenceEditMode) return;

    const rowIndex = Number(moveButton.dataset.index);
    const pumpIndex = Number(moveButton.dataset.pumpIndex);
    const direction = Number(moveButton.dataset.fluidMove);
    moveFluidReferencePump(rowIndex, pumpIndex, direction);
  });
}

function readFluidReferenceRowsFromTable() {
  const sourceRows = Array.from(fluidReferenceTableBody.querySelectorAll("tr")).map((row, index) => {
    const cells = Array.from(row.querySelectorAll("td"));
    const hasSequenceColumn = cells.length >= 10 && /^\d+$/.test(cells[0]?.textContent.trim() || "");
    const pumpCellIndex = hasSequenceColumn ? 1 : 0;
    const valueStartIndex = hasSequenceColumn ? 2 : 1;
    const pumpText = cells[pumpCellIndex]?.textContent.trim() || "";

    return {
      order: FLUID_REFERENCE_START_ORDER + index,
      pumps: row.classList.contains("pump-reference-row") && pumpText ? parsePumpList(pumpText) : [],
      abrasivity: cells.slice(valueStartIndex, valueStartIndex + 4).map(cell => parseReferenceNumber(cell.textContent)),
      viscosity: cells.slice(valueStartIndex + 4, valueStartIndex + 8).map(cell => parseReferenceNumber(cell.textContent))
    };
  });

  return normalizeFluidReferenceRowCount(sourceRows);
}

async function loadFluidReferenceRows() {
  setFluidReferenceStatus("Loading Supabase values...");

  try {
    const [abrasivityRows, viscosityRows] = await Promise.all([
      fetchPropertyRows("abresivitat"),
      fetchPropertyRows("viskositat")
    ]);

    fluidReferenceColumns = {
      abrasivity: getGroupColumnKeys(abrasivityRows),
      viscosity: getGroupColumnKeys(viscosityRows)
    };
    fluidReferenceModelByDisplayName = buildModelDisplayMap(abrasivityRows, viscosityRows);
    fluidReferenceRows = buildFluidReferenceRows(abrasivityRows, viscosityRows);
    await applySavedFluidReferenceLayout();
    savedFluidReferenceRows = cloneFluidReferenceRows(fluidReferenceRows);
    renderFluidReferenceRows();
    setFluidReferenceStatus("Values loaded from Supabase.");
  } catch (error) {
    renderFluidReferenceRows();
    setFluidReferenceStatus("Supabase values could not be loaded. Static table is shown.", true);
  }
}

function buildFluidReferenceRows(abrasivityRows, viscosityRows) {
  const abrasivityByOrder = indexPropertyRowsByOrder(abrasivityRows);
  const viscosityByOrder = indexPropertyRowsByOrder(viscosityRows);

  return normalizeFluidReferenceRowCount(savedFluidReferenceRows).map(row => {
    const updatedRow = cloneFluidReferenceRows([row])[0];
    const abrasivityRow = abrasivityByOrder.get(updatedRow.order);
    const viscosityRow = viscosityByOrder.get(updatedRow.order);

    if (abrasivityRow) {
      updatedRow.abrasivity = [1, 2, 3, 4].map(group => getGroupValue(abrasivityRow, group));
    }

    if (viscosityRow) {
      updatedRow.viscosity = [1, 2, 3, 4].map(group => getGroupValue(viscosityRow, group));
    }

    return updatedRow;
  });
}

function renderFluidReferenceRows() {
  if (!fluidReferenceTableBody) return;

  fluidReferenceTableBody.innerHTML = "";
  fluidReferenceTableBody.classList.toggle("is-editing", fluidReferenceEditMode);
  fluidReferenceEditBtn?.classList.toggle("hidden", fluidReferenceEditMode);
  fluidReferenceSaveBtn?.classList.toggle("hidden", !fluidReferenceEditMode);
  fluidReferenceCancelBtn?.classList.toggle("hidden", !fluidReferenceEditMode);

  fluidReferenceRows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    tr.classList.toggle("pump-reference-row", row.pumps.length > 0);

    tr.appendChild(createFluidReferenceOrderCell(row));
    tr.appendChild(createFluidReferencePumpCell(row, rowIndex));
    row.abrasivity.forEach((value, groupIndex) => {
      tr.appendChild(createFluidReferenceValueCell(value, "abrasivity", groupIndex));
    });
    row.viscosity.forEach((value, groupIndex) => {
      tr.appendChild(createFluidReferenceValueCell(value, "viscosity", groupIndex));
    });

    fluidReferenceTableBody.appendChild(tr);
  });
}

function createFluidReferenceOrderCell(row) {
  const cell = document.createElement("td");
  cell.className = "fluid-order-cell";
  cell.textContent = row.order;
  return cell;
}

function createFluidReferencePumpCell(row, rowIndex) {
  const cell = document.createElement("td");

  if (!fluidReferenceEditMode) {
    cell.textContent = row.pumps.join(", ");
    return cell;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "fluid-pump-list-editor";

  row.pumps.forEach((pump, pumpIndex) => {
    const item = document.createElement("div");
    item.className = "fluid-pump-editor";

    const upButton = document.createElement("button");
    upButton.type = "button";
    upButton.textContent = "Up";
    upButton.dataset.fluidMove = "-1";
    upButton.dataset.index = String(rowIndex);
    upButton.dataset.pumpIndex = String(pumpIndex);
    upButton.disabled = rowIndex === 0;

    const name = document.createElement("span");
    name.textContent = pump;

    const downButton = document.createElement("button");
    downButton.type = "button";
    downButton.textContent = "Down";
    downButton.dataset.fluidMove = "1";
    downButton.dataset.index = String(rowIndex);
    downButton.dataset.pumpIndex = String(pumpIndex);
    downButton.disabled = rowIndex === fluidReferenceRows.length - 1;

    item.append(upButton, name, downButton);
    wrapper.appendChild(item);
  });

  const input = document.createElement("input");
  input.type = "text";
  input.value = row.pumps.join(", ");
  input.placeholder = "e.g. 80, 200";
  input.addEventListener("change", () => {
    row.pumps = parsePumpList(input.value);
    renderFluidReferenceRows();
  });

  wrapper.appendChild(input);
  cell.appendChild(wrapper);
  return cell;
}

function createFluidReferenceValueCell(value, type, groupIndex) {
  const cell = document.createElement("td");

  if (!fluidReferenceEditMode) {
    cell.textContent = formatReferenceValue(value);
    return cell;
  }

  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.001";
  input.value = value === null ? "" : String(value);
  input.dataset.type = type;
  input.dataset.group = String(groupIndex);
  input.addEventListener("input", () => {
    const row = input.closest("tr");
    const rowIndex = Array.from(fluidReferenceTableBody.children).indexOf(row);
    fluidReferenceRows[rowIndex][type][groupIndex] = parseReferenceNumber(input.value);
  });

  cell.appendChild(input);
  return cell;
}

function moveFluidReferencePump(rowIndex, pumpIndex, direction) {
  const targetIndex = rowIndex + direction;
  if (targetIndex < 0 || targetIndex >= fluidReferenceRows.length) return;

  const currentPumps = fluidReferenceRows[rowIndex].pumps;
  const targetPumps = fluidReferenceRows[targetIndex].pumps;
  const pump = currentPumps[pumpIndex];
  if (!pump) return;

  currentPumps.splice(pumpIndex, 1);
  targetPumps.push(pump);
  renderFluidReferenceRows();
}

async function saveFluidReferenceRows() {
  setFluidReferenceStatus("Saving pump assignments and values to Supabase...");
  fluidReferenceSaveBtn.disabled = true;

  try {
    const assignedPumps = getAssignedFluidReferencePumps();

    if (assignedPumps.length === 0) {
      throw new Error("Add at least one pump before saving.");
    }

    await Promise.all([
      saveFluidReferenceTable("abresivitat", "abrasivity"),
      saveFluidReferenceTable("viskositat", "viscosity")
    ]);
    await saveFluidReferenceLayout();

    fluidReferenceEditMode = false;
    savedFluidReferenceRows = cloneFluidReferenceRows(fluidReferenceRows);
    renderFluidReferenceRows();
    setFluidReferenceStatus("Changes saved. Calculations will use the new pump row assignments.");
  } catch (error) {
    setFluidReferenceStatus(error.message || "Changes could not be saved.", true);
  } finally {
    fluidReferenceSaveBtn.disabled = false;
  }
}

async function applySavedFluidReferenceLayout() {
  try {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from(FLUID_REFERENCE_LAYOUT_TABLE)
      .select("order_position, pumps");

    if (error || !data || data.length === 0) return;

    const layoutByOrder = new Map(data.map(row => [Number(row.order_position), parsePumpList(row.pumps)]));
    fluidReferenceRows.forEach(row => {
      if (layoutByOrder.has(row.order)) {
        row.pumps = layoutByOrder.get(row.order);
      }
    });
  } catch (error) {
    // The layout table is optional for older Supabase setups.
  }
}

async function saveFluidReferenceLayout() {
  const supabaseClient = getSupabaseClient();
  const payload = fluidReferenceRows.map(row => ({
    order_position: row.order,
    pumps: row.pumps.join(", ")
  }));

  const { error } = await supabaseClient
    .from(FLUID_REFERENCE_LAYOUT_TABLE)
    .upsert(payload, { onConflict: "order_position" });

  if (error) {
    throw new Error("Pump positions could not be saved. Create the fluid_reference_layout table in Supabase first.");
  }
}

async function saveFluidReferenceTable(tableName, type) {
  const supabaseClient = getSupabaseClient();
  const columns = fluidReferenceColumns[type].length ? fluidReferenceColumns[type] : ["group_1", "group_2", "group_3", "group_4"];

  const payload = fluidReferenceRows.map(row => {
    const values = { order_position: row.order, selection_key: String(row.order) };
    columns.forEach((column, index) => {
      values[column] = row[type][index];
    });
    return values;
  });

  const { error } = await supabaseClient
    .from(tableName)
    .upsert(payload, { onConflict: "order_position" });

  if (error) {
    throw new Error(tableName + " reference values could not be saved. Add order_position as a unique column first.");
  }
}

function getAssignedFluidReferencePumps() {
  const assignments = [];
  const usedModels = new Set();
  const unknownPumps = [];

  fluidReferenceRows.forEach(row => {
    row.pumps.forEach(pump => {
      const model = getPumpModelForDisplayName(pump);
      if (!model) {
        unknownPumps.push(pump);
        return;
      }
      if (usedModels.has(model)) return;
      usedModels.add(model);
      assignments.push({ model, row });
    });
  });

  if (unknownPumps.length) {
    throw new Error("Unknown pump name: " + unknownPumps.join(", "));
  }

  return assignments;
}

function buildModelDisplayMap(...rowSets) {
  const map = new Map();

  rowSets.flat().forEach(row => {
    const model = String(row.selection_key || row.model || "").trim();
    if (!model) return;

    map.set(formatPumpDisplayName(model), model);
    map.set(model, model);
  });

  return map;
}

function indexPropertyRowsByDisplayName(rows) {
  return new Map(rows.map(row => {
    const model = String(row.selection_key || row.model || "").trim();
    return [formatPumpDisplayName(model), row];
  }));
}

function getPumpModelForDisplayName(displayName) {
  const normalized = String(displayName || "").trim();
  return fluidReferenceModelByDisplayName.get(normalized) || fluidReferenceModelByDisplayName.get(formatPumpDisplayName(normalized)) || null;
}

function normalizeFluidReferenceRowCount(rows) {
  const normalizedRows = rows.slice(0, getFluidReferenceRowCount()).map((row, index) => ({
    order: FLUID_REFERENCE_START_ORDER + index,
    pumps: parsePumpList(row.pumps || []),
    abrasivity: normalizeValueList(row.abrasivity),
    viscosity: normalizeValueList(row.viscosity)
  }));

  while (normalizedRows.length < getFluidReferenceRowCount()) {
    normalizedRows.push({
      order: FLUID_REFERENCE_START_ORDER + normalizedRows.length,
      pumps: [],
      abrasivity: [null, null, null, null],
      viscosity: [null, null, null, null]
    });
  }

  return normalizedRows;
}

function getFluidReferenceRowCount() {
  return FLUID_REFERENCE_END_ORDER - FLUID_REFERENCE_START_ORDER + 1;
}

function normalizeValueList(values) {
  const normalized = Array.isArray(values) ? values.slice(0, 4) : [];
  while (normalized.length < 4) normalized.push(null);
  return normalized;
}

function parsePumpList(value) {
  const rawItems = Array.isArray(value) ? value : String(value || "").split(/[,;\n]+/);
  const seen = new Set();
  const pumps = [];

  rawItems.map(item => String(item).trim()).filter(Boolean).forEach(item => {
    const displayName = formatPumpDisplayName(item);
    if (seen.has(displayName)) return;
    seen.add(displayName);
    pumps.push(displayName);
  });

  return pumps;
}

function getGroupColumnKeys(rows) {
  const sample = rows.find(row => row && typeof row === "object") || {};

  return [1, 2, 3, 4].map(groupNumber => {
    const possibleColumns = [
      "group_" + groupNumber,
      "group" + groupNumber,
      "grup_" + groupNumber,
      "grup" + groupNumber,
      "g" + groupNumber,
      String(groupNumber)
    ];

    return Object.keys(sample).find(key => possibleColumns.includes(key.toLowerCase())) || "group_" + groupNumber;
  });
}

function parseReferenceNumber(value) {
  const number = parseDecimal(String(value || "").trim());
  return Number.isFinite(number) ? number : null;
}

function formatReferenceValue(value) {
  if (value === null || value === undefined) return "-";
  return String(value).replace(".", ",");
}

function cloneFluidReferenceRows(rows) {
  return rows.map(row => ({
    ...row,
    pumps: [...row.pumps],
    abrasivity: [...row.abrasivity],
    viscosity: [...row.viscosity]
  }));
}

function setFluidReferenceStatus(message, isError = false) {
  if (!fluidReferenceStatus) return;
  fluidReferenceStatus.textContent = message;
  fluidReferenceStatus.classList.toggle("error", isError);
}

const flowInputs = {
  lmin: document.getElementById("flowLMin"),
  lhour: document.getElementById("flowLHour"),
  m3hour: document.getElementById("flowM3Hour")
};

Object.entries(flowInputs).forEach(([unit, input]) => {
  input.addEventListener("input", () => {
    const rawValue = input.value;

    if (rawValue.trim() === "") {
      resetFlowInputs();
      return;
    }

    const value = parseDecimal(rawValue);

    if (isNaN(value)) return;

    calculateFlow(unit, value);
  });
});

function parseDecimal(value) {
  return Number(String(value).replace(",", "."));
}

function formatDecimal(value) {
  return String(Math.round(value * 1000) / 1000).replace(".", ",");
}

function calculateFlow(unit, value) {
  let lmin;
  let lhour;
  let m3hour;

  if (unit === "lmin") {
    lmin = value;
    lhour = value * 60;
    m3hour = value * 0.06;
  }

  if (unit === "lhour") {
    lhour = value;
    lmin = value / 60;
    m3hour = value / 1000;
  }

  if (unit === "m3hour") {
    m3hour = value;
    lhour = value * 1000;
    lmin = value * 1000 / 60;
  }

  if (unit !== "lmin") flowInputs.lmin.value = formatDecimal(lmin);
  if (unit !== "lhour") flowInputs.lhour.value = formatDecimal(lhour);
  if (unit !== "m3hour") flowInputs.m3hour.value = formatDecimal(m3hour);

  Object.entries(flowInputs).forEach(([key, input]) => {
    input.disabled = key !== unit;
  });
}

function resetFlowInputs() {
  Object.values(flowInputs).forEach(input => {
    input.value = "";
    input.disabled = false;
  });
}

const pressureSlider = document.getElementById("pressureSlider");
const pressureValue = document.getElementById("pressureValue");

if (window.noUiSlider) {
  noUiSlider.create(pressureSlider, {
    start: 0,
    connect: [true, false],
    step: 1,
    range: {
      min: 0,
      max: 24
    },
    pips: {
      mode: "values",
      values: [0, 4, 8, 12, 16, 20, 24],
      density: 4
    },
    format: {
      to: value => Math.round(value),
      from: value => Number(value)
    }
  });
} else {
  const fallbackSlider = document.createElement("input");
  fallbackSlider.type = "range";
  fallbackSlider.min = "0";
  fallbackSlider.max = "24";
  fallbackSlider.step = "1";
  fallbackSlider.value = "0";
  fallbackSlider.className = "pressure-fallback-slider";
  pressureSlider.replaceChildren(fallbackSlider);
  pressureSlider.noUiSlider = {
    set(value) {
      fallbackSlider.value = String(value);
      pressureValue.value = String(value);
    },
    on(eventName, handler) {
      if (eventName !== "update") return;
      fallbackSlider.addEventListener("input", () => handler([fallbackSlider.value]));
      handler([fallbackSlider.value]);
    }
  };
}

pressureSlider.noUiSlider.on("update", values => {
  pressureValue.value = values[0];
});

pressureValue.addEventListener("input", () => {
  let value = Number(pressureValue.value);

  if (pressureValue.value === "") return;

  value = Math.round(value);

  if (value < 0) value = 0;
  if (value > 24) value = 24;

  pressureValue.value = value;
  pressureSlider.noUiSlider.set(value);
});

calculateRotationBtn.addEventListener("click", () => {
  const qLiterMin = getFlowRateLiterMin();

  if (!qLiterMin || qLiterMin <= 0) {
    alert("Please enter a valid flow rate.");
    return;
  }

  showFluidPage();
});

showRotationBtn.addEventListener("click", async () => {
  const qLiterMin = getFlowRateLiterMin();

  if (!qLiterMin || qLiterMin <= 0) {
    alert("Please enter a valid flow rate.");
    showDataInputPage();
    return;
  }

  showRotationPage();
  rpmTableBody.innerHTML = "";
  setStatus("Loading calculation data...");

  try {
    const [coefficients, abrasivityRows, viscosityRows, efficiencyRows, layoutRows] = await Promise.all([
      fetchCoefficients(),
      fetchPropertyRows("abresivitat"),
      fetchPropertyRows("viskositat"),
      fetchEfficiencyRows(),
      fetchFluidReferenceLayoutRows()
    ]);

    setRotationReferenceRows(coefficients, efficiencyRows);
    renderRotationSpeeds(coefficients, qLiterMin, abrasivityRows, viscosityRows, efficiencyRows, layoutRows);
    setStatus("");
  } catch (error) {
    rpmTableBody.innerHTML = "";
    setStatus(error.message || "Calculation data could not be loaded.", true);
  }
});

backToDataBtn.addEventListener("click", showDataInputPage);
backToFluidBtn.addEventListener("click", showFluidPage);
backToRotationBtn.addEventListener("click", showRotationPage);
resetButtons.forEach(button => button.addEventListener("click", resetToStart));

function showDataInputPage() {
  dataInputPage.classList.remove("hidden");
  fluidPage.classList.add("hidden");
  rotationPage.classList.add("hidden");
  pumpDetailPage.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetToStart() {
  showDataInputPage();
}

function showFluidPage() {
  dataInputPage.classList.add("hidden");
  fluidPage.classList.remove("hidden");
  rotationPage.classList.add("hidden");
  pumpDetailPage.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showRotationPage() {
  dataInputPage.classList.add("hidden");
  fluidPage.classList.add("hidden");
  rotationPage.classList.remove("hidden");
  pumpDetailPage.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPumpDetailPage() {
  dataInputPage.classList.add("hidden");
  fluidPage.classList.add("hidden");
  rotationPage.classList.add("hidden");
  pumpDetailPage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getFlowRateLiterMin() {
  return parseDecimal(flowInputs.lmin.value) || 0;
}

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and anon key are missing.");
  }

  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase library could not be loaded.");
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function fetchCoefficients() {
  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient
    .from("coefficients")
    .select("model, constant, eccentricity, rotor_diameter, stator_pitch");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No coefficients found.");
  }

  return data;
}

async function fetchPropertyRows(tableName) {
  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient
    .from(tableName)
    .select("*");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`No data found in ${tableName}.`);
  }

  return data;
}

async function fetchEfficiencyRows() {
  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient
    .from("efficiency")
    .select("model, pressure_step, efficiency");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No efficiency data found.");
  }

  return data;
}

function renderRotationSpeeds(coefficients, qLiterMin, abrasivityRows, viscosityRows, efficiencyRows, layoutRows) {
  rpmTableBody.innerHTML = "";

  const pumpOrderByModel = indexFluidLayoutByModel(layoutRows, coefficients);
  const abrasivityByOrder = indexPropertyRowsByOrder(abrasivityRows);
  const viscosityByOrder = indexPropertyRowsByOrder(viscosityRows);
  const efficiencyByModelAndPressure = indexEfficiencyRows(efficiencyRows);
  const pressureStep = getSelectedPressureStep();
  const abrasivityGroup = getSelectedGroupNumber(fluidSelections.abrasivity);
  const viscosityGroup = getSelectedGroupNumber(fluidSelections.viscosity);

  coefficients.forEach(coefficient => {
    const efficiency = getEfficiencyValue(efficiencyByModelAndPressure, coefficient.model, pressureStep);
    const rpm =
      qLiterMin *
      (1 / Number(coefficient.constant)) *
      (1 / Number(coefficient.eccentricity)) *
      (1 / Number(coefficient.rotor_diameter)) *
      (1 / Number(coefficient.stator_pitch)) *
      (1 / efficiency) /
      1000;

    const roundedRpm = Math.round(rpm);
    const referenceOrder = pumpOrderByModel.get(coefficient.model);
    if (!referenceOrder) {
      throw new Error("No fluid reference order found for " + coefficient.model + ". Check fluid_reference_layout.");
    }

    const abrasivityRow = abrasivityByOrder.get(referenceOrder);
    const viscosityRow = viscosityByOrder.get(referenceOrder);

    if (!abrasivityRow || !viscosityRow) {
      throw new Error("No abrasivity/viscosity values found for order " + referenceOrder + ". Add order_position to abresivitat and viskositat.");
    }

    const abrasivityValue = getGroupValue(abrasivityRow, abrasivityGroup);
    const viscosityValue = getGroupValue(viscosityRow, viscosityGroup);
    const selectedPropertyValue = getLowerPropertyValue(abrasivityValue, viscosityValue);
    const calculationRange = getCalculationRange(selectedPropertyValue);
    const row = document.createElement("tr");
    const abrasivityIsLower = isLowerOrEqualValue(abrasivityValue, viscosityValue);
    const viscosityIsLower = isLowerOrEqualValue(viscosityValue, abrasivityValue);

    if (isRpmInRange(roundedRpm, calculationRange)) {
      row.classList.add("rpm-match");
    }

    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Select ${coefficient.model}`);

    row.innerHTML = `
      <td>${formatPumpDisplayName(coefficient.model)}</td>
      <td>${roundedRpm}</td>
      <td class="${abrasivityIsLower ? "lower-value" : ""}">${formatResultValue(abrasivityValue)}</td>
      <td class="${viscosityIsLower ? "lower-value" : ""}">${formatResultValue(viscosityValue)}</td>
      <td>${formatRangeValue(calculationRange, "min")}</td>
      <td>${formatRangeValue(calculationRange, "max")}</td>
    `;

    row.addEventListener("click", () => showPumpDetails(coefficient.model));
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPumpDetails(coefficient.model);
      }
    });

    rpmTableBody.appendChild(row);
  });
}

function formatPumpDisplayName(model) {
  return String(model)
    .replace("JP-700.", "")
    .replace("JP-", "");
}

function showPumpDetails(model) {
  selectedPumpModel = model;
  updatePumpFamilyOptions();
  showPumpDetailPage();
}

function updatePumpFamilyOptions() {
  const allowedFamilies = getAllowedPumpFamilies();
  const allowedSet = new Set(allowedFamilies);
  let firstEnabledButton = null;

  pumpFamilyContext.textContent = `Selected pump: ${formatPumpDisplayName(selectedPumpModel)} | ${getSelectionLabel()} | ${selections.orientation}`;

  pumpFamilyButtons.forEach(button => {
    const isAllowed = allowedSet.has(button.dataset.family);

    button.disabled = !isAllowed;
    button.classList.toggle("disabled", !isAllowed);
    button.classList.remove("active");

    if (isAllowed && !firstEnabledButton) {
      firstEnabledButton = button;
    }
  });

  if (firstEnabledButton) {
    firstEnabledButton.classList.add("active");
  }
}

const pumpFamilyRules = [
  { family: "JP-", orientation: "H", food: true, atex: true },
  { family: "JP-700.", orientation: "V", food: false, atex: false },
  { family: "JP-700H.", orientation: "H", food: false, atex: false },
  { family: "JP-700HL.", orientation: "H", food: true, atex: false },
  { family: "JP-700L.", orientation: "V", food: true, atex: false },
  { family: "JP-700X.", orientation: "V", food: false, atex: true },
  { family: "JP-700HX.", orientation: "H", food: false, atex: true },
  { family: "JP-700XL.", orientation: "V", food: true, atex: true },
  { family: "JP-700HXL.", orientation: "H", food: true, atex: true },
  { family: "JP-L", orientation: "H", food: true, atex: true },
  { family: "JP-S", orientation: "H", food: true, atex: true },
  { family: "JP-SO", orientation: "H", food: true, atex: true }
];

function getAllowedPumpFamilies() {
  const orientationCode = selections.orientation === "Vertical" ? "V" : "H";
  const requiresFood = selections.food === "Food";
  const requiresAtex = selections.atex === "ATEX";

  return pumpFamilyRules
    .filter(rule =>
      rule.orientation === orientationCode &&
      rule.food === requiresFood &&
      rule.atex === requiresAtex
    )
    .map(rule => rule.family);
}

pumpFamilyButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.disabled) return;

    pumpFamilyButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
  });
});

function getFlowRateSummary() {
  const parts = [];

  if (flowInputs.lmin.value) parts.push(`${flowInputs.lmin.value} l/min`);
  if (flowInputs.lhour.value) parts.push(`${flowInputs.lhour.value} l/h`);
  if (flowInputs.m3hour.value) parts.push(`${flowInputs.m3hour.value} m3/h`);

  return parts.length ? parts.join(" = ") : "-";
}

function getSelectionLabel() {
  let base = "";

  if (selections.atex === "Non-ATEX" && selections.food === "Non-food") {
    base = "Standard";
  } else if (selections.atex === "ATEX" && selections.food === "Non-food") {
    base = "ATEX";
  } else if (selections.atex === "Non-ATEX" && selections.food === "Food") {
    base = "Food";
  } else {
    base = "ATEX & Food";
  }

  return base;
}
async function fetchFluidReferenceLayoutRows() {
  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient
    .from(FLUID_REFERENCE_LAYOUT_TABLE)
    .select("order_position, pumps");

  if (error) throw error;
  return data || [];
}

function indexFluidLayoutByModel(rows, coefficients) {
  const orderByModel = new Map();
  const modelByDisplayName = buildModelDisplayMap(coefficients);

  rows.forEach(row => {
    const order = Number(row.order_position);
    if (!Number.isFinite(order)) return;

    parsePumpList(row.pumps).forEach(pump => {
      const model = modelByDisplayName.get(pump) || modelByDisplayName.get(formatPumpDisplayName(pump));
      if (model) orderByModel.set(model, order);
    });
  });

  return orderByModel;
}

function indexPropertyRowsByOrder(rows) {
  const indexedRows = new Map();

  rows.forEach(row => {
    const order = getReferenceOrder(row);
    if (Number.isFinite(order)) indexedRows.set(order, row);
  });

  return indexedRows;
}

function getReferenceOrder(row) {
  const possibleColumns = ["order_position", "reference_order", "order", "sequence", "row_number"];
  const matchingKey = Object.keys(row || {}).find(key => possibleColumns.includes(key.toLowerCase()));
  const value = matchingKey ? Number(row[matchingKey]) : NaN;

  return Number.isFinite(value) ? value : null;
}

function indexRowsBySelectionKey(rows) {
  return new Map(rows.map(row => [String(row.selection_key).trim(), row]));
}

function indexEfficiencyRows(rows) {
  return new Map(
    rows.map(row => [getEfficiencyKey(row.model, row.pressure_step), Number(row.efficiency)])
  );
}

function getEfficiencyKey(model, pressureStep) {
  return `${String(model).trim()}__${Number(pressureStep)}`;
}

function getSelectedPressureStep() {
  return Math.round(Number(pressureValue.value) || 0);
}

function getEfficiencyValue(efficiencyByModelAndPressure, model, pressureStep) {
  const efficiency = efficiencyByModelAndPressure.get(getEfficiencyKey(model, pressureStep));

  if (!Number.isFinite(efficiency) || efficiency === 0) {
    throw new Error(`No efficiency value found for ${model} at ${pressureStep} bar.`);
  }

  return efficiency;
}

function getSelectedGroupNumber(value) {
  const groups = {
    group1: 1,
    group2: 2,
    group3: 3,
    group4: 4,
    low: 1,
    medium: 2,
    high: 3,
    "very-high": 4
  };

  return groups[value] || 1;
}

function getGroupValue(row, groupNumber) {
  if (!row) return null;

  const possibleColumns = [
    `group_${groupNumber}`,
    `group${groupNumber}`,
    `grup_${groupNumber}`,
    `grup${groupNumber}`,
    `g${groupNumber}`,
    String(groupNumber)
  ];

  const matchingKey = Object.keys(row).find(key =>
    possibleColumns.includes(key.toLowerCase())
  );

  if (!matchingKey) return null;

  const value = Number(row[matchingKey]);
  return Number.isFinite(value) ? value : null;
}

function getLowerPropertyValue(abrasivityValue, viscosityValue) {
  if (abrasivityValue === null && viscosityValue === null) return null;
  if (abrasivityValue === null) return viscosityValue;
  if (viscosityValue === null) return abrasivityValue;
  return Math.min(abrasivityValue, viscosityValue);
}

function isLowerOrEqualValue(value, otherValue) {
  if (value === null) return false;
  if (otherValue === null) return true;
  return value <= otherValue;
}

function getCalculationRange(value) {
  if (value === null) return null;

  const ratio = getCalculationRatio(value);

  return {
    min: value * (1 - ratio),
    max: value * (1 + ratio),
    ratio
  };
}

function getCalculationRatio(value) {
  if (value <= 100) return 0.5;
  if (value <= 500) return 0.3;
  if (value <= 1000) return 0.2;
  if (value <= 2000) return 0.1;
  return 0.05;
}

function isRpmInRange(rpm, range) {
  if (!range) return false;
  return rpm >= range.min && rpm <= range.max;
}

function formatRangeValue(range, type) {
  if (!range) return "-";

  const sign = type === "min" ? "-" : "+";
  const value = type === "min" ? range.min : range.max;
  const percent = Math.round(range.ratio * 100);

  return `${formatResultValue(value)} (${sign}%${percent})`;
}

function formatResultValue(value) {
  if (value === null) return "-";
  return String(Math.round(value * 1000) / 1000).replace(".", ",");
}

function setStatus(message, isError = false) {
  rpmStatus.textContent = message;
  rpmStatus.classList.toggle("error", isError);
}







