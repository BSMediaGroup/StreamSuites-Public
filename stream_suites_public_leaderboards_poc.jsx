import React, { useMemo, useState } from "react";

const iconPaths = {
  award: "M12 15.5 8.5 21l-.6-4.4L4 14.5l4.3-1.1L12 2l3.7 11.4 4.3 1.1-3.9 2.1-.6 4.4L12 15.5Z",
  badgeCheck: "M12 2l2.8 2 3.5.3.3 3.5 2 2.8-2 2.8-.3 3.5-3.5.3-2.8 2-2.8-2-3.5-.3-.3-3.5-2-2.8 2-2.8.3-3.5 3.5-.3L12 2Zm-3 10 2 2 4-5",
  barChart: "M4 19V9m6 10V5m6 14v-7m4 7H2",
  calendar: "M7 2v4m10-4v4M4 8h16M5 4h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm7 8v4l3 2",
  chevronDown: "m6 9 6 6 6-6",
  crown: "M3 8l4 3 5-7 5 7 4-3-2 11H5L3 8Zm2 11h14",
  flame: "M12 22c4 0 7-3 7-7 0-3-2-5-4-7 .1 2-1 3-2 3-2 0-3-3-1-8-4 2-7 6-7 11 0 4 3 7 7 7Z",
  gamepad: "M7 8h10a5 5 0 0 1 4.7 6.7l-.7 2a2.5 2.5 0 0 1-4.2.8L14.8 15H9.2l-2 2.5a2.5 2.5 0 0 1-4.2-.8l-.7-2A5 5 0 0 1 7 8Zm0 4h4M9 10v4m7-1h.01M18 11h.01",
  gem: "M6 3h12l4 6-10 12L2 9l4-6Zm-4 6h20M6 3l6 18 6-18",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0 0c3-3 4.5-6.3 4.5-10S15 5 12 2m0 20c-3-3-4.5-6.3-4.5-10S9 5 12 2M2 12h20",
  medal: "M8 2h8l-2 7h-4L8 2Zm8 0 2 7m-10 0h8m-4 13a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-9 1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 18l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4L12 12Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5",
  sparkles: "M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Zm6 10 .8 2.7L21 16.5l-2.2.8L18 20l-.8-2.7-2.2-.8 2.2-.8L18 13ZM5 13l.8 2.7 2.2.8-2.2.8L5 21l-.8-2.7-2.2-.8 2.2-.8L5 13Z",
  star: "m12 2 3 6 6.5.9-4.7 4.6 1.1 6.5L12 16.9 6.1 20l1.1-6.5L2.5 8.9 9 8l3-6Z",
  swords: "M14 3l7 7-2 2-7-7 2-2ZM3 14l7 7 2-2-7-7-2 2Zm11-5 5 5M5 5l14 14M19 5 5 19",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Zm0 2H4a2 2 0 0 0 0 4h3m10-4h3a2 2 0 0 1 0 4h-3",
  trendingDown: "m22 17-7-7-4 4-7-7m18 10h-6v-6",
  trendingUp: "m22 7-7 7-4-4-7 7m18-10h-6V1",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  wallet: "M3 7h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V7Zm0 0a2 2 0 0 1 2-2h13v2m3 5h-5a2 2 0 0 0 0 4h5v-4Z",
  zap: "M13 2 3 14h8l-1 8 10-14h-8l1-8Z",
};

function Icon({ name, size = 18, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name] || iconPaths.sparkles} />
    </svg>
  );
}

const iconNameTests = [
  "award",
  "badgeCheck",
  "barChart",
  "calendar",
  "chevronDown",
  "crown",
  "flame",
  "gamepad",
  "gem",
  "globe",
  "medal",
  "search",
  "shieldCheck",
  "sparkles",
  "star",
  "swords",
  "trophy",
  "trendingDown",
  "trendingUp",
  "users",
  "wallet",
  "zap",
];

function runPOCSanityTests() {
  const missingIcons = iconNameTests.filter((name) => !iconPaths[name]);
  const duplicateRanks = creators.length !== new Set(creators.map((creator) => creator.rank)).size;
  const invalidPodium = creators.slice(0, 3).some((creator) => creator.rank < 1 || creator.rank > 3);

  return {
    missingIcons,
    duplicateRanks,
    invalidPodium,
    passed: missingIcons.length === 0 && !duplicateRanks && !invalidPodium,
  };
}

