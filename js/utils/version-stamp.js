(() => {
  "use strict";

  if (!window.Versioning || !window.Versioning.applyVersionToElements) return;

  window.Versioning.applyVersionToElements({
    version: ".version-badge",
    footerVersion: ".footer-version",
    copyright: ".footer-copyright"
  });
})();
