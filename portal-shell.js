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
    machineLabel: document.body.dataset.machineLabel || "Piso WiFi portal",
    brandTitle: document.body.dataset.brandTitle || "Piso WiFi",
    brandSubtitle: document.body.dataset.brandSubtitle || "Coin Operated Internet Access",
    badgeText: document.body.dataset.badgeText || "",
    coinTitle: document.body.dataset.coinTitle || "Waiting for coin...",
    coinCopy: document.body.dataset.coinCopy || "Insert a coin into the machine to start or continue your internet session.",
    voucherTitle: document.body.dataset.voucherTitle || "Voucher Access",
    voucherCopy: document.body.dataset.voucherCopy || "Enter your voucher code to load internet time.",
    insertLabel: document.body.dataset.insertLabel || "Insert Coin",
    voucherLabel: document.body.dataset.voucherLabel || "Voucher",
    disconnectLabel: document.body.dataset.disconnectLabel || "Disconnect",
    continueLabel: document.body.dataset.continueLabel || "Continue",
    useVoucherLabel: document.body.dataset.useVoucherLabel || "Use Voucher",
    backLabel: document.body.dataset.backLabel || "Back",
    voucherPlaceholder: document.body.dataset.voucherPlaceholder || "Enter voucher code"
  };
  var badgeMarkup = config.badgeText
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
      '      <div class="button-pair">',
      '        <button class="button button--secondary" id="voucherButton" type="button">' + escapeHtml(config.voucherLabel) + "</button>",
      '        <button class="button button--danger" id="disconnectButton" type="button">' + escapeHtml(config.disconnectLabel) + "</button>",
      "      </div>",
      "    </div>",
      '    <div class="info-box" id="infoText">WiFi Rates: &#8369;1 = 5 mins, &#8369;5 = 30 mins, &#8369;10 = 60 mins</div>',
      '    <div class="footer">',
      '      <div class="footer__item">',
      '        <span class="footer__label">IP Address</span>',
      '        <span class="footer__value" id="ipText">10.0.0.1</span>',
      "      </div>",
      '      <div class="footer__item">',
      '        <span class="footer__label">Session ID</span>',
      '        <span class="footer__value" id="sessionText">PWF-000000</span>',
      "      </div>",
      "    </div>",
      "  </section>",
      "</main>",
      '<div class="modal modal--coin" id="coinModal" aria-hidden="true">',
      '  <div class="modal__card modal__card--coin" role="dialog" aria-modal="true" aria-labelledby="modalTitle">',
      '    <h2 class="modal__title" id="modalTitle">' + escapeHtml(config.coinTitle) + "</h2>",
      '    <p class="modal__text" id="modalText">' + escapeHtml(config.coinCopy) + "</p>",
      '    <div class="modal__coin" id="modalCoinText"></div>',
      '    <div class="modal__count" id="modalCountText">Coins inserted: 0</div>',
      '    <div class="modal__limit" id="modalLimitText">Insert time left: 00:30</div>',
      '    <div class="modal__time" id="modalTimeText">00:00:00</div>',
      '    <div class="modal__actions">',
      '      <button class="button button--primary" id="simulateCoinButton" type="button">' + escapeHtml(config.insertLabel) + "</button>",
      '      <button class="button button--secondary" id="continueButton" type="button">' + escapeHtml(config.continueLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>",
      '<div class="modal modal--voucher" id="voucherModal" aria-hidden="true">',
      '  <div class="modal__card modal__card--voucher" role="dialog" aria-modal="true" aria-labelledby="voucherTitle">',
      '    <h2 class="modal__title" id="voucherTitle">' + escapeHtml(config.voucherTitle) + "</h2>",
      '    <p class="modal__text">' + escapeHtml(config.voucherCopy) + "</p>",
      '    <input class="voucher-input" id="voucherInput" type="text" inputmode="text" autocomplete="off" placeholder="' + escapeHtml(config.voucherPlaceholder) + '">',
      '    <div class="modal__hint">Sample codes: WIFI5, WIFI30, WIFI60</div>',
      '    <div class="modal__error" id="voucherError"></div>',
      '    <div class="modal__actions">',
      '      <button class="button button--primary" id="useVoucherButton" type="button">' + escapeHtml(config.useVoucherLabel) + "</button>",
      '      <button class="button button--secondary" id="closeVoucherButton" type="button">' + escapeHtml(config.backLabel) + "</button>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("")
  );
}
