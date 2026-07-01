const pageMode = new URLSearchParams(window.location.search).get("mode");
const hashMode = window.location.hash.includes("set-password");
const isPasswordSetup = pageMode === "set-password" || hashMode;

const authForm = document.querySelector("#authForm");
const authTitle = document.querySelector("#authTitle");
const authModeLabel = document.querySelector("#authModeLabel");
const authDescription = document.querySelector("#authDescription");
const authNote = document.querySelector("#authNote");
const submitButton = document.querySelector("#submitButton");
const passwordInput = document.querySelector("#passwordInput");
const confirmPasswordInput = document.querySelector("#confirmPasswordInput");

if (isPasswordSetup) {
  document.body.classList.add("password-setup");
  authModeLabel.textContent = "Invitation access";
  authTitle.textContent = "Set your password";
  authDescription.textContent =
    "Create your password to activate your invited selector account.";
  authNote.textContent =
    "This page is opened from an invitation link. Public registration remains closed.";
  passwordInput.placeholder = "Create a password";
  passwordInput.autocomplete = "new-password";
  confirmPasswordInput.required = true;
  submitButton.textContent = "Save password";
}

authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isPasswordSetup && passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.setCustomValidity("Passwords do not match.");
    confirmPasswordInput.reportValidity();
    return;
  }

  confirmPasswordInput.setCustomValidity("");
  submitButton.textContent = isPasswordSetup ? "Password saved" : "Signing in";
  submitButton.disabled = true;
});
