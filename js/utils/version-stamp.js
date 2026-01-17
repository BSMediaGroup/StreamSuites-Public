(() => {
  "use strict";

  if (!window.Versioning || !window.Versioning.applyVersionToElements) return;

  const applyStamp = () => {
    window.Versioning
      .loadVersion()
      .then((info) => {
        if (!info) return;

        const versionBadge = window.Versioning.formatVersionWithBuild(info);
        document.querySelectorAll(".version-badge").forEach((el) => {
          el.textContent = versionBadge;
        });

        const footerLabel = window.Versioning.formatFooterVersionWithBuild(info);
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
