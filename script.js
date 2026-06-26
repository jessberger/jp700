const selections = {
  atex: "Non-ATEX",
  food: "Non-food"
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

  summaryText.textContent = result;
}

updateSummary();

const flowInputs = {
  lmin: document.getElementById("flowLMin"),
  lhour: document.getElementById("flowLHour"),
  m3hour: document.getElementById("flowM3Hour")
};

Object.entries(flowInputs).forEach(([unit, input]) => {
  input.addEventListener("input", () => {
    const value = Number(input.value);

    if (input.value === "") {
      resetFlowInputs();
      return;
    }

    if (isNaN(value)) return;

    calculateFlow(unit, value);
  });
});

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

  flowInputs.lmin.value = roundNumber(lmin);
  flowInputs.lhour.value = roundNumber(lhour);
  flowInputs.m3hour.value = roundNumber(m3hour);

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

function roundNumber(number) {
  return Math.round(number * 1000) / 1000;
}