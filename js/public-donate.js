(function () {
  "use strict";

  var DONATION_ENDPOINT = "https://api.streamsuites.app/billing/donate/session";
  var MESSAGE_STORAGE_KEY = "streamsuites_donor_message_draft";
  var MESSAGE_MAX_LENGTH = 320;
  var DONATION_GOALS = [
    {
      id: "compute",
      title: "Faster hosting and compute",
      blurb: "Lower latency for realtime runtime features and smoother automation during live streams.",
      target_cents: 500000,
      raised_cents: 176500
    },
    {
      id: "storage",
      title: "Clip and asset archive storage",
      blurb: "Expand retention for clip libraries and media assets used by creators and public tools.",
      target_cents: 350000,
      raised_cents: 114300
    },
    {
      id: "bandwidth",
      title: "Bandwidth and export throughput",
      blurb: "Increase CDN and transfer capacity for faster exports and content delivery.",
      target_cents: 275000,
      raised_cents: 92300
    },
    {
      id: "reliability",
      title: "Monitoring and incident tooling",
      blurb: "Improve alerting, diagnostics, and response workflows to keep uptime predictable.",
      target_cents: 200000,
      raised_cents: 71800
    },
    {
      id: "velocity",
      title: "Development acceleration",
      blurb: "Support faster implementation and rollout of roadmap features for the community.",
      target_cents: 425000,
      raised_cents: 148900
    }
  ];

  var donateCard = document.getElementById("donate");
  if (!donateCard) {
    return;
  }

  var statusMessage = donateCard.querySelector(".donate-error");
  var messageInlineNote = donateCard.querySelector("#donate-message-inline");
  var presetButtons = donateCard.querySelectorAll(".donate-option[data-amount]");
  var customButton = donateCard.querySelector(".donate-option[data-action=\"custom\"]");
  var customInput = donateCard.querySelector("#donate-custom-amount");
  var impactSelectButtons = document.querySelectorAll(".impact-select[data-amount]");
  var donorMessageInput = document.getElementById("donor-message");
  var donorMessageCount = document.getElementById("donor-message-count");
  var donorMessageStatus = document.getElementById("donor-message-status");
  var goalsGrid = document.getElementById("donation-goals-grid");

  renderFundingGoals();
  setupDonorMessageDraft();
  setupImpactSelectors();
  bindDonationActions();

  function formatUsdFromCents(cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(cents / 100);
  }

  function renderFundingGoals() {
    if (!goalsGrid) {
      return;
    }

    goalsGrid.innerHTML = "";
    DONATION_GOALS.forEach(function (goal) {
      var safeTarget = Math.max(0, Number(goal.target_cents) || 0);
      var safeRaised = Math.max(0, Number(goal.raised_cents) || 0);
      var progress = safeTarget > 0 ? (safeRaised / safeTarget) * 100 : 0;
      var progressClamped = Math.max(0, Math.min(100, progress));
      var progressRounded = Math.round(progressClamped * 10) / 10;

      var card = document.createElement("article");
      card.className = "goal-card";
      card.setAttribute("data-goal-id", goal.id);

      var title = document.createElement("h3");
      title.textContent = goal.title;

      var blurb = document.createElement("p");
      blurb.className = "muted";
      blurb.textContent = goal.blurb;

      var statRow = document.createElement("div");
      statRow.className = "goal-stat-row";
      statRow.innerHTML = (
        "<div>" +
          "<p class=\"goal-stat-label\">Raised</p>" +
          "<p class=\"goal-stat-value\">" + formatUsdFromCents(safeRaised) + "</p>" +
        "</div>" +
        "<div>" +
          "<p class=\"goal-stat-label\">Target</p>" +
          "<p class=\"goal-stat-value\">" + formatUsdFromCents(safeTarget) + "</p>" +
        "</div>"
      );

      var progressWrap = document.createElement("div");
      progressWrap.className = "goal-progress-wrap";

      var progressTrack = document.createElement("div");
      progressTrack.className = "goal-progress-track";
      progressTrack.setAttribute("role", "progressbar");
      progressTrack.setAttribute("aria-valuemin", "0");
      progressTrack.setAttribute("aria-valuemax", "100");
      progressTrack.setAttribute("aria-valuenow", String(progressRounded));
      progressTrack.setAttribute("aria-label", "Funding progress for " + goal.title);
      progressTrack.setAttribute(
        "aria-valuetext",
        progressRounded + "% funded (" + formatUsdFromCents(safeRaised) + " of " + formatUsdFromCents(safeTarget) + ")"
      );

      var progressFill = document.createElement("span");
      progressFill.className = "goal-progress-fill";
      progressFill.style.setProperty("--goal-progress", progressRounded + "%");

      var progressMeta = document.createElement("div");
      progressMeta.className = "goal-progress-meta";
      progressMeta.innerHTML = (
        "<p class=\"helper-text\">Progress</p>" +
        "<p class=\"helper-text\">" + progressRounded + "%</p>"
      );

      progressTrack.appendChild(progressFill);
      progressWrap.appendChild(progressTrack);
      progressWrap.appendChild(progressMeta);

      card.appendChild(title);
      card.appendChild(blurb);
      card.appendChild(statRow);
      card.appendChild(progressWrap);
      goalsGrid.appendChild(card);
    });
  }

  function bindDonationActions() {
    presetButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var amount = Number(button.dataset.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          setStatusMessage("Please choose a valid donation amount.");
          return;
        }
        startDonation(amount, button);
      });
    });

    if (!customButton || !customInput) {
      return;
    }

    customButton.addEventListener("click", function () {
      var amount = Number(customInput.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        setStatusMessage("Please enter a valid donation amount.");
        return;
      }
      startDonation(amount, customButton);
    });
  }

  function setStatusMessage(message) {
    if (!statusMessage) {
      return;
    }
    statusMessage.textContent = message;
    statusMessage.hidden = false;
  }

  function setBusyState(isBusy, activeButton, label) {
    var buttons = donateCard.querySelectorAll(".donate-option");
    buttons.forEach(function (button) {
      if (!button.dataset.label) {
        button.dataset.label = button.textContent;
      }
      button.disabled = isBusy;
      if (button === activeButton) {
        button.setAttribute("aria-busy", isBusy ? "true" : "false");
        button.textContent = isBusy ? label : button.dataset.label;
      } else if (!isBusy) {
        button.textContent = button.dataset.label;
        button.removeAttribute("aria-busy");
      }
    });

    if (customInput) {
      customInput.disabled = isBusy;
    }
  }

  function maybeShowMessageInlineNote() {
    if (!messageInlineNote || !donorMessageInput) {
      return;
    }
    if (!donorMessageInput.value.trim()) {
      return;
    }
    messageInlineNote.hidden = false;
  }

  function startDonation(amount, activeButton) {
    setBusyState(true, activeButton, "Redirecting...");
    maybeShowMessageInlineNote();

    if (statusMessage) {
      statusMessage.hidden = true;
    }

    fetch(DONATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        source: "public"
      })
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Donation request failed.");
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || typeof data.checkout_url !== "string" || !data.checkout_url.length) {
          throw new Error("Donation session was not returned.");
        }
        window.location.assign(data.checkout_url);
      })
      .catch(function () {
        setBusyState(false);
        setStatusMessage("Sorry, we could not start checkout. Please try again in a moment.");
      });
  }

  function setupImpactSelectors() {
    impactSelectButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var amount = Number(button.dataset.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          return;
        }

        var targetButton = donateCard.querySelector(".donate-option[data-amount=\"" + amount + "\"]");
        if (targetButton) {
          targetButton.focus();
        } else if (customInput) {
          customInput.value = String(amount);
          customInput.focus();
        }

        donateCard.scrollIntoView({
          behavior: shouldReduceMotion() ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  function shouldReduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setupDonorMessageDraft() {
    if (!donorMessageInput) {
      return;
    }

    try {
      var savedDraft = window.localStorage.getItem(MESSAGE_STORAGE_KEY);
      if (savedDraft) {
        donorMessageInput.value = savedDraft.slice(0, MESSAGE_MAX_LENGTH);
      }
    } catch (error) {
      // Storage failures should never block checkout flow.
    }

    updateMessageCount();

    donorMessageInput.addEventListener("input", function () {
      if (donorMessageInput.value.length > MESSAGE_MAX_LENGTH) {
        donorMessageInput.value = donorMessageInput.value.slice(0, MESSAGE_MAX_LENGTH);
      }

      updateMessageCount();

      try {
        window.localStorage.setItem(MESSAGE_STORAGE_KEY, donorMessageInput.value);
      } catch (error) {
        // Ignore storage errors in restricted contexts.
      }

      if (donorMessageStatus) {
        donorMessageStatus.hidden = false;
        donorMessageStatus.textContent = "Message draft saved locally.";
      }
    });
  }

  function updateMessageCount() {
    if (!donorMessageInput || !donorMessageCount) {
      return;
    }

    var currentLength = donorMessageInput.value.length;
    donorMessageCount.textContent = currentLength + " / " + MESSAGE_MAX_LENGTH;
  }
})();
