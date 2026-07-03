const loginPage = document.querySelector("#loginPage");
const workspaceShell = document.querySelector("#workspaceShell");
const projectsPage = document.querySelector("#projectsPage");
const selectorPage = document.querySelector("#selectorPage");
const mediaPage = document.querySelector("#mediaPage");
const pumpPage = document.querySelector("#pumpPage");
const datasetsPage = document.querySelector("#datasetsPage");
const datasetTabs = document.querySelector("#datasetTabs");
const datasetTableHead = document.querySelector("#datasetTableHead");
const datasetTableBody = document.querySelector("#datasetTableBody");
const datasetStatus = document.querySelector("#datasetStatus");
const saveDatasetBtn = document.querySelector("#saveDatasetBtn");

const authForm = document.querySelector("#authForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const submitButton = document.querySelector("#submitButton");
const authNote = document.querySelector("#authNote");
const signedInEmail = document.querySelector("#signedInEmail");
const logoutBtn = document.querySelector("#logoutBtn");
const sidebarSteps = document.querySelectorAll(".sidebar-step");
const projectsTableBody = document.querySelector("#projectsTableBody");
const emptyProjects = document.querySelector("#emptyProjects");
const startProjectBtn = document.querySelector("#startProjectBtn");
const projectModal = document.querySelector("#projectModal");
const projectForm = document.querySelector("#projectForm");
const cancelProjectBtn = document.querySelector("#cancelProjectBtn");
const customerInput = document.querySelector("#customerInput");
const projectNameInput = document.querySelector("#projectNameInput");
const mediumInput = document.querySelector("#mediumInput");
const backToProjectsBtn = document.querySelector("#backToProjectsBtn");
const goToMediaBtn = document.querySelector("#goToMediaBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const backToTypeBtn = document.querySelector("#backToTypeBtn");
const goToPumpBtn = document.querySelector("#goToPumpBtn");
const saveMediaBtn = document.querySelector("#saveMediaBtn");
const backToMediaBtn = document.querySelector("#backToMediaBtn");
const saveAndCloseBtn = document.querySelector("#saveAndCloseBtn");
const projectContext = document.querySelector("#projectContext");
const mediaProjectContext = document.querySelector("#mediaProjectContext");
const pumpProjectContext = document.querySelector("#pumpProjectContext");
const pumpResultsStatus = document.querySelector("#pumpResultsStatus");
const pumpResultsTableBody = document.querySelector("#pumpResultsTableBody");
const toggleGroups = document.querySelectorAll(".segmented-control");
const mediaGroups = document.querySelectorAll(".option-stack");
const flowInputs = {
  lmin: document.querySelector("#flowLMin"),
  lhour: document.querySelector("#flowLHour"),
  m3hour: document.querySelector("#flowM3Hour"),
};
const pressureSlider = document.querySelector("#pressureSlider");
const pressureInput = document.querySelector("#pressureInput");
const pressureTicks = document.querySelector("#pressureTicks");

const SUPABASE_URL = "https://kkzoldapwrsffhhqkuxi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrem9sZGFwd3JzZmZoaHFrdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTk0ODMsImV4cCI6MjA5ODQzNTQ4M30.vhKBIxVfixfAYVJ-tednebgwi-RggFCkCcb1aCMKDaA";
const PROJECTS_KEY = "jp700_projects";
const ACTIVE_PROJECT_KEY = "jp700_active_project_id";
const USER_EMAIL_KEY = "jp700_user_email";
const USER_ID_KEY = "jp700_user_id";
const USER_ROLE_KEY = "jp700_user_role";

let projects = loadProjects();
let activeProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY) || null;
let isHydratingProject = false;
let currentUserRole = localStorage.getItem(USER_ROLE_KEY) || "non_viewer";
let activeDatasetKey = "pump_limits";
let datasetRows = [];
let datasetOriginalRows = [];
let editedDatasetRows = new Map();
let calculationDatasetCache = null;
const DATASET_CONFIG = [
  { key: "pump_limits", label: "1.Pump_limits", table: "pump_limits", primaryKey: ["pump_code"], orderBy: ["sort_order", "pump_code"], columns: [
    { key: "pump_code", label: "Pump code", type: "text", locked: true },
    { key: "stage", label: "Stage", type: "integer" },
    { key: "max_rotation", label: "Max rotation", type: "number" },
    { key: "section_number", label: "Section number", type: "integer" },
    { key: "installation", label: "Installation", type: "text" },
  ]},
  { key: "jp_codes", label: "2.JP_Codes", table: "jp_codes", primaryKey: ["pump_family"], orderBy: ["pump_family"], columns: [
    { key: "pump_family", label: "Pump family", type: "text", locked: true },
    { key: "type", label: "Type", type: "text" },
    { key: "installation", label: "Installation", type: "text" },
  ]},
  { key: "sr_codes", label: "3.SR_Codes", table: "sr_codes", primaryKey: ["pump_model"], orderBy: ["pump_model"], columns: [
    { key: "pump_model", label: "Pump model", type: "text", locked: true },
    { key: "phase", label: "Phase", type: "text" },
    { key: "rotation", label: "Rotation", type: "text" },
  ]},
  { key: "abb_vis", label: "4.Abb_Vis", table: "abb_vis", primaryKey: ["section"], orderBy: ["section"], columns: [
    { key: "section", label: "Section", type: "integer", locked: true },
    { key: "abr_1", label: "Abr 1", type: "number" },
    { key: "abr_2", label: "Abr 2", type: "number" },
    { key: "abr_3", label: "Abr 3", type: "number" },
    { key: "abr_4", label: "Abr 4", type: "number" },
    { key: "vis_1", label: "Vis 1", type: "number" },
    { key: "vis_2", label: "Vis 2", type: "number" },
    { key: "vis_3", label: "Vis 3", type: "number" },
    { key: "vis_4", label: "Vis 4", type: "number" },
  ]},
  { key: "efficiency", label: "5.Efficiency", table: "efficiency", primaryKey: ["pump_code", "pressure_bar"], orderBy: ["sort_order", "pump_code", "pressure_bar"], columns: [
    { key: "pump_code", label: "Pump code", type: "text", locked: true },
    { key: "pressure_bar", label: "Pressure bar", type: "integer", locked: true },
    { key: "efficiency", label: "Efficiency", type: "number" },
  ]},
  { key: "rpm_formula", label: "6.RPM_Formula", table: "rpm_formula", primaryKey: ["pump_code"], orderBy: ["sort_order", "pump_code"], columns: [
    { key: "pump_code", label: "Pump code", type: "text", locked: true },
    { key: "constant", label: "Constant", type: "number" },
    { key: "eccentricity", label: "Eccentricity", type: "number" },
    { key: "rotor_diameter", label: "Rotor diameter", type: "number" },
    { key: "stator_pitch", label: "Stator pitch", type: "number" },
  ]},
];

function setFormState(isLoading, message) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Signing in" : "Sign in";
  if (message) authNote.textContent = message;
}

