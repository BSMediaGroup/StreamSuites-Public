(() => {
  "use strict";

  if (!window.Versioning || !window.Versioning.applyVersionToElements) return;

  const applyStamp = () => {
    window.Versioning
      .loadVersion()
      .then((info) => {
        const versionBadge = info
          ? window.Versioning.formatVersionWithBuild(info)
          : window.Versioning.UNAVAILABLE_LABEL || "Version unavailable";
        document.querySelectorAll(".version-badge").forEach((el) => {
          el.textContent = versionBadge;
        });

        const footerLabel = info
          ? window.Versioning.formatFooterVersionWithBuild(info)
          : window.Versioning.UNAVAILABLE_LABEL || "Version unavailable";
        document.querySelectorAll(".footer-version").forEach((el) => {
          el.textContent = footerLabel;
        });
      })
      .finally(() => {
        window.Versioning.applyVersionToElements({
          copyright: ".footer-copyright"
        });
      });
  };

  applyStamp();
})();
