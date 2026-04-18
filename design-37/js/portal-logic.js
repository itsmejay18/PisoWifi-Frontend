(function () {
  var RATE_PLANS = [
    { credit: 5, seconds: 3600, download: "10 MB", upload: "10 MB", voucher: "UNIFI5" },
    { credit: 10, seconds: 7200, download: "10 MB", upload: "10 MB", voucher: "UNIFI10" },
    { credit: 25, seconds: 18000, download: "10 MB", upload: "10 MB", voucher: "UNIFI25" },
    { credit: 50, seconds: 36000, download: "10 MB", upload: "10 MB", voucher: "UNIFI50" },
    { credit: 120, seconds: 86400, download: "10 MB", upload: "10 MB", voucher: "UNIFI120" },
    { credit: 840, seconds: 604800, download: "10 MB", upload: "10 MB", voucher: "UNIFI840" }
  ];
  var VOUCHERS = {};

  RATE_PLANS.forEach(function (plan) {
    VOUCHERS[plan.voucher] = plan;
  });

  var elements = {
    displayBox: document.getElementById("displayBox"),
    displayEyebrow: document.getElementById("displayEyebrow"),
    statusBox: document.getElementById("statusBox"),
    statusText: document.getElementById("statusText"),
    statusHint: document.getElementById("statusHint"),
    timerText: document.getElementById("timerText"),
    daysText: document.getElementById("daysText"),
    hoursText: document.getElementById("hoursText"),
    minutesText: document.getElementById("minutesText"),
    secondsText: document.getElementById("secondsText"),
    messageText: document.getElementById("messageText"),
    infoText: document.getElementById("infoText"),
    pointsText: document.getElementById("pointsText"),
    creditText: document.getElementById("creditText"),
    coinButton: document.getElementById("coinButton"),
    ratesButton: document.getElementById("ratesButton"),
    voucherButton: document.getElementById("voucherButton"),
    disconnectButton: document.getElementById("disconnectButton"),
    voucherInlineInput: document.getElementById("voucherInlineInput"),
    voucherInlineButton: document.getElementById("voucherInlineButton"),
    voucherError: document.getElementById("voucherError"),
    macText: document.getElementById("macText"),
    ipText: document.getElementById("ipText"),
    bandwidthText: document.getElementById("bandwidthText"),
    uptimeText: document.getElementById("uptimeText"),
    coinModal: document.getElementById("coinModal"),
    closeCoinButton: document.getElementById("closeCoinButton"),
    continueButton: document.getElementById("continueButton"),
    modalLimitText: document.getElementById("modalLimitText"),
    modalText: document.getElementById("modalText"),
    modalCoinText: document.getElementById("modalCoinText"),
    modalCountText: document.getElementById("modalCountText"),
    modalTimeText: document.getElementById("modalTimeText"),
    ratesModal: document.getElementById("ratesModal"),
    closeRatesButton: document.getElementById("closeRatesButton"),
    ratesTableBody: document.getElementById("ratesTableBody")
  };

  if (!elements.coinButton) {
    return;
  }

  var state = {
    seconds: 0,
    paused: false,
    timerId: null,
    macAddress: createMacAddress(),
    clientIp: createClientIp(),
    bandwidthDown: "10 MB",
    bandwidthUp: "10 MB",
    uptimeSeconds: 0,
    totalCreditLoaded: 0,
    flashText: "",
    flashTimer: null,
    ratesModalOpen: false,
    coinModalOpen: false,
    voucherError: "",
    pendingSeconds: 0,
    pendingCredit: 0,
    pendingCoinCount: 0,
    lastCoin: 0,
    coinWindowSeconds: 30,
    coinWindowId: null
  };

  elements.infoText.textContent = defaultRatesText();
  elements.bandwidthText.textContent = state.bandwidthDown + " down / " + state.bandwidthUp + " up";
  elements.macText.textContent = state.macAddress;
  elements.ipText.textContent = state.clientIp;
  elements.uptimeText.textContent = formatHumanDuration(state.uptimeSeconds);
  renderRatesTable();

  elements.coinButton.addEventListener("click", openCoinModal);
  elements.ratesButton.addEventListener("click", openRatesModal);
  elements.voucherButton.addEventListener("click", focusVoucherField);
  elements.disconnectButton.addEventListener("click", togglePauseOrReset);
  elements.closeCoinButton.addEventListener("click", closeCoinModal);
  elements.continueButton.addEventListener("click", continueWithTime);
  elements.closeRatesButton.addEventListener("click", closeRatesModal);
  elements.voucherInlineButton.addEventListener("click", applyVoucher);
  elements.voucherInlineInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      if (typeof window.triggerPortalActionLoading === "function") {
        window.triggerPortalActionLoading(420);
      }

      applyVoucher();
    }
  });

  elements.ratesModal.addEventListener("click", function (event) {
    if (event.target === elements.ratesModal) {
      closeRatesModal();
    }
  });

  elements.coinModal.addEventListener("click", function (event) {
    if (event.target === elements.coinModal) {
      closeCoinModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    if (state.coinModalOpen) {
      closeCoinModal();
      return;
    }

    if (state.ratesModalOpen) {
      closeRatesModal();
    }
  });

  bindExternalCoinHooks();
  render();

  function renderRatesTable() {
    elements.ratesTableBody.innerHTML = RATE_PLANS.map(function (plan) {
      return [
        "<tr>",
        "  <td>" + formatPeso(plan.credit) + "</td>",
        "  <td>" + escapeHtml(formatHumanDuration(plan.seconds)) + "</td>",
        "  <td>" + escapeHtml(plan.download) + "</td>",
        "  <td>" + escapeHtml(plan.upload) + "</td>",
        "</tr>"
      ].join("");
    }).join("");
  }

  function openCoinModal() {
    state.coinModalOpen = true;
    state.ratesModalOpen = false;
    resetPendingCoinState();
    startCoinWindow();
    render();
  }

  function closeCoinModal() {
    if (state.pendingSeconds > 0) {
      continueWithTime();
      return;
    }

    state.coinModalOpen = false;
    stopCoinWindow();
    resetPendingCoinState();
    render();
  }

  function continueWithTime() {
    var addedSeconds = state.pendingSeconds;
    var addedCredit = state.pendingCredit;
    var hadSession = state.seconds > 0;

    if (addedSeconds <= 0) {
      closeCoinModal();
      return;
    }

    state.seconds += addedSeconds;
    state.totalCreditLoaded += addedCredit;
    state.paused = false;
    state.voucherError = "";
    elements.voucherInlineInput.value = "";
    elements.infoText.textContent =
      (hadSession ? "Session extended: " : "Credit loaded: ") +
      formatPeso(addedCredit) +
      " for " +
      formatHumanDuration(addedSeconds) +
      ".";

    showFlashMessage(
      (hadSession ? "Session extended: " : "Credit loaded: ") +
        formatPeso(addedCredit) +
        " | " +
        formatHumanDuration(addedSeconds)
    );
    pulseDisplay();
    startTimer();

    state.coinModalOpen = false;
    stopCoinWindow();
    resetPendingCoinState();
    render();
  }

  function startCoinWindow() {
    stopCoinWindow();
    state.coinWindowSeconds = 30;
    state.coinWindowId = window.setInterval(function () {
      if (!state.coinModalOpen) {
        stopCoinWindow();
        return;
      }

      if (state.coinWindowSeconds > 0) {
        state.coinWindowSeconds -= 1;
      }

      if (state.coinWindowSeconds <= 0) {
        state.coinWindowSeconds = 0;

        if (state.pendingSeconds > 0) {
          continueWithTime();
          return;
        }

        closeCoinModal();
        return;
      }

      render();
    }, 1000);
  }

  function stopCoinWindow() {
    if (state.coinWindowId !== null) {
      window.clearInterval(state.coinWindowId);
      state.coinWindowId = null;
    }
  }

  function resetPendingCoinState() {
    state.pendingSeconds = 0;
    state.pendingCredit = 0;
    state.pendingCoinCount = 0;
    state.lastCoin = 0;
    state.coinWindowSeconds = 30;
  }

  function openRatesModal() {
    state.ratesModalOpen = true;

    if (state.coinModalOpen) {
      state.coinModalOpen = false;
      stopCoinWindow();
      resetPendingCoinState();
    }

    render();
  }

  function closeRatesModal() {
    state.ratesModalOpen = false;
    render();
  }

  function focusVoucherField() {
    elements.voucherInlineInput.focus();
    elements.voucherInlineInput.select();

    if (typeof elements.voucherInlineInput.scrollIntoView === "function") {
      elements.voucherInlineInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function applyVoucher() {
    var code = elements.voucherInlineInput.value.replace(/\s+/g, "").toUpperCase();
    var plan = VOUCHERS[code];

    if (!plan) {
      state.voucherError = "Invalid voucher code.";
      render();
      return;
    }

    state.seconds += plan.seconds;
    state.totalCreditLoaded += plan.credit;
    state.paused = false;
    state.voucherError = "";
    elements.voucherInlineInput.value = "";
    elements.infoText.textContent =
      "Voucher " + code + " loaded for " + formatHumanDuration(plan.seconds) + ".";

    showFlashMessage("Voucher accepted: " + code);
    pulseDisplay();
    startTimer();
    render();
  }

  function togglePauseOrReset() {
    if (state.seconds <= 0) {
      resetPortal();
      return;
    }

    state.paused = !state.paused;

    if (state.paused) {
      stopTimer();
      elements.infoText.textContent = "Session paused. Tap Resume to continue.";
      showFlashMessage("Session paused");
    } else {
      startTimer();
      elements.infoText.textContent =
        "Session resumed with " + formatHumanDuration(state.seconds) + " remaining.";
      showFlashMessage("Session resumed");
    }

    render();
  }

  function resetPortal() {
    state.seconds = 0;
    state.paused = false;
    state.totalCreditLoaded = 0;
    state.uptimeSeconds = 0;
    state.voucherError = "";
    state.flashText = "";
    state.ratesModalOpen = false;
    state.coinModalOpen = false;
    state.macAddress = createMacAddress();
    state.clientIp = createClientIp();
    elements.voucherInlineInput.value = "";
    elements.infoText.textContent = defaultRatesText();
    stopTimer();
    stopCoinWindow();
    resetPendingCoinState();
    render();
  }

  function startTimer() {
    if (state.timerId !== null || state.paused || state.seconds <= 0) {
      return;
    }

    state.timerId = window.setInterval(function () {
      if (state.seconds > 0 && !state.paused) {
        state.seconds -= 1;
        state.uptimeSeconds += 1;
      }

      if (state.seconds <= 0) {
        state.seconds = 0;
        state.paused = false;
        stopTimer();
        elements.infoText.textContent = defaultRatesText();
        showFlashMessage("Session ended");
      }

      render();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function render() {
    var hasSession = state.seconds > 0;
    var isActive = hasSession && !state.paused;
    var parts = splitDuration(state.seconds);

    elements.statusText.textContent = hasSession ? (state.paused ? "PAUSED" : "CONNECTED") : "WAITING";
    elements.statusHint.textContent = hasSession
      ? state.paused
        ? "Session on hold"
        : "Signal locked"
      : "Ready for access";
    elements.displayEyebrow.textContent = hasSession
      ? state.paused
        ? "Paused Session"
        : "Current Session"
      : "Ready to Connect";
    elements.timerText.textContent = formatClock(state.seconds);
    elements.daysText.textContent = pad(parts.days);
    elements.hoursText.textContent = pad(parts.hours);
    elements.minutesText.textContent = pad(parts.minutes);
    elements.secondsText.textContent = pad(parts.seconds);
    elements.messageText.textContent = state.flashText || defaultMessage(hasSession, state.paused);
    elements.messageText.classList.toggle("is-flash", state.flashText !== "");
    elements.macText.textContent = state.macAddress;
    elements.ipText.textContent = state.clientIp;
    elements.bandwidthText.textContent = state.bandwidthDown + " down / " + state.bandwidthUp + " up";
    elements.uptimeText.textContent = formatHumanDuration(state.uptimeSeconds);
    elements.creditText.textContent = formatPeso(state.totalCreditLoaded);
    elements.pointsText.textContent = formatPoints(calculatePoints());
    elements.coinButton.textContent = hasSession ? "Extend Time" : "Insert Coin";
    elements.disconnectButton.textContent = hasSession ? (state.paused ? "Resume" : "Pause") : "Reset Portal";
    elements.voucherError.textContent = state.voucherError;
    elements.statusBox.classList.toggle("is-connected", isActive);
    elements.statusBox.classList.toggle("is-paused", hasSession && state.paused);
    elements.coinModal.classList.toggle("is-open", state.coinModalOpen);
    elements.coinModal.setAttribute("aria-hidden", state.coinModalOpen ? "false" : "true");
    elements.ratesModal.classList.toggle("is-open", state.ratesModalOpen);
    elements.ratesModal.setAttribute("aria-hidden", state.ratesModalOpen ? "false" : "true");
    elements.continueButton.disabled = state.pendingSeconds <= 0;
    elements.modalText.textContent = state.pendingSeconds > 0
      ? "Coin detected. Press Continue to load it into the session."
      : "Waiting for coin input from the vendo...";
    elements.modalCoinText.textContent = "Pending credit: " + formatPeso(state.pendingCredit);
    elements.modalCountText.textContent = state.pendingSeconds > 0
      ? "Detected " +
        state.pendingCoinCount +
        " coin" +
        (state.pendingCoinCount === 1 ? "" : "s") +
        " | Latest " +
        formatPeso(state.lastCoin)
      : "No coin detected yet.";
    elements.modalTimeText.textContent = state.pendingSeconds > 0 ? formatHumanDuration(state.pendingSeconds) : "Waiting";
    elements.modalLimitText.textContent =
      "Insert time left: " + pad(Math.floor(state.coinWindowSeconds / 60)) + ":" + pad(state.coinWindowSeconds % 60);
  }

  function bindExternalCoinHooks() {
    window.portalOpenCoinModal = openCoinModal;
    window.portalCloseCoinModal = closeCoinModal;
    window.portalInsertCoin = handleExternalCoinInsert;

    window.addEventListener("portal-coin-inserted", function (event) {
      handleExternalCoinInsert(event.detail);
    });
  }

  function handleExternalCoinInsert(detail) {
    var plan = resolveCoinPlan(detail);

    if (!plan) {
      return false;
    }

    if (!state.coinModalOpen) {
      state.coinModalOpen = true;
      state.ratesModalOpen = false;
      resetPendingCoinState();
      startCoinWindow();
    }

    state.pendingSeconds += plan.seconds;
    state.pendingCredit += plan.credit;
    state.pendingCoinCount += 1;
    state.lastCoin = plan.credit;
    render();
    return true;
  }

  function resolveCoinPlan(detail) {
    var creditValue = 0;
    var secondsValue = 0;
    var matchedPlan = null;

    if (typeof detail === "number") {
      creditValue = detail;
    } else if (typeof detail === "string") {
      creditValue = Number(detail);
    } else if (detail && typeof detail === "object") {
      if (detail.credit !== undefined) {
        creditValue = Number(detail.credit);
      } else if (detail.amount !== undefined) {
        creditValue = Number(detail.amount);
      } else if (detail.value !== undefined) {
        creditValue = Number(detail.value);
      }

      if (detail.seconds !== undefined) {
        secondsValue = Number(detail.seconds);
      }
    }

    matchedPlan = findRatePlanByCredit(creditValue);

    if (!secondsValue && matchedPlan) {
      secondsValue = matchedPlan.seconds;
    }

    if ((!creditValue || creditValue <= 0) && matchedPlan) {
      creditValue = matchedPlan.credit;
    }

    if (creditValue > 0 && secondsValue > 0) {
      return {
        credit: creditValue,
        seconds: secondsValue
      };
    }

    return null;
  }

  function findRatePlanByCredit(creditValue) {
    var index;

    for (index = 0; index < RATE_PLANS.length; index += 1) {
      if (Number(RATE_PLANS[index].credit) === Number(creditValue)) {
        return RATE_PLANS[index];
      }
    }

    return null;
  }

  function showFlashMessage(text) {
    state.flashText = text;

    if (state.flashTimer !== null) {
      window.clearTimeout(state.flashTimer);
    }

    state.flashTimer = window.setTimeout(function () {
      state.flashText = "";
      render();
    }, 1400);
  }

  function pulseDisplay() {
    elements.displayBox.classList.remove("coin-pop");
    void elements.displayBox.offsetWidth;
    elements.displayBox.classList.add("coin-pop");
  }

  function defaultMessage(hasSession, isPaused) {
    if (!hasSession) {
      return "Insert coin or redeem a code to connect.";
    }

    if (isPaused) {
      return "Session paused. Tap Resume when you are ready.";
    }

    return "Session active. Extend time or redeem another code.";
  }

  function defaultRatesText() {
    return "WiFi Rates: " + RATE_PLANS.map(function (plan) {
      return formatPeso(plan.credit) + " = " + formatShortDuration(plan.seconds);
    }).join(", ");
  }

  function calculatePoints() {
    return state.totalCreditLoaded * 0.12 + state.uptimeSeconds / 3600 * 0.2;
  }

  function splitDuration(totalSeconds) {
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
  }

  function formatClock(totalSeconds) {
    var parts = splitDuration(totalSeconds);
    return pad(parts.hours) + ":" + pad(parts.minutes) + ":" + pad(parts.seconds);
  }

  function formatHumanDuration(totalSeconds) {
    var parts = splitDuration(totalSeconds);
    var output = [];

    if (parts.days > 0) {
      output.push(parts.days + "d");
    }

    output.push(parts.hours + "h");
    output.push(parts.minutes + "m");
    output.push(parts.seconds + "s");

    return output.join(" ");
  }

  function formatShortDuration(totalSeconds) {
    var parts = splitDuration(totalSeconds);
    var output = [];

    if (parts.days > 0) {
      output.push(parts.days + "d");
    }

    if (parts.hours > 0) {
      output.push(parts.hours + "h");
    }

    if (parts.minutes > 0 && parts.days === 0) {
      output.push(parts.minutes + "m");
    }

    return output.join(" ");
  }

  function formatPeso(value) {
    return "\u20B1" + Number(value).toFixed(2);
  }

  function formatPoints(value) {
    return Number(value).toFixed(2);
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function createMacAddress() {
    var parts = [];
    var index;

    for (index = 0; index < 6; index += 1) {
      parts.push(Math.floor(Math.random() * 256).toString(16).padStart(2, "0"));
    }

    return parts.join(":");
  }

  function createClientIp() {
    return "10.0.0." + Math.floor(Math.random() * 200 + 20);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}());
