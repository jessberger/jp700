const selections = {
  atex: "Non-ATEX",
  food: "Non-food",
  orientation: "Vertical"
};

const buttons = document.querySelectorAll(".option-btn");
const summaryText = document.getElementById("summaryText");

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
  return Number(value.replace(",", "."));
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


const calculateRotationBtn = document.getElementById("calculateRotationBtn");
const rotationPage = document.getElementById("rotationPage");
const rpmTableBody = document.getElementById("rpmTableBody");

// Şimdilik örnek motor verileri.
// Burayı senin gerçek pump coefficient tablonla değiştireceğiz.
const pumpTypes = [
  {
    name: "JP-700.12.1",
    constant: 1,
    exzentrizitat: 1,
    rotorDurchmesser: 1,
    statorSteigung: 1
  },
  {
    name: "JP-700.12.2",
    constant: 1,
    exzentrizitat: 1,
    rotorDurchmesser: 1,
    statorSteigung: 1
  }
];

calculateRotationBtn.addEventListener("click", () => {
  const qLiterMin = getFlowRateLiterMin();

  rpmTableBody.innerHTML = "";

  pumpTypes.forEach(pump => {
    const rpm =
      qLiterMin *
      (1 / pump.constant) *
      (1 / pump.exzentrizitat) *
      (1 / pump.rotorDurchmesser) *
      (1 / pump.statorSteigung) /
      1000;

    const roundedRpm = Math.round(rpm);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${pump.name}</td>
      <td>${roundedRpm}</td>
    `;

    rpmTableBody.appendChild(row);
  });

  rotationPage.classList.remove("hidden");
  rotationPage.scrollIntoView({ behavior: "smooth" });
});

function getFlowRateLiterMin() {
  // Burada input id'lerini kendi mevcut HTML'ine göre kontrol et.
  // Eğer flow input'unun id'si farklıysa sadece burayı değiştir.
  const flowInput = document.getElementById("flowRate");

  if (!flowInput) {
    alert("Flow rate input bulunamadı.");
    return 0;
  }

  return Number(flowInput.value) || 0;
}