(function () {
  const nav = document.querySelector("#site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const year = document.querySelector("#year");
  const form = document.querySelector("#quote-form");
  const status = document.querySelector("#form-status");
  const serviceSelect = document.querySelector("#service-needed");
  const messageField = document.querySelector("#message");
  const requestButtons = document.querySelectorAll("[data-service]");

  const companyEmail = "SFDEBIASE@iCLOUD.COM";
  const successMessage = "Thank you. Your service request has been prepared. Boat MD will contact you soon.";

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function closeMenu() {
    if (!nav || !menuButton) return;
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    if (!nav || !menuButton) return;
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", isOpen);
  }

  menuButton?.addEventListener("click", toggleMenu);

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  requestButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const service = button.getAttribute("data-service") || "";
      if (serviceSelect) {
        serviceSelect.value = service;
        clearFieldError(serviceSelect);
      }

      if (messageField && !messageField.value.trim()) {
        messageField.value = `I would like a quote for ${service}.`;
      }

      document.querySelector("#book")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => serviceSelect?.focus({ preventScroll: true }), 450);
    });
  });

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status visible ${type}`;
  }

  function getErrorElement(field) {
    return document.querySelector(`[data-error-for="${field.id}"]`);
  }

  function clearFieldError(field) {
    field.removeAttribute("aria-invalid");
    field.closest(".form-field")?.classList.remove("has-error");
    const errorElement = getErrorElement(field);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function setFieldError(field, message) {
    field.setAttribute("aria-invalid", "true");
    field.closest(".form-field")?.classList.add("has-error");
    const errorElement = getErrorElement(field);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function validateField(field) {
    clearFieldError(field);

    if (field.required && !field.value.trim()) {
      setFieldError(field, "Please complete this field.");
      return false;
    }

    if (field.type === "email" && field.value.trim() && !field.validity.valid) {
      setFieldError(field, "Please enter a valid email address.");
      return false;
    }

    if (field.type === "tel" && field.value.trim()) {
      const digits = field.value.replace(/\D/g, "");
      if (digits.length < 10) {
        setFieldError(field, "Please enter a phone number with at least 10 digits.");
        return false;
      }
    }

    return true;
  }

  function validateForm() {
    if (!form) return false;
    const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter(
      (field) => field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement,
    );
    let valid = true;
    fields.forEach((field) => {
      if (!validateField(field)) {
        valid = false;
      }
    });

    if (!valid) {
      const firstInvalid = fields.find((field) => field.getAttribute("aria-invalid") === "true");
      firstInvalid?.focus();
      setStatus("Please fix the highlighted fields before sending your request.", "error");
    }

    return valid;
  }

  function buildEmailBody(data) {
    const lines = [
      "Boat MD Dive Service Quote Request",
      "",
      `Full Name: ${data.get("Full Name") || ""}`,
      `Phone Number: ${data.get("Phone Number") || ""}`,
      `Email Address: ${data.get("Email Address") || ""}`,
      `Boat Name: ${data.get("Boat Name") || ""}`,
      `Boat Location / Marina: ${data.get("Boat Location / Marina") || ""}`,
      `Boat Size: ${data.get("Boat Size") || ""}`,
      `Service Needed: ${data.get("Service Needed") || ""}`,
      `Preferred Date: ${data.get("Preferred Date") || ""}`,
      `Preferred Time Window: ${data.get("Preferred Time Window") || ""}`,
      `Urgency: ${data.get("Urgency") || ""}`,
      `Recurring Maintenance: ${data.get("Recurring Maintenance") || "No"}`,
      "",
      "Message / Service Details:",
      `${data.get("Message / Service Details") || ""}`,
    ];

    return lines.join("\n");
  }

  form?.addEventListener("input", (event) => {
    const field = event.target;
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
    ) {
      clearFieldError(field);
    }
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData(form);
    const subject = encodeURIComponent("Boat MD Dive Service Quote Request");
    const body = encodeURIComponent(buildEmailBody(formData));
    const mailto = `mailto:${companyEmail}?subject=${subject}&body=${body}`;

    setStatus(successMessage, "success");
    window.location.href = mailto;
  });
})();
