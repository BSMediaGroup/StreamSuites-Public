(function () {
  "use strict";

  var CHECKOUT_ENDPOINT = "https://api.streamsuites.app/billing/donate/session";

  function init() {
    var checkout = document.getElementById("donate-checkout");
    var customInput = document.getElementById("donate-custom-amount");
    var status = document.getElementById("donate-status");
    var controls = Array.prototype.slice.call(document.querySelectorAll(".donate-option"));
    var busy = false;

    if (!checkout || !customInput || !status || !controls.length) return;

    function setStatus(message, state) {
      status.textContent = message;
      status.dataset.state = state || "idle";
    }

    function setBusy(value) {
      busy = value;
      checkout.setAttribute("aria-busy", value ? "true" : "false");
      controls.forEach(function (control) {
        control.disabled = value;
      });
      customInput.disabled = value;
    }

    function validateAmount(value) {
      var amount = Number(value);
      if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 1) {
        return null;
      }
      return amount;
    }

    function selectPreset(control) {
      controls.forEach(function (candidate) {
        candidate.setAttribute("aria-pressed", candidate === control ? "true" : "false");
      });
    }

    async function beginCheckout(amount) {
      if (busy) return;

      setBusy(true);
      setStatus("Creating a secure Stripe Checkout session…", "loading");

      try {
        var response = await fetch(CHECKOUT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amount, source: "public" })
        });
        var payload = await response.json().catch(function () { return {}; });

        if (!response.ok || typeof payload.checkout_url !== "string" || !payload.checkout_url) {
          throw new Error(payload.detail || payload.error || "checkout_unavailable");
        }

        setStatus("Checkout is ready. Redirecting to Stripe…", "loading");
        window.location.assign(payload.checkout_url);
      } catch (error) {
        var unavailable = error && (error.message === "stripe_live_disabled" || error.message === "stripe_unavailable");
        setStatus(unavailable ? "Donations are not available right now. Please try again later." : "We could not start checkout. Check your connection and try again.", "error");
        setBusy(false);
      }
    }

    controls.forEach(function (control) {
      control.addEventListener("click", function () {
        var amount = control.dataset.action === "custom" ? validateAmount(customInput.value) : validateAmount(control.dataset.amount);
        if (amount === null) {
          setStatus("Enter a whole-dollar amount of at least $1.", "error");
          customInput.focus();
          return;
        }
        selectPreset(control);
        beginCheckout(amount);
      });
    });

    customInput.addEventListener("input", function () {
      controls.forEach(function (control) { control.setAttribute("aria-pressed", "false"); });
      setStatus("Choose Continue to Stripe when the amount is ready.", "idle");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