function showPage(page) {
  const isLogin = page === "login";
  loginPage.classList.toggle("is-hidden", !isLogin);
  workspaceShell.classList.toggle("is-hidden", isLogin);
  workspaceShell.classList.toggle("has-active-project", Boolean(getActiveProject()));
  projectsPage.classList.toggle("is-hidden", page !== "projects");
  selectorPage.classList.toggle("is-hidden", page !== "selector");
  mediaPage.classList.toggle("is-hidden", page !== "media");
  pumpPage.classList.toggle("is-hidden", page !== "pump");
  datasetsPage.classList.toggle("is-hidden", page !== "datasets");
  workspaceShell.dataset.page = page;
  workspaceShell.classList.toggle("can-view-datasets", canViewDatasets());
  workspaceShell.classList.toggle("can-edit-datasets", canEditDatasets());
  if (page === "datasets") loadDataset(activeDatasetKey);
  updateSidebar(page);
}

function updateSidebar(activePage) {
  const hasProject = Boolean(getActiveProject());
  sidebarSteps.forEach((step) => {
    const page = step.dataset.page;
    step.classList.toggle("is-active", page === activePage);
    step.disabled = page !== "projects" && page !== "datasets" && !hasProject;
  });
  signedInEmail.textContent = localStorage.getItem(USER_EMAIL_KEY) || "Signed in";
  workspaceShell.classList.toggle("can-view-datasets", canViewDatasets());
  workspaceShell.classList.toggle("can-edit-datasets", canEditDatasets());
}

function hasSavedSession() {
  return Boolean(localStorage.getItem("jp700_access_token"));
}

