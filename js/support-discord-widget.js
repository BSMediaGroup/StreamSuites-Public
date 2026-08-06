(function () {
  "use strict";

  var GUILD_ID = "1449303974086967306";
  var WIDGET_URL = "https://discord.com/api/guilds/" + GUILD_ID + "/widget.json";
  var FALLBACK_INVITE = "https://discord.com/invite/fv3CBc4g";
  var REQUEST_TIMEOUT_MS = 8000;
  var root = document.querySelector("[data-discord-community-widget]");

  if (!root) return;

  var nameNode = root.querySelector("[data-discord-server-name]");
  var connectionNode = root.querySelector("[data-discord-connection]");
  var presenceNode = root.querySelector("[data-discord-presence]");
  var channelCountNode = root.querySelector("[data-discord-channel-count]");
  var messageNode = root.querySelector("[data-discord-message]");
  var channelsNode = root.querySelector("[data-discord-channels]");
  var membersNode = root.querySelector("[data-discord-members]");
  var inviteNode = root.querySelector("[data-discord-invite]");
  var refreshNode = root.querySelector("[data-discord-refresh]");

  function element(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof value === "string") node.textContent = value;
    return node;
  }

  function boundedText(value, fallback, maximum) {
    if (typeof value !== "string") return fallback;
    var clean = value.trim().replace(/\s+/g, " ");
    return clean ? clean.slice(0, maximum || 80) : fallback;
  }

  function boundedCount(value) {
    return Number.isInteger(value) && value >= 0 && value <= 100000 ? value : 0;
  }

  function safeInvite(value) {
    try {
      var url = new URL(value);
      var isDiscordHost = url.hostname === "discord.com" || url.hostname === "www.discord.com" || url.hostname === "discord.gg";
      var isInvitePath = url.hostname === "discord.gg" || url.pathname.startsWith("/invite/");
      return url.protocol === "https:" && isDiscordHost && isInvitePath ? url.href : FALLBACK_INVITE;
    } catch (_error) {
      return FALLBACK_INVITE;
    }
  }

  function safeAvatar(value) {
    try {
      var url = new URL(value);
      var allowedHost = url.hostname === "cdn.discordapp.com" || url.hostname === "media.discordapp.net";
      return url.protocol === "https:" && allowedHost && url.pathname.startsWith("/widget-avatars/") ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function validate(payload) {
    return payload && String(payload.id) === GUILD_ID && typeof payload.name === "string" &&
      Array.isArray(payload.channels) && Array.isArray(payload.members) && Number.isInteger(payload.presence_count);
  }

  function setState(state, connection, message) {
    root.dataset.state = state;
    root.setAttribute("aria-busy", state === "loading" ? "true" : "false");
    connectionNode.textContent = connection;
    messageNode.textContent = message;
  }

  function statusLabel(value) {
    var labels = { online: "Online", idle: "Idle", dnd: "Do not disturb" };
    return labels[value] || "Online";
  }

  function renderChannels(channels) {
    var fragment = document.createDocumentFragment();
    channels.slice().sort(function (left, right) {
      return boundedCount(left && left.position) - boundedCount(right && right.position);
    }).slice(0, 8).forEach(function (channel) {
      var item = element("li", "discord-community__channel");
      item.append(element("span", "discord-community__channel-icon", "#"));
      var copy = element("span");
      copy.append(element("strong", "", boundedText(channel && channel.name, "Visible voice channel", 72)), element("small", "", "Voice channel"));
      item.append(copy, element("span", "discord-community__channel-state", "Open"));
      fragment.appendChild(item);
    });
    if (!fragment.childNodes.length) fragment.appendChild(element("li", "discord-community__empty", "No public voice channels are visible right now."));
    channelsNode.replaceChildren(fragment);
  }

  function renderMembers(members) {
    var fragment = document.createDocumentFragment();
    members.slice(0, 12).forEach(function (member) {
      var item = element("li", "discord-community__member");
      var avatar = element("span", "discord-community__avatar");
      var displayName = boundedText(member && (member.display_name || member.username), "Discord member", 64);
      var avatarUrl = safeAvatar(member && member.avatar_url);
      if (avatarUrl) {
        var image = element("img");
        image.src = avatarUrl;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        avatar.appendChild(image);
      } else {
        avatar.textContent = displayName.slice(0, 1).toUpperCase();
      }
      var status = boundedText(member && member.status, "online", 16).toLowerCase();
      var copy = element("span");
      copy.append(element("strong", "", displayName), element("small", "", statusLabel(status)));
      item.dataset.status = status;
      item.append(avatar, copy);
      fragment.appendChild(item);
    });
    if (!fragment.childNodes.length) fragment.appendChild(element("li", "discord-community__empty", "No public member presence is visible right now."));
    membersNode.replaceChildren(fragment);
  }

  function render(payload) {
    var channels = payload.channels.filter(function (channel) { return channel && typeof channel.name === "string"; });
    var members = payload.members.filter(function (member) { return member && (typeof member.username === "string" || typeof member.display_name === "string"); });
    nameNode.textContent = boundedText(payload.name, "StreamSuites™", 72);
    presenceNode.textContent = String(boundedCount(payload.presence_count));
    channelCountNode.textContent = String(channels.length);
    inviteNode.href = safeInvite(payload.instant_invite);
    renderChannels(channels);
    renderMembers(members);
    setState("ready", "Live from Discord", "Community presence refreshed from Discord's public widget.");
  }

  function showError() {
    presenceNode.textContent = "—";
    channelCountNode.textContent = "—";
    channelsNode.replaceChildren(element("li", "discord-community__empty", "Live channel information is temporarily unavailable."));
    membersNode.replaceChildren(element("li", "discord-community__empty", "Live member presence is temporarily unavailable."));
    inviteNode.href = FALLBACK_INVITE;
    setState("error", "Preview unavailable", "Discord presence could not be refreshed. The verified Join server and Support channel links remain available.");
  }

  async function loadWidget() {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);
    refreshNode.disabled = true;
    setState("loading", "Connecting", "Reading the live Discord community preview…");
    try {
      var response = await fetch(WIDGET_URL, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error("discord_widget_http_" + response.status);
      var payload = await response.json();
      if (!validate(payload)) throw new Error("discord_widget_invalid_payload");
      render(payload);
    } catch (error) {
      console.warn("[SupportDiscordWidget] Live Discord preview unavailable.", error);
      showError();
    } finally {
      window.clearTimeout(timeout);
      refreshNode.disabled = false;
    }
  }

  refreshNode.addEventListener("click", loadWidget);
  loadWidget();
})();
