const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

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
const rotationPage = document.getElementById("rotationPage");
const rpmTableBody = document.getElementById("rpmTableBody");
const rpmStatus = document.getElementById("rpmStatus");

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
  abrasivity: "low",
  viscosity: "low"
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
  setStatus("Loading coefficients...");

  try {
    const coefficients = await fetchCoefficients();
    renderRotationSpeeds(coefficients, qLiterMin);
    setStatus("");
  } catch (error) {
    rpmTableBody.innerHTML = "";
    setStatus(error.message || "Coefficients could not be loaded.", true);
  }
});

function showDataInputPage() {
  dataInputPage.classList.remove("hidden");
  fluidPage.classList.add("hidden");
  rotationPage.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showFluidPage() {
  dataInputPage.classList.add("hidden");
  fluidPage.classList.remove("hidden");
  rotationPage.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showRotationPage() {
  dataInputPage.classList.add("hidden");
  fluidPage.classList.add("hidden");
  rotationPage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getFlowRateLiterMin() {
  return parseDecimal(flowInputs.lmin.value) || 0;
}

async function fetchCoefficients() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and anon key are missing.");
  }

  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase library could not be loaded.");
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabaseClient
    .from("coefficients")
    .select("model, constant, eccentricity, rotor_diameter, stator_pitch");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No coefficients found.");
  }

  return data;
}

function renderRotationSpeeds(coefficients, qLiterMin) {
  rpmTableBody.innerHTML = "";

  coefficients.forEach(coefficient => {
    const rpm =
      qLiterMin *
      (1 / Number(coefficient.constant)) *
      (1 / Number(coefficient.eccentricity)) *
      (1 / Number(coefficient.rotor_diameter)) *
      (1 / Number(coefficient.stator_pitch)) /
      1000;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${coefficient.model}</td>
      <td>${Math.round(rpm)}</td>
    `;

    rpmTableBody.appendChild(row);
  });
}

function setStatus(message, isError = false) {
  rpmStatus.textContent = message;
  rpmStatus.classList.toggle("error", isError);
}