const creators = [
  {
    rank: 1,
    name: "Ari Vale",
    handle: "@arivale",
    avatar: "AV",
    roles: ["Creator", "Founder"],
    tier: "Pro",
    rankLabel: "Diamond III",
    rankTone: "from-cyan-300 via-sky-300 to-fuchsia-300",
    xp: 184920,
    level: 42,
    wallet: 12480,
    weekly: 8,
    board: "Overall",
    lastActive: "Live now",
    online: true,
    winRate: "18.4%",
    streak: 14,
  },
  {
    rank: 2,
    name: "Mika Orion",
    handle: "@mikaorion",
    avatar: "MO",
    roles: ["Creator"],
    tier: "Gold",
    rankLabel: "Obsidian II",
    rankTone: "from-violet-300 via-purple-400 to-orange-300",
    xp: 151230,
    level: 38,
    wallet: 10110,
    weekly: 3,
    board: "Overall",
    lastActive: "12 min ago",
    online: false,
    winRate: "16.1%",
    streak: 9,
  },
  {
    rank: 3,
    name: "Nox Relay",
    handle: "@noxrelay",
    avatar: "NR",
    roles: ["Moderator", "Founder"],
    tier: "Gold",
    rankLabel: "Obsidian I",
    rankTone: "from-amber-200 via-orange-300 to-purple-300",
    xp: 132770,
    level: 35,
    wallet: 8950,
    weekly: -2,
    board: "Overall",
    lastActive: "1 hr ago",
    online: false,
    winRate: "14.8%",
    streak: 6,
  },
  {
    rank: 4,
    name: "Vera Knoll",
    handle: "@veraknoll",
    avatar: "VK",
    roles: ["Creator"],
    tier: "Core",
    rankLabel: "Amethyst IV",
    rankTone: "from-purple-300 to-pink-300",
    xp: 118440,
    level: 32,
    wallet: 7840,
    weekly: 11,
    board: "Overall",
    lastActive: "Live now",
    online: true,
    winRate: "12.2%",
    streak: 11,
  },
  {
    rank: 5,
    name: "Jett Cassian",
    handle: "@jettcassian",
    avatar: "JC",
    roles: ["Creator", "Developer"],
    tier: "Developer",
    rankLabel: "Amethyst II",
    rankTone: "from-emerald-300 via-cyan-300 to-violet-300",
    xp: 105210,
    level: 29,
    wallet: 6905,
    weekly: 4,
    board: "Overall",
    lastActive: "22 min ago",
    online: false,
    winRate: "11.7%",
    streak: 8,
  },
  {
    rank: 6,
    name: "Rhea Static",
    handle: "@rheastatic",
    avatar: "RS",
    roles: ["Creator"],
    tier: "Pro",
    rankLabel: "Sapphire V",
    rankTone: "from-blue-300 via-cyan-300 to-sky-400",
    xp: 97840,
    level: 28,
    wallet: 6620,
    weekly: 19,
    board: "Overall",
    lastActive: "3 hrs ago",
    online: false,
    winRate: "10.4%",
    streak: 7,
  },
  {
    rank: 7,
    name: "Atlas Wren",
    handle: "@atlaswren",
    avatar: "AW",
    roles: ["Founder"],
    tier: "Gold",
    rankLabel: "Sapphire III",
    rankTone: "from-sky-300 to-indigo-300",
    xp: 91220,
    level: 27,
    wallet: 5920,
    weekly: -5,
    board: "Overall",
    lastActive: "Yesterday",
    online: false,
    winRate: "9.9%",
    streak: 4,
  },
  {
    rank: 8,
    name: "Luna Forge",
    handle: "@lunaforge",
    avatar: "LF",
    roles: ["Creator"],
    tier: "Core",
    rankLabel: "Ruby II",
    rankTone: "from-rose-300 via-red-300 to-orange-300",
    xp: 88410,
    level: 26,
    wallet: 5430,
    weekly: 2,
    board: "Overall",
    lastActive: "2 days ago",
    online: false,
    winRate: "8.8%",
    streak: 5,
  },
];

