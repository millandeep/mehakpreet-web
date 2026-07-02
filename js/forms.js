const DEMO_MODE = true;
const AGENCY_EMAIL = "hello@wanderluxtravel.example";

document.addEventListener("DOMContentLoaded", function () {
  setupForm("appointment-form", buildAppointmentEmail);
  setupForm("contact-form", buildContactEmail);
});

function setupForm(formId, buildEmail) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll("[data-validate]"));
    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    const statusEl = form.querySelector(".form-status");

    if (!isValid) {
      showStatus(statusEl, "error", "Please fix the highlighted fields and try again.");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const { subject, body } = buildEmail(form);

    if (DEMO_MODE) {
      showStatus(
        statusEl,
        "success",
        "Thank you! Your request has been sent to our travel consultants. We'll be in touch within 1 business day."
      );
      form.reset();
      fields.forEach((field) => clearFieldError(field));
    } else {
      const mailto =
        "mailto:" + AGENCY_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
      showStatus(statusEl, "success", "Opening your email client to send your message…");
    }
  });

  form.querySelectorAll("[data-validate]").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
  });
}

function validateField(field) {

  field.removeAttribute("aria-invalid");
  const errorEl = document.getElementById(field.id + "-error");
  if (errorEl) errorEl.classList.remove("show");

  const rule = field.dataset.validate;
  const value = field.value.trim();
  let message = "";

  if (rule.includes("required") && value === "") {
    message = field.dataset.requiredMsg || "This field is required.";
  } else if (rule.includes("email") && value !== "" && !isValidEmail(value)) {
    message = "Please enter a valid email address (e.g. name@example.com).";
  } else if (rule.includes("phone") && value !== "" && !isValidPhone(value)) {
    message = "Please enter a valid phone number (digits, spaces, + and - only).";
  } else if (rule.includes("futureDate") && value !== "" && !isTodayOrFuture(value)) {
    message = "Please choose today's date or a date in the future.";
  } else if (rule.includes("minlength")) {
    const min = Number(field.dataset.minlength || 10);
    if (value.length > 0 && value.length < min) {
      message = `Please enter at least ${min} characters.`;
    }
  }

  if (message) {
    field.setAttribute("aria-invalid", "true");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    }
    return false;
  }

  return true;
}

function clearFieldError(field) {
  field.removeAttribute("aria-invalid");
  const errorEl = document.getElementById(field.id + "-error");
  if (errorEl) errorEl.classList.remove("show");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+\-\s()]{7,20}$/.test(value);
}

function isTodayOrFuture(dateStr) {
  const chosen = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return chosen.getTime() >= today.getTime();
}

function showStatus(statusEl, type, message) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("success", "error");
  statusEl.classList.add("show", type);
  statusEl.setAttribute("role", "status");
}

function buildAppointmentEmail(form) {
  const name = form.querySelector("#apt-name").value.trim();
  const email = form.querySelector("#apt-email").value.trim();
  const phone = form.querySelector("#apt-phone").value.trim();
  const date = form.querySelector("#apt-date").value;
  const message = form.querySelector("#apt-message").value.trim();

  const subject = `Appointment Request — ${name}`;
  const body =
    `New appointment request from the WanderLux website:\n\n` +
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nPreferred Date: ${date}\n\nMessage:\n${message}`;

  return { subject, body };
}

function buildContactEmail(form) {
  const name = form.querySelector("#contact-name").value.trim();
  const email = form.querySelector("#contact-email").value.trim();
  const subject = form.querySelector("#contact-subject").value.trim();
  const message = form.querySelector("#contact-message").value.trim();

  const emailSubject = `Website Contact Form — ${subject || "General Enquiry"}`;
  const body =
    `New message from the WanderLux website contact form:\n\n` +
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  return { subject: emailSubject, body };
}
