import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  serverTimestamp,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmC1_Hklc1SgvVQXyNT07TYDfVn2euRO8",
  authDomain: "stream-overlay-creator.firebaseapp.com",
  databaseURL: "https://stream-overlay-creator-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stream-overlay-creator",
  storageBucket: "stream-overlay-creator.firebasestorage.app",
  messagingSenderId: "79079678682",
  appId: "1:79079678682:web:b267bb62195f50f6273be3",
};

const PRESETS = {
  aurora: {
    label: "Aurora",
    description: "Violet / cyan premium pour scène starting soon.",
    values: {
      title: "Starting Soon",
      sceneLabel: "STARTING SOON",
      subtitle: "Le live démarre dans quelques minutes, prends ton snack préféré.",
      message: "Bienvenue sur le stream. Prépare-toi, la scène s'allume dans un instant ✨",
      cta: "Abonne-toi pour ne rien rater",
      social: "@streamer",
      eventLabel: "Dernier follow",
      eventValue: "viewer_42",
      goalLabel: "Objectif subs",
      goalValue: "42 / 100",
      goalProgress: 42,
      layout: "split",
      backgroundStyle: "aurora",
      cardStyle: "glass",
      accent: "#8b5cf6",
      accentSecondary: "#38bdf8",
      textColor: "#f8fafc",
      backgroundOpacity: 0.78,
      fontScale: 1,
      showClock: true,
      showGoal: true,
      showSocial: true,
      showRoomBadge: true,
      showCta: true,
    },
  },
  ember: {
    label: "Ember",
    description: "Palette orange / rouge plus énergique.",
    values: {
      title: "Live dans 5 min",
      sceneLabel: "WARMUP",
      subtitle: "On chauffe le chat avant de lancer la vraie session.",
      message: "Balance un hello dans le chat, on démarre sur un gros rythme 🔥",
      cta: "Partage le live à ton squad",
      social: "@creatorlive",
      eventLabel: "Dernier sub",
      eventValue: "nova_prime",
      goalLabel: "Road to Partner",
      goalValue: "78 / 100",
      goalProgress: 78,
      layout: "focus",
      backgroundStyle: "spotlight",
      cardStyle: "solid",
      accent: "#fb7185",
      accentSecondary: "#f59e0b",
      textColor: "#fff7ed",
      backgroundOpacity: 0.9,
      fontScale: 1.05,
      showClock: true,
      showGoal: true,
      showSocial: true,
      showRoomBadge: true,
      showCta: true,
    },
  },
  mono: {
    label: "Mono Grid",
    description: "Layout minimal blanc / bleu pour scène clean.",
    values: {
      title: "Be Right Back",
      sceneLabel: "BRB",
      subtitle: "Pause courte, on revient immédiatement.",
      message: "Reste dans le coin, la session reprend juste après cette courte pause.",
      cta: "Active les notifications pour le retour",
      social: "@studiohq",
      eventLabel: "Now playing",
      eventValue: "Lo-fi set",
      goalLabel: "Challenge du jour",
      goalValue: "12 / 20",
      goalProgress: 60,
      layout: "minimal",
      backgroundStyle: "grid",
      cardStyle: "outline",
      accent: "#e2e8f0",
      accentSecondary: "#60a5fa",
      textColor: "#f8fafc",
      backgroundOpacity: 0.6,
      fontScale: 0.95,
      showClock: true,
      showGoal: true,
      showSocial: false,
      showRoomBadge: true,
      showCta: false,
    },
  },
};

const DEFAULT_OVERLAY = structuredClone(PRESETS.aurora.values);
const DEMO_OVERLAY = {
  ...PRESETS.ember.values,
  title: "Tournoi en préparation",
  subtitle: "Bracket prêt, scène prête, le cast démarre très vite.",
  message: "Bienvenue sur la pré-show room. Installe-toi, partage le live et prépare le popcorn.",
  eventLabel: "Équipe à suivre",
  eventValue: "Team Nova",
  goalLabel: "Objectif viewers",
  goalValue: "1 250 / 2 000",
  goalProgress: 63,
};

const SESSION_KEY = "stream-overlay-session";
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const query = new URLSearchParams(window.location.search);
const roomFromUrl = query.get("room");

