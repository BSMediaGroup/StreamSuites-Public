(function () {
  "use strict";

  var CHECKOUT_ENDPOINT = "https://api.streamsuites.app/billing/donate/session";
  var MESSAGE_STORAGE_KEY = "streamsuites_donor_message_draft";
  var MESSAGE_MAX_LENGTH = 320;

  function init() {
    var checkout = document.getElementById("donate-checkout");
    var customInput = document.getElementById("donate-custom-amount");
    var status = document.getElementById("donate-status");
    var controls = Array.prototype.slice.call(document.querySelectorAll(".donate-option"));
    var impactControls = Array.prototype.slice.call(document.querySelectorAll(".donate-impact-select"));
    var messageInput = document.getElementById("donor-message");
    var messageCount = document.getElementById("donor-message-count");
    var messageStatus = document.getElementById("donor-message-status");
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
      impactControls.forEach(function (control) {
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

    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function selectImpactAmount(amount) {
      var target = document.querySelector('.donate-option[data-amount="' + amount + '"]');
      if (!target) return;

      customInput.value = "";
      selectPreset(target);
      setStatus("$" + amount + " selected. Activate that amount to continue to Stripe.", "idle");
      checkout.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      target.focus({ preventScroll: true });
    }

    function updateMessageDraft() {
      if (!messageInput || !messageCount || !messageStatus) return;
      if (messageInput.value.length > MESSAGE_MAX_LENGTH) {
        messageInput.value = messageInput.value.slice(0, MESSAGE_MAX_LENGTH);
      }

      messageCount.textContent = messageInput.value.length + " / " + MESSAGE_MAX_LENGTH;
      try {
        window.localStorage.setItem(MESSAGE_STORAGE_KEY, messageInput.value);
        messageStatus.textContent = messageInput.value ? "Local draft saved in this browser. It will not be sent with checkout." : "No local draft saved.";
      } catch (error) {
        messageStatus.textContent = "This browser could not save the local draft. It has not been sent.";
      }
    }

    function initMessageDraft() {
      if (!messageInput || !messageCount || !messageStatus) return;
      try {
        messageInput.value = (window.localStorage.getItem(MESSAGE_STORAGE_KEY) || "").slice(0, MESSAGE_MAX_LENGTH);
      } catch (error) {
        messageStatus.textContent = "Local draft storage is unavailable. Nothing has been sent.";
      }
      messageCount.textContent = messageInput.value.length + " / " + MESSAGE_MAX_LENGTH;
      if (messageInput.value) messageStatus.textContent = "Local draft restored. It will not be sent with checkout.";
      messageInput.addEventListener("input", updateMessageDraft);
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

    impactControls.forEach(function (control) {
      control.addEventListener("click", function () {
        var amount = validateAmount(control.dataset.amount);
        if (amount !== null) selectImpactAmount(amount);
      });
    });

    customInput.addEventListener("input", function () {
      controls.forEach(function (control) { control.setAttribute("aria-pressed", "false"); });
      setStatus("Choose Continue to Stripe when the amount is ready.", "idle");
    });

    initMessageDraft();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
