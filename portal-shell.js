document.body.classList.add("portal-page");

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
    logoSrc: document.body.dataset.logoSrc || "Sample%20ui/vendosys/public/assets/images/unifi96.png",
    logoAlt: document.body.dataset.logoAlt || "UniFi logo",
    badgeText: document.body.dataset.badgeText || "",
    coinTitle: document.body.dataset.coinTitle || "Insert Credit",
    coinCopy: document.body.dataset.coinCopy || "Insert coin credits, wait for the machine to total them, then continue your session.",
    ratesTitle: document.body.dataset.ratesTitle || "WiFi Rates",
    ratesCopy: document.body.dataset.ratesCopy || "Available hotspot rates and included limits.",
    voucherTitle: document.body.dataset.voucherTitle || "Voucher",
    voucherCopy: document.body.dataset.voucherCopy || "Enter your voucher code to load internet time.",
    insertLabel: document.body.dataset.insertLabel || "Insert Coin",
    ratesLabel: document.body.dataset.ratesLabel || "WiFi Rates",
    voucherLabel: document.body.dataset.voucherLabel || "Voucher",
    disconnectLabel: document.body.dataset.disconnectLabel || "Disconnect",
    continueLabel: document.body.dataset.continueLabel || "Done",
    useVoucherLabel: document.body.dataset.useVoucherLabel || "Use Voucher",
    backLabel: document.body.dataset.backLabel || "Close",
    voucherFieldLabel: document.body.dataset.voucherFieldLabel || "Code",
    voucherPlaceholder: document.body.dataset.voucherPlaceholder || "Enter voucher code",
    voucherHint: document.body.dataset.voucherHint || "Sample codes: UNIFI5, UNIFI10, UNIFI25, UNIFI50, UNIFI120, UNIFI840"
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

  document.body.insertAdjacentHTML(
    "beforeend",
    [
      '<div class="portal-stage" id="portalStage">',
      '<main class="machine" aria-label="' + escapeHtml(config.machineLabel) + '">',
      '  <section class="machine__top">',
      '    <div class="brand">',
      '      <div class="brand__badge" aria-hidden="true">',
      "        " + badgeMarkup,
      "      </div>",
      '      <div class="brand__text">',
      '        <h1 class="brand__title">' + escapeHtml(config.brandTitle) + "</h1>",
      '        <p class="brand__subtitle">' + escapeHtml(config.brandSubtitle) + "</p>",
      "      </div>",
      "    </div>",
      '    <div class="machine__slot" aria-hidden="true"></div>',
      "  </section>",
      '  <section class="machine__panel">',
      '    <div class="display" id="displayBox">',
      '      <div class="status" id="statusBox">',
      '        <span class="status__light" aria-hidden="true"></span>',
      '        <span id="statusText">WAITING</span>',
      "      </div>",
      '      <p class="timer" id="timerText">00:00:00</p>',
      '      <div class="message" id="messageText">Tap Insert Coin to add time</div>',
      "    </div>",
      '    <div class="controls">',
      '      <button class="button button--primary" id="coinButton" type="button">' + escapeHtml(config.insertLabel) + "</button>",
      '      <div class="button-trio">',
      '        <button class="button button--secondary" id="ratesButton" type="button">' + escapeHtml(config.ratesLabel) + "</button>",
      '        <button class="button button--secondary" id="voucherButton" type="button">' + escapeHtml(config.voucherLabel) + "</button>",
      '        <button class="button button--danger" id="disconnectButton" type="button">' + escapeHtml(config.disconnectLabel) + "</button>",
      "      </div>",
      "    </div>",
      '    <div class="info-box" id="infoText">WiFi Rates: &#8369;5 = 1h, &#8369;10 = 2h, &#8369;25 = 5h, &#8369;50 = 10h, &#8369;120 = 24h, &#8369;840 = 168h</div>',
      '    <div class="footer">',
      '      <div class="footer__item">',
      '        <span class="footer__label">MAC Address</span>',
      '        <span class="footer__value" id="macText">00:00:00:00:00:00</span>',
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">IP Address</span>',
      '        <span class="footer__value" id="ipText">10.0.0.1</span>',
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">Bandwidth</span>',
      '        <span class="footer__value" id="bandwidthText">10 MB &darr; / 10 MB &uarr;</span>',
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">Uptime</span>',
      '        <span class="footer__value" id="uptimeText">0h 0m 0s</span>',
      "      </div>",
      "    </div>",
      "  </section>",
      "</main>",
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
      '      <button class="button button--secondary" id="closeRatesButton" type="button">' + escapeHtml(config.backLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>",
      '<div class="modal modal--coin" id="coinModal" aria-hidden="true">',
      '  <div class="modal__card modal__card--coin" role="dialog" aria-modal="true" aria-labelledby="modalTitle">',
      '    <h2 class="modal__title" id="modalTitle">' + escapeHtml(config.coinTitle) + "</h2>",
      '    <p class="modal__text" id="modalText">' + escapeHtml(config.coinCopy) + "</p>",
      '    <div class="modal__limit" id="modalLimitText">Insert time left: 00:30</div>',
      '    <div class="modal__actions">',
      '      <button class="button button--secondary" id="continueButton" type="button">' + escapeHtml(config.continueLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>",
      '<div class="modal modal--voucher" id="voucherModal" aria-hidden="true">',
      '  <div class="modal__card modal__card--voucher" role="dialog" aria-modal="true" aria-labelledby="voucherTitle">',
      '    <h2 class="modal__title" id="voucherTitle">' + escapeHtml(config.voucherTitle) + "</h2>",
      '    <p class="modal__text">' + escapeHtml(config.voucherCopy) + "</p>",
      '    <label class="voucher-label" for="voucherInput">' + escapeHtml(config.voucherFieldLabel) + "</label>",
      '    <input class="voucher-input" id="voucherInput" type="text" inputmode="text" autocomplete="off" placeholder="' + escapeHtml(config.voucherPlaceholder) + '">',
      '    <div class="modal__hint">' + escapeHtml(config.voucherHint) + "</div>",
      '    <div class="modal__error" id="voucherError"></div>',
      '    <div class="modal__actions">',
      '      <button class="button button--primary" id="useVoucherButton" type="button">' + escapeHtml(config.useVoucherLabel) + "</button>",
      '      <button class="button button--secondary" id="closeVoucherButton" type="button">' + escapeHtml(config.backLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("")
  );

  initializePortalViewportFit();
}

function initializePortalViewportFit() {
  var stage = document.getElementById("portalStage");
  var machine = stage && stage.querySelector(".machine");
  var resizeToken = null;

  if (!stage || !machine) {
    return;
  }

  function fitPortalStage() {
    machine.style.transform = "";
    stage.style.width = "";
    stage.style.height = "";
    document.body.classList.remove("portal-page--fixed");

    if (window.innerWidth < 900) {
      return;
    }

    var viewportPadding = 24;
    var availableWidth = window.innerWidth - viewportPadding * 2;
    var availableHeight = window.innerHeight - viewportPadding * 2;
    var naturalWidth = machine.offsetWidth;
    var naturalHeight = machine.offsetHeight;
    var scale = Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight);

    stage.style.width = Math.round(naturalWidth * scale) + "px";
    stage.style.height = Math.round(naturalHeight * scale) + "px";
    machine.style.transform = "scale(" + scale + ")";
    document.body.classList.add("portal-page--fixed");
  }

  function queueFitPortalStage() {
    if (resizeToken !== null) {
      window.cancelAnimationFrame(resizeToken);
    }

    resizeToken = window.requestAnimationFrame(function () {
      resizeToken = null;
      fitPortalStage();
    });
  }

  window.addEventListener("resize", queueFitPortalStage);
  window.addEventListener("orientationchange", queueFitPortalStage);
  window.addEventListener("load", queueFitPortalStage);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(queueFitPortalStage);
  }

  queueFitPortalStage();
}
