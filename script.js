const loginPage = document.querySelector("#loginPage");
const projectsPage = document.querySelector("#projectsPage");
const selectorPage = document.querySelector("#selectorPage");
const authForm = document.querySelector("#authForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const submitButton = document.querySelector("#submitButton");
const authNote = document.querySelector("#authNote");
const projectsTableBody = document.querySelector("#projectsTableBody");
const emptyProjects = document.querySelector("#emptyProjects");
const startProjectBtn = document.querySelector("#startProjectBtn");
const projectModal = document.querySelector("#projectModal");
const projectForm = document.querySelector("#projectForm");
const cancelProjectBtn = document.querySelector("#cancelProjectBtn");
const customerInput = document.querySelector("#customerInput");
const projectNameInput = document.querySelector("#projectNameInput");
const backToProjectsBtn = document.querySelector("#backToProjectsBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const projectContext = document.querySelector("#projectContext");
const toggleGroups = document.querySelectorAll(".segmented-control");
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

let projects = loadProjects();
let activeProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY) || null;
let isHydratingProject = false;

function setFormState(isLoading, message) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Signing in" : "Sign in";
  if (message) authNote.textContent = message;
}

function showPage(page) {
  loginPage.classList.toggle("is-hidden", page !== "login");
  projectsPage.classList.toggle("is-hidden", page !== "projects");
  selectorPage.classList.toggle("is-hidden", page !== "selector");
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
          <button class="icon-action" type="button" data-action="edit" data-id="${project.id}" aria-label="Edit project">✎</button>
          <button class="icon-action danger-action" type="button" data-action="delete" data-id="${project.id}" aria-label="Delete project">×</button>
        </div>
      </td>
    `;
    projectsTableBody.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  activeProjectId = projectId;
  localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  hydrateSelector(project);
  showPage("selector");
}

function openProjectModal() {
  projectForm.reset();
  projectModal.classList.remove("is-hidden");
  customerInput.focus();
}

function closeProjectModal() {
  projectModal.classList.add("is-hidden");
}

function updateProjectContext(project) {
  projectContext.innerHTML = `
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

function hydrateSelector(project) {
  isHydratingProject = true;
  const selection = project.selection || createBlankSelection();

  updateProjectContext(project);
  setToggleValue("application", selection.application);
  setToggleValue("certification", selection.certification);
  setToggleValue("orientation", selection.orientation);

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
  updateProjectContext(project);
}

function autosaveActiveProject() {
  if (isHydratingProject) return;
  saveActiveProject();
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!SUPABASE_ANON_KEY) {
    setFormState(false, "Supabase anon key is missing in script.js.");
    return;
  }

  setFormState(true, "Checking account...");

  try {
    const { response, result } = await signInWithPassword(
      usernameInput.value.trim(),
      passwordInput.value
    );

    if (!response.ok) {
      setFormState(false, result.error_description || result.msg || "Login failed.");
      return;
    }

    localStorage.setItem("jp700_access_token", result.access_token);
    localStorage.setItem("jp700_refresh_token", result.refresh_token);
    setFormState(false, "Signed in successfully.");
    renderProjects();
    showPage("projects");
  } catch (error) {
    setFormState(false, "Connection failed. Check the Supabase URL and anon key for this project.");
  }
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
  openProject(project.id);
});

projectsTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const projectId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "preview" || action === "edit") {
    openProject(projectId);
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
  }
});

backToProjectsBtn.addEventListener("click", () => {
  saveActiveProject();
  renderProjects();
  showPage("projects");
});

saveProjectBtn.addEventListener("click", () => {
  saveActiveProject();
  saveProjectBtn.textContent = "Saved";
  window.setTimeout(() => {
    saveProjectBtn.textContent = "Save";
  }, 900);
});

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
  showPage("projects");
} else {
  showPage("login");
}