async function signInWithPassword(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json().catch(() => ({}));
  return { response, result };
}

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveProjects() {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function createBlankSelection() {
  return {
    application: "food",
    certification: "atex",
    orientation: "vertical",
    flow: { source: "", lmin: "", lhour: "", m3hour: "" },
    pressure: 0,
    abrasivity: "",
    viscosity: "",
  };
}

function getActiveProject() {
  return projects.find((project) => project.id === activeProjectId) || null;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function renderProjects() {
  projectsTableBody.innerHTML = "";
  emptyProjects.classList.toggle("is-hidden", projects.length > 0);

  projects.forEach((project) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(project.updatedAt || project.createdAt)}</td>
      <td>${escapeHtml(project.customer)}</td>
      <td class="project-name-cell">${escapeHtml(project.name)}</td>
      <td>${escapeHtml(project.medium || "-")}</td>
      <td><span class="status-pill">${project.status}</span></td>
      <td>
        <div class="row-actions">
<button class="icon-action" type="button" data-action="edit" data-id="${project.id}" aria-label="Edit project">Edit</button>
          <button class="icon-action danger-action" type="button" data-action="delete" data-id="${project.id}" aria-label="Delete project">Delete</button>
        </div>
      </td>
    `;
    projectsTableBody.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openProject(projectId, targetPage = "selector") {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  activeProjectId = projectId;
  localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  hydrateProject(project);
  if (targetPage === "pump") renderPumpPage(project);
  showPage(targetPage);
}

function openProjectModal() {
  projectForm.reset();
  projectModal.classList.remove("is-hidden");
  customerInput.focus();
}

function closeProjectModal() {
  projectModal.classList.add("is-hidden");
}

function renderProjectContext(target, project) {
  target.innerHTML = `
    <span>Customer: <strong>${escapeHtml(project.customer)}</strong></span>
    <span>Project: <strong>${escapeHtml(project.name)}</strong></span>
    <span>Medium: <strong>${escapeHtml(project.medium || "-")}</strong></span>
    <span>Status: <strong>${project.status}</strong></span>
  `;
}

function setToggleValue(groupName, value) {
  const group = document.querySelector(`[data-toggle-group="${groupName}"]`);
  if (!group) return;

  group.querySelectorAll(".toggle-option").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === value);
  });
}

function setMediaValue(groupName, value) {
  const group = document.querySelector(`[data-media-group="${groupName}"]`);
  if (!group) return;

  group.querySelectorAll(".media-option").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === value);
  });
}

function hydrateProject(project) {
  isHydratingProject = true;
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };

  renderProjectContext(projectContext, project);
  renderProjectContext(mediaProjectContext, project);
  renderProjectContext(pumpProjectContext, project);
  setToggleValue("application", selection.application);
  setToggleValue("certification", selection.certification);
  setToggleValue("orientation", selection.orientation);
  setMediaValue("abrasivity", selection.abrasivity);
  setMediaValue("viscosity", selection.viscosity);

  Object.values(flowInputs).forEach((input) => {
    input.value = "";
    input.readOnly = false;
    input.classList.remove("is-calculated");
  });

  const source = selection.flow?.source || "";
  if (source && flowInputs[source]) {
    flowInputs[source].value = selection.flow[source] || "";
    updateFlowFrom(source, false);
  }

  setPressure(selection.pressure ?? 0, false);
  isHydratingProject = false;
}

function collectSelection() {
  const getActive = (groupName) =>
    document.querySelector(`[data-toggle-group="${groupName}"] .toggle-option.is-active`)?.dataset.value;
  const getMedia = (groupName) =>
    document.querySelector(`[data-media-group="${groupName}"] .media-option.is-active`)?.dataset.value;

  const flowSource = Object.entries(flowInputs).find(([, input]) => !input.readOnly && input.value.trim())?.[0] || "";

  return {
    application: getActive("application") || "food",
    certification: getActive("certification") || "atex",
    orientation: getActive("orientation") || "vertical",
    flow: {
      source: flowSource,
      lmin: flowInputs.lmin.value,
      lhour: flowInputs.lhour.value,
      m3hour: flowInputs.m3hour.value,
    },
    pressure: Number(pressureInput.value) || 0,
    abrasivity: getMedia("abrasivity") || "",
    viscosity: getMedia("viscosity") || "",
  };
}

function saveActiveProject() {
  const project = getActiveProject();
  if (!project) return;

  project.selection = collectSelection();
  project.status = "In progress";
  project.updatedAt = new Date().toISOString();
  saveProjects();
  renderProjects();
  renderProjectContext(projectContext, project);
  renderProjectContext(mediaProjectContext, project);
  renderProjectContext(pumpProjectContext, project);
  updateSidebar(getVisiblePage());
}

function autosaveActiveProject() {
  if (isHydratingProject) return;
  saveActiveProject();
}

function getVisiblePage() {
  if (!projectsPage.classList.contains("is-hidden")) return "projects";
  if (!datasetsPage.classList.contains("is-hidden")) return "datasets";
  if (!selectorPage.classList.contains("is-hidden")) return "selector";
  if (!mediaPage.classList.contains("is-hidden")) return "media";
  if (!pumpPage.classList.contains("is-hidden")) return "pump";
  return "login";
}

async function renderPumpPage(project) {
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  renderProjectContext(pumpProjectContext, project);
  await renderPumpResults(selection);
}

async function renderPumpResults(selection) {
  if (!pumpResultsTableBody || !pumpResultsStatus) return;

  pumpResultsTableBody.innerHTML = "";
  if (!selection.flow?.source || !selection.abrasivity || !selection.viscosity) {
    pumpResultsStatus.textContent = "Enter type, flow, pressure and media values to calculate pump speeds.";
    return;
  }

  pumpResultsStatus.textContent = "Loading pump data...";

  try {
    const rows = await calculatePumpResultsFromSupabase(selection);
    pumpResultsStatus.textContent = `${rows.length} pump code(s) calculated.`;
    pumpResultsTableBody.innerHTML = rows.map(renderPumpResultRow).join("");
  } catch (error) {
    pumpResultsStatus.textContent = error.message || "Pump calculation failed.";
  }
}

async function calculatePumpResultsFromSupabase(selection) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/calculate_pump_results`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({
      flow_lmin: Number(selection.flow?.lmin) || 0,
      pressure_bar: Number(selection.pressure) || 0,
      orientation: selection.orientation || "vertical",
      abrasivity_group: getGroupNumber(selection.abrasivity),
      viscosity_group: getGroupNumber(selection.viscosity),
    }),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result?.message || result?.hint || "Pump data could not be loaded.";
    throw new Error(message);
  }

  return (result || []).map((row) => ({
    pumpCode: row.pump_code,
    isSelectable: Boolean(row.is_selectable),
    requiredRpm: Number(row.required_rpm),
    abrRpm: Number(row.rpm_abrasivity),
    visRpm: Number(row.rpm_viscosity),
    maximumRpm: row.maximum_rpm == null ? null : {
      value: Number(row.maximum_rpm),
      source: row.maximum_source,
      percent: Number(row.maximum_percent),
    },
  }));
}

async function loadCalculationDatasets() {
  if (calculationDatasetCache) return calculationDatasetCache;

  const keys = ["pump_limits", "efficiency", "rpm_formula", "abb_vis"];
  const entries = await Promise.all(keys.map(async (key) => {
    const config = getDatasetConfig(key);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.table}?${getDatasetQuery(config)}`, {
      headers: apiHeaders(false),
    });
    if (!response.ok) throw new Error(`Dataset failed: ${key}`);
    return [key, await response.json()];
  }));

  calculationDatasetCache = Object.fromEntries(entries);
  return calculationDatasetCache;
}

function calculatePumpResults(selection, data) {
  const pressure = Number(selection.pressure) || 0;
  const flowLMin = Number(selection.flow?.lmin) || 0;
  const abrKey = `abr_${getGroupNumber(selection.abrasivity)}`;
  const visKey = `vis_${getGroupNumber(selection.viscosity)}`;
  const efficiencyByPumpPressure = createLookup(data.efficiency || [], (row) => `${normalizeCode(row.pump_code)}|${Number(row.pressure_bar)}`);
  const formulaByPump = createLookup(data.rpm_formula || [], (row) => normalizeCode(row.pump_code));
  const abbVisBySection = createLookup(data.abb_vis || [], (row) => Number(row.section));

  return [...(data.pump_limits || [])].map((pump) => {
    const pumpCode = normalizeCode(pump.pump_code);
    const formula = formulaByPump.get(pumpCode);
    const efficiencyRow = efficiencyByPumpPressure.get(`${pumpCode}|${pressure}`);
    const mediaRow = abbVisBySection.get(Number(pump.section_number));
    const isSelectable = isPumpSelectable(selection.orientation, pump.installation);
    const efficiency = Number(efficiencyRow?.efficiency);
    const requiredRpm = calculateRequiredRpm(flowLMin, efficiency, formula);
    const abrRpm = Number(mediaRow?.[abrKey]);
    const visRpm = Number(mediaRow?.[visKey]);
    const maximumRpm = calculateMaximumRpm(abrRpm, visRpm);

    return {
      pumpCode,
      isSelectable,
      requiredRpm,
      abrRpm,
      visRpm,
      maximumRpm,
    };
  });
}

function createLookup(rows, keyGetter) {
  return new Map(rows.map((row) => [keyGetter(row), row]));
}

function normalizeCode(value) {
  return String(value ?? "").trim();
}

function getGroupNumber(value) {
  return Number(String(value || "").match(/Group\s+(\d)/i)?.[1]) || 0;
}

function isPumpSelectable(selectedOrientation, installation) {
  const orientation = String(selectedOrientation || "").toLowerCase();
  const installText = String(installation || "").toLowerCase();
  if (orientation === "vertical") return installText.includes("vertikal") || installText.includes("vertical");
  return installText.includes("horizontal");
}

function calculateRequiredRpm(flowLMin, efficiency, formula) {
  if (!formula || !Number.isFinite(flowLMin) || !Number.isFinite(efficiency) || efficiency <= 0) return null;
  const factors = [formula.constant, formula.eccentricity, formula.rotor_diameter, formula.stator_pitch]
    .map(Number);
  if (factors.some((value) => !Number.isFinite(value) || value === 0)) return null;
  const denominator = factors.reduce((total, value) => total * value, 1) * efficiency;
  return (flowLMin / denominator) / 1000;
}

function calculateMaximumRpm(abrRpm, visRpm) {
  if (!Number.isFinite(abrRpm) || !Number.isFinite(visRpm)) return null;
  const source = abrRpm <= visRpm ? "Abr" : "Vis";
  const base = source === "Abr" ? abrRpm : visRpm;
  const percent = getMaximumIncreasePercent(base);
  return {
    value: base * (1 + percent / 100),
    source,
    percent,
  };
}

function getMaximumIncreasePercent(value) {
  if (value <= 100) return 50;
  if (value <= 250) return 30;
  if (value <= 500) return 20;
  if (value <= 1000) return 10;
  return 5;
}

function renderPumpResultRow(row) {
  return `
    <tr class="${row.isSelectable ? "" : "is-unavailable"}">
      <td>${escapeHtml(row.pumpCode)}</td>
      <td>${formatRpm(row.requiredRpm)}</td>
      <td>${formatRpm(row.abrRpm)}</td>
      <td>${formatRpm(row.visRpm)}</td>
      <td>${formatMaximumRpm(row.maximumRpm)}</td>
    </tr>
  `;
}

function formatRpm(value) {
  if (!Number.isFinite(value)) return "Missing data";
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatMaximumRpm(result) {
  if (!result) return "Missing data";
  return `${formatRpm(result.value)} (${result.source} ${result.percent}%)`;
}

function labelValue(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}
function validateTypeValues() {
  const selection = collectSelection();
  if (!selection.flow.source) {
    window.alert("Please enter a flow rate before continuing.");
    return false;
  }
  return true;
}

function validateMediaValues() {
  if (!validateTypeValues()) return false;
  const selection = collectSelection();
  if (!selection.abrasivity || !selection.viscosity) {
    window.alert("Please select abrasivity and viscosity before continuing.");
    return false;
  }
  return true;
}
function canViewDatasets() {
  return currentUserRole === "admin" || currentUserRole === "viewer";
}

function canEditDatasets() {
  return currentUserRole === "admin";
}

function getAccessToken() {
  return localStorage.getItem("jp700_access_token") || "";
}

function apiHeaders(includeJson = true) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${getAccessToken()}`,
  };
  if (includeJson) headers["Content-Type"] = "application/json";
  return headers;
}

async function loadUserRole(userId) {
  if (!userId) {
    currentUserRole = localStorage.getItem(USER_ROLE_KEY) || "non_viewer";
    return currentUserRole;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role,is_active&limit=1`, {
    headers: apiHeaders(false),
  });
  const rows = await response.json().catch(() => []);
  const profile = rows[0];
  currentUserRole = profile?.is_active === false ? "non_viewer" : profile?.role || "non_viewer";
  localStorage.setItem(USER_ROLE_KEY, currentUserRole);
  return currentUserRole;
}

function getDatasetConfig(key = activeDatasetKey) {
  return DATASET_CONFIG.find((config) => config.key === key) || DATASET_CONFIG[0];
}

function getDatasetQuery(config) {
  const orderQuery = (config.orderBy || config.primaryKey)
    .map((column) => `${column}.asc.nullslast`)
    .join(",");
  return `select=*&order=${orderQuery}`;
}

function renderDatasetTabs() {
  datasetTabs.innerHTML = DATASET_CONFIG.map((config) => `
    <button class="dataset-tab ${config.key === activeDatasetKey ? "is-active" : ""}" type="button" data-dataset="${config.key}">
      ${config.label}
    </button>
  `).join("");
}

function renderDatasetTable(config) {
  const editable = canEditDatasets();
  datasetTableHead.innerHTML = `<tr>${config.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr>`;
  datasetTableBody.innerHTML = datasetRows.map((row, rowIndex) => `
    <tr>
      ${config.columns.map((column) => {
        const disabled = !editable || column.locked;
        const value = row[column.key] ?? "";
        return `<td><input ${disabled ? "disabled" : ""} data-row="${rowIndex}" data-column="${column.key}" value="${escapeHtml(value)}" /></td>`;
      }).join("")}
    </tr>
  `).join("");

  datasetStatus.textContent = editable
    ? `${datasetRows.length} rows loaded. Edit cells and save changes.`
    : `${datasetRows.length} rows loaded. Read-only access.`;
}

async function loadDataset(key) {
  if (!canViewDatasets()) {
    datasetStatus.textContent = "You do not have access to datasets.";
    datasetTableHead.innerHTML = "";
    datasetTableBody.innerHTML = "";
    return;
  }

  activeDatasetKey = key;
  const config = getDatasetConfig(key);
  renderDatasetTabs();
  datasetStatus.textContent = "Loading dataset...";
  editedDatasetRows.clear();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.table}?${getDatasetQuery(config)}`, {
    headers: apiHeaders(false),
  });

  if (!response.ok) {
    datasetStatus.textContent = "Dataset could not be loaded.";
    return;
  }

  datasetRows = await response.json();
  datasetOriginalRows = JSON.parse(JSON.stringify(datasetRows));
  calculationDatasetCache = null;
  renderDatasetTable(config);
}

function parseDatasetValue(value, column) {
  if (value === "") return null;
  if (column.type === "integer") return Number.parseInt(value, 10);
  if (column.type === "number") return Number(value);
  return value;
}

function datasetRowFilter(config, row) {
  return config.primaryKey
    .map((key) => `${key}=eq.${encodeURIComponent(row[key])}`)
    .join("&");
}

datasetTabs.addEventListener("click", (event) => {
  const button = event.target.closest(".dataset-tab");
  if (!button) return;
  loadDataset(button.dataset.dataset);
});

datasetTableBody.addEventListener("input", (event) => {
  const input = event.target.closest("input[data-row][data-column]");
  if (!input || !canEditDatasets()) return;

  const rowIndex = Number(input.dataset.row);
  const columnKey = input.dataset.column;
  const config = getDatasetConfig();
  const column = config.columns.find((item) => item.key === columnKey);
  if (!column || column.locked) return;

  datasetRows[rowIndex][columnKey] = parseDatasetValue(input.value, column);
  editedDatasetRows.set(rowIndex, true);
  input.classList.add("is-edited");
  datasetStatus.textContent = `${editedDatasetRows.size} row(s) changed.`;
});

saveDatasetBtn.addEventListener("click", async () => {
  if (!canEditDatasets() || editedDatasetRows.size === 0) {
    datasetStatus.textContent = "No changes to save.";
    return;
  }

  const config = getDatasetConfig();
  const originalButtonText = saveDatasetBtn.textContent;
  saveDatasetBtn.disabled = true;
  saveDatasetBtn.textContent = "Saving...";
  datasetStatus.classList.remove("is-success", "is-error");
  datasetStatus.textContent = "Saving changes...";

  for (const rowIndex of editedDatasetRows.keys()) {
    const row = datasetRows[rowIndex];
    const originalRow = datasetOriginalRows[rowIndex];
    const payload = {};

    config.columns.forEach((column) => {
      if (!column.locked && row[column.key] !== originalRow[column.key]) {
        payload[column.key] = row[column.key];
      }
    });

    if (Object.keys(payload).length === 0) continue;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.table}?${datasetRowFilter(config, row)}`, {
      method: "PATCH",
      headers: { ...apiHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      datasetStatus.classList.add("is-error");
      datasetStatus.textContent = "Save failed. Please check permissions and values.";
      saveDatasetBtn.disabled = false;
      saveDatasetBtn.textContent = originalButtonText;
      return;
    }
  }

  editedDatasetRows.clear();
  calculationDatasetCache = null;
  await loadDataset(activeDatasetKey);
  datasetStatus.classList.add("is-success");
  datasetStatus.textContent = "Saved.";
  saveDatasetBtn.textContent = "Saved";
  window.setTimeout(() => {
    saveDatasetBtn.disabled = false;
    saveDatasetBtn.textContent = originalButtonText;
    datasetStatus.classList.remove("is-success");
  }, 1200);
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!SUPABASE_ANON_KEY) {
    setFormState(false, "Supabase anon key is missing in script.js.");
    return;
  }

  setFormState(true, "Checking account...");

  try {
    const email = usernameInput.value.trim();
    const { response, result } = await signInWithPassword(email, passwordInput.value);

    if (!response.ok) {
      setFormState(false, result.error_description || result.msg || "Login failed.");
      return;
    }

    localStorage.setItem("jp700_access_token", result.access_token);
    localStorage.setItem("jp700_refresh_token", result.refresh_token);
    localStorage.setItem(USER_EMAIL_KEY, email);
    localStorage.setItem(USER_ID_KEY, result.user?.id || "");
    await loadUserRole(result.user?.id);
    signedInEmail.textContent = email;
    setFormState(false, "Signed in successfully.");
    renderProjects();
    showPage("projects");
  } catch (error) {
    setFormState(false, "Connection failed. Check the Supabase URL and anon key for this project.");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jp700_access_token");
  localStorage.removeItem("jp700_refresh_token");
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  currentUserRole = "non_viewer";
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  currentUserRole = "non_viewer";
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
  activeProjectId = null;
  passwordInput.value = "";
  showPage("login");
});

sidebarSteps.forEach((step) => {
  step.addEventListener("click", () => {
    const page = step.dataset.page;
    if (!["projects", "datasets"].includes(page) && !getActiveProject()) return;
    if (page === "media" && !validateTypeValues()) return;
    if (page === "pump" && getActiveProject() && !validateMediaValues()) return;
    if (page === "pump" && getActiveProject()) {
      saveActiveProject();
      renderPumpPage(getActiveProject());
    }
    if (page === "media" || page === "selector") saveActiveProject();
    showPage(page);
  });
});

startProjectBtn.addEventListener("click", openProjectModal);
cancelProjectBtn.addEventListener("click", closeProjectModal);
projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) closeProjectModal();
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const project = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: customerInput.value.trim(),
    name: projectNameInput.value.trim(),
    medium: mediumInput.value.trim(),
    status: "In progress",
    selection: createBlankSelection(),
  };

  projects.unshift(project);
  saveProjects();
  renderProjects();
  closeProjectModal();
  openProject(project.id, "selector");
});

projectsTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const projectId = button.dataset.id;
  const action = button.dataset.action;
if (action === "edit") {
    openProject(projectId, "selector");
    return;
  }

  if (action === "delete") {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;

    const confirmed = window.confirm(`Delete project "${project.name}"?`);
    if (!confirmed) return;

    projects = projects.filter((item) => item.id !== projectId);
    if (activeProjectId === projectId) {
      activeProjectId = null;
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
    saveProjects();
    renderProjects();
    updateSidebar(getVisiblePage());
  }
});

backToProjectsBtn.addEventListener("click", () => {
  saveActiveProject();
  renderProjects();
  showPage("projects");
});

goToMediaBtn.addEventListener("click", () => {
  if (!validateTypeValues()) return;
  saveActiveProject();
  showPage("media");
});

backToTypeBtn.addEventListener("click", () => {
  saveActiveProject();
  showPage("selector");
});

goToPumpBtn.addEventListener("click", () => {
  if (!validateMediaValues()) return;
  saveActiveProject();
  renderPumpPage(getActiveProject());
  showPage("pump");
});

backToMediaBtn.addEventListener("click", () => {
  showPage("media");
});

saveAndCloseBtn.addEventListener("click", () => {
  saveActiveProject();
  renderProjects();
  showPage("projects");
});

function flashSaved(button) {
  saveActiveProject();
  button.textContent = "Saved";
  window.setTimeout(() => {
    button.textContent = "Save";
  }, 900);
}

saveProjectBtn.addEventListener("click", () => flashSaved(saveProjectBtn));
saveMediaBtn.addEventListener("click", () => flashSaved(saveMediaBtn));

toggleGroups.forEach((group) => {
  group.addEventListener("click", (event) => {
    const option = event.target.closest(".toggle-option");
    if (!option) return;

    group.querySelectorAll(".toggle-option").forEach((button) => {
      button.classList.toggle("is-active", button === option);
    });
    autosaveActiveProject();
  });
});

mediaGroups.forEach((group) => {
  group.addEventListener("click", (event) => {
    const option = event.target.closest(".media-option");
    if (!option) return;

    group.querySelectorAll(".media-option").forEach((button) => {
      button.classList.toggle("is-active", button === option);
    });
    autosaveActiveProject();
  });
});

function formatFlow(value) {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(2);
}

function clearCalculatedFlowFields() {
  Object.values(flowInputs).forEach((input) => {
    input.readOnly = false;
    input.classList.remove("is-calculated");
  });
}

function setCalculatedFlow(input, value) {
  input.value = formatFlow(value);
  input.readOnly = true;
  input.classList.add("is-calculated");
}

function updateFlowFrom(sourceKey, shouldSave = true) {
  const sourceInput = flowInputs[sourceKey];
  const rawValue = sourceInput.value.trim();

  if (!rawValue) {
    Object.values(flowInputs).forEach((input) => {
      if (input !== sourceInput) input.value = "";
    });
    clearCalculatedFlowFields();
    if (shouldSave) autosaveActiveProject();
    return;
  }

  const value = Number(rawValue.replace(",", "."));
  if (!Number.isFinite(value)) return;

  let lmin;
  if (sourceKey === "lmin") lmin = value;
  if (sourceKey === "lhour") lmin = value / 60;
  if (sourceKey === "m3hour") lmin = (value * 1000) / 60;

  Object.entries(flowInputs).forEach(([key, input]) => {
    if (key === sourceKey) {
      input.readOnly = false;
      input.classList.remove("is-calculated");
      return;
    }

    if (key === "lmin") setCalculatedFlow(input, lmin);
    if (key === "lhour") setCalculatedFlow(input, lmin * 60);
    if (key === "m3hour") setCalculatedFlow(input, (lmin * 60) / 1000);
  });

  if (shouldSave) autosaveActiveProject();
}

Object.entries(flowInputs).forEach(([key, input]) => {
  input.addEventListener("input", () => updateFlowFrom(key));
});

function clampPressure(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(24, Math.round(number)));
}

function setPressure(value, shouldSave = true) {
  const clamped = clampPressure(value);
  pressureSlider.value = String(clamped);
  pressureInput.value = String(clamped);
  if (shouldSave) autosaveActiveProject();
}

for (let value = 0; value <= 24; value += 1) {
  const tick = document.createElement("span");
  tick.className = "pressure-tick";
  tick.textContent = String(value);
  pressureTicks.appendChild(tick);
}

pressureSlider.addEventListener("input", () => setPressure(pressureSlider.value));
pressureInput.addEventListener("input", () => setPressure(pressureInput.value));

renderProjects();
if (hasSavedSession()) {
  signedInEmail.textContent = localStorage.getItem(USER_EMAIL_KEY) || "Signed in";
  workspaceShell.classList.toggle("can-view-datasets", canViewDatasets());
  workspaceShell.classList.toggle("can-edit-datasets", canEditDatasets());
  showPage("projects");
} else {
  showPage("login");
}