const boardCards = [
  {
    title: "Stateside Safari Community",
    owner: "Daniel Clancy",
    type: "Creator board",
    metric: "Monthly XP",
    entries: 412,
    leader: "Ari Vale",
    change: "+28 today",
    tone: "from-purple-500/25 via-orange-500/15 to-transparent",
    icon: "users",
  },
  {
    title: "Wheel Night Winners",
    owner: "Public Events",
    type: "Event board",
    metric: "Wins",
    entries: 96,
    leader: "Nox Relay",
    change: "Live season",
    tone: "from-cyan-500/25 via-blue-500/15 to-transparent",
    icon: "trophy",
  },
  {
    title: "Coin Economy Titans",
    owner: "StreamSuites",
    type: "Economy board",
    metric: "Wallet value",
    entries: 1280,
    leader: "Mika Orion",
    change: "+4.8% weekly",
    tone: "from-amber-400/25 via-orange-500/15 to-transparent",
    icon: "wallet",
  },
  {
    title: "Live Chat Streaks",
    owner: "Creator-defined",
    type: "Engagement board",
    metric: "Active streak",
    entries: 633,
    leader: "Vera Knoll",
    change: "14 day best",
    tone: "from-fuchsia-500/25 via-purple-500/15 to-transparent",
    icon: "flame",
  },
  {
    title: "Mini Games Arena",
    owner: "StreamSuites Games",
    type: "Game board",
    metric: "Composite score",
    entries: 271,
    leader: "Jett Cassian",
    change: "3 active games",
    tone: "from-emerald-400/20 via-cyan-500/15 to-transparent",
    icon: "gamepad",
  },
  {
    title: "Founding Members Cup",
    owner: "Seasonal",
    type: "Season board",
    metric: "Season XP",
    entries: 144,
    leader: "Atlas Wren",
    change: "Ends in 19 days",
    tone: "from-slate-300/20 via-violet-400/15 to-transparent",
    icon: "medal",
  },
];

const activity = [
  { label: "Ari Vale crossed 180k lifetime XP", time: "2 min ago", icon: "crown" },
  { label: "Stateside Safari Community added 18 new ranked users", time: "14 min ago", icon: "users" },
  { label: "Wheel Night Winners switched to live event scoring", time: "31 min ago", icon: "swords" },
  { label: "Coin Economy Titans refreshed wallet snapshots", time: "1 hr ago", icon: "wallet" },
];

const tabs = ["Overall", "XP", "Economy", "Games", "Weekly", "Creator Boards", "Events"];

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function roleClass(role) {
  const key = role.toLowerCase();
  if (key === "creator") return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  if (key === "founder") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  if (key === "moderator") return "border-violet-300/30 bg-violet-300/10 text-violet-100";
  if (key === "developer") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  return "border-white/15 bg-white/10 text-white/75";
}

function tierClass(tier) {
  const key = tier.toLowerCase();
  if (key === "pro") return "from-fuchsia-400/25 to-purple-400/10 text-fuchsia-50 border-fuchsia-300/30";
  if (key === "gold") return "from-amber-300/25 to-orange-400/10 text-amber-50 border-amber-300/30";
  if (key === "developer") return "from-emerald-300/25 to-cyan-400/10 text-emerald-50 border-emerald-300/30";
  return "from-teal-300/15 to-slate-300/10 text-teal-50 border-teal-200/25";
}

function Chip({ children, className = "" }) {
  return (
    <span className={`relative inline-flex items-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] before:absolute before:inset-y-0 before:-left-8 before:w-8 before:skew-x-[-18deg] before:bg-white/25 before:opacity-0 before:transition before:duration-500 hover:before:left-[115%] hover:before:opacity-100 ${className}`}>{children}</span>
  );
}

function StatCard({ label, value, detail, icon, glow }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${glow} blur-3xl transition duration-500 group-hover:scale-125`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-white/50">{detail}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-2 text-white/70">
          <Icon name={icon} size={18} />
        </div>
      </div>
    </div>
  );
}

function Avatar({ person, size = "h-14 w-14", crown = false }) {
  return (
    <div className={`relative ${size} shrink-0 rounded-2xl bg-gradient-to-br ${person.rankTone} p-[1px] shadow-lg shadow-black/40`}>
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950 text-sm font-black tracking-widest text-white">
        {person.avatar}
      </div>
      {person.online && <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-300 shadow-lg shadow-emerald-400/40" />}
      {crown && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/30 bg-amber-300/15 p-1 text-amber-100 shadow-lg shadow-amber-400/20">
          <Icon name="crown" size={15} />
        </div>
      )}
    </div>
  );
}

function Movement({ value }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${positive ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-rose-300/25 bg-rose-300/10 text-rose-100"}`}>
      <Icon name={positive ? "trendingUp" : "trendingDown"} size={13} /> {positive ? `+${value}` : value}
    </span>
  );
}

