const loginPage = document.querySelector("#loginPage");
const workspaceShell = document.querySelector("#workspaceShell");
const projectsPage = document.querySelector("#projectsPage");
const selectorPage = document.querySelector("#selectorPage");
const mediaPage = document.querySelector("#mediaPage");
const pumpPage = document.querySelector("#pumpPage");
const familyPage = document.querySelector("#familyPage");
const modelPage = document.querySelector("#modelPage");
const configPage = document.querySelector("#configPage");
const pumpConfigPage = document.querySelector("#pumpConfigPage");
const datasetsPage = document.querySelector("#datasetsPage");
const datasetTabs = document.querySelector("#datasetTabs");
const datasetTableHead = document.querySelector("#datasetTableHead");
const datasetTableBody = document.querySelector("#datasetTableBody");
const datasetStatus = document.querySelector("#datasetStatus");
const saveDatasetBtn = document.querySelector("#saveDatasetBtn");
const addDatasetRowBtn = document.querySelector("#addDatasetRowBtn");
const ruleBuilder = document.querySelector("#ruleBuilder");
const ruleInputCode = document.querySelector("#ruleInputCode");
const ruleInputSelection = document.querySelector("#ruleInputSelection");
const ruleOutputCode = document.querySelector("#ruleOutputCode");
const ruleOutputSelection = document.querySelector("#ruleOutputSelection");
const addRuleBuilderBtn = document.querySelector("#addRuleBuilderBtn");

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
const offerNoInput = document.querySelector("#offerNoInput");
const mediumInput = document.querySelector("#mediumInput");
const backToProjectsBtn = document.querySelector("#backToProjectsBtn");
const goToMediaBtn = document.querySelector("#goToMediaBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const backToTypeBtn = document.querySelector("#backToTypeBtn");
const goToPumpBtn = document.querySelector("#goToPumpBtn");
const saveMediaBtn = document.querySelector("#saveMediaBtn");
const backToMediaBtn = document.querySelector("#backToMediaBtn");
const savePumpBtn = document.querySelector("#savePumpBtn");
const goToFamilyBtn = document.querySelector("#goToFamilyBtn");
const backToPumpBtn = document.querySelector("#backToPumpBtn");
const saveFamilyBtn = document.querySelector("#saveFamilyBtn");
const goToModelBtn = document.querySelector("#goToModelBtn");
const backToFamilyBtn = document.querySelector("#backToFamilyBtn");
const saveModelBtn = document.querySelector("#saveModelBtn");
const goToConfigBtn = document.querySelector("#goToConfigBtn");
const backToModelBtn = document.querySelector("#backToModelBtn");
const saveAndCloseBtn = document.querySelector("#saveAndCloseBtn");
const goToConfigNextBtn = document.querySelector("#goToConfigNextBtn");
const goToPumpConfigurationBtn = document.querySelector("#goToPumpConfigurationBtn");
const goToMotorSelectionBtn = document.querySelector("#goToMotorSelectionBtn");
const backToConfigBtn = document.querySelector("#backToConfigBtn");
const savePumpConfigBtn = document.querySelector("#savePumpConfigBtn");
const projectContext = document.querySelector("#projectContext");
const mediaProjectContext = document.querySelector("#mediaProjectContext");
const pumpProjectContext = document.querySelector("#pumpProjectContext");
const familyProjectContext = document.querySelector("#familyProjectContext");
const modelProjectContext = document.querySelector("#modelProjectContext");
const configProjectContext = document.querySelector("#configProjectContext");
const pumpConfigProjectContext = document.querySelector("#pumpConfigProjectContext");
const pumpResultsStatus = document.querySelector("#pumpResultsStatus");
const pumpResultsTableBody = document.querySelector("#pumpResultsTableBody");
const familySummary = document.querySelector("#familySummary");
const familyStatus = document.querySelector("#familyStatus");
const familyTableBody = document.querySelector("#familyTableBody");
const modelSummary = document.querySelector("#modelSummary");
const modelStatus = document.querySelector("#modelStatus");
const modelTableBody = document.querySelector("#modelTableBody");
const configStepNumber = document.querySelector("#configStepNumber");
const configStepTitle = document.querySelector("#configStepTitle");
const configurationCode = document.querySelector("#configurationCode");
const configurationOptions = document.querySelector("#configurationOptions");
const pumpConfigCode = document.querySelector("#pumpConfigCode");
const pumpConfigurationGrid = document.querySelector("#pumpConfigurationGrid");
const toggleGroups = document.querySelectorAll(".segmented-control");
const mediaGroups = document.querySelectorAll(".option-stack");
const flowInputs = {
  lmin: document.querySelector("#flowLMin"),
  lhour: document.querySelector("#flowLHour"),
  m3hour: document.querySelector("#flowM3Hour"),
};
const pressureGroup = document.querySelector("[data-pressure-group]");

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
let latestPumpRows = [];
let currentConfigGroupIndex = 0;
let configurationRules = [];
let configurationRulesLoaded = false;
const DATASET_CONFIG = [
  { key: "pump_limits", label: "1.Pump_limits", table: "pump_limits", primaryKey: ["pump_code"], orderBy: ["sort_order", "pump_code"], columns: [
    { key: "pump_code", label: "Pump code", type: "text", locked: true },
    { key: "stage", label: "Stage", type: "integer" },
    { key: "max_rotation", label: "Max rotation", type: "number" },
    { key: "section_number", label: "Section number", type: "integer" },
    { key: "installation", label: "Installation", type: "text" },
    { key: "rpm_interval", label: "RPM Interval", type: "text" },
  ]},
  { key: "jp_codes", label: "2.JP_Codes", table: "jp_codes", primaryKey: ["pump_family"], orderBy: ["pump_family"], columns: [
    { key: "pump_family", label: "Pump family", type: "text", locked: true },
    { key: "type", label: "Type", type: "text" },
    { key: "installation", label: "Installation", type: "text" },
  ]},
  { key: "sr_codes", label: "3.SR_Codes", table: "sr_codes", primaryKey: ["pump_model"], orderBy: ["pump_model"], columns: [
    { key: "pump_model", label: "Pump model", type: "text", locked: true },
    { key: "model_code", label: "Model code", type: "text" },
    { key: "model_name", label: "Model name", type: "text" },
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
  { key: "configuration_rules", label: "7.Configuration_Rules", table: "configuration_rules", primaryKey: ["rule_id"], orderBy: ["rule_id"], allowInsertDelete: true, columns: [
    { key: "rule_id", label: "ID", type: "integer", locked: true },
    { key: "input_code", label: "Input", type: "text" },
    { key: "input_selection", label: "Input selection", type: "text" },
    { key: "output_code", label: "Output", type: "text" },
    { key: "output_selection", label: "Output selection", type: "text" },
  ]},
];

const PUMP_CODE_OPTIONS = [
  "12.1", "12.2", "25.1", "25.2", "50.1", "50.2", "50L.1", "80.1", "80.2", "200.1", "200.2", "300.1", "300.2", "350.1", "350.2", "350L.1", "7032.1", "7052.1", "7082.1", "7112.1", "7115.1", "7115.2", "7115.4", "7120.1", "7120.2", "7120.4",
];

const CONFIG_OPTION_GROUPS = [
  {
    title: "Application Conditions",
    items: [
    { key: "SUCTION_HEAD", options: ["Flooded", "Non-Flooded"] },
    { key: "OPERATION_TYPE", options: ["Continuous", "Intermittently"] },
  ],
  },
  {
    title: "Materials",
    items: [
    { key: "PUMP_CASING", options: ["Stainless Steel AISI 316Ti", "Stainless Steel AISI 316", "Stainless Steel AISI 431", "Cast iron GG25"] },
    { key: "LANTERN", options: ["Flexible Coupling (ATEX)", "Stainless Steel AISI 316Ti", "Stainless Steel AISI 304", "Aluminum", "Speed reducer 1:16"] },
    { key: "ROTOR", options: ["Stainless Steel AISI 316Ti", "Stainless Steel AISI 316Ti Hard chrome plated", "Stainless Steel AISI D6 Hardened", "Stainless Steel AISI 440B Hardened"] },
    { key: "ROTATING_PARTS", options: ["Stainless Steel AISI 316Ti", "Stainless Steel AISI 431", "Stainless Steel AISI 316", "Hardened"] },
    { key: "JOINTS", options: ["Torsionshaft", "Open pin joint (FDA)", "Sealed pin joint"] },
  ],
  },
  {
    title: "Sealing and Elastomers",
    items: [
    { key: "CASING_SEALING", options: ["NBR (FDA)", "NBR light (FDA)", "EPDM (FDA)", "EPDM light (FDA)", "PTFE", "FKM"] },
    { key: "STATOR", options: ["NBR (FDA)", "NBR light (FDA)", "EPDM (FDA)", "EPDM light (FDA)", "PTFE", "FKM"] },
    { key: "SHAFT_SEALING", options: ["Carbon/SiC/FKM", "SiC/SiC/FKM Chamfered", "SiC/SiC/FKM", "PS Lip Seal PTFE", "Carbon/SiC/FKM encapsulated", "SiC/SiC/NBR", "SiC/SiC/EPDM", "SiC/SiC/FEP", "ATEX Carbon/SiC/FKM"] },
    { key: "DIRECTION_OF_ROTATION", options: ["Clockwise", "Counterclockwise"] },
  ],
  },
  {
    title: "Immersion Tube",
    items: [
    { key: "IMMERSION_TUBE_LENGTH", options: ["700 mm", "800 mm", "900 mm", "1000 mm", "1100 mm", "1200 mm", "1300 mm", "1400 mm"] },
    { key: "IMMERSION_TUBE_DIA", options: ["54 mm", "89 mm", "105 mm", "130 mm"] },
  ],
  },
  {
    title: "Connections",
    items: [
    { key: "SUCTION_PORT", options: ["IG 1¼\"", "IG 1\"", "IG ¾''", "IG ½''", "AG 1½''", "DN 40 Tri-Clamp", "DN 40 - DIN 11851", "DN 15 - DIN 11851", "DN 50 - DIN 11851", "DN 65 - DIN 11851", "DN 80 - DIN 11851"] },
    { key: "DELIVERY_PORT", options: ["IG 1¼\"", "IG 1\"", "IG ¾''", "IG ½''", "AG 1½''", "DN 40 Tri-Clamp", "DN 40 - DIN 11851", "DN 15 - DIN 11851", "DN 50 - DIN 11851", "DN 65 - DIN 11851", "DN 80 - DIN 11851"] },
    { key: "HOSE_CONNECTION", options: ["Hose connection 1\" / 1¼\" / 1½\"", "Hose connection DN40 to 1\" / 1¼\" / 1½\"", "Hose connection Clamp DN40", "Hose connection DN50", "Hose connection DN65", "Hose connection DN80"] },
  ],
  },
  {
    title: "Finish and Protection",
    items: [
    { key: "VARNISH", options: ["RAL 5010", "RAL 1015 NSDF3+", "RAL 7024"] },
    { key: "PTC", options: ["3x155°C", "3x130°C"] },
  ],
  },
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
  familyPage.classList.toggle("is-hidden", page !== "family");
  modelPage.classList.toggle("is-hidden", page !== "model");
  configPage.classList.toggle("is-hidden", page !== "config");
  pumpConfigPage.classList.toggle("is-hidden", page !== "pump-config");
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
    application: "non-food",
    certification: "non-atex",
    orientation: "vertical",
    flow: { source: "", lmin: "", lhour: "", m3hour: "" },
    pressure: 6,
    abrasivity: "",
    viscosity: "",
    selectedPump: null,
    selectedFamily: null,
    selectedModel: null,
    configOptions: {},
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
      <td>${escapeHtml(project.offerNo || "-")}</td>
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
  if (targetPage === "family") renderFamilyPage(project);
  if (targetPage === "model") renderModelPage(project);
  if (targetPage === "config") renderConfigPage(project);
  if (targetPage === "pump-config") renderPumpConfigurationPage(project);
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
    <span>Offer No: <strong>${escapeHtml(project.offerNo || "-")}</strong></span>
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
  renderProjectContext(familyProjectContext, project);
  renderProjectContext(modelProjectContext, project);
  renderProjectContext(configProjectContext, project);
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

  setPressure(selection.pressure ?? 6, false);
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
    pressure: getPressureValue(),
    abrasivity: getMedia("abrasivity") || "",
    viscosity: getMedia("viscosity") || "",
  };
}

function saveActiveProject() {
  const project = getActiveProject();
  if (!project) return;

  project.selection = { ...createBlankSelection(), ...(project.selection || {}), ...collectSelection() };
  project.status = "In progress";
  project.updatedAt = new Date().toISOString();
  saveProjects();
  renderProjects();
  renderProjectContext(projectContext, project);
  renderProjectContext(mediaProjectContext, project);
  renderProjectContext(pumpProjectContext, project);
  renderProjectContext(familyProjectContext, project);
  renderProjectContext(modelProjectContext, project);
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
  if (!familyPage.classList.contains("is-hidden")) return "family";
  if (!modelPage.classList.contains("is-hidden")) return "model";
  if (!configPage.classList.contains("is-hidden")) return "config";
  if (!pumpConfigPage.classList.contains("is-hidden")) return "pump-config";
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
    latestPumpRows = rows;
    pumpResultsStatus.textContent = `${rows.length} pump code(s) calculated.`;
    pumpResultsTableBody.innerHTML = rows.map((row) => renderPumpResultRow(row, selection)).join("");
  } catch (error) {
    pumpResultsStatus.textContent = error.message || "Pump calculation failed.";
  }
}

async function calculatePumpResultsFromSupabase(selection) {
  const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/rpc/calculate_pump_results`, {
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
    matchesPressureStage: Boolean(row.matches_pressure_stage ?? true),
    isInRpmRange: Boolean(row.is_in_rpm_range ?? true),
    rpmInterval: row.rpm_interval || "",
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
    const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/${config.table}?${getDatasetQuery(config)}`, {
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

function renderPumpResultRow(row, selection) {
  const reasons = getPumpRejectionReasons(row, selection);
  const isAvailable = reasons.length === 0;
  const selected = selection.selectedPump?.pumpCode === row.pumpCode;
  return `
    <tr class="${isAvailable ? "is-selectable" : "is-unavailable"} ${selected ? "is-selected" : ""}" data-pump-code="${escapeHtml(row.pumpCode)}">
      <td>${escapeHtml(row.pumpCode)}</td>
      <td>${formatRpm(row.requiredRpm)}</td>
      <td>${formatRpm(row.abrRpm)}</td>
      <td>${formatRpm(row.visRpm)}</td>
      <td>${formatMaximumRpm(row.maximumRpm)}</td>
      <td>${formatRejectionReasons(reasons)}</td>
    </tr>
  `;
}

function getPumpRejectionReasons(row, selection) {
  const reasons = [];
  if (!row.matchesPressureStage) reasons.push(`(${selection.pressure} bar)`);
  if (!row.isSelectable) reasons.push("(Not vertical)");
  if (!row.isInRpmRange) reasons.push("(Out of RPM range)");
  return reasons;
}

function formatRejectionReasons(reasons) {
  if (!reasons.length) return "";
  return `<ul class="pump-reason-list">${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>`;
}

function formatRpm(value) {
  if (!Number.isFinite(value)) return "Missing data";
  return Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatMaximumRpm(result) {
  if (!result) return "Missing data";
  return `${formatRpm(result.value)} (${result.source} ${result.percent}%)`;
}

function renderSelectionSummary(target, selection, extraRows = []) {
  if (!target) return;
  const rows = [
    ["01 Type", `${labelValue(selection.application)} / ${labelValue(selection.certification)} / ${labelValue(selection.orientation)}`],
    ["02 Flow rate", getEnteredFlowText(selection)],
    ["03 Pressure", `${selection.pressure || 6} bar`],
    ["04 Media Properties", `${selection.abrasivity || "-"} / ${selection.viscosity || "-"}`],
  ];

  if (selection.selectedPump) {
    rows.push(["05 Pump selection", `${selection.selectedPump.pumpCode} (required RPM: ${formatRpm(selection.selectedPump.requiredRpm)})`]);
  }

  rows.push(...extraRows);
  target.innerHTML = rows
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
}

function getEnteredFlowText(selection) {
  const source = selection.flow?.source || "lmin";
  const labels = { lmin: "l/min", lhour: "l/h", m3hour: "m3/h" };
  return `${selection.flow?.[source] || "-"} ${labels[source] || ""}`.trim();
}

async function loadTableRows(key) {
  const config = getDatasetConfig(key);
  const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/${config.table}?${getDatasetQuery(config)}`, {
    headers: apiHeaders(false),
  });
  if (!response.ok) throw new Error(`${config.label} could not be loaded.`);
  return response.json();
}

async function renderFamilyPage(project) {
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  renderProjectContext(familyProjectContext, project);
  renderSelectionSummary(familySummary, selection);
  familyTableBody.innerHTML = "";
  familyStatus.textContent = "Loading pump families...";

  try {
    const rows = await loadTableRows("jp_codes");
    familyStatus.textContent = `${rows.length} pump family option(s) loaded.`;
    familyTableBody.innerHTML = rows.map((row) => renderFamilyRow(row, selection)).join("");
  } catch (error) {
    familyStatus.textContent = error.message || "Pump families could not be loaded.";
  }
}

function renderFamilyRow(row, selection) {
  const isAvailable = isFamilyCompatible(row, selection);
  const isSelected = selection.selectedFamily?.pump_family === row.pump_family;
  return `
    <tr class="${isAvailable ? "is-selectable" : "is-unavailable"} ${isSelected ? "is-selected" : ""}" data-family="${escapeHtml(row.pump_family)}">
      <td>${escapeHtml(cleanPumpFamilyCode(row.pump_family))}</td>
      <td>${escapeHtml(row.type)}</td>
      <td>${escapeHtml(row.installation)}</td>
    </tr>
  `;
}

function isFamilyCompatible(row, selection) {
  return normalizeSelectionText(row.type) === getRequiredFamilyType(selection)
    && isInstallationCompatible(selection.orientation, row.installation);
}

function getRequiredFamilyType(selection) {
  const food = selection.application === "food";
  const atex = selection.certification === "atex";
  if (food && atex) return "ATEX_FOOD";
  if (food) return "FOOD";
  if (atex) return "ATEX";
  return "STANDARD";
}

function normalizeSelectionText(value) {
  return String(value || "").trim().toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");
}

function isInstallationCompatible(orientation, installation) {
  const text = String(installation || "").toLowerCase();
  if (orientation === "vertical") return text.includes("vertical") || text.includes("vertikal");
  return text.includes("horizontal");
}

async function renderModelPage(project) {
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  renderProjectContext(modelProjectContext, project);
  const extraRows = [];
  if (selection.selectedFamily) extraRows.push(["06 Pump family", cleanPumpFamilyCode(selection.selectedFamily.pump_family)]);
  if (selection.selectedModel) extraRows.push(["07 Pump Model", formatModelLabel(selection.selectedModel)]);
  renderSelectionSummary(modelSummary, selection, extraRows);
  modelTableBody.innerHTML = "";
  modelStatus.textContent = "Loading pump models...";

  try {
    const rows = await loadTableRows("sr_codes");
    modelStatus.textContent = `${rows.length} pump model option(s) loaded.`;
    modelTableBody.innerHTML = rows.map((row) => renderModelRow(row, selection)).join("");
  } catch (error) {
    modelStatus.textContent = error.message || "Pump models could not be loaded.";
  }
}

function renderModelRow(row, selection) {
  const isAvailable = isRotationCompatible(row.rotation, selection.selectedPump?.requiredRpm);
  const isSelected = selection.selectedModel?.pump_model === row.pump_model;
  return `
    <tr class="${isAvailable ? "is-selectable" : "is-unavailable"} ${isSelected ? "is-selected" : ""}"
      data-model="${escapeHtml(row.pump_model)}"
      data-model-code="${escapeHtml(row.model_code || getModelCode(row))}"
      data-model-name="${escapeHtml(row.model_name || getModelName(row))}">
      <td>${escapeHtml(formatModelLabel(row))}</td>
      <td>${escapeHtml(row.phase || "")}</td>
      <td>${escapeHtml(row.rotation || "")}</td>
    </tr>
  `;
}

function isRotationCompatible(rotationText, requiredRpm) {
  const rpm = Number(requiredRpm);
  if (!Number.isFinite(rpm)) return false;
  const text = String(rotationText || "").replaceAll(" ", "");
  if (!text) return false;

  if (text.includes("~")) {
    const [min, max] = text.split("~").map(Number);
    return Number.isFinite(min) && Number.isFinite(max) && rpm >= min && rpm <= max;
  }

  if (text.includes("/")) {
    return text.split("/").map(Number).some((value) => Number.isFinite(value) && Math.round(rpm) === value);
  }

  const value = Number(text);
  return Number.isFinite(value) && Math.round(rpm) === value;
}

function renderConfigPage(project, groupIndex = currentConfigGroupIndex) {
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  currentConfigGroupIndex = Math.max(0, Math.min(groupIndex, CONFIG_OPTION_GROUPS.length - 1));
  const group = CONFIG_OPTION_GROUPS[currentConfigGroupIndex];
  const stepNo = getConfigStepNumber(currentConfigGroupIndex);
  renderProjectContext(configProjectContext, project);
  configStepNumber.textContent = stepNo;
  configStepTitle.textContent = group.title;
  configurationCode.textContent = getConfigurationCode(selection);
  configurationOptions.innerHTML = renderConfigGroup(group, currentConfigGroupIndex, selection.configOptions || {}, selection);
  loadConfigurationRules().then(() => {
    if (getVisiblePage() === "config") {
      const latestProject = getActiveProject();
      const latestSelection = { ...createBlankSelection(), ...(latestProject?.selection || {}) };
      configurationOptions.innerHTML = renderConfigGroup(group, currentConfigGroupIndex, latestSelection.configOptions || {}, latestSelection);
    }
  });
  backToModelBtn.textContent = currentConfigGroupIndex === 0 ? "Back" : "Back";
  goToConfigNextBtn.classList.toggle("is-hidden", currentConfigGroupIndex === CONFIG_OPTION_GROUPS.length - 1);
  goToPumpConfigurationBtn.closest(".configuration-next-panel")?.classList.toggle("is-hidden", currentConfigGroupIndex !== CONFIG_OPTION_GROUPS.length - 1);
}

function renderPumpConfigurationPage(project) {
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  renderProjectContext(pumpConfigProjectContext, project);
  pumpConfigCode.textContent = getConfigurationCode(selection);
  pumpConfigurationGrid.innerHTML = getPumpConfigurationGroups(selection)
    .map((group) => renderPumpConfigurationGroup(group))
    .join("");
}

function getPumpConfigurationGroups(selection) {
  return [
    {
      title: "Project",
      rows: [
        ["Customer", getActiveProject()?.customer || "-"],
        ["Project name", getActiveProject()?.name || "-"],
        ["Offer No", getActiveProject()?.offerNo || "-"],
        ["Medium", getActiveProject()?.medium || "-"],
      ],
    },
    {
      title: "Pump Basis",
      rows: [
        ["Type", `${labelValue(selection.application)} / ${labelValue(selection.certification)} / ${labelValue(selection.orientation)}`],
        ["Flow rate", getEnteredFlowText(selection)],
        ["Pressure", `${selection.pressure || 6} bar`],
        ["Media Properties", `${selection.abrasivity || "-"} / ${selection.viscosity || "-"}`],
      ],
    },
    {
      title: "Pump Selection",
      rows: [
        ["Pump selection", selection.selectedPump?.pumpCode || "-"],
        ["Required RPM", selection.selectedPump ? formatRpm(selection.selectedPump.requiredRpm) : "-"],
        ["Pump family", cleanPumpFamilyCode(selection.selectedFamily?.pump_family || "-")],
        ["Pump model", selection.selectedModel ? formatModelLabel(selection.selectedModel) : "-"],
      ],
    },
    ...CONFIG_OPTION_GROUPS.map((group) => ({
      title: group.title,
      rows: group.items.map((item) => [item.key, selection.configOptions?.[item.key] || "-"]),
    })),
  ];
}

function renderPumpConfigurationGroup(group) {
  return `
    <section class="pump-configuration-group">
      <h3>${escapeHtml(group.title)}</h3>
      <dl>
        ${group.rows.map(([label, value]) => `
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        `).join("")}
      </dl>
    </section>
  `;
}

function getConfigurationCode(selection) {
  const family = cleanPumpFamilyCode(selection.selectedFamily?.pump_family || "");
  const pump = selection.selectedPump?.pumpCode || "";
  const model = getModelCode(selection.selectedModel);
  return `${family}.${pump} ${model}`.trim();
}

function cleanPumpFamilyCode(value) {
  return String(value || "").replace(/\.+$/g, "");
}

function getModelCode(model) {
  if (!model) return "";
  if (model.model_code) return model.model_code;
  return String(model.pump_model || "").split(" - ")[0].trim();
}

function getModelName(model) {
  if (!model) return "";
  if (model.model_name) return model.model_name;
  const parts = String(model.pump_model || "").split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ").trim() : "";
}

function formatModelLabel(model) {
  const code = getModelCode(model);
  const name = getModelName(model);
  return name ? `${code} - ${name}` : code;
}

function getConfigStepNumber(groupIndex) {
  return String(8 + groupIndex).padStart(2, "0");
}

function renderConfigGroup(group, groupIndex, selectedOptions, selection) {
  return `
    <section class="config-option-group">
      <div class="config-group-label">${escapeHtml(getConfigStepNumber(groupIndex))} / ${escapeHtml(group.title)}</div>
      ${group.items.map((item, itemIndex) => renderConfigVariable(item, groupIndex, itemIndex, selectedOptions, selection)).join("")}
    </section>
  `;
}

function renderConfigVariable(item, groupIndex, itemIndex, selectedOptions, selection) {
  const variableNo = getConfigVariableCode(groupIndex, itemIndex);
  const allowedOptions = getAllowedOptionNumbers(variableNo, selection);
  return `
    <div class="config-variable" data-variable="${escapeHtml(item.key)}">
      <div class="config-variable-title">
        <span>${escapeHtml(variableNo)}</span>
        <strong>${escapeHtml(item.key)}</strong>
      </div>
      <div class="config-option-grid">
        ${item.options.map((option, optionIndex) => {
          const optionNo = String(optionIndex + 1);
          const selected = selectedOptions[item.key] === option;
          const unavailable = allowedOptions && !allowedOptions.has(optionNo);
          return `<button class="config-option-btn ${selected ? "is-active" : ""} ${unavailable ? "is-unavailable" : ""}" type="button" ${unavailable ? "disabled" : ""} data-variable="${escapeHtml(item.key)}" data-option="${escapeHtml(option)}">
            <small>${optionNo}</small>
            <span>${escapeHtml(option)}</span>
          </button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function getConfigVariableCode(groupIndex, itemIndex) {
  return `${getConfigStepNumber(groupIndex)}.${itemIndex + 1}`;
}

async function loadConfigurationRules() {
  if (configurationRulesLoaded) return configurationRules;
  try {
    const rows = await loadTableRows("configuration_rules");
    configurationRules = rows;
  } catch (error) {
    configurationRules = [];
  }
  configurationRulesLoaded = true;
  return configurationRules;
}

function getAllowedOptionNumbers(outputCode, selection) {
  let allowed = null;
  configurationRules.forEach((rule) => {
    if (!ruleMatchesInput(rule, selection)) return;
    if (rule.output_code !== outputCode || !rule.output_selection) return;
    const outputSet = new Set(splitRuleValues(rule.output_selection));
    allowed = allowed ? intersectSets(allowed, outputSet) : outputSet;
  });
  return allowed;
}

function ruleMatchesInput(rule, selection) {
  const currentValue = getRuleInputValue(rule.input_code, selection);
  if (!currentValue) return false;
  return splitRuleValues(rule.input_selection).includes(currentValue);
}

function getRuleInputValue(inputCode, selection) {
  if (inputCode === "01.CERTIFICATION") return selection.certification === "atex" ? "ATEX" : "NON_ATEX";
  if (inputCode === "01.APPLICATION") return selection.application === "food" ? "FOOD" : "NON_FOOD";
  if (inputCode === "01.ORIENTATION") return selection.orientation === "vertical" ? "VERTICAL" : "HORIZONTAL";
  if (inputCode === "PUMP_CODE") return selection.selectedPump?.pumpCode || "";
  const match = findConfigVariableByCode(inputCode);
  if (!match) return "";
  const selectedOption = selection.configOptions?.[match.item.key];
  const optionIndex = match.item.options.findIndex((option) => option === selectedOption);
  return optionIndex >= 0 ? String(optionIndex + 1) : "";
}

function findConfigVariableByCode(code) {
  for (let groupIndex = 0; groupIndex < CONFIG_OPTION_GROUPS.length; groupIndex += 1) {
    const group = CONFIG_OPTION_GROUPS[groupIndex];
    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex += 1) {
      if (getConfigVariableCode(groupIndex, itemIndex) === code) {
        return { groupIndex, itemIndex, item: group.items[itemIndex] };
      }
    }
  }
  return null;
}

function splitRuleValues(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function intersectSets(left, right) {
  return new Set([...left].filter((value) => right.has(value)));
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

function validatePumpSelection() {
  const project = getActiveProject();
  if (!project?.selection?.selectedPump) {
    window.alert("Please select an available pump before continuing.");
    return false;
  }
  return true;
}

function validateFamilySelection() {
  if (!validatePumpSelection()) return false;
  const project = getActiveProject();
  if (!project?.selection?.selectedFamily) {
    window.alert("Please select a pump family before continuing.");
    return false;
  }
  return true;
}

function validateModelSelection() {
  if (!validateFamilySelection()) return false;
  const project = getActiveProject();
  if (!project?.selection?.selectedModel) {
    window.alert("Please select a pump model before continuing.");
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

async function refreshSession() {
  const refreshToken = localStorage.getItem("jp700_refresh_token");
  if (!refreshToken) throw new Error("Session expired. Please sign in again.");

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error_description || result.msg || "Session expired. Please sign in again.");
  }

  localStorage.setItem("jp700_access_token", result.access_token);
  if (result.refresh_token) localStorage.setItem("jp700_refresh_token", result.refresh_token);
  return result.access_token;
}

async function authenticatedFetch(url, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  headers.set("apikey", SUPABASE_ANON_KEY);
  headers.set("Authorization", `Bearer ${getAccessToken()}`);

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401 || !retry) return response;

  await refreshSession();
  headers.set("Authorization", `Bearer ${getAccessToken()}`);
  return fetch(url, { ...options, headers });
}

async function loadUserRole(userId) {
  if (!userId) {
    currentUserRole = localStorage.getItem(USER_ROLE_KEY) || "non_viewer";
    return currentUserRole;
  }

  const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role,is_active&limit=1`, {
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
  const canChangeRows = editable && config.allowInsertDelete;
  const useRuleBuilder = config.key === "configuration_rules" && editable;
  datasetTableHead.innerHTML = `<tr>${config.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}${canChangeRows ? "<th></th>" : ""}</tr>`;
  datasetTableBody.innerHTML = datasetRows.map((row, rowIndex) => `
    <tr>
      ${config.columns.map((column) => {
        const disabled = !editable || column.locked;
        const value = row[column.key] ?? "";
        return `<td><input ${disabled ? "disabled" : ""} data-row="${rowIndex}" data-column="${column.key}" value="${escapeHtml(value)}" /></td>`;
      }).join("")}
      ${canChangeRows ? `<td><button class="dataset-delete-row" type="button" data-row="${rowIndex}">Delete</button></td>` : ""}
    </tr>
  `).join("");

  ruleBuilder.classList.toggle("is-hidden", !useRuleBuilder);
  addDatasetRowBtn.classList.toggle("is-hidden", !canChangeRows || useRuleBuilder);
  if (useRuleBuilder) renderRuleBuilder();
  datasetStatus.textContent = editable
    ? `${datasetRows.length} rows loaded. Edit cells and save changes.`
    : `${datasetRows.length} rows loaded. Read-only access.`;
}

function renderRuleBuilder() {
  renderSelectOptions(ruleInputCode, getRuleInputTargets(), ruleInputCode.value);
  renderSelectOptions(ruleOutputCode, getRuleOutputTargets(), ruleOutputCode.value);
  renderRuleSelectionOptions(ruleInputSelection, ruleInputCode.value);
  renderRuleSelectionOptions(ruleOutputSelection, ruleOutputCode.value);
}

function renderSelectOptions(select, options, selectedValue = "") {
  const value = options.some((option) => option.value === selectedValue) ? selectedValue : options[0]?.value || "";
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function renderRuleSelectionOptions(select, code) {
  const selectedValues = new Set(getSelectedValues(select));
  const options = getRuleSelectionOptions(code);
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.value)}" ${selectedValues.has(option.value) ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function getRuleInputTargets() {
  return [
    { value: "01.APPLICATION", label: "01 Type / Application" },
    { value: "01.CERTIFICATION", label: "01 Type / Certification" },
    { value: "01.ORIENTATION", label: "01 Type / Orientation" },
    { value: "PUMP_CODE", label: "05 Pump selection / Pump code" },
    ...getConfigRuleTargets(),
  ];
}

function getRuleOutputTargets() {
  return getConfigRuleTargets();
}

function getConfigRuleTargets() {
  return CONFIG_OPTION_GROUPS.flatMap((group, groupIndex) => (
    group.items.map((item, itemIndex) => {
      const code = getConfigVariableCode(groupIndex, itemIndex);
      return { value: code, label: `${code} ${item.key}` };
    })
  ));
}

function getRuleSelectionOptions(code) {
  if (code === "01.APPLICATION") {
    return [
      { value: "FOOD", label: "Food" },
      { value: "NON_FOOD", label: "Non-Food" },
    ];
  }
  if (code === "01.CERTIFICATION") {
    return [
      { value: "ATEX", label: "ATEX" },
      { value: "NON_ATEX", label: "Non-ATEX" },
    ];
  }
  if (code === "01.ORIENTATION") {
    return [
      { value: "VERTICAL", label: "Vertical" },
      { value: "HORIZONTAL", label: "Horizontal" },
    ];
  }
  if (code === "PUMP_CODE") {
    return PUMP_CODE_OPTIONS.map((pumpCode) => ({ value: pumpCode, label: pumpCode }));
  }
  const match = findConfigVariableByCode(code);
  if (!match) return [];
  return match.item.options.map((option, index) => ({
    value: String(index + 1),
    label: `${index + 1} - ${option}`,
  }));
}

function getSelectedValues(select) {
  return Array.from(select.selectedOptions || []).map((option) => option.value);
}

async function loadDataset(key) {
  if (!canViewDatasets()) {
    datasetStatus.textContent = "You do not have access to datasets.";
    datasetTableHead.innerHTML = "";
    datasetTableBody.innerHTML = "";
    addDatasetRowBtn.classList.add("is-hidden");
    ruleBuilder.classList.add("is-hidden");
    return;
  }

  activeDatasetKey = key;
  const config = getDatasetConfig(key);
  renderDatasetTabs();
  datasetStatus.textContent = "Loading dataset...";
  editedDatasetRows.clear();

  const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/${config.table}?${getDatasetQuery(config)}`, {
    headers: apiHeaders(false),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    datasetStatus.textContent = error.message || "Dataset could not be loaded.";
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
  if (column.type === "boolean") return ["true", "1", "yes", "active"].includes(String(value).trim().toLowerCase());
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

ruleInputCode.addEventListener("change", () => {
  renderRuleSelectionOptions(ruleInputSelection, ruleInputCode.value);
});

ruleOutputCode.addEventListener("change", () => {
  renderRuleSelectionOptions(ruleOutputSelection, ruleOutputCode.value);
});

addRuleBuilderBtn.addEventListener("click", async () => {
  if (!canEditDatasets() || activeDatasetKey !== "configuration_rules") return;

  const inputSelection = getSelectedValues(ruleInputSelection);
  const outputSelection = getSelectedValues(ruleOutputSelection);
  if (!ruleInputCode.value || inputSelection.length === 0 || !ruleOutputCode.value || outputSelection.length === 0) {
    datasetStatus.textContent = "Select input, input selection, output and output selection first.";
    return;
  }

  addRuleBuilderBtn.disabled = true;
  addRuleBuilderBtn.textContent = "Adding...";
  const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/configuration_rules`, {
    method: "POST",
    headers: { ...apiHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      input_code: ruleInputCode.value,
      input_selection: inputSelection.join(","),
      output_code: ruleOutputCode.value,
      output_selection: outputSelection.join(","),
    }),
  });

  addRuleBuilderBtn.disabled = false;
  addRuleBuilderBtn.textContent = "Add rule";

  if (!response.ok) {
    datasetStatus.classList.add("is-error");
    datasetStatus.textContent = "Rule could not be added. Please check permissions.";
    return;
  }

  configurationRulesLoaded = false;
  configurationRules = [];
  await loadDataset("configuration_rules");
  datasetStatus.classList.add("is-success");
  datasetStatus.textContent = "Rule added.";
});

addDatasetRowBtn.addEventListener("click", () => {
  const config = getDatasetConfig();
  if (!canEditDatasets() || !config.allowInsertDelete) return;

  const row = { __isNew: true };
  config.columns.forEach((column) => {
    row[column.key] = "";
  });
  datasetRows.unshift(row);
  datasetOriginalRows.unshift({});
  editedDatasetRows.set(0, true);
  renderDatasetTable(config);
  datasetStatus.textContent = "New row added. Fill it and save changes.";
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

datasetTableBody.addEventListener("click", async (event) => {
  const button = event.target.closest(".dataset-delete-row");
  if (!button || !canEditDatasets()) return;

  const config = getDatasetConfig();
  if (!config.allowInsertDelete) return;

  const rowIndex = Number(button.dataset.row);
  const row = datasetRows[rowIndex];
  if (!row) return;

  if (row.__isNew) {
    datasetRows.splice(rowIndex, 1);
    datasetOriginalRows.splice(rowIndex, 1);
    editedDatasetRows.clear();
    renderDatasetTable(config);
    datasetStatus.textContent = "New row removed.";
    return;
  }

  const confirmed = window.confirm("Delete this rule?");
  if (!confirmed) return;

  const response = await authenticatedFetch(`${SUPABASE_URL}/rest/v1/${config.table}?${datasetRowFilter(config, row)}`, {
    method: "DELETE",
    headers: { ...apiHeaders(), Prefer: "return=minimal" },
  });

  if (!response.ok) {
    datasetStatus.classList.add("is-error");
    datasetStatus.textContent = "Delete failed. Please check permissions.";
    return;
  }

  configurationRulesLoaded = false;
  configurationRules = [];
  await loadDataset(activeDatasetKey);
  datasetStatus.classList.add("is-success");
  datasetStatus.textContent = "Rule deleted.";
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
      if (row.__isNew && column.locked) return;
      if (row.__isNew && row[column.key] !== "") {
        payload[column.key] = parseDatasetValue(row[column.key], column);
        return;
      }
      if (!column.locked && row[column.key] !== originalRow[column.key]) {
        payload[column.key] = row[column.key];
      }
    });

    if (Object.keys(payload).length === 0) continue;

    const response = await authenticatedFetch(row.__isNew ? `${SUPABASE_URL}/rest/v1/${config.table}` : `${SUPABASE_URL}/rest/v1/${config.table}?${datasetRowFilter(config, row)}`, {
      method: row.__isNew ? "POST" : "PATCH",
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
  if (activeDatasetKey === "configuration_rules") {
    configurationRulesLoaded = false;
    configurationRules = [];
  }
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
    setFormState(false, error.message || "Connection failed. Check the Supabase URL and anon key for this project.");
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
    if (page === "family" && getActiveProject() && !validatePumpSelection()) return;
    if (page === "family" && getActiveProject()) {
      saveActiveProject();
      renderFamilyPage(getActiveProject());
    }
    if (page === "model" && getActiveProject() && !validateFamilySelection()) return;
    if (page === "model" && getActiveProject()) {
      saveActiveProject();
      renderModelPage(getActiveProject());
    }
    if (page === "config" && getActiveProject() && !validateModelSelection()) return;
    if (page === "config" && getActiveProject()) {
      saveActiveProject();
      renderConfigPage(getActiveProject());
    }
    if (page === "pump-config" && getActiveProject() && !validateModelSelection()) return;
    if (page === "pump-config" && getActiveProject()) {
      saveActiveProject();
      renderPumpConfigurationPage(getActiveProject());
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
    offerNo: offerNoInput.value.trim(),
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

goToFamilyBtn.addEventListener("click", () => {
  if (!validatePumpSelection()) return;
  saveActiveProject();
  renderFamilyPage(getActiveProject());
  showPage("family");
});

backToPumpBtn.addEventListener("click", () => {
  renderPumpPage(getActiveProject());
  showPage("pump");
});

goToModelBtn.addEventListener("click", () => {
  if (!validateFamilySelection()) return;
  saveActiveProject();
  renderModelPage(getActiveProject());
  showPage("model");
});

backToFamilyBtn.addEventListener("click", () => {
  renderFamilyPage(getActiveProject());
  showPage("family");
});

goToConfigBtn.addEventListener("click", () => {
  if (!validateModelSelection()) return;
  saveActiveProject();
  currentConfigGroupIndex = 0;
  renderConfigPage(getActiveProject(), currentConfigGroupIndex);
  showPage("config");
});

backToModelBtn.addEventListener("click", () => {
  if (currentConfigGroupIndex > 0) {
    currentConfigGroupIndex -= 1;
    renderConfigPage(getActiveProject(), currentConfigGroupIndex);
    return;
  }
  renderModelPage(getActiveProject());
  showPage("model");
});

saveAndCloseBtn.addEventListener("click", () => {
  flashSaved(saveAndCloseBtn);
});

goToConfigNextBtn.addEventListener("click", () => {
  saveActiveProject();
  if (currentConfigGroupIndex >= CONFIG_OPTION_GROUPS.length - 1) return;
  currentConfigGroupIndex += 1;
  renderConfigPage(getActiveProject(), currentConfigGroupIndex);
});

goToPumpConfigurationBtn.addEventListener("click", () => {
  saveActiveProject();
  renderPumpConfigurationPage(getActiveProject());
  showPage("pump-config");
});

backToConfigBtn.addEventListener("click", () => {
  currentConfigGroupIndex = CONFIG_OPTION_GROUPS.length - 1;
  renderConfigPage(getActiveProject(), currentConfigGroupIndex);
  showPage("config");
});

savePumpConfigBtn.addEventListener("click", () => flashSaved(savePumpConfigBtn));

function flashSaved(button) {
  saveActiveProject();
  button.textContent = "Saved";
  window.setTimeout(() => {
    button.textContent = "Save";
  }, 900);
}

saveProjectBtn.addEventListener("click", () => flashSaved(saveProjectBtn));
saveMediaBtn.addEventListener("click", () => flashSaved(saveMediaBtn));
savePumpBtn.addEventListener("click", () => flashSaved(savePumpBtn));
saveFamilyBtn.addEventListener("click", () => flashSaved(saveFamilyBtn));
saveModelBtn.addEventListener("click", () => flashSaved(saveModelBtn));

pumpResultsTableBody.addEventListener("click", (event) => {
  const rowElement = event.target.closest("tr.is-selectable[data-pump-code]");
  if (!rowElement) return;
  const selectedRow = latestPumpRows.find((row) => row.pumpCode === rowElement.dataset.pumpCode);
  const project = getActiveProject();
  if (!selectedRow || !project) return;

  project.selection = {
    ...createBlankSelection(),
    ...(project.selection || {}),
    selectedPump: selectedRow,
    selectedFamily: null,
    selectedModel: null,
  };
  saveProjects();
  renderFamilyPage(project);
  showPage("family");
});

familyTableBody.addEventListener("click", (event) => {
  const rowElement = event.target.closest("tr.is-selectable[data-family]");
  if (!rowElement) return;
  const project = getActiveProject();
  if (!project) return;

  project.selection = {
    ...createBlankSelection(),
    ...(project.selection || {}),
    selectedFamily: {
      pump_family: rowElement.dataset.family,
      type: rowElement.children[1]?.textContent || "",
      installation: rowElement.children[2]?.textContent || "",
    },
    selectedModel: null,
  };
  saveProjects();
  renderModelPage(project);
  showPage("model");
});

modelTableBody.addEventListener("click", (event) => {
  const rowElement = event.target.closest("tr.is-selectable[data-model]");
  if (!rowElement) return;
  const project = getActiveProject();
  if (!project) return;

  project.selection = {
    ...createBlankSelection(),
    ...(project.selection || {}),
    selectedModel: {
      pump_model: rowElement.dataset.model,
      model_code: rowElement.dataset.modelCode || "",
      model_name: rowElement.dataset.modelName || "",
      phase: rowElement.children[1]?.textContent || "",
      rotation: rowElement.children[2]?.textContent || "",
    },
  };
  saveProjects();
  currentConfigGroupIndex = 0;
  renderConfigPage(project, currentConfigGroupIndex);
  showPage("config");
});

configurationOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".config-option-btn");
  if (!button) return;
  const project = getActiveProject();
  if (!project) return;

  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  project.selection = {
    ...selection,
    configOptions: {
      ...(selection.configOptions || {}),
      [button.dataset.variable]: button.dataset.option,
    },
  };
  saveProjects();
  renderConfigPage(project);
});

if (goToMotorSelectionBtn) {
  goToMotorSelectionBtn.addEventListener("click", () => {
    saveActiveProject();
    window.alert("Motor selection will be added next.");
  });
}

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

function setPressure(value, shouldSave = true) {
  const pressure = [6, 12, 24].includes(Number(value)) ? Number(value) : 6;
  pressureGroup.querySelectorAll("[data-pressure]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.pressure) === pressure);
  });
  if (shouldSave) autosaveActiveProject();
}

function getPressureValue() {
  return Number(pressureGroup.querySelector("[data-pressure].is-active")?.dataset.pressure) || 6;
}

pressureGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pressure]");
  if (!button) return;
  setPressure(button.dataset.pressure);
});

renderProjects();
if (hasSavedSession()) {
  signedInEmail.textContent = localStorage.getItem(USER_EMAIL_KEY) || "Signed in";
  workspaceShell.classList.toggle("can-view-datasets", canViewDatasets());
  workspaceShell.classList.toggle("can-edit-datasets", canEditDatasets());
  showPage("projects");
} else {
  showPage("login");
}
















