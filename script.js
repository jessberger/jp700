const authForm = document.querySelector("#authForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const submitButton = document.querySelector("#submitButton");
const authNote = document.querySelector("#authNote");

const SUPABASE_URL = "https://zglsynbyeldfbsmyrlpi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrem9sZGFwd3JzZmZoaHFrdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTk0ODMsImV4cCI6MjA5ODQzNTQ4M30.vhKBIxVfixfAYVJ-tednebgwi-RggFCkCcb1aCMKDaA";

function setFormState(isLoading, message) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Signing in" : "Sign in";
  if (message) {
    authNote.textContent = message;
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!SUPABASE_ANON_KEY) {
    setFormState(
      false,
      "Supabase anon key is missing. Add it in script.js before publishing."
    );
    return;
  }

  setFormState(true, "Checking account...");

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: usernameInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setFormState(false, result.error_description || result.msg || "Login failed.");
      return;
    }

    localStorage.setItem("jp700_access_token", result.access_token);
    localStorage.setItem("jp700_refresh_token", result.refresh_token);
    setFormState(false, "Signed in successfully.");
  } catch (error) {
    setFormState(false, "Connection failed. Please try again.");
  }
});
