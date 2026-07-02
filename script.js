const loginPage = document.querySelector("#loginPage");
const workspaceShell = document.querySelector("#workspaceShell");
const projectsPage = document.querySelector("#projectsPage");
const selectorPage = document.querySelector("#selectorPage");
const mediaPage = document.querySelector("#mediaPage");
const previewPage = document.querySelector("#previewPage");
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
const backToProjectsBtn = document.querySelector("#backToProjectsBtn");
const goToMediaBtn = document.querySelector("#goToMediaBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const backToTypeBtn = document.querySelector("#backToTypeBtn");
const goToPreviewBtn = document.querySelector("#goToPreviewBtn");
const saveMediaBtn = document.querySelector("#saveMediaBtn");
const backToMediaBtn = document.querySelector("#backToMediaBtn");
const saveAndCloseBtn = document.querySelector("#saveAndCloseBtn");
const projectContext = document.querySelector("#projectContext");
const mediaProjectContext = document.querySelector("#mediaProjectContext");
const previewProjectContext = document.querySelector("#previewProjectContext");
const previewList = document.querySelector("#previewList");
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

let projects = loadProjects();
let activeProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY) || null;
let isHydratingProject = false;

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
  previewPage.classList.toggle("is-hidden", page !== "preview");
  updateSidebar(page);
}

function updateSidebar(activePage) {
  const hasProject = Boolean(getActiveProject());
  sidebarSteps.forEach((step) => {
    const page = step.dataset.page;
    step.classList.toggle("is-active", page === activePage);
    step.disabled = page !== "projects" && !hasProject;
  });
  signedInEmail.textContent = localStorage.getItem(USER_EMAIL_KEY) || "Signed in";
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
      <td><span class="status-pill">${project.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="ghost-action" type="button" data-action="preview" data-id="${project.id}">Preview</button>
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
  if (targetPage === "preview") renderPreview(project);
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
  renderProjectContext(previewProjectContext, project);
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
  renderProjectContext(previewProjectContext, project);
  updateSidebar(getVisiblePage());
}

function autosaveActiveProject() {
  if (isHydratingProject) return;
  saveActiveProject();
}

function getVisiblePage() {
  if (!projectsPage.classList.contains("is-hidden")) return "projects";
  if (!selectorPage.classList.contains("is-hidden")) return "selector";
  if (!mediaPage.classList.contains("is-hidden")) return "media";
  if (!previewPage.classList.contains("is-hidden")) return "preview";
  return "login";
}

function renderPreview(project) {
  const selection = { ...createBlankSelection(), ...(project.selection || {}) };
  const flowText = selection.flow?.source
    ? `${selection.flow.lmin || "-"} l/min | ${selection.flow.lhour || "-"} l/h | ${selection.flow.m3hour || "-"} m3/h`
    : "Not specified";

  const rows = [
    ["Customer", project.customer],
    ["Project name", project.name],
    ["Application", labelValue(selection.application)],
    ["Certification", labelValue(selection.certification)],
    ["Orientation", labelValue(selection.orientation)],
    ["Flow rate", flowText],
    ["Pressure", `${selection.pressure || 0} bar`],
    ["Abrasivity", selection.abrasivity || "Not specified"],
    ["Viscosity", selection.viscosity || "Not specified"],
  ];

  previewList.innerHTML = rows
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
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
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
  activeProjectId = null;
  passwordInput.value = "";
  showPage("login");
});

sidebarSteps.forEach((step) => {
  step.addEventListener("click", () => {
    const page = step.dataset.page;
    if (page !== "projects" && !getActiveProject()) return;
    if (page === "media" && !validateTypeValues()) return;
    if (page === "preview" && !validateMediaValues()) return;
    if (page === "preview") {
      saveActiveProject();
      renderPreview(getActiveProject());
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

  if (action === "preview") {
    openProject(projectId, "preview");
    return;
  }

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

goToPreviewBtn.addEventListener("click", () => {
  if (!validateMediaValues()) return;
  saveActiveProject();
  renderPreview(getActiveProject());
  showPage("preview");
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
  showPage("projects");
} else {
  showPage("login");
}



