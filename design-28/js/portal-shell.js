document.body.classList.add("portal-page", "portal-page--loading");

var PORTAL_LOADER_DURATION_MS = 3000;
var portalLoadingStartedAt = Date.now();
var portalLoaderHideTimeout = null;

function hidePortalLoader() {
  var loader = document.getElementById("appLoader");

  document.body.classList.remove("portal-page--loading");

  if (!loader || loader.dataset.hidden === "true") {
    return;
  }

  loader.dataset.hidden = "true";
  loader.classList.add("app-loader--hidden");
}

function showPortalLoader(durationMs) {
  var loader = document.getElementById("appLoader");

  if (!loader) {
    return;
  }

  if (portalLoaderHideTimeout !== null) {
    window.clearTimeout(portalLoaderHideTimeout);
    portalLoaderHideTimeout = null;
  }

  loader.dataset.hidden = "false";
  loader.classList.remove("app-loader--hidden");
  document.body.classList.add("portal-page--loading");

  if (durationMs === 0) {
    return;
  }

  portalLoaderHideTimeout = window.setTimeout(function () {
    portalLoaderHideTimeout = null;
    hidePortalLoader();
  }, typeof durationMs === "number" ? durationMs : PORTAL_LOADER_DURATION_MS);
}

function finishPortalLoading() {
  hidePortalLoader();
}

function schedulePortalLoadingFinish() {
  var remainingDelay = Math.max(0, PORTAL_LOADER_DURATION_MS - (Date.now() - portalLoadingStartedAt));

  window.setTimeout(finishPortalLoading, remainingDelay);
}

window.triggerPortalActionLoading = showPortalLoader;

