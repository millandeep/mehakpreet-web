const DESTINATION_RATES = {
  bali:     { label: "Bali, Indonesia",      daily: 140, accom: 190 },
  paris:    { label: "Paris, France",        daily: 180, accom: 240 },
  tokyo:    { label: "Tokyo, Japan",         daily: 165, accom: 210 },
  sydney:   { label: "Sydney, Australia",    daily: 150, accom: 200 },
  maldives: { label: "Maldives",             daily: 230, accom: 320 },
  rome:     { label: "Rome, Italy",          daily: 170, accom: 220 },
};

const STYLE_MULTIPLIERS = {
  budget:   { label: "Budget",   multiplier: 0.75 },
  standard: { label: "Standard", multiplier: 1.0 },
  luxury:   { label: "Luxury",   multiplier: 1.5 },
};

const FLAT_SERVICE_FEE = 100;

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("calculator-form");
  if (!form) return;

  const resultWrap = document.getElementById("calc-result");
  const resultPlaceholder = document.getElementById("calc-placeholder");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateCalculatorForm(form)) return;

    const data = readCalculatorInputs(form);
    const result = calculateTripCost(data);
    renderResult(result, data, resultWrap, resultPlaceholder);
  });

  form.addEventListener("reset", function () {
    resultWrap.innerHTML = "";
    resultWrap.hidden = true;
    resultPlaceholder.hidden = false;
    clearAllErrors(form);
  });
});

function validateCalculatorForm(form) {
  let valid = true;

  const destination = form.querySelector("#destination");
  const travellers = form.querySelector("#travellers");
  const days = form.querySelector("#days");
  const style = form.querySelector('input[name="travelStyle"]:checked');

  valid = requireValue(destination, "Please choose a destination.") && valid;
  valid = requireRange(travellers, 1, 20, "Enter between 1 and 20 travellers.") && valid;
  valid = requireRange(days, 1, 60, "Enter a trip length between 1 and 60 days.") && valid;

  const styleError = document.getElementById("travelStyle-error");
  if (!style) {
    if (styleError) {
      styleError.textContent = "Please select a travel style.";
      styleError.classList.add("show");
    }
    valid = false;
  } else if (styleError) {
    styleError.classList.remove("show");
  }

  return valid;
}

function requireValue(input, message) {
  const errorEl = document.getElementById(input.id + "-error");
  if (!input.value) {
    setFieldError(input, errorEl, message);
    return false;
  }
  clearFieldError(input, errorEl);
  return true;
}

function requireRange(input, min, max, message) {
  const errorEl = document.getElementById(input.id + "-error");
  const num = Number(input.value);
  if (input.value === "" || isNaN(num) || num < min || num > max) {
    setFieldError(input, errorEl, message);
    return false;
  }
  clearFieldError(input, errorEl);
  return true;
}

function setFieldError(input, errorEl, message) {
  input.setAttribute("aria-invalid", "true");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
}

function clearFieldError(input, errorEl) {
  input.removeAttribute("aria-invalid");
  if (errorEl) errorEl.classList.remove("show");
}

function clearAllErrors(form) {
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  form.querySelectorAll(".error-msg").forEach((el) => el.classList.remove("show"));
}

function readCalculatorInputs(form) {
  const destinationKey = form.querySelector("#destination").value;
  const travellers = Number(form.querySelector("#travellers").value);
  const days = Number(form.querySelector("#days").value);
  const styleKey = form.querySelector('input[name="travelStyle"]:checked').value;

  return { destinationKey, travellers, days, styleKey };
}

function calculateTripCost({ destinationKey, travellers, days, styleKey }) {
  const destination = DESTINATION_RATES[destinationKey];
  const style = STYLE_MULTIPLIERS[styleKey];

  const travelCost = destination.daily * travellers * days;
  const accommodationCost = destination.accom * days;
  const subtotal = travelCost + accommodationCost;
  const styledSubtotal = subtotal * style.multiplier;
  const total = Math.round(styledSubtotal + FLAT_SERVICE_FEE);

  return {
    destinationLabel: destination.label,
    styleLabel: style.label,
    travellers,
    days,
    travelCost: Math.round(travelCost * style.multiplier),
    accommodationCost: Math.round(accommodationCost * style.multiplier),
    serviceFee: FLAT_SERVICE_FEE,
    total,
  };
}

function renderResult(result, inputs, resultWrap, resultPlaceholder) {
  const formattedTotal = result.total.toLocaleString("en-AU");

  resultWrap.innerHTML = `
    <div class="stamp-result reveal in-view">
      <p>Estimated cost for ${result.travellers} traveller${result.travellers > 1 ? "s" : ""}
        to ${result.destinationLabel} for ${result.days} day${result.days > 1 ? "s" : ""}:</p>
      <p class="amount">$${formattedTotal}</p>
      <p><strong>${result.styleLabel} Travel Package</strong></p>
      <div class="breakdown">
        <div><span>Travel &amp; daily costs</span><span>$${result.travelCost.toLocaleString("en-AU")}</span></div>
        <div><span>Accommodation</span><span>$${result.accommodationCost.toLocaleString("en-AU")}</span></div>
        <div><span>Booking &amp; planning fee</span><span>$${result.serviceFee.toLocaleString("en-AU")}</span></div>
        <div class="total"><span>Total estimate</span><span>$${formattedTotal}</span></div>
      </div>
    </div>
  `;

  resultWrap.hidden = false;
  resultPlaceholder.hidden = true;
  resultWrap.setAttribute("tabindex", "-1");
  resultWrap.focus();
}
