(() => {
  const API_URL = 'https://v0hwlmly3pd2.statuspage.io/api/v2/summary.json';
  const ROOT_ID = 'ss-status-widget';
  const DETAILS_ID = 'ss-status-details';

  if (document.getElementById(ROOT_ID)) return;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'ss-status';
  root.dataset.state = 'unknown';
  root.dataset.expanded = 'false';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'ss-status__toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', DETAILS_ID);

  const dot = document.createElement('span');
  dot.className = 'ss-status__dot';
  dot.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'ss-status__label';
  label.textContent = 'Status: Loading...';

  toggle.append(dot, label);

  const details = document.createElement('div');
  details.className = 'ss-status__details';
  details.id = DETAILS_ID;
  details.hidden = true;

  root.append(toggle, details);
  document.body.appendChild(root);

  const setExpanded = (expanded) => {
    const isExpanded = Boolean(expanded);
    root.dataset.expanded = String(isExpanded);
    toggle.setAttribute('aria-expanded', String(isExpanded));
    details.hidden = !isExpanded;
  };

  toggle.addEventListener('click', () => setExpanded(root.dataset.expanded !== 'true'));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.dataset.expanded === 'true') {
      setExpanded(false);
    }
  });

  const toTitle = (value) => {
    if (!value) return '';
    return value
      .replace(/_/g, ' ')
      .split(' ')
      .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
      .join(' ');
  };

  const truncateText = (value, limit) => {
    if (!value) return '';
    const text = String(value).trim();
    if (text.length <= limit) return text;
    const slice = text.slice(0, limit);
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > 40) {
      return `${slice.slice(0, lastSpace)}...`;
    }
    return `${slice}...`;
  };

  const formatDate = (value) => {
    if (!value) return 'Unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unavailable';
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const setUnknown = () => {
    root.dataset.state = 'unknown';
    label.textContent = 'Status: Unknown';
    details.innerHTML = '';
    const summary = document.createElement('div');
    summary.className = 'ss-status__summary';
    summary.textContent = 'Status details unavailable.';
    const updated = document.createElement('div');
    updated.className = 'ss-status__updated';
    updated.textContent = 'Last updated: Unavailable';
    details.append(summary, updated);
  };

  const buildSection = (titleText, items) => {
    const section = document.createElement('div');
    section.className = 'ss-status__section';
    const title = document.createElement('div');
    title.className = 'ss-status__section-title';
    title.textContent = titleText;
    const list = document.createElement('ul');
    list.className = 'ss-status__list';
    items.forEach((item) => list.appendChild(item));
    section.append(title, list);
    return section;
  };

  const createListItem = ({ title, meta, body }) => {
    const item = document.createElement('li');
    item.className = 'ss-status__item';

    const titleEl = document.createElement('div');
    titleEl.className = 'ss-status__item-title';
    titleEl.textContent = title;

    item.appendChild(titleEl);

    if (meta) {
      const metaEl = document.createElement('div');
      metaEl.className = 'ss-status__item-meta';
      metaEl.textContent = meta;
      item.appendChild(metaEl);
    }

    if (body) {
      const bodyEl = document.createElement('div');
      bodyEl.className = 'ss-status__item-body';
      bodyEl.textContent = body;
      item.appendChild(bodyEl);
    }

    return item;
  };

  const updateWidget = (summary) => {
    const components = Array.isArray(summary?.components) ? summary.components : [];
    const incidents = Array.isArray(summary?.incidents) ? summary.incidents : [];
    const maintenances = Array.isArray(summary?.scheduled_maintenances)
      ? summary.scheduled_maintenances
      : [];

    let state = 'operational';
    if (components.some((component) => component.status === 'major_outage')) {
      state = 'major';
    } else if (components.some((component) =>
      component.status === 'partial_outage' || component.status === 'degraded_performance'
    )) {
      state = 'partial';
    }

    root.dataset.state = state;
    const description = summary?.status?.description || 'Unknown';
    label.textContent = `Status: ${description}`;

    details.innerHTML = '';

    const summaryEl = document.createElement('div');
    summaryEl.className = 'ss-status__summary';
    summaryEl.textContent = description;

    const updatedEl = document.createElement('div');
    updatedEl.className = 'ss-status__updated';
    updatedEl.textContent = `Last updated: ${formatDate(summary?.page?.updated_at)}`;

    details.append(summaryEl, updatedEl);

    const impactedComponents = components.filter((component) => component.status !== 'operational');
    if (impactedComponents.length) {
      const items = impactedComponents.map((component) => createListItem({
        title: component.name || 'Unnamed Component',
        meta: toTitle(component.status) || 'Status Unknown',
      }));
      details.appendChild(buildSection('Components', items));
    }

    const unresolvedIncidents = incidents.filter((incident) => incident.status !== 'resolved');
    if (unresolvedIncidents.length) {
      const items = unresolvedIncidents.map((incident) => {
        const update = Array.isArray(incident.incident_updates)
          ? incident.incident_updates[0]
          : null;
        const body = truncateText(update?.body || '', 180);
        return createListItem({
          title: incident.name || 'Untitled Incident',
          meta: toTitle(incident.status) || 'Unknown',
          body: body || null,
        });
      });
      details.appendChild(buildSection('Incidents', items));
    }

    const activeMaintenances = maintenances.filter((maintenance) => maintenance.status !== 'completed');
    if (activeMaintenances.length) {
      const items = activeMaintenances.map((maintenance) => createListItem({
        title: maintenance.name || 'Scheduled Maintenance',
        meta: `${toTitle(maintenance.status) || 'Scheduled'} - ${formatDate(maintenance.scheduled_for)}`,
      }));
      details.appendChild(buildSection('Maintenances', items));
    }
  };

  const fetchStatus = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(API_URL, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('status fetch failed');

      const data = await response.json();
      updateWidget(data);
    } catch (error) {
      setUnknown();
    } finally {
      clearTimeout(timeout);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchStatus);
  } else {
    fetchStatus();
  }
})();