const builderView = document.getElementById("builder-view");
const overlayView = document.getElementById("overlay-view");
const overlayStage = document.getElementById("overlay-stage");
const overlayEmpty = document.getElementById("overlay-empty");
const authPanel = document.getElementById("auth-panel");
const dashboard = document.getElementById("dashboard");
const authForm = document.getElementById("auth-form");
const authStatus = document.getElementById("auth-status");
const authSubmit = document.getElementById("auth-submit");
const authReset = document.getElementById("auth-reset");
const editorForm = document.getElementById("editor-form");
const editorStatus = document.getElementById("editor-status");
const roomStat = document.getElementById("room-stat");
const syncStat = document.getElementById("sync-stat");
const themeStat = document.getElementById("theme-stat");
const layoutStat = document.getElementById("layout-stat");
const overlayLink = document.getElementById("overlay-link");
const previewSurface = document.getElementById("preview-surface");
const copyLinkBtn = document.getElementById("copy-link");
const copyJsonBtn = document.getElementById("copy-json");
const logoutBtn = document.getElementById("logout-btn");
const deleteBtn = document.getElementById("delete-account");
const resetOverlayBtn = document.getElementById("reset-overlay");
const applyDemoBtn = document.getElementById("apply-demo");
const presetButtonsContainer = document.getElementById("preset-buttons");
const tabs = Array.from(document.querySelectorAll(".tab"));

let authMode = "signup";
let currentUserId = null;
let previewClockTimer = null;
let liveOverlayClockTimer = null;
let lastPreviewConfig = structuredClone(DEFAULT_OVERLAY);
let lastLiveOverlayConfig = structuredClone(DEFAULT_OVERLAY);
let activePresetKey = "aurora";

renderPresetButtons();

if (roomFromUrl) {
  startOverlayMode(roomFromUrl);
} else {
  hydrateSession();
  renderPreview(DEFAULT_OVERLAY);
}

tabs.forEach((button) => {
  button.addEventListener("click", () => switchAuthMode(button.dataset.tab));
});

authReset.addEventListener("click", () => {
  authForm.reset();
  setStatus(authStatus, "", "");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const rawId = String(formData.get("accountId") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const accountId = normalizeAccountId(rawId);

  if (!accountId || accountId.length < 3) {
    setStatus(authStatus, "Choisis un identifiant d'au moins 3 caractères.", "error");
    return;
  }

  if (password.length < 6) {
    setStatus(authStatus, "Le mot de passe doit faire au moins 6 caractères.", "error");
    return;
  }

  authSubmit.disabled = true;
  setStatus(authStatus, authMode === "signup" ? "Création du compte..." : "Connexion en cours...", "");

  try {
    if (authMode === "signup") {
      await signUp(accountId, password);
      setStatus(authStatus, `Compte ${accountId} créé avec succès.`, "success");
    } else {
      await login(accountId, password);
      setStatus(authStatus, `Connecté en tant que ${accountId}.`, "success");
    }
  } catch (error) {
    setStatus(authStatus, error.message || "Une erreur est survenue.", "error");
  } finally {
    authSubmit.disabled = false;
  }
});

editorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUserId) {
    setStatus(editorStatus, "Connecte-toi pour enregistrer l'overlay.", "error");
    return;
  }

  const config = readOverlayForm();

  try {
    await update(ref(db, `users/${currentUserId}`), {
      overlay: config,
      updatedAt: serverTimestamp(),
    });
    lastPreviewConfig = config;
    renderPreview(config);
    updateDashboardMeta();
    setStatus(editorStatus, "Overlay enregistré dans Firebase.", "success");
  } catch (error) {
    setStatus(editorStatus, error.message || "Impossible d'enregistrer.", "error");
  }
});

editorForm.addEventListener("input", () => {
  const config = readOverlayForm();
  syncPresetFromConfig(config);
  lastPreviewConfig = config;
  renderPreview(config);
  updateDashboardMeta(undefined, config);
});

copyLinkBtn.addEventListener("click", async () => {
  if (!currentUserId) {
    setStatus(editorStatus, "Connecte-toi pour copier un lien.", "error");
    return;
  }

  const link = buildOverlayLink(currentUserId);

  try {
    await navigator.clipboard.writeText(link);
    setStatus(editorStatus, "Lien OBS copié dans le presse-papiers.", "success");
  } catch {
    setStatus(editorStatus, "Copie impossible automatiquement, utilise le lien affiché.", "error");
  }
});

