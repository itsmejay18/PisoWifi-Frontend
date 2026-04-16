(function () {
  var RATES = {
    1: 300,
    5: 1800,
    10: 3600
  };
  var VOUCHERS = {
    WIFI5: 300,
    WIFI30: 1800,
    WIFI60: 3600
  };
  var COINS = [1, 5, 10];

  var elements = {
    displayBox: document.getElementById("displayBox"),
    statusBox: document.getElementById("statusBox"),
    statusText: document.getElementById("statusText"),
    timerText: document.getElementById("timerText"),
    messageText: document.getElementById("messageText"),
    infoText: document.getElementById("infoText"),
    coinButton: document.getElementById("coinButton"),
    voucherButton: document.getElementById("voucherButton"),
    disconnectButton: document.getElementById("disconnectButton"),
    ipText: document.getElementById("ipText"),
    sessionText: document.getElementById("sessionText"),
    coinModal: document.getElementById("coinModal"),
    simulateCoinButton: document.getElementById("simulateCoinButton"),
    continueButton: document.getElementById("continueButton"),
    modalCoinText: document.getElementById("modalCoinText"),
    modalCountText: document.getElementById("modalCountText"),
    modalLimitText: document.getElementById("modalLimitText"),
    modalText: document.getElementById("modalText"),
    modalTimeText: document.getElementById("modalTimeText"),
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
    sessionId: createSessionId(),
    flashText: "",
    flashTimer: null,
    modalOpen: false,
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

  elements.ipText.textContent = "10.0.0.1";
  elements.sessionText.textContent = state.sessionId;

  elements.coinButton.addEventListener("click", openCoinModal);
  elements.voucherButton.addEventListener("click", openVoucherModal);
  elements.disconnectButton.addEventListener("click", disconnectSession);
  elements.simulateCoinButton.addEventListener("click", simulateCoinInsert);
  elements.continueButton.addEventListener("click", continueWithTime);
  elements.useVoucherButton.addEventListener("click", applyVoucher);
  elements.closeVoucherButton.addEventListener("click", closeVoucherModal);
  elements.voucherInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      applyVoucher();
    }
  });

  render();

  function openCoinModal() {
    state.modalOpen = true;
    state.voucherModalOpen = false;
    prepareAudio();
    startCoinWindow();
    render();
  }

  function closeCoinModal() {
    state.modalOpen = false;
    stopCoinWindow();
    render();
  }

  function openVoucherModal() {
    state.voucherModalOpen = true;
    state.modalOpen = false;
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
      showFlashMessage("Time loaded: " + formatMinutes(state.pendingSeconds));
      elements.infoText.textContent = "Coins inserted: " + "\u20B1" + state.pendingPeso + " - Added " + formatMinutes(state.pendingSeconds);
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
      if (!state.modalOpen) {
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
    elements.infoText.textContent = "Voucher loaded: " + code + " - Added " + formatMinutes(voucherSeconds);
    showFlashMessage("Voucher accepted: " + formatMinutes(voucherSeconds));
    pulseDisplay();
    startTimer();
    closeVoucherModal();
  }

  function disconnectSession() {
    state.seconds = 0;
    stopTimer();

    if (state.flashTimer !== null) {
      window.clearTimeout(state.flashTimer);
    }

    state.sessionId = createSessionId();
    elements.sessionText.textContent = state.sessionId;
    elements.infoText.textContent = defaultRatesText();
    state.flashText = "";
    state.voucherError = "";
    elements.voucherInput.value = "";
    resetPendingCoinState();
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
      }

      if (state.seconds <= 0) {
        state.seconds = 0;
        stopTimer();
        elements.infoText.textContent = defaultRatesText();
        state.flashText = "";
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
    var message = state.flashText || (connected ? "Internet access is active" : "Tap Insert Coin to add time");

    elements.statusText.textContent = connected ? "CONNECTED" : "WAITING";
    elements.timerText.textContent = formatTime(state.seconds);
    elements.messageText.textContent = message;
    elements.statusBox.classList.toggle("is-connected", connected);
    elements.disconnectButton.disabled = !connected;
    elements.coinModal.classList.toggle("is-open", state.modalOpen);
    elements.coinModal.setAttribute("aria-hidden", state.modalOpen ? "false" : "true");
    elements.voucherModal.classList.toggle("is-open", state.voucherModalOpen);
    elements.voucherModal.setAttribute("aria-hidden", state.voucherModalOpen ? "false" : "true");
    elements.modalTimeText.textContent = formatTime(state.pendingSeconds);
    elements.modalLimitText.textContent = "Insert time left: " + pad(Math.floor(state.coinWindowSeconds / 60)) + ":" + pad(state.coinWindowSeconds % 60);
    elements.modalText.textContent = state.pendingSeconds > 0
      ? "You can insert more coins or continue with the loaded time."
      : "Press Insert Coin to simulate a coin insertion event.";
    elements.modalCoinText.textContent = state.pendingSeconds > 0
      ? "Pending credit: " + "\u20B1" + state.pendingPeso + (state.lastCoin ? " - Last coin: " + "\u20B1" + state.lastCoin : "")
      : "No coin detected yet.";
    elements.modalCountText.textContent = "Coins inserted: " + state.pendingCoinCount;
    elements.voucherError.textContent = state.voucherError;
    elements.simulateCoinButton.disabled = state.coinWindowSeconds <= 0;
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
    return "WiFi Rates: " + "\u20B1" + "1 = 5 mins, " + "\u20B1" + "5 = 30 mins, " + "\u20B1" + "10 = 60 mins";
  }

  function formatTime(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  }

  function formatMinutes(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    return minutes + (minutes === 1 ? " minute" : " minutes");
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function createSessionId() {
    return "PWF-" + Math.floor(Math.random() * 900000 + 100000);
  }
}());
