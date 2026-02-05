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
      const footerCompactLabel = hadError
        ? window.Versioning.UNAVAILABLE_LABEL || "Version unavailable"
        : window.Versioning.formatDisplayVersion(info);
      const footerTooltipVersion = hadError
        ? window.Versioning.UNAVAILABLE_LABEL || "Version unavailable"
        : window.Versioning.formatFooterVersion(info) ||
          window.Versioning.formatDisplayVersion(info);
      const footerTooltipBuild = hadError ? "" : window.Versioning.getBuildLabel(info);

      document.querySelectorAll(".version-badge").forEach((el) => {
        el.textContent = versionBadge;
      });

      document.querySelectorAll(".footer-version").forEach((el) => {
        const hasTooltip = !!el.closest(".footer-version-tooltip-container");
        el.textContent = hasTooltip ? footerCompactLabel : footerLabel;
      });

      document.querySelectorAll("[data-footer-version-tooltip=\"version\"]").forEach((el) => {
        el.textContent = footerTooltipVersion;
      });

      document.querySelectorAll("[data-footer-version-tooltip=\"build\"]").forEach((el) => {
        if (!footerTooltipBuild) {
          el.textContent = "";
          el.setAttribute("hidden", "");
          return;
        }
        el.removeAttribute("hidden");
        el.textContent = `Build ${footerTooltipBuild}`;
      });

      window.Versioning.applyVersionToElements({
        copyright: ".footer-copyright"
      });
    });
  };

  applyStamp();
})();