if (document.readyState === "complete") {
  schedulePortalLoadingFinish();
} else {
  window.addEventListener("load", schedulePortalLoadingFinish, { once: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

if (!document.getElementById("coinButton")) {
  var config = {
    machineLabel: document.body.dataset.machineLabel || "UniFi hotspot portal",
    brandTitle: document.body.dataset.brandTitle || "UniFi",
    brandSubtitle: document.body.dataset.brandSubtitle || "Hotspot Internet Access",
    logoSrc: document.body.dataset.logoSrc || "assets/unifi96.png",
    logoAlt: document.body.dataset.logoAlt || "UniFi logo",
    badgeText: document.body.dataset.badgeText || "",
    coinTitle: document.body.dataset.coinTitle || "Insert Credit",
    coinCopy:
      document.body.dataset.coinCopy ||
      "Waiting for coin input from the vendo. Insert a coin on the machine, then continue once credit is detected.",
    ratesTitle: document.body.dataset.ratesTitle || "WiFi Rates",
    ratesCopy: document.body.dataset.ratesCopy || "Available hotspot rates and included limits.",
    voucherTitle: document.body.dataset.voucherTitle || "Voucher",
    voucherPlaceholder: document.body.dataset.voucherPlaceholder || "Enter voucher code",
    insertLabel: document.body.dataset.insertLabel || "Insert Coin",
    ratesLabel: document.body.dataset.ratesLabel || "WiFi Rates",
    voucherLabel: document.body.dataset.voucherLabel || "Redeem",
    disconnectLabel: document.body.dataset.disconnectLabel || "Pause",
    continueLabel: document.body.dataset.continueLabel || "Continue",
    backLabel: document.body.dataset.backLabel || "Close",
    voucherFieldLabel: document.body.dataset.voucherFieldLabel || "Voucher Code",
    heroHeadline: document.body.dataset.heroHeadline || "Detailed WiFi Portal",
    heroCopy:
      document.body.dataset.heroCopy ||
      "Insert coins, extend your session, or redeem a code from one focused control deck."
  };
  var badgeMarkup = config.logoSrc
    ? '<img class="brand__logo-img" src="' + escapeHtml(config.logoSrc) + '" alt="' + escapeHtml(config.logoAlt) + '">'
    : config.badgeText
    ? '<span class="brand__mark-text">' + escapeHtml(config.badgeText) + "</span>"
    : [
        '<svg width="42" height="42" viewBox="0 0 40 40" fill="none">',
        '  <path d="M9 18C15.2 12.7 24.8 12.7 31 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
        '  <path d="M13.5 23C17.4 19.7 22.6 19.7 26.5 23" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
        '  <path d="M18.2 28C19.3 27.2 20.7 27.2 21.8 28" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
        '  <circle cx="20" cy="31.3" r="2.2" fill="currentColor"/>',
        "</svg>"
      ].join("");
  var loaderLogoMarkup = config.logoSrc
    ? '<img class="app-loader__logo-img" src="' + escapeHtml(config.logoSrc) + '" alt="' + escapeHtml(config.logoAlt) + '">'
    : badgeMarkup;

  document.body.insertAdjacentHTML(
    "beforeend",
    [
      '<div class="app-loader" id="appLoader" aria-hidden="true">',
      '  <div class="app-loader__inner">',
      '    <div class="app-loader__logo">',
      "      " + loaderLogoMarkup,
      "    </div>",
      '    <div class="app-loader__spinner" aria-hidden="true"></div>',
      '    <div class="app-loader__text">Loading...</div>',
      "  </div>",
      "</div>",
      '<div class="portal-stage" id="portalStage">',
      '<main class="machine" aria-label="' + escapeHtml(config.machineLabel) + '">',
      '  <section class="machine__top">',
      '    <div class="hero-hud">',
      '      <span class="hero-hud__pill">Premium Hotspot</span>',
      '      <span class="hero-hud__pill hero-hud__pill--accent">Design 21-40</span>',
      "    </div>",
      '    <div class="brand">',
      '      <div class="brand__badge" aria-hidden="true">',
      "        " + badgeMarkup,
      "      </div>",
      '      <div class="brand__text">',
      '        <h1 class="brand__title">' + escapeHtml(config.brandTitle) + "</h1>",
      '        <p class="brand__subtitle">' + escapeHtml(config.brandSubtitle) + "</p>",
      "      </div>",
      "    </div>",
      '    <div class="hero-banner">',
      '      <p class="hero-banner__eyebrow">' + escapeHtml(config.machineLabel) + "</p>",
      '      <h2 class="hero-banner__title">' + escapeHtml(config.heroHeadline) + "</h2>",
      '      <p class="hero-banner__copy">' + escapeHtml(config.heroCopy) + "</p>",
      "    </div>",
      '    <div class="machine__slot" aria-hidden="true"></div>',
      "  </section>",
      '  <section class="machine__panel">',
      '    <div class="status-bar">',
      '      <div class="status" id="statusBox">',
      '        <span class="status__light" aria-hidden="true"></span>',
      '        <span id="statusText">WAITING</span>',
      "      </div>",
      '      <div class="status-hint" id="statusHint">Ready for access</div>',
      "    </div>",
      '    <div class="identity-rack">',
      '      <div class="identity-card">',
      '        <span>MAC</span>',
      '        <strong id="macText">00:00:00:00:00:00</strong>',
      "      </div>",
      '      <div class="identity-card">',
      '        <span>IP</span>',
      '        <strong id="ipText">10.0.0.1</strong>',
      "      </div>",
      "    </div>",
      '    <div class="session-layout">',
      '      <div class="session-display">',
      '        <div class="display" id="displayBox">',
      '          <p class="display__eyebrow" id="displayEyebrow">Ready to Connect</p>',
      '          <p class="timer" id="timerText">00:00:00</p>',
      '          <div class="time-breakdown">',
      '            <div class="time-breakdown__item">',
      '              <strong id="daysText">00</strong>',
      "              <span>Days</span>",
      "            </div>",
      '            <div class="time-breakdown__item">',
      '              <strong id="hoursText">00</strong>',
      "              <span>Hours</span>",
      "            </div>",
      '            <div class="time-breakdown__item">',
      '              <strong id="minutesText">00</strong>',
      "              <span>Minutes</span>",
      "            </div>",
      '            <div class="time-breakdown__item">',
      '              <strong id="secondsText">00</strong>',
      "              <span>Seconds</span>",
      "            </div>",
      "          </div>",
      '          <p class="message" id="messageText">Insert coin or redeem a code to connect.</p>',
      "        </div>",
      '        <div class="metric-grid">',
      '          <div class="metric-card">',
      '            <span>Current Credit</span>',
      '            <strong id="creditText">&#8369;0.00</strong>',
      "          </div>",
      '          <div class="metric-card">',
      '            <span>Total Points</span>',
      '            <strong id="pointsText">0.00</strong>',
      "          </div>",
      '          <div class="metric-card">',
      '            <span>Bandwidth</span>',
      '            <strong id="bandwidthText">10 MB down / 10 MB up</strong>',
      "          </div>",
      '          <div class="metric-card">',
      '            <span>Uptime</span>',
      '            <strong id="uptimeText">0h 0m 0s</strong>',
      "          </div>",
      "        </div>",
      "      </div>",
      '      <div class="action-rail">',
      '        <button class="button button--primary button--coin" id="coinButton" type="button">' + escapeHtml(config.insertLabel) + "</button>",
      '        <button class="button button--secondary button--rail" id="disconnectButton" type="button">' + escapeHtml(config.disconnectLabel) + "</button>",
      '        <button class="button button--secondary button--rail" id="voucherButton" type="button">' + escapeHtml(config.voucherLabel) + "</button>",
      '        <button class="button button--danger button--rail" id="ratesButton" type="button">' + escapeHtml(config.ratesLabel) + "</button>",
      "      </div>",
      "    </div>",
      '    <div class="voucher-strip">',
      '      <label class="voucher-strip__label" for="voucherInlineInput">' + escapeHtml(config.voucherFieldLabel) + "</label>",
      '      <div class="voucher-strip__field">',
      '        <input class="voucher-strip__input" id="voucherInlineInput" type="text" inputmode="text" autocomplete="off" placeholder="' + escapeHtml(config.voucherPlaceholder) + '">',
      '        <button class="button button--primary voucher-strip__button" id="voucherInlineButton" type="button">Submit</button>',
      "      </div>",
      '      <div class="voucher-strip__error" id="voucherError"></div>',
      "    </div>",
      '    <div class="info-box" id="infoText">WiFi Rates: &#8369;5.00 = 1h, &#8369;10.00 = 2h, &#8369;25.00 = 5h, &#8369;50.00 = 10h, &#8369;120.00 = 24h, &#8369;840.00 = 168h</div>',
      '    <div class="footer">',
      '      <div class="footer__item">',
      '        <span class="footer__label">Portal</span>',
      '        <span class="footer__value">' + escapeHtml(config.brandTitle) + "</span>",
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">Theme</span>',
      '        <span class="footer__value">' + escapeHtml(config.brandSubtitle) + "</span>",
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">Rates Panel</span>',
      '        <span class="footer__value">' + escapeHtml(config.ratesTitle) + "</span>",
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">Voucher Mode</span>',
      '        <span class="footer__value">' + escapeHtml(config.voucherTitle) + "</span>",
      "      </div>",
      "    </div>",
      '    <div class="machine__copyright">2026 Hotspot Console</div>',
      "  </section>",
      "</main>",
      "</div>",
      '<div class="modal modal--coin" id="coinModal" aria-hidden="true">',
      '  <div class="modal__card modal__card--coin" role="dialog" aria-modal="true" aria-labelledby="coinTitle">',
      '    <h2 class="modal__title" id="coinTitle">' + escapeHtml(config.coinTitle) + "</h2>",
      '    <p class="modal__text" id="modalText">' + escapeHtml(config.coinCopy) + "</p>",
      '    <div class="modal__coin" id="modalCoinText">Pending credit: &#8369;0.00</div>',
      '    <div class="modal__count" id="modalCountText">No coin detected yet.</div>',
      '    <div class="modal__time" id="modalTimeText">Waiting</div>',
      '    <div class="modal__limit" id="modalLimitText">Insert time left: 00:30</div>',
      '    <div class="modal__actions">',
      '      <button class="button button--primary" id="continueButton" type="button">' + escapeHtml(config.continueLabel) + "</button>",
      '      <button class="button button--secondary" id="closeCoinButton" type="button" data-skip-loader="true">' + escapeHtml(config.backLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>",
      '<div class="modal modal--rates" id="ratesModal" aria-hidden="true">',
      '  <div class="modal__card modal__card--rates" role="dialog" aria-modal="true" aria-labelledby="ratesTitle">',
      '    <h2 class="modal__title" id="ratesTitle">' + escapeHtml(config.ratesTitle) + "</h2>",
      '    <p class="modal__text">' + escapeHtml(config.ratesCopy) + "</p>",
      '    <div class="rates-table-wrap">',
      '      <table class="rates-table">',
      "        <thead>",
      "          <tr>",
      "            <th>Credit</th>",
      "            <th>Time</th>",
      "            <th>Download</th>",
      "            <th>Upload</th>",
      "          </tr>",
      "        </thead>",
      '        <tbody id="ratesTableBody"></tbody>',
      "      </table>",
      "    </div>",
      '    <div class="modal__actions">',
      '      <button class="button button--secondary" id="closeRatesButton" type="button" data-skip-loader="true">' + escapeHtml(config.backLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("")
  );

  initializePortalViewportFit();
  registerPortalActionLoading();
}

function initializePortalViewportFit() {
  var stage = document.getElementById("portalStage");
  var machine = stage && stage.querySelector(".machine");

  if (!stage || !machine) {
    return;
  }

  function resetPortalStageLayout() {
    machine.style.transform = "";
    stage.style.width = "100%";
    stage.style.height = "";
    document.body.classList.remove("portal-page--fixed");
  }

  window.addEventListener("resize", resetPortalStageLayout);
  window.addEventListener("orientationchange", resetPortalStageLayout);
  window.addEventListener("load", resetPortalStageLayout);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(resetPortalStageLayout);
  }

  resetPortalStageLayout();
}

function registerPortalActionLoading() {
  if (document.body.dataset.portalActionLoadingBound === "true") {
    return;
  }

  document.body.dataset.portalActionLoadingBound = "true";

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest(".button");

    if (!trigger || trigger.disabled || trigger.dataset.skipLoader === "true") {
      return;
    }

    showPortalLoader(PORTAL_LOADER_DURATION_MS);
  });
}