function PodiumCard({ person, place }) {
  const isFirst = place === 1;
  const metal = place === 1 ? "from-amber-200 via-yellow-400 to-orange-500" : place === 2 ? "from-slate-100 via-slate-300 to-sky-300" : "from-orange-200 via-amber-600 to-stone-500";
  return (
    <div className={`group relative overflow-hidden rounded-[2rem] border bg-slate-950/70 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 ${isFirst ? "min-h-[360px] border-amber-200/25 lg:order-2" : "min-h-[314px] border-white/10 lg:mt-12"}`}>
      <div className={`absolute inset-x-8 -top-24 h-44 rounded-full bg-gradient-to-r ${metal} opacity-20 blur-3xl transition duration-500 group-hover:opacity-30`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_45%)]" />
      <div className="relative flex h-full flex-col items-center text-center">
        <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.24em] ${place === 1 ? "border-amber-200/30 bg-amber-300/10 text-amber-100" : "border-white/15 bg-white/5 text-white/70"}`}>
          <Icon name="trophy" size={14} /> Rank #{place}
        </div>
        <Avatar person={person} size={isFirst ? "h-24 w-24" : "h-20 w-20"} crown={isFirst} />
        <h3 className="mt-5 text-xl font-black tracking-tight text-white">{person.name}</h3>
        <p className="mt-1 text-sm text-white/45">{person.handle}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {person.roles.map((role) => <Chip key={role} className={roleClass(role)}>{role}</Chip>)}
          <Chip className={`bg-gradient-to-r ${tierClass(person.tier)}`}><Icon name="gem" size={12} />{person.tier}</Chip>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
          <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${person.rankTone} text-slate-950 shadow-lg shadow-black/30`}>
            <Icon name="shieldCheck" size={22} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">XP Rank</p>
            <p className="text-sm font-bold text-white">{person.rankLabel}</p>
          </div>
        </div>
        <div className="mt-auto grid w-full grid-cols-3 gap-2 pt-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">XP</p>
            <p className="mt-1 text-sm font-black text-white">{numberFormat(person.xp)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Level</p>
            <p className="mt-1 text-sm font-black text-white">{person.level}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Move</p>
            <p className="mt-1 flex justify-center"><Movement value={person.weekly} /></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardCard({ board }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className={`absolute inset-0 bg-gradient-to-br ${board.tone}`} />
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-white/80">
            <Icon name={board.icon} size={20} />
          </div>
          <Chip className="border-white/15 bg-black/25 text-white/55">{board.type}</Chip>
        </div>
        <h3 className="mt-5 text-lg font-black tracking-tight text-white">{board.title}</h3>
        <p className="mt-1 text-sm text-white/45">Owned by {board.owner}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Metric</p>
            <p className="mt-1 text-sm font-bold text-white">{board.metric}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Entries</p>
            <p className="mt-1 text-sm font-bold text-white">{numberFormat(board.entries)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
          <span className="text-xs text-white/45">Current leader</span>
          <span className="text-sm font-black text-white">{board.leader}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/55">
          <Icon name="sparkles" size={14} className="text-orange-200" /> {board.change}
        </div>
      </div>
    </article>
  );
}

function LeaderboardRow({ person }) {
  return (
    <div className="group grid items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-lg shadow-black/20 transition duration-300 hover:border-white/20 hover:bg-white/[0.06] lg:grid-cols-[72px_minmax(260px,1.4fr)_minmax(170px,0.9fr)_repeat(5,minmax(84px,0.5fr))]">
      <div className="flex items-center gap-3 lg:block">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-lg font-black ${person.rank <= 3 ? "border-amber-200/25 bg-amber-300/10 text-amber-100" : "border-white/10 bg-black/25 text-white/70"}`}>#{person.rank}</div>
        <span className="text-xs uppercase tracking-[0.2em] text-white/35 lg:hidden">Rank</span>
      </div>
      <div className="flex items-center gap-3">
        <Avatar person={person} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-base font-black text-white">{person.name}</h4>
            {person.online && <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">Live</span>}
          </div>
          <p className="mt-0.5 text-sm text-white/40">{person.handle}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {person.roles.slice(0, 2).map((role) => <Chip key={role} className={`${roleClass(role)} px-2 py-0.5 text-[9px]`}>{role}</Chip>)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-2">
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${person.rankTone} text-slate-950`}>
          <Icon name="badgeCheck" size={18} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{person.tier}</p>
          <p className="text-xs font-bold text-white">{person.rankLabel}</p>
        </div>
      </div>
      <Metric label="XP" value={numberFormat(person.xp)} />
      <Metric label="Level" value={person.level} />
      <Metric label="Wallet" value={numberFormat(person.wallet)} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/35 lg:hidden">Weekly</span>
        <Movement value={person.weekly} />
      </div>
      <Metric label="Active" value={person.lastActive} subtle />
    </div>
  );
}

