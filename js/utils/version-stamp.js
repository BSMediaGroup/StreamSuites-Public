(() => {
  "use strict";

  if (!window.Versioning || !window.Versioning.applyVersionToElements) return;

  const applyStamp = () => {
    window.Versioning.loadVersion().then((result) => {
      const hadError = !result || result.error;
      const info = result ? result.info : null;
      const versionBadge = hadError
        ? window.Versioning.UNAVAILABLE_LABEL || "Version unavailable"
        : window.Versioning.formatVersionWithBuild(info);
      const footerLabel = hadError
        ? window.Versioning.UNAVAILABLE_LABEL || "Version unavailable"
        : window.Versioning.formatFooterVersionWithBuild(info);

      document.querySelectorAll(".version-badge").forEach((el) => {
        el.textContent = versionBadge;
      });

      document.querySelectorAll(".footer-version").forEach((el) => {
        el.textContent = footerLabel;
      });

      window.Versioning.applyVersionToElements({
        copyright: ".footer-copyright"
      });
    });
  };

  applyStamp();
})();
