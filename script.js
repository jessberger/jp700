const loginPage = document.querySelector("#loginPage");
const selectorPage = document.querySelector("#selectorPage");
const authForm = document.querySelector("#authForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const submitButton = document.querySelector("#submitButton");
const authNote = document.querySelector("#authNote");
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

function setFormState(isLoading, message) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Signing in" : "Sign in";
  if (message) {
    authNote.textContent = message;
  }
}

function showSelectorPage() {
  loginPage.classList.add("is-hidden");
  selectorPage.classList.remove("is-hidden");
}

function showLoginPage() {
  selectorPage.classList.add("is-hidden");
  loginPage.classList.remove("is-hidden");
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
    showSelectorPage();
  } catch (error) {
    setFormState(
      false,
      "Connection failed. Check the Supabase URL and anon key for this project."
    );
  }
});

toggleGroups.forEach((group) => {
  group.addEventListener("click", (event) => {
    const option = event.target.closest(".toggle-option");
    if (!option) return;

    group.querySelectorAll(".toggle-option").forEach((button) => {
      button.classList.toggle("is-active", button === option);
    });
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

function updateFlowFrom(sourceKey) {
  const sourceInput = flowInputs[sourceKey];
  const rawValue = sourceInput.value.trim();

  if (!rawValue) {
    Object.values(flowInputs).forEach((input) => {
      if (input !== sourceInput) input.value = "";
    });
    clearCalculatedFlowFields();
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
}

Object.entries(flowInputs).forEach(([key, input]) => {
  input.addEventListener("input", () => updateFlowFrom(key));
});

function clampPressure(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(24, Math.round(number)));
}

function setPressure(value) {
  const clamped = clampPressure(value);
  pressureSlider.value = String(clamped);
  pressureInput.value = String(clamped);
}

for (let value = 0; value <= 24; value += 1) {
  const tick = document.createElement("span");
  tick.className = "pressure-tick";
  tick.textContent = String(value);
  pressureTicks.appendChild(tick);
}

pressureSlider.addEventListener("input", () => setPressure(pressureSlider.value));
pressureInput.addEventListener("input", () => setPressure(pressureInput.value));

if (hasSavedSession()) {
  showSelectorPage();
} else {
  showLoginPage();
}