function Metric({ label, value, subtle = false }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 lg:hidden">{label}</p>
      <p className={`text-sm font-bold ${subtle ? "text-white/55" : "text-white"}`}>{value}</p>
    </div>
  );
}

export default function StreamSuitesPublicLeaderboardsPOC() {
  const [activeTab, setActiveTab] = useState("Overall");
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("All time");

  const sanity = useMemo(() => runPOCSanityTests(), []);

  const filteredCreators = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return creators;
    return creators.filter((creator) =>
      [creator.name, creator.handle, creator.tier, creator.rankLabel, ...creator.roles]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const topThree = creators.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-[-18rem] top-32 h-[38rem] w-[38rem] rounded-full bg-orange-500/14 blur-[130px]" />
        <div className="absolute bottom-[-20rem] left-[-16rem] h-[38rem] w-[38rem] rounded-full bg-cyan-500/12 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.055]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "26px 26px" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,11,0.15),#05060b_78%)]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-purple-900/25">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/25 via-orange-300/15 to-cyan-300/10" />
              <Icon name="trophy" className="relative text-orange-100" size={23} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">StreamSuites Public</p>
              <h1 className="text-xl font-black tracking-tight text-white">Leaderboards</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100"><Icon name="zap" size={12} />Updated live</Chip>
            <Chip className="border-purple-300/25 bg-purple-300/10 text-purple-100"><Icon name="globe" size={12} />Public identities</Chip>
            <Chip className="border-orange-300/25 bg-orange-300/10 text-orange-100"><Icon name="shieldCheck" size={12} />Runtime authority</Chip>
            <Chip className={sanity.passed ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100" : "border-rose-300/25 bg-rose-300/10 text-rose-100"}>{sanity.passed ? "POC checks passed" : "POC checks failed"}</Chip>
          </div>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(168,85,247,0.26),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(249,115,22,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
          <div className="absolute right-8 top-8 hidden opacity-[0.05] lg:block">
            <Icon name="trophy" size={220} />
          </div>
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/60">
                <Icon name="sparkles" size={14} className="text-orange-200" /> Season 01 leaderboard shell
              </div>
              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Public rankings with creator-grade polish.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/58 sm:text-lg">
                A premium public leaderboard hub for lifetime XP, weekly momentum, StreamSuites economy standings, mini-games, event winners, and creator-defined community boards.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative overflow-hidden rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition duration-300 before:absolute before:inset-y-0 before:-left-8 before:w-8 before:skew-x-[-18deg] before:bg-white/25 before:opacity-0 before:transition before:duration-500 hover:before:left-[115%] hover:before:opacity-100 ${activeTab === tab ? "border-orange-200/40 bg-gradient-to-r from-purple-500/25 to-orange-400/20 text-white shadow-lg shadow-orange-900/20" : "border-white/10 bg-black/20 text-white/48 hover:border-white/20 hover:text-white/75"}`}
                  >
                    {activeTab === tab && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-200 shadow-lg shadow-orange-200/50" />}
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-5 shadow-2xl shadow-black/30">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Current board</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-400 via-orange-300 to-cyan-300 text-slate-950">
                  <Icon name="award" size={23} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeTab}</h3>
                  <p className="text-sm text-white/45">All public profiles · {season}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Entries</p>
                  <p className="mt-1 text-lg font-black">8,492</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Boards</p>
                  <p className="mt-1 text-lg font-black">126</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Live</p>
                  <p className="mt-1 text-lg font-black">34</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Lifetime XP" value="18.7M" detail="Across public identities" icon="barChart" glow="bg-purple-500/30" />
          <StatCard label="Creator Boards" value="126" detail="Community-defined rankings" icon="users" glow="bg-cyan-500/25" />
          <StatCard label="Season Pool" value="S01" detail="19 days remaining" icon="calendar" glow="bg-orange-500/25" />
          <StatCard label="Wallet Index" value="4.82M" detail="Public coin circulation" icon="wallet" glow="bg-amber-400/25" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Hall of Fame</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Top 3 Overall</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/45">The podium is intentionally visual and prestige-heavy. It gives the main leaderboard an immediate premium identity before the data table begins.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
              {podiumOrder.map((person) => <PodiumCard key={person.rank} person={person} place={person.rank} />)}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Your Standing</p>
                  <h3 className="mt-2 text-xl font-black text-white">Signed-out preview</h3>
                </div>
                <div className="rounded-2xl border border-purple-300/20 bg-purple-300/10 p-3 text-purple-100">
                  <Icon name="star" size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/52">Sign in to reveal your overall rank, creator-board placements, weekly movement, XP history, wallet position, and game standings.</p>
              <div className="mt-5 grid gap-2">
                <button className="rounded-2xl border border-orange-200/30 bg-gradient-to-r from-purple-500/35 to-orange-400/25 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-900/20 transition hover:border-orange-100/50">Sign in to view rank</button>
                <button className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white/65 transition hover:border-white/20 hover:text-white">Browse public profiles</button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Live movement</p>
              <div className="mt-4 space-y-3">
                {activity.map((item) => (
                  <div key={item.label} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white/70">
                      <Icon name={item.icon} size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-5 text-white/80">{item.label}</p>
                      <p className="mt-0.5 text-xs text-white/35">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:p-6">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Main Board</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Overall StreamSuites Leaderboard</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Ranked by lifetime public XP with supporting economy, level, movement, role, tier, and rank presentation metadata.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-[260px]">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ranked profiles..."
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-purple-300/35 focus:bg-black/40"
                />
              </label>
              <button onClick={() => setSeason(season === "All time" ? "Weekly" : "All time")} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white/70 transition hover:border-white/20 hover:text-white">
                Season: {season} <Icon name="chevronDown" size={15} />
              </button>
            </div>
          </div>

          <div className="mt-5 hidden rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35 lg:grid lg:grid-cols-[72px_minmax(260px,1.4fr)_minmax(170px,0.9fr)_repeat(5,minmax(84px,0.5fr))]">
            <span>Rank</span>
            <span>Profile</span>
            <span>Rank / Tier</span>
            <span>XP</span>
            <span>Level</span>
            <span>Wallet</span>
            <span>Weekly</span>
            <span>Active</span>
          </div>
          <div className="mt-3 space-y-3">
            {filteredCreators.map((person) => <LeaderboardRow key={person.handle} person={person} />)}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Creator-defined boards</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Featured Leaderboards</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Cards should scale into a gallery of creator, event, economy, game, and seasonal boards without making the main table feel crowded.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/65 transition hover:border-white/20 hover:text-white">
              View board directory <Icon name="chevronDown" size={15} />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boardCards.map((board) => <BoardCard key={board.title} board={board} />)}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-orange-400/15 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Board Governance</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Public by design, authority-backed underneath.</h2>
              <p className="mt-4 text-sm leading-6 text-white/52">The public surface should not invent leaderboard state. It should hydrate from runtime exports and APIs, then present boards as public, readable, shareable prestige surfaces.</p>
              <div className="mt-5 grid gap-3">
                {[
                  "Overall board remains the default canonical board.",
                  "Creator boards inherit public identity, role, tier, and rank presentation metadata.",
                  "Private/unlisted boards can exist later, but this page only exposes public boards.",
                  "Empty states should feel intentional, not broken.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/62">
                    <Icon name="badgeCheck" className="mt-0.5 shrink-0 text-emerald-200" size={16} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="absolute -left-16 bottom-[-4rem] h-44 w-44 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Responsive Behavior</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Mobile becomes ranked profile cards.</h2>
              <p className="mt-4 text-sm leading-6 text-white/52">On narrow screens, the table collapses into stacked cards with rank, avatar, tier, XP, movement, and wallet shown first. Filters remain sticky-friendly and thumb-accessible.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Mobile", "Card rows"],
                  ["Tablet", "Hybrid layout"],
                  ["Desktop", "Podium + table"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                    <p className="mt-2 text-lg font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-orange-200/15 bg-orange-300/10 p-4 text-sm leading-6 text-orange-50/70">
                Suggested empty-state copy: “No public entries yet. Once public profiles earn XP or join a creator board, rankings will appear here.”
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
