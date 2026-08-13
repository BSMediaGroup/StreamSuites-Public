async (page) => {
  return page.evaluate(() => {
    const nav = document.querySelector('[data-profile-nav-placement="standalone"]');
    const sections = ['#profile-about', '#profile-identity', '#media', '#clips', '#artifacts', '#profile-safety']
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);
    const aboutLayout = document.querySelector('.profile-about-layout');
    const sourceLink = document.querySelector('.profile-about-video-source-link');
    const profileButton = document.createElement('button');
    const storyButton = document.createElement('button');
    profileButton.className = 'profile-edit-open-button profile-edit-open-button--hero profile-feature-action profile-feature-action--subtle';
    storyButton.className = 'profile-section-edit-button profile-feature-action profile-feature-action--subtle';
    document.body.append(profileButton, storyButton);
    const profileButtonStyle = getComputedStyle(profileButton);
    const storyButtonStyle = getComputedStyle(storyButton);
    const result = {
      navigation: nav ? [...nav.querySelectorAll('a')].map((link) => link.textContent.trim()) : [],
      sectionOrder: [...document.querySelectorAll('#profile-about, #profile-overview, #profile-identity, #media, #clips, #artifacts, #profile-presence, #profile-share, #profile-safety')]
        .map((section) => section.id),
      featureEyebrows: sections.reduce((total, section) => total + section.querySelectorAll('.profile-content-summary-eyebrow').length, 0),
      innerFeatureEyebrows: sections.reduce((total, section) => total + section.querySelectorAll('.profile-content-collapsible-panel > .profile-section-heading .profile-section-eyebrow').length, 0),
      mediaOpenWithoutContent: document.querySelector('#media')?.open ?? null,
      artifactsOpenByDefault: document.querySelector('#artifacts')?.open ?? null,
      aboutLayoutOrder: aboutLayout ? [...aboutLayout.children].map((child) => child.className) : [],
      sourceLink: sourceLink ? {
        background: getComputedStyle(sourceLink).backgroundColor,
        border: getComputedStyle(sourceLink).borderStyle,
        fontSize: getComputedStyle(sourceLink).fontSize,
        text: sourceLink.textContent.trim()
      } : null,
      editTypography: {
        profile: [profileButtonStyle.fontFamily, profileButtonStyle.fontWeight, profileButtonStyle.fontSize],
        story: [storyButtonStyle.fontFamily, storyButtonStyle.fontWeight, storyButtonStyle.fontSize]
      },
      overviewColumns: getComputedStyle(document.querySelector('.profile-overview-definition-list')).gridTemplateColumns,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
    profileButton.remove();
    storyButton.remove();
    return result;
  });
}