copyJsonBtn.addEventListener("click", async () => {
  const config = readOverlayForm();

  try {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setStatus(editorStatus, "Configuration JSON copiée.", "success");
  } catch {
    setStatus(editorStatus, "Impossible de copier le JSON automatiquement.", "error");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  currentUserId = null;
  authPanel.classList.remove("hidden");
  dashboard.classList.add("hidden");
  setStatus(editorStatus, "Déconnecté.", "");
});

deleteBtn.addEventListener("click", async () => {
  if (!currentUserId) {
    return;
  }

  const confirmed = window.confirm(`Supprimer définitivement le compte ${currentUserId} et son overlay ?`);
  if (!confirmed) {
    return;
  }

  try {
    await remove(ref(db, `users/${currentUserId}`));
    localStorage.removeItem(SESSION_KEY);
    currentUserId = null;
    authPanel.classList.remove("hidden");
    dashboard.classList.add("hidden");
    authForm.reset();
    fillOverlayForm(DEFAULT_OVERLAY);
    renderPreview(DEFAULT_OVERLAY);
    setStatus(authStatus, "Compte supprimé.", "success");
  } catch (error) {
    setStatus(editorStatus, error.message || "Suppression impossible.", "error");
  }
});

resetOverlayBtn.addEventListener("click", () => {
  applyOverlayConfig(DEFAULT_OVERLAY, "Preset par défaut rechargé. Clique sur Enregistrer pour publier.");
});

applyDemoBtn.addEventListener("click", () => {
  applyOverlayConfig(DEMO_OVERLAY, "Démo chargée dans l'éditeur. Clique sur Enregistrer pour publier.");
});

function renderPresetButtons() {
  presetButtonsContainer.innerHTML = Object.entries(PRESETS)
    .map(
      ([key, preset]) => `
        <button class="preset-btn ${key === activePresetKey ? "active" : ""}" type="button" data-preset="${key}">
          <strong>${escapeHtml(preset.label)}</strong>
          <small>${escapeHtml(preset.description)}</small>
        </button>
      `,
    )
    .join("");

  Array.from(presetButtonsContainer.querySelectorAll("[data-preset]")).forEach((button) => {
    button.addEventListener("click", () => {
      const presetKey = button.dataset.preset;
      const preset = PRESETS[presetKey];
      if (!preset) {
        return;
      }

      activePresetKey = presetKey;
      applyOverlayConfig(preset.values, `Preset ${preset.label} appliqué.`);
      syncPresetButtons();
    });
  });
}

function syncPresetButtons() {
  Array.from(presetButtonsContainer.querySelectorAll("[data-preset]")).forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === activePresetKey);
  });
}

function switchAuthMode(nextMode) {
  authMode = nextMode;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === nextMode));
  authSubmit.textContent = nextMode === "signup" ? "Créer mon compte" : "Me connecter";
  setStatus(authStatus, "", "");
}

function normalizeAccountId(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);
}

async function hashPassword(accountId, password) {
  const source = `${accountId}:${password}`;
  const data = new TextEncoder().encode(source);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signUp(accountId, password) {
  const userRef = ref(db, `users/${accountId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    throw new Error("Cet identifiant existe déjà.");
  }

  const passwordHash = await hashPassword(accountId, password);
  await set(userRef, {
    accountId,
    passwordHash,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    overlay: DEFAULT_OVERLAY,
  });

  persistSession(accountId);
  await openDashboard(accountId);
}

async function login(accountId, password) {
  const userRef = ref(db, `users/${accountId}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    throw new Error("Compte introuvable.");
  }

  const userData = snapshot.val();
  const passwordHash = await hashPassword(accountId, password);
  if (userData.passwordHash !== passwordHash) {
    throw new Error("Mot de passe incorrect.");
  }

  persistSession(accountId);
  await openDashboard(accountId, userData.overlay || DEFAULT_OVERLAY);
}

function persistSession(accountId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId }));
}

function hydrateSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (session?.accountId) {
      openDashboard(session.accountId).catch(() => {
        localStorage.removeItem(SESSION_KEY);
      });
    } else {
      fillOverlayForm(DEFAULT_OVERLAY);
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
    fillOverlayForm(DEFAULT_OVERLAY);
  }
}

