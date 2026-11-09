"use strict";
const eyeIcon = (visible = false) =>
  `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${visible ? '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.2A10.5 10.5 0 0 1 21 12a13 13 0 0 1-3 3.7M6.5 6.5A15 15 0 0 0 3 12s3 7 9 7a11 11 0 0 0 4.1-.8"/>' : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'}</svg>`;
$("#auth-utilities").innerHTML = utilities();
applyTheme();
$$("[data-password-toggle]").forEach((button) => {
  button.innerHTML = eyeIcon();
  button.addEventListener("click", () => {
    const input = $("#" + button.dataset.passwordToggle),
      visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.innerHTML = eyeIcon(visible);
    button.setAttribute("aria-pressed", visible);
    button.setAttribute(
      "aria-label",
      (visible ? "Hide " : "Show ") +
        (input.id === "confirm-password" ? "confirmed password" : "password"),
    );
  });
});
function authFeedback(message) {
  const el = $("#auth-feedback");
  el.hidden = false;
  el.textContent = message;
}
const form = $("#auth-form"),
  confirm = $("#confirm-password"),
  password = $("#auth-password");
function validateConfirmation() {
  if (confirm)
    confirm.setCustomValidity(
      confirm.value && confirm.value !== password.value
        ? "Passwords do not match."
        : "",
    );
}
confirm?.addEventListener("input", validateConfirmation);
password.addEventListener("input", validateConfirmation);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#full-name");
  if (name && !name.value.trim()) {
    name.setCustomValidity("Please enter your name.");
    name.reportValidity();
    return;
  }
  validateConfirmation();
  if (!form.reportValidity()) return;
  authFeedback(
    form.dataset.authMode === "signup"
      ? "Account creation is not connected yet. No account was created and your details were not sent."
      : "Sign-in is not connected yet. Your credentials were not sent or saved.",
  );
  $$("[data-password]").forEach((input) => (input.value = ""));
  $$("[data-password-toggle]").forEach((button) => {
    $("#" + button.dataset.passwordToggle).type = "password";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = eyeIcon();
    button.setAttribute(
      "aria-label",
      "Show " +
        (button.dataset.passwordToggle === "confirm-password"
          ? "confirmed password"
          : "password"),
    );
  });
});
$("#full-name")?.addEventListener("input", (event) =>
  event.target.setCustomValidity(""),
);
$$("[data-provider]").forEach((button) =>
  button.addEventListener("click", () =>
    authFeedback(
      `${button.dataset.provider} sign-in is not connected yet. No authentication has been performed.`,
    ),
  ),
);
$("#forgot-password")?.addEventListener("click", (event) => {
  event.preventDefault();
  dialog(
    `<h2>Forgot your password?</h2><p>Enter the email you use for your member account.</p><form class="recovery-form" id="recovery-form"><div class="field"><label for="recovery-email">Email</label><input type="email" id="recovery-email" autocomplete="email" required placeholder="you@example.com"></div><button type="submit" class="btn">Send Reset Link</button><p id="recovery-feedback" class="auth-feedback" role="status" hidden></p></form>`,
  );
  $("#recovery-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const feedback = $("#recovery-feedback");
    feedback.hidden = false;
    feedback.textContent =
      "Password recovery is not connected yet. No email has been sent.";
  });
});
