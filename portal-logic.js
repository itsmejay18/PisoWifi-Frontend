(function () {
  var RATE_PLANS = [
    { credit: 5, seconds: 3600, download: "10 MB", upload: "10 MB", voucher: "UNIFI5" },
    { credit: 10, seconds: 7200, download: "10 MB", upload: "10 MB", voucher: "UNIFI10" },
    { credit: 25, seconds: 18000, download: "10 MB", upload: "10 MB", voucher: "UNIFI25" },
    { credit: 50, seconds: 36000, download: "10 MB", upload: "10 MB", voucher: "UNIFI50" },
    { credit: 120, seconds: 86400, download: "10 MB", upload: "10 MB", voucher: "UNIFI120" },
    { credit: 840, seconds: 604800, download: "10 MB", upload: "10 MB", voucher: "UNIFI840" }
  ];
  var RATES = {};
  var VOUCHERS = {};
  var COINS = [];

  RATE_PLANS.forEach(function (plan) {
    RATES[plan.credit] = plan.seconds;
    VOUCHERS[plan.voucher] = plan.seconds;
    COINS.push(plan.credit);
  });

  var elements = {
    displayBox: document.getElementById("displayBox"),
    statusBox: document.getElementById("statusBox"),
    statusText: document.getElementById("statusText"),
    timerText: document.getElementById("timerText"),
    messageText: document.getElementById("messageText"),
    infoText: document.getElementById("infoText"),
    coinButton: document.getElementById("coinButton"),
    ratesButton: document.getElementById("ratesButton"),
    voucherButton: document.getElementById("voucherButton"),
    disconnectButton: document.getElementById("disconnectButton"),
    macText: document.getElementById("macText"),
    ipText: document.getElementById("ipText"),
    bandwidthText: document.getElementById("bandwidthText"),
    uptimeText: document.getElementById("uptimeText"),
    ratesModal: document.getElementById("ratesModal"),
    closeRatesButton: document.getElementById("closeRatesButton"),
    ratesTableBody: document.getElementById("ratesTableBody"),
    coinModal: document.getElementById("coinModal"),
    continueButton: document.getElementById("continueButton"),
    modalLimitText: document.getElementById("modalLimitText"),
    modalText: document.getElementById("modalText"),
    voucherModal: document.getElementById("voucherModal"),
    voucherInput: document.getElementById("voucherInput"),
    voucherError: document.getElementById("voucherError"),
    useVoucherButton: document.getElementById("useVoucherButton"),
    closeVoucherButton: document.getElementById("closeVoucherButton")
  };

  if (!elements.coinButton) {
    return;
  }

  var state = {
    seconds: 0,
    timerId: null,
    macAddress: createMacAddress(),
    clientIp: createClientIp(),
    bandwidthDown: "10 MB",
    bandwidthUp: "10 MB",
    uptimeSeconds: 0,
    flashText: "",
    flashTimer: null,
    ratesModalOpen: false,
    coinModalOpen: false,
    voucherModalOpen: false,
    pendingSeconds: 0,
    pendingPeso: 0,
    lastCoin: 0,
    pendingCoinCount: 0,
    voucherError: "",
    coinWindowSeconds: 30,
    coinWindowId: null,
    audioContext: null
  };

  elements.macText.textContent = state.macAddress;
  elements.ipText.textContent = state.clientIp;
  elements.bandwidthText.textContent = state.bandwidthDown + " \u2193 / " + state.bandwidthUp + " \u2191";
  elements.uptimeText.textContent = formatHumanDuration(state.uptimeSeconds);
  renderRatesTable();

  elements.coinButton.addEventListener("click", openCoinModal);
  elements.ratesButton.addEventListener("click", openRatesModal);
  elements.voucherButton.addEventListener("click", openVoucherModal);
  elements.disconnectButton.addEventListener("click", disconnectSession);
  elements.closeRatesButton.addEventListener("click", closeRatesModal);
  elements.continueButton.addEventListener("click", continueWithTime);
  elements.useVoucherButton.addEventListener("click", applyVoucher);
  elements.closeVoucherButton.addEventListener("click", closeVoucherModal);
  elements.voucherInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      if (typeof window.triggerPortalActionLoading === "function") {
        window.triggerPortalActionLoading(420);
      }

      applyVoucher();
    }
  });

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

  function openRatesModal() {
    state.ratesModalOpen = true;
    state.coinModalOpen = false;
    state.voucherModalOpen = false;
    stopCoinWindow();
    render();
  }

  function closeRatesModal() {
    state.ratesModalOpen = false;
    render();
  }

  function openCoinModal() {
    state.coinModalOpen = true;
    state.ratesModalOpen = false;
    state.voucherModalOpen = false;
    resetPendingCoinState();
    prepareAudio();
    startCoinWindow();
    render();
  }

  function closeCoinModal() {
    state.coinModalOpen = false;
    stopCoinWindow();
    render();
  }

  function openVoucherModal() {
    state.voucherModalOpen = true;
    state.coinModalOpen = false;
    state.ratesModalOpen = false;
    stopCoinWindow();
    state.voucherError = "";
    elements.voucherInput.value = "";
    render();
    elements.voucherInput.focus();
  }

  function closeVoucherModal() {
    state.voucherModalOpen = false;
    state.voucherError = "";
    elements.voucherInput.value = "";
    render();
  }

  function simulateCoinInsert() {
    if (state.coinWindowSeconds <= 0) {
      return;
    }

    var coin = COINS[Math.floor(Math.random() * COINS.length)];
    var addedSeconds = RATES[coin];
    state.pendingSeconds += addedSeconds;
    state.pendingPeso += coin;
    state.lastCoin = coin;
    state.pendingCoinCount += 1;
    render();
  }

  function continueWithTime() {
    if (state.pendingSeconds > 0) {
      state.seconds += state.pendingSeconds;
      showFlashMessage("Credit loaded: " + formatPeso(state.pendingPeso));
      elements.infoText.textContent = "Credit loaded: " + formatPeso(state.pendingPeso) + " - " + formatHumanDuration(state.pendingSeconds);
      pulseDisplay();
      startTimer();
    }

    resetPendingCoinState();
    closeCoinModal();
  }

  function resetPendingCoinState() {
    state.pendingSeconds = 0;
    state.pendingPeso = 0;
    state.lastCoin = 0;
    state.pendingCoinCount = 0;
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
        playCountdownTick(state.coinWindowSeconds);
      }

      if (state.coinWindowSeconds <= 0) {
        state.coinWindowSeconds = 0;
        stopCoinWindow();

        if (state.pendingSeconds > 0) {
          continueWithTime();
          return;
        }

        closeCoinModal();
        render();
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

  function applyVoucher() {
    var code = elements.voucherInput.value.replace(/\s+/g, "").toUpperCase();
    var voucherSeconds = VOUCHERS[code];

    if (!voucherSeconds) {
      state.voucherError = "Invalid voucher code.";
      render();
      return;
    }

    state.seconds += voucherSeconds;
    state.voucherError = "";
    elements.infoText.textContent = "Voucher loaded: " + code + " - " + formatHumanDuration(voucherSeconds);
    showFlashMessage("Voucher accepted: " + code);
    pulseDisplay();
    startTimer();
    closeVoucherModal();
  }

  function disconnectSession() {
    state.seconds = 0;
    state.uptimeSeconds = 0;
    stopTimer();

    if (state.flashTimer !== null) {
      window.clearTimeout(state.flashTimer);
    }

    state.macAddress = createMacAddress();
    state.clientIp = createClientIp();
    elements.macText.textContent = state.macAddress;
    elements.ipText.textContent = state.clientIp;
    elements.infoText.textContent = defaultRatesText();
    state.flashText = "";
    state.voucherError = "";
    elements.voucherInput.value = "";
    resetPendingCoinState();
    closeRatesModal();
    closeCoinModal();
    closeVoucherModal();
    render();
  }

  function startTimer() {
    if (state.timerId !== null) {
      return;
    }

    state.timerId = window.setInterval(function () {
      if (state.seconds > 0) {
        state.seconds -= 1;
        state.uptimeSeconds += 1;
      }

      if (state.seconds <= 0) {
        state.seconds = 0;
        stopTimer();
        elements.infoText.textContent = defaultRatesText();
        state.flashText = "";
        closeRatesModal();
        closeCoinModal();
        closeVoucherModal();
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
    var connected = state.seconds > 0;
    var message = state.flashText || (connected ? "Internet access is active" : "Tap Insert Coin or use Voucher");

    elements.statusText.textContent = connected ? "CONNECTED" : "WAITING";
    elements.timerText.textContent = formatTime(state.seconds);
    elements.messageText.textContent = message;
    elements.macText.textContent = state.macAddress;
    elements.ipText.textContent = state.clientIp;
    elements.bandwidthText.textContent = state.bandwidthDown + " \u2193 / " + state.bandwidthUp + " \u2191";
    elements.uptimeText.textContent = formatHumanDuration(state.uptimeSeconds);
    elements.statusBox.classList.toggle("is-connected", connected);
    elements.disconnectButton.disabled = !connected;
    elements.ratesModal.classList.toggle("is-open", state.ratesModalOpen);
    elements.ratesModal.setAttribute("aria-hidden", state.ratesModalOpen ? "false" : "true");
    elements.coinModal.classList.toggle("is-open", state.coinModalOpen);
    elements.coinModal.setAttribute("aria-hidden", state.coinModalOpen ? "false" : "true");
    elements.voucherModal.classList.toggle("is-open", state.voucherModalOpen);
    elements.voucherModal.setAttribute("aria-hidden", state.voucherModalOpen ? "false" : "true");
    elements.modalLimitText.textContent = "Insert time left: " + pad(Math.floor(state.coinWindowSeconds / 60)) + ":" + pad(state.coinWindowSeconds % 60);
    elements.modalText.textContent = state.pendingSeconds > 0
      ? "Detected inserted credit. Press Done to continue."
      : "Waiting for inserted credit...";
    elements.voucherError.textContent = state.voucherError;
  }

  function showFlashMessage(text) {
    state.flashText = text;

    if (state.flashTimer !== null) {
      window.clearTimeout(state.flashTimer);
    }

    elements.messageText.classList.remove("is-flash");
    void elements.messageText.offsetWidth;
    elements.messageText.classList.add("is-flash");

    state.flashTimer = window.setTimeout(function () {
      state.flashText = "";
      render();
    }, 900);
  }

  function pulseDisplay() {
    elements.displayBox.classList.remove("coin-pop");
    void elements.displayBox.offsetWidth;
    elements.displayBox.classList.add("coin-pop");
  }

  function prepareAudio() {
    var AudioContextRef = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextRef) {
      return;
    }

    if (!state.audioContext) {
      state.audioContext = new AudioContextRef();
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }
  }

  function playCountdownTick(remainingSeconds) {
    if (remainingSeconds < 0) {
      return;
    }

    prepareAudio();

    if (!state.audioContext) {
      return;
    }

    var ctx = state.audioContext;
    var now = ctx.currentTime;
    var urgent = remainingSeconds <= 5;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(urgent ? 0.22 : 0.11, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (urgent ? 0.22 : 0.14));
    gain.connect(ctx.destination);

    var tone = ctx.createOscillator();
    tone.type = urgent ? "square" : "sine";
    tone.frequency.setValueAtTime(urgent ? 1320 : 920, now);
    tone.frequency.exponentialRampToValueAtTime(urgent ? 1080 : 760, now + (urgent ? 0.12 : 0.08));
    tone.connect(gain);
    tone.start(now);
    tone.stop(now + (urgent ? 0.14 : 0.1));
  }

  function defaultRatesText() {
    return "WiFi Rates: " + RATE_PLANS.map(function (plan) {
      return formatPeso(plan.credit) + " = " + formatShortDuration(plan.seconds);
    }).join(", ");
  }

  function formatTime(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  }

  function formatHumanDuration(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    return hours + "h " + minutes + "m " + seconds + "s";
  }

  function formatShortDuration(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    return hours + "h";
  }

  function formatPeso(value) {
    return "\u20B1" + value;
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