async function openDashboard(accountId, cachedOverlay = null) {
  currentUserId = accountId;

  const userRef = ref(db, `users/${accountId}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    authPanel.classList.remove("hidden");
    dashboard.classList.add("hidden");
    throw new Error("Compte introuvable dans la base.");
  }

  authPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  const data = snapshot.val();
  const overlay = { ...DEFAULT_OVERLAY, ...(cachedOverlay || data.overlay || {}) };
  fillOverlayForm(overlay);
  renderPreview(overlay);
  overlayLink.textContent = buildOverlayLink(accountId);
  roomStat.textContent = accountId;
  updateDashboardMeta(data.updatedAt, overlay);
  syncPresetFromConfig(overlay);
}

function updateDashboardMeta(timestamp = Date.now(), config = readOverlayForm()) {
  syncStat.textContent = new Date(timestamp || Date.now()).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
  overlayLink.textContent = currentUserId ? buildOverlayLink(currentUserId) : "Connecte-toi pour générer un lien";
  roomStat.textContent = currentUserId || "preview";
  themeStat.textContent = PRESETS[activePresetKey]?.label || "Custom";
  layoutStat.textContent = capitalize(config.layout || DEFAULT_OVERLAY.layout);
}

function overlayField(name) {
  return editorForm.elements.namedItem(name);
}

function fillOverlayForm(config) {
  const merged = { ...DEFAULT_OVERLAY, ...config };
  setFieldValue("title", merged.title);
  setFieldValue("sceneLabel", merged.sceneLabel);
  setFieldValue("subtitle", merged.subtitle);
  setFieldValue("message", merged.message);
  setFieldValue("cta", merged.cta);
  setFieldValue("social", merged.social);
  setFieldValue("eventLabel", merged.eventLabel);
  setFieldValue("eventValue", merged.eventValue);
  setFieldValue("goalLabel", merged.goalLabel);
  setFieldValue("goalValue", merged.goalValue);
  setFieldValue("goalProgress", Number(merged.goalProgress));
  setFieldValue("layout", merged.layout);
  setFieldValue("backgroundStyle", merged.backgroundStyle);
  setFieldValue("cardStyle", merged.cardStyle);
  setFieldValue("accent", merged.accent);
  setFieldValue("accentSecondary", merged.accentSecondary);
  setFieldValue("textColor", merged.textColor);
  setFieldValue("backgroundOpacity", Number(merged.backgroundOpacity));
  setFieldValue("fontScale", Number(merged.fontScale));
  setFieldValue("showClock", String(Boolean(merged.showClock)));
  setFieldValue("showGoal", String(Boolean(merged.showGoal)));
  setFieldValue("showSocial", String(Boolean(merged.showSocial)));
  setFieldValue("showRoomBadge", String(Boolean(merged.showRoomBadge)));
  setFieldValue("showCta", String(Boolean(merged.showCta)));
}

function setFieldValue(name, value) {
  const field = overlayField(name);
  if (field) {
    field.value = value;
  }
}

function readOverlayForm() {
  return {
    title: readText("title", DEFAULT_OVERLAY.title),
    sceneLabel: readText("sceneLabel", DEFAULT_OVERLAY.sceneLabel),
    subtitle: readText("subtitle", DEFAULT_OVERLAY.subtitle),
    message: readText("message", DEFAULT_OVERLAY.message),
    cta: readText("cta", DEFAULT_OVERLAY.cta),
    social: readText("social", DEFAULT_OVERLAY.social),
    eventLabel: readText("eventLabel", DEFAULT_OVERLAY.eventLabel),
    eventValue: readText("eventValue", DEFAULT_OVERLAY.eventValue),
    goalLabel: readText("goalLabel", DEFAULT_OVERLAY.goalLabel),
    goalValue: readText("goalValue", DEFAULT_OVERLAY.goalValue),
    goalProgress: clampNumber(overlayField("goalProgress").value || DEFAULT_OVERLAY.goalProgress, 0, 100),
    layout: readChoice("layout", ["split", "focus", "minimal"], DEFAULT_OVERLAY.layout),
    backgroundStyle: readChoice("backgroundStyle", ["aurora", "grid", "spotlight"], DEFAULT_OVERLAY.backgroundStyle),
    cardStyle: readChoice("cardStyle", ["glass", "solid", "outline"], DEFAULT_OVERLAY.cardStyle),
    accent: overlayField("accent").value || DEFAULT_OVERLAY.accent,
    accentSecondary: overlayField("accentSecondary").value || DEFAULT_OVERLAY.accentSecondary,
    textColor: overlayField("textColor").value || DEFAULT_OVERLAY.textColor,
    backgroundOpacity: clampNumber(overlayField("backgroundOpacity").value || DEFAULT_OVERLAY.backgroundOpacity, 0.25, 0.98),
    fontScale: clampNumber(overlayField("fontScale").value || DEFAULT_OVERLAY.fontScale, 0.9, 1.2),
    showClock: overlayField("showClock").value === "true",
    showGoal: overlayField("showGoal").value === "true",
    showSocial: overlayField("showSocial").value === "true",
    showRoomBadge: overlayField("showRoomBadge").value === "true",
    showCta: overlayField("showCta").value === "true",
  };
}

function readText(name, fallback) {
  const value = String(overlayField(name)?.value || "").trim();
  return value || fallback;
}

function readChoice(name, allowed, fallback) {
  const value = String(overlayField(name)?.value || fallback);
  return allowed.includes(value) ? value : fallback;
}

function buildOverlayLink(accountId) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("room", accountId);
  return url.toString();
}

function renderPreview(config) {
  lastPreviewConfig = config;
  paintOverlay(previewSurface, config, currentUserId || "preview", false);
  startClock(previewSurface, config.showClock, false);
}

async function startOverlayMode(room) {
  document.getElementById("app").classList.add("hidden");
  overlayView.classList.remove("hidden");
  builderView.classList.add("hidden");

  const normalizedRoom = normalizeAccountId(room);
  if (!normalizedRoom) {
    overlayEmpty.classList.remove("hidden");
    return;
  }

  const overlayRef = ref(db, `users/${normalizedRoom}/overlay`);
  onValue(overlayRef, (snapshot) => {
    if (!snapshot.exists()) {
      overlayEmpty.classList.remove("hidden");
      overlayStage.innerHTML = "";
      return;
    }

    overlayEmpty.classList.add("hidden");
    const config = { ...DEFAULT_OVERLAY, ...snapshot.val() };
    lastLiveOverlayConfig = config;
    paintOverlay(overlayStage, config, normalizedRoom, true);
    startClock(overlayStage, config.showClock, true);
  });
}

function startClock(container, enabled, liveMode) {
  if (liveMode) {
    clearInterval(liveOverlayClockTimer);
  } else {
    clearInterval(previewClockTimer);
  }

  const tick = () => {
    const clockTarget = container.querySelector("[data-clock]");
    if (clockTarget) {
      clockTarget.textContent = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  };

  if (!enabled) {
    tick();
    return;
  }

  tick();
  const timer = window.setInterval(tick, 1000);
  if (liveMode) {
    liveOverlayClockTimer = timer;
  } else {
    previewClockTimer = timer;
  }
}

function paintOverlay(container, config, room, transparentPage) {
  const foreground = config.textColor || DEFAULT_OVERLAY.textColor;
  const accent = config.accent || DEFAULT_OVERLAY.accent;
  const accentSecondary = config.accentSecondary || DEFAULT_OVERLAY.accentSecondary;
  const panelAlpha = clampNumber(config.backgroundOpacity ?? DEFAULT_OVERLAY.backgroundOpacity, 0.25, 0.98);
  const baseCard = hexToRgba("#0f172a", panelAlpha);
  const baseCardSolid = mixHex(accent, "#0f172a", 0.18);
  const shadowColor = hexToRgba(accent, 0.2);
  const accentSoft = hexToRgba(accent, 0.25);
  const secondarySoft = hexToRgba(accentSecondary, 0.24);
  const textSoft = hexToRgba(foreground, 0.76);
  const scale = clampNumber(config.fontScale ?? DEFAULT_OVERLAY.fontScale, 0.9, 1.2);
  const progressWidth = clampNumber(config.goalProgress ?? DEFAULT_OVERLAY.goalProgress, 0, 100);
  const cardStyleClass = `card-${config.cardStyle || DEFAULT_OVERLAY.cardStyle}`;
  const layoutClass = `layout-${config.layout || DEFAULT_OVERLAY.layout}`;
  const backgroundClass = `bg-${config.backgroundStyle || DEFAULT_OVERLAY.backgroundStyle}`;

  container.innerHTML = `
    <div
      class="overlay-root ${layoutClass} ${backgroundClass}"
      style="
        --overlay-text:${foreground};
        --overlay-text-soft:${textSoft};
        --overlay-accent:${accent};
        --overlay-secondary:${accentSecondary};
        --overlay-accent-soft:${accentSoft};
        --overlay-secondary-soft:${secondarySoft};
        --overlay-card-bg:${baseCard};
        --overlay-card-bg-solid:${baseCardSolid};
        --overlay-card-border:${hexToRgba(accent, 0.42)};
        --overlay-scene-border:${hexToRgba(accentSecondary, 0.48)};
        --overlay-shadow:${shadowColor};
        ${transparentPage ? "background: transparent;" : ""}
        transform: scale(${scale});
      "
    >
      <div class="overlay-topbar">
        <div class="overlay-card ${cardStyleClass} overlay-hero">
          <span class="overlay-scene">● ${escapeHtml(config.sceneLabel)}</span>
          <div>
            <h2 class="overlay-title">${escapeHtml(config.title)}</h2>
            <p class="overlay-subtitle">${escapeHtml(config.subtitle)}</p>
          </div>
          ${config.showCta ? `<p class="overlay-cta">${escapeHtml(config.cta)}</p>` : ""}
        </div>

        <div class="overlay-right-stack">
          ${config.showClock ? renderWidget(cardStyleClass, "🕒", "Horloge", '<strong class="overlay-widget-value" data-clock>--:--:--</strong>') : ""}
          ${renderWidget(cardStyleClass, "✨", escapeHtml(config.eventLabel), `<strong class="overlay-widget-value">${escapeHtml(config.eventValue)}</strong>`)}
        </div>
      </div>

      <div class="overlay-filler"></div>

      <div class="overlay-footer">
        <div class="overlay-badges">
          ${config.showSocial ? renderFooterCard(cardStyleClass, "📣", `<strong>${escapeHtml(config.social)}</strong>`) : ""}
          ${config.showRoomBadge ? renderFooterCard(cardStyleClass, "🔗", `<span class="overlay-room">${escapeHtml(`?room=${room}`)}</span>`) : ""}
        </div>

        <div class="overlay-right-stack">
          ${config.showGoal ? `
            <div class="overlay-card ${cardStyleClass} overlay-goal-card">
              <div class="overlay-meta-row">
                <span class="overlay-small">${escapeHtml(config.goalLabel)}</span>
                <strong>${escapeHtml(config.goalValue)}</strong>
              </div>
              <div class="overlay-progress-track">
                <div class="overlay-progress-bar" style="width:${progressWidth}%"></div>
              </div>
              <span class="overlay-small">Progression : ${progressWidth}%</span>
            </div>
          ` : ""}

          <div class="overlay-card ${cardStyleClass} overlay-message-card">
            <span class="overlay-small">Message stream</span>
            <p class="overlay-message">${escapeHtml(config.message)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWidget(cardStyleClass, icon, label, valueMarkup) {
  return `
    <div class="overlay-card ${cardStyleClass} overlay-widget">
      <span class="overlay-small">${icon} ${label}</span>
      ${valueMarkup}
    </div>
  `;
}

function renderFooterCard(cardStyleClass, icon, content) {
  return `<div class="overlay-card ${cardStyleClass} overlay-footer-card"><span>${icon}</span>${content}</div>`;
}

function applyOverlayConfig(config, statusMessage) {
  fillOverlayForm(config);
  const nextConfig = readOverlayForm();
  syncPresetFromConfig(nextConfig);
  renderPreview(nextConfig);
  updateDashboardMeta(undefined, nextConfig);
  setStatus(editorStatus, statusMessage, "");
}

function syncPresetFromConfig(config) {
  const matchedEntry = Object.entries(PRESETS).find(([, preset]) => shallowOverlayEquals(config, preset.values));
  activePresetKey = matchedEntry?.[0] || "custom";
  syncPresetButtons();
}

function shallowOverlayEquals(left, right) {
  return Object.keys(DEFAULT_OVERLAY).every((key) => String(left[key]) === String(right[key]));
}

function hexToRgba(hex, alpha = 1) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  const bigint = Number.parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(hexA, hexB, weight = 0.5) {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const mix = (a, b) => Math.round(a * (1 - weight) + b * weight);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  const bigint = Number.parseInt(full, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function setStatus(target, message, type = "") {
  target.textContent = message;
  target.className = `status${type ? ` ${type}` : ""}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function capitalize(value) {
  if (!value) {
    return "-";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
