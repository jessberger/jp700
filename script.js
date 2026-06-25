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
  summaryText.textContent = `${selections.atex} / ${selections.food}`;
}