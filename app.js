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

const SESSION_KEY = "stream-overlay-session";
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const DEFAULT_SCENE_ID = "scene-main";

const PRESETS = {
  nebula: {
    label: "Nebula Command",
    description: "Scene premium violet/cyan avec HUD complet et hiérarchie forte.",
    create: () => ({
      sceneName: "Nebula Starting Soon",
      layoutMode: "freeform",
      backgroundStyle: "nebula",
      cardStyle: "glass",
      accent: "#8b5cf6",
      accentSecondary: "#22d3ee",
      textColor: "#f8fafc",
      panelColor: "#0f172a",
      panelOpacity: 0.72,
      blur: 16,
      radius: 24,
      fontScale: 1,
      fontFamily: "Inter, sans-serif",
      showGrid: true,
      snapToGrid: true,
      gridSize: 20,
      safeArea: 24,
      elements: [
        createElement("title", {
          name: "Hero principal",
          title: "Starting Soon",
          body: "Le live démarre dans quelques minutes. Prépare le chat et le setup.",
          icon: "●",
          x: 72,
          y: 110,
          w: 760,
          h: 250,
          fontSize: 52,
          accentColor: "#8b5cf6",
        }),
        createElement("text", {
          name: "Message central",
          title: "Brief stream",
          body: "Overlay totalement éditable : chaque bloc se déplace, se masque et se re-style indépendamment.",
          icon: "✦",
          x: 76,
          y: 386,
          w: 520,
          h: 180,
          fontSize: 24,
          accentColor: "#22d3ee",
        }),
        createElement("goal", {
          name: "Objectif communauté",
          title: "Objectif subs",
          body: "Road to Partner",
          value: "178 / 250",
          progress: 71,
          icon: "🎯",
          x: 1324,
          y: 770,
          w: 510,
          h: 190,
          fontSize: 20,
          accentColor: "#22d3ee",
        }),
        createElement("clock", {
          name: "Horloge live",
          title: "Heure locale",
          body: "Synchronisation temps réel",
          icon: "🕒",
          x: 1484,
          y: 82,
          w: 350,
          h: 150,
          fontSize: 24,
          accentColor: "#8b5cf6",
        }),
        createElement("stat", {
          name: "Dernier event",
          title: "Dernier follow",
          value: "nova_prime",
          body: "Merci pour le soutien 💜",
          icon: "✨",
          x: 1460,
          y: 254,
          w: 374,
          h: 160,
          fontSize: 22,
          accentColor: "#22d3ee",
        }),
        createElement("custom", {
          name: "Social card",
          title: "@streamer",
          body: "TikTok • Twitch • YouTube",
          value: "?room=streamer",
          icon: "📣",
          x: 1320,
          y: 592,
          w: 514,
          h: 150,
          fontSize: 24,
          accentColor: "#8b5cf6",
        }),
      ],
    }),
  },
  tournament: {
    label: "Tournament Ops",
    description: "Version plus agressive pour casting, event ou show esport.",
    create: () => ({
      sceneName: "Tournament Control",
      layoutMode: "focus-left",
      backgroundStyle: "spotlight",
      cardStyle: "solid",
      accent: "#fb7185",
      accentSecondary: "#f59e0b",
      textColor: "#fff7ed",
      panelColor: "#31111c",
      panelOpacity: 0.92,
      blur: 6,
      radius: 18,
      fontScale: 1.04,
      fontFamily: "'Space Grotesk', sans-serif",
      showGrid: true,
      snapToGrid: true,
      gridSize: 16,
      safeArea: 20,
      elements: [
        createElement("title", {
          name: "Headline",
          title: "Tournoi en préparation",
          body: "Bracket finalisé, observer prêt, lancement imminent.",
          icon: "LIVE",
          x: 84,
          y: 132,
          w: 950,
          h: 250,
          fontSize: 58,
          accentColor: "#fb7185",
          bgOpacity: 0.9,
        }),
        createElement("text", {
          name: "Infos planning",
          title: "À suivre",
          body: "Top 8 à venir • Interview winner side • Analyse desk après match",
          icon: "📡",
          x: 84,
          y: 418,
          w: 620,
          h: 192,
          fontSize: 24,
          accentColor: "#f59e0b",
          bgOpacity: 0.86,
        }),
        createElement("stat", {
          name: "MVP watch",
          title: "Joueur à suivre",
          value: "Luna / 1.42 rating",
          body: "Entrée en scène dans quelques instants",
          icon: "🔥",
          x: 1370,
          y: 146,
          w: 420,
          h: 180,
          fontSize: 24,
          accentColor: "#fb7185",
          bgOpacity: 0.9,
        }),
        createElement("goal", {
          name: "Viewers goal",
          title: "Objectif viewers",
          value: "14 250 / 20 000",
          body: "Merci pour la force",
          progress: 71,
          icon: "🚀",
          x: 1200,
          y: 796,
          w: 590,
          h: 180,
          fontSize: 22,
          accentColor: "#f59e0b",
          bgOpacity: 0.92,
        }),
        createElement("clock", {
          name: "Timer",
          title: "On air dans",
          body: "Heure de régie",
          icon: "⏱",
          x: 1380,
          y: 360,
          w: 410,
          h: 160,
          fontSize: 28,
          accentColor: "#f59e0b",
        }),
      ],
    }),
  },
  clean: {
    label: "Clean Minimal",
    description: "Overlay sobre, plus éditorial, pour intermission ou BRB très clean.",
    create: () => ({
      sceneName: "Minimal BRB",
      layoutMode: "centered",
      backgroundStyle: "clean",
      cardStyle: "outline",
      accent: "#e2e8f0",
      accentSecondary: "#60a5fa",
      textColor: "#f8fafc",
      panelColor: "#0f172a",
      panelOpacity: 0.5,
      blur: 0,
      radius: 20,
      fontScale: 0.96,
      fontFamily: "Inter, sans-serif",
      showGrid: false,
      snapToGrid: false,
      gridSize: 20,
      safeArea: 34,
      elements: [
        createElement("title", {
          name: "BRB title",
          title: "Be Right Back",
          body: "Pause courte, retour dans quelques minutes.",
          icon: "BRB",
          x: 420,
          y: 240,
          w: 1080,
          h: 220,
          fontSize: 56,
          align: "center",
          accentColor: "#60a5fa",
          bgOpacity: 0.24,
        }),
        createElement("custom", {
          name: "Notes",
          title: "Pendant la pause",
          body: "Hydrate-toi • Partage le live • Reviens dans 3 minutes",
          value: "@studiohq",
          icon: "✦",
          x: 640,
          y: 520,
          w: 640,
          h: 180,
          fontSize: 24,
          align: "center",
          accentColor: "#e2e8f0",
          bgOpacity: 0.2,
        }),
        createElement("clock", {
          name: "Clock simple",
          title: "Retour prévu",
          body: "Heure actuelle",
          icon: "🕒",
          x: 790,
          y: 744,
          w: 340,
          h: 150,
          fontSize: 24,
          align: "center",
          accentColor: "#60a5fa",
          bgOpacity: 0.24,
        }),
      ],
    }),
  },
};

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
const sceneForm = document.getElementById("scene-form");
const elementForm = document.getElementById("element-form");
const elementEmpty = document.getElementById("element-empty");
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
const saveSceneBtn = document.getElementById("save-scene");
const presetButtonsContainer = document.getElementById("preset-buttons");
const layersList = document.getElementById("layers-list");
const duplicateElementBtn = document.getElementById("duplicate-element");
const toggleElementBtn = document.getElementById("toggle-element");
const removeElementBtn = document.getElementById("remove-element");
const tabs = Array.from(document.querySelectorAll(".tab"));
const addElementButtons = Array.from(document.querySelectorAll(".add-element"));

let authMode = "signup";
let currentUserId = null;
let activePresetKey = "nebula";
let selectedElementId = null;
let previewClockTimer = null;
let liveOverlayClockTimer = null;
let previewScene = createSceneFromPreset("nebula");
let lastSavedUpdatedAt = null;
let dragState = null;

renderPresetButtons();
wireEvents();

if (roomFromUrl) {
  startOverlayMode(roomFromUrl);
} else {
  hydrateSession();
  renderPreview(previewScene);
}

function wireEvents() {
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

  sceneForm.addEventListener("input", () => {
    applySceneFormToState();
    syncPresetFromState();
    renderPreview(previewScene);
    updateDashboardMeta(undefined, previewScene);
  });

  elementForm.addEventListener("input", () => {
    applyElementFormToState();
    syncPresetFromState();
    renderPreview(previewScene);
    renderLayers();
    updateDashboardMeta(undefined, previewScene);
  });

  saveSceneBtn.addEventListener("click", async () => {
    if (!currentUserId) {
      setStatus(editorStatus, "Connecte-toi pour enregistrer la scène.", "error");
      return;
    }

    try {
      await update(ref(db, `users/${currentUserId}`), {
        overlay: sanitizeScene(previewScene),
        updatedAt: serverTimestamp(),
      });
      lastSavedUpdatedAt = Date.now();
      setStatus(editorStatus, "Scène sauvegardée dans Firebase.", "success");
      updateDashboardMeta(lastSavedUpdatedAt, previewScene);
    } catch (error) {
      setStatus(editorStatus, error.message || "Impossible d'enregistrer la scène.", "error");
    }
  });

  copyLinkBtn.addEventListener("click", async () => {
    if (!currentUserId) {
      setStatus(editorStatus, "Connecte-toi pour copier le lien OBS.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(buildOverlayLink(currentUserId));
      setStatus(editorStatus, "Lien OBS copié dans le presse-papiers.", "success");
    } catch {
      setStatus(editorStatus, "Copie automatique impossible, utilise le lien affiché.", "warning");
    }
  });

  copyJsonBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sanitizeScene(previewScene), null, 2));
      setStatus(editorStatus, "JSON de scène copié.", "success");
    } catch {
      setStatus(editorStatus, "Impossible de copier le JSON automatiquement.", "warning");
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    currentUserId = null;
    authPanel.classList.remove("hidden");
    dashboard.classList.add("hidden");
    previewScene = createSceneFromPreset("nebula");
    selectedElementId = previewScene.elements[0]?.id || null;
    fillSceneForm(previewScene);
    renderPreview(previewScene);
    renderLayers();
    renderElementInspector();
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
      previewScene = createSceneFromPreset("nebula");
      selectedElementId = previewScene.elements[0]?.id || null;
      fillSceneForm(previewScene);
      renderPreview(previewScene);
      renderLayers();
      renderElementInspector();
      setStatus(authStatus, "Compte supprimé.", "success");
    } catch (error) {
      setStatus(editorStatus, error.message || "Suppression impossible.", "error");
    }
  });

  resetOverlayBtn.addEventListener("click", () => {
    previewScene = createSceneFromPreset("nebula");
    activePresetKey = "nebula";
    selectedElementId = previewScene.elements[0]?.id || null;
    hydrateEditor(previewScene, "Scène par défaut rechargée. Clique sur Enregistrer pour publier.");
  });

  applyDemoBtn.addEventListener("click", () => {
    previewScene = createSceneFromPreset("tournament");
    activePresetKey = "tournament";
    selectedElementId = previewScene.elements[0]?.id || null;
    hydrateEditor(previewScene, "Démo e-sport chargée dans le builder.");
  });

  addElementButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.kind;
      addElement(kind);
    });
  });

  duplicateElementBtn.addEventListener("click", () => duplicateSelectedElement());
  toggleElementBtn.addEventListener("click", () => toggleSelectedElement());
  removeElementBtn.addEventListener("click", () => removeSelectedElement());

  previewSurface.addEventListener("pointerdown", onCanvasPointerDown);
  window.addEventListener("pointermove", onCanvasPointerMove);
  window.addEventListener("pointerup", onCanvasPointerUp);
  window.addEventListener("pointercancel", onCanvasPointerUp);
}

function createSceneFromPreset(key = "nebula") {
  const preset = PRESETS[key] || PRESETS.nebula;
  return normalizeScene({
    id: DEFAULT_SCENE_ID,
    version: 2,
    ...preset.create(),
  });
}

function createElement(kind, overrides = {}) {
  const base = {
    id: crypto.randomUUID(),
    kind,
    name: elementKindLabel(kind),
    enabled: true,
    title: "",
    body: "",
    value: "",
    icon: "✦",
    note: "",
    progress: 50,
    align: "left",
    x: 80,
    y: 80,
    w: 360,
    h: 150,
    fontSize: 24,
    fontWeight: 700,
    radius: 22,
    opacity: 1,
    rotation: 0,
    zIndex: 10,
    bgColor: "#0f172a",
    textColor: "#f8fafc",
    accentColor: "#8b5cf6",
    bgOpacity: 0.72,
  };

  const templates = {
    title: {
      name: "Titre héro",
      title: "Starting Soon",
      body: "Le live démarre très vite.",
      icon: "●",
      w: 680,
      h: 220,
      fontSize: 50,
      zIndex: 20,
    },
    text: {
      name: "Carte texte",
      title: "Bloc texte",
      body: "Ajoute ici n'importe quelle info importante pour ta scène.",
      icon: "✦",
      w: 420,
      h: 170,
      fontSize: 22,
    },
    stat: {
      name: "Stat stream",
      title: "Dernier event",
      body: "Merci pour le soutien",
      value: "viewer_42",
      icon: "✨",
      w: 360,
      h: 160,
      fontSize: 24,
    },
    goal: {
      name: "Objectif",
      title: "Objectif du stream",
      body: "Road to next milestone",
      value: "45 / 100",
      progress: 45,
      icon: "🎯",
      w: 430,
      h: 180,
      fontSize: 22,
    },
    clock: {
      name: "Horloge",
      title: "Heure locale",
      body: "Synchronisation live",
      icon: "🕒",
      w: 320,
      h: 150,
      fontSize: 24,
    },
    custom: {
      name: "Widget custom",
      title: "Bloc custom",
      body: "Mets absolument ce que tu veux ici.",
      value: "Texte secondaire / tag / room",
      icon: "🛠",
      w: 420,
      h: 170,
      fontSize: 22,
    },
  };

  return normalizeElement({
    ...base,
    ...(templates[kind] || templates.custom),
    ...overrides,
  });
}

function normalizeScene(scene) {
  const normalized = {
    id: scene.id || DEFAULT_SCENE_ID,
    version: 2,
    sceneName: String(scene.sceneName || "Scene overlay").slice(0, 60),
    layoutMode: pick(scene.layoutMode, ["freeform", "focus-left", "focus-right", "centered"], "freeform"),
    backgroundStyle: pick(scene.backgroundStyle, ["nebula", "grid", "spotlight", "mesh", "clean"], "nebula"),
    cardStyle: pick(scene.cardStyle, ["glass", "solid", "outline"], "glass"),
    accent: safeColor(scene.accent, "#8b5cf6"),
    accentSecondary: safeColor(scene.accentSecondary, "#22d3ee"),
    textColor: safeColor(scene.textColor, "#f8fafc"),
    panelColor: safeColor(scene.panelColor, "#0f172a"),
    panelOpacity: clamp(scene.panelOpacity ?? 0.72, 0.18, 1),
    blur: clamp(scene.blur ?? 16, 0, 28),
    radius: clamp(scene.radius ?? 24, 4, 40),
    fontScale: clamp(scene.fontScale ?? 1, 0.8, 1.4),
    fontFamily: String(scene.fontFamily || "Inter, sans-serif"),
    showGrid: Boolean(scene.showGrid),
    snapToGrid: Boolean(scene.snapToGrid),
    gridSize: clamp(scene.gridSize ?? 20, 8, 64),
    safeArea: clamp(scene.safeArea ?? 24, 0, 80),
    elements: Array.isArray(scene.elements) ? scene.elements.map((element, index) => normalizeElement({ ...element, zIndex: element?.zIndex ?? 10 + index })) : [],
  };

  if (!normalized.elements.length) {
    normalized.elements = createSceneFromPreset("nebula").elements;
  }

  return normalized;
}

function normalizeElement(element) {
  return {
    id: element.id || crypto.randomUUID(),
    kind: pick(element.kind, ["title", "text", "stat", "goal", "clock", "custom"], "custom"),
    name: String(element.name || elementKindLabel(element.kind)).slice(0, 40),
    enabled: element.enabled !== false,
    title: String(element.title || "").slice(0, 80),
    body: String(element.body || "").slice(0, 260),
    value: String(element.value || "").slice(0, 80),
    icon: String(element.icon || "✦").slice(0, 10),
    note: String(element.note || "").slice(0, 120),
    progress: clamp(element.progress ?? 50, 0, 100),
    align: pick(element.align, ["left", "center", "right"], "left"),
    x: clamp(element.x ?? 80, 0, CANVAS_WIDTH - 80),
    y: clamp(element.y ?? 80, 0, CANVAS_HEIGHT - 60),
    w: clamp(element.w ?? 360, 80, CANVAS_WIDTH),
    h: clamp(element.h ?? 150, 50, CANVAS_HEIGHT),
    fontSize: clamp(element.fontSize ?? 24, 12, 76),
    fontWeight: clamp(element.fontWeight ?? 700, 400, 900),
    radius: clamp(element.radius ?? 22, 0, 40),
    opacity: clamp(element.opacity ?? 1, 0.2, 1),
    rotation: clamp(element.rotation ?? 0, -15, 15),
    zIndex: clamp(element.zIndex ?? 10, 1, 999),
    bgColor: safeColor(element.bgColor, "#0f172a"),
    textColor: safeColor(element.textColor, "#f8fafc"),
    accentColor: safeColor(element.accentColor, "#8b5cf6"),
    bgOpacity: clamp(element.bgOpacity ?? 0.72, 0, 1),
  };
}

function elementKindLabel(kind) {
  return {
    title: "Titre héro",
    text: "Carte texte",
    stat: "Stat / event",
    goal: "Objectif",
    clock: "Horloge",
    custom: "Widget custom",
  }[kind] || "Widget";
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
    overlay: sanitizeScene(createSceneFromPreset("nebula")),
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
  await openDashboard(accountId, userData.overlay || null, userData.updatedAt || null);
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
      previewScene = createSceneFromPreset("nebula");
      selectedElementId = previewScene.elements[0]?.id || null;
      fillSceneForm(previewScene);
      renderLayers();
      renderElementInspector();
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
    previewScene = createSceneFromPreset("nebula");
    selectedElementId = previewScene.elements[0]?.id || null;
    fillSceneForm(previewScene);
    renderLayers();
    renderElementInspector();
  }
}

async function openDashboard(accountId, cachedOverlay = null, cachedUpdatedAt = null) {
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
  previewScene = normalizeScene(migrateLegacyOverlay(cachedOverlay || data.overlay || null, accountId));
  selectedElementId = previewScene.elements[0]?.id || null;
  lastSavedUpdatedAt = cachedUpdatedAt || data.updatedAt || Date.now();

  hydrateEditor(previewScene);
  roomStat.textContent = accountId;
  overlayLink.textContent = buildOverlayLink(accountId);
  updateDashboardMeta(lastSavedUpdatedAt, previewScene);
  syncPresetFromState();
}

function hydrateEditor(scene, message = "") {
  fillSceneForm(scene);
  renderLayers();
  renderElementInspector();
  renderPreview(scene);
  if (message) {
    setStatus(editorStatus, message, "success");
  }
}

function fillSceneForm(scene) {
  setFieldValue(sceneForm, "sceneName", scene.sceneName);
  setFieldValue(sceneForm, "layoutMode", scene.layoutMode);
  setFieldValue(sceneForm, "backgroundStyle", scene.backgroundStyle);
  setFieldValue(sceneForm, "cardStyle", scene.cardStyle);
  setFieldValue(sceneForm, "accent", scene.accent);
  setFieldValue(sceneForm, "accentSecondary", scene.accentSecondary);
  setFieldValue(sceneForm, "textColor", scene.textColor);
  setFieldValue(sceneForm, "panelColor", scene.panelColor);
  setFieldValue(sceneForm, "panelOpacity", scene.panelOpacity);
  setFieldValue(sceneForm, "blur", scene.blur);
  setFieldValue(sceneForm, "radius", scene.radius);
  setFieldValue(sceneForm, "fontScale", scene.fontScale);
  setFieldValue(sceneForm, "fontFamily", scene.fontFamily);
  setFieldValue(sceneForm, "showGrid", String(scene.showGrid));
  setFieldValue(sceneForm, "snapToGrid", String(scene.snapToGrid));
  setFieldValue(sceneForm, "gridSize", scene.gridSize);
  setFieldValue(sceneForm, "safeArea", scene.safeArea);
}

function renderLayers() {
  const elements = [...previewScene.elements].sort((a, b) => b.zIndex - a.zIndex);
  layersList.innerHTML = elements
    .map((element) => {
      const active = element.id === selectedElementId;
      return `
        <div class="layer-row ${active ? "active" : ""}" data-layer-id="${element.id}">
          <button class="layer-btn layer-pill" type="button" data-action="select" data-id="${element.id}">${element.enabled ? "👁" : "🙈"}</button>
          <div class="layer-main">
            <span class="layer-title">${escapeHtml(element.name || elementKindLabel(element.kind))}</span>
            <span class="layer-subtitle">${escapeHtml(elementKindLabel(element.kind))} · z ${element.zIndex}${element.note ? ` · ${escapeHtml(element.note)}` : ""}</span>
          </div>
          <div class="layer-actions">
            <button class="layer-btn" type="button" data-action="toggle" data-id="${element.id}">On/Off</button>
            <button class="layer-btn" type="button" data-action="up" data-id="${element.id}">↑</button>
            <button class="layer-btn" type="button" data-action="down" data-id="${element.id}">↓</button>
          </div>
        </div>
      `;
    })
    .join("");

  Array.from(layersList.querySelectorAll("[data-action]")).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (!id) {
        return;
      }

      if (action === "select") {
        selectedElementId = id;
      }
      if (action === "toggle") {
        updateElement(id, (element) => {
          element.enabled = !element.enabled;
        });
      }
      if (action === "up") {
        bumpElementZ(id, 1);
      }
      if (action === "down") {
        bumpElementZ(id, -1);
      }

      renderLayers();
      renderElementInspector();
      renderPreview(previewScene);
      updateDashboardMeta(undefined, previewScene);
    });
  });
}

function renderElementInspector() {
  const element = getSelectedElement();
  if (!element) {
    elementForm.classList.add("hidden");
    elementEmpty.classList.remove("hidden");
    return;
  }

  elementForm.classList.remove("hidden");
  elementEmpty.classList.add("hidden");

  setFieldValue(elementForm, "name", element.name);
  setFieldValue(elementForm, "enabled", String(element.enabled));
  setFieldValue(elementForm, "kind", elementKindLabel(element.kind));
  setFieldValue(elementForm, "title", element.title);
  setFieldValue(elementForm, "body", element.body);
  setFieldValue(elementForm, "value", element.value);
  setFieldValue(elementForm, "icon", element.icon);
  setFieldValue(elementForm, "progress", element.progress);
  setFieldValue(elementForm, "align", element.align);
  setFieldValue(elementForm, "x", element.x);
  setFieldValue(elementForm, "y", element.y);
  setFieldValue(elementForm, "w", element.w);
  setFieldValue(elementForm, "h", element.h);
  setFieldValue(elementForm, "fontSize", element.fontSize);
  setFieldValue(elementForm, "fontWeight", element.fontWeight);
  setFieldValue(elementForm, "radius", element.radius);
  setFieldValue(elementForm, "opacity", element.opacity);
  setFieldValue(elementForm, "rotation", element.rotation);
  setFieldValue(elementForm, "zIndex", element.zIndex);
  setFieldValue(elementForm, "bgColor", element.bgColor);
  setFieldValue(elementForm, "textColor", element.textColor);
  setFieldValue(elementForm, "accentColor", element.accentColor);
  setFieldValue(elementForm, "bgOpacity", element.bgOpacity);
  setFieldValue(elementForm, "note", element.note);
}

function applySceneFormToState() {
  previewScene = normalizeScene({
    ...previewScene,
    sceneName: readFormValue(sceneForm, "sceneName", previewScene.sceneName),
    layoutMode: readFormValue(sceneForm, "layoutMode", previewScene.layoutMode),
    backgroundStyle: readFormValue(sceneForm, "backgroundStyle", previewScene.backgroundStyle),
    cardStyle: readFormValue(sceneForm, "cardStyle", previewScene.cardStyle),
    accent: readFormValue(sceneForm, "accent", previewScene.accent),
    accentSecondary: readFormValue(sceneForm, "accentSecondary", previewScene.accentSecondary),
    textColor: readFormValue(sceneForm, "textColor", previewScene.textColor),
    panelColor: readFormValue(sceneForm, "panelColor", previewScene.panelColor),
    panelOpacity: numberFormValue(sceneForm, "panelOpacity", previewScene.panelOpacity),
    blur: numberFormValue(sceneForm, "blur", previewScene.blur),
    radius: numberFormValue(sceneForm, "radius", previewScene.radius),
    fontScale: numberFormValue(sceneForm, "fontScale", previewScene.fontScale),
    fontFamily: readFormValue(sceneForm, "fontFamily", previewScene.fontFamily),
    showGrid: readFormValue(sceneForm, "showGrid", String(previewScene.showGrid)) === "true",
    snapToGrid: readFormValue(sceneForm, "snapToGrid", String(previewScene.snapToGrid)) === "true",
    gridSize: numberFormValue(sceneForm, "gridSize", previewScene.gridSize),
    safeArea: numberFormValue(sceneForm, "safeArea", previewScene.safeArea),
  });
}

function applyElementFormToState() {
  const element = getSelectedElement();
  if (!element) {
    return;
  }

  updateElement(element.id, (current) => {
    current.name = readFormValue(elementForm, "name", current.name).slice(0, 40) || elementKindLabel(current.kind);
    current.enabled = readFormValue(elementForm, "enabled", String(current.enabled)) === "true";
    current.title = readFormValue(elementForm, "title", current.title).slice(0, 80);
    current.body = readFormValue(elementForm, "body", current.body).slice(0, 260);
    current.value = readFormValue(elementForm, "value", current.value).slice(0, 80);
    current.icon = readFormValue(elementForm, "icon", current.icon).slice(0, 10);
    current.progress = numberFormValue(elementForm, "progress", current.progress);
    current.align = readFormValue(elementForm, "align", current.align);
    current.x = numberFormValue(elementForm, "x", current.x);
    current.y = numberFormValue(elementForm, "y", current.y);
    current.w = numberFormValue(elementForm, "w", current.w);
    current.h = numberFormValue(elementForm, "h", current.h);
    current.fontSize = numberFormValue(elementForm, "fontSize", current.fontSize);
    current.fontWeight = numberFormValue(elementForm, "fontWeight", current.fontWeight);
    current.radius = numberFormValue(elementForm, "radius", current.radius);
    current.opacity = numberFormValue(elementForm, "opacity", current.opacity);
    current.rotation = numberFormValue(elementForm, "rotation", current.rotation);
    current.zIndex = numberFormValue(elementForm, "zIndex", current.zIndex);
    current.bgColor = readFormValue(elementForm, "bgColor", current.bgColor);
    current.textColor = readFormValue(elementForm, "textColor", current.textColor);
    current.accentColor = readFormValue(elementForm, "accentColor", current.accentColor);
    current.bgOpacity = numberFormValue(elementForm, "bgOpacity", current.bgOpacity);
    current.note = readFormValue(elementForm, "note", current.note).slice(0, 120);
  });
}

function addElement(kind) {
  const existingMaxZ = Math.max(...previewScene.elements.map((element) => element.zIndex), 9);
  const nextElement = createElement(kind, {
    x: 100 + previewScene.elements.length * 18,
    y: 100 + previewScene.elements.length * 18,
    zIndex: existingMaxZ + 1,
    bgColor: previewScene.panelColor,
    textColor: previewScene.textColor,
    accentColor: previewScene.accent,
    bgOpacity: previewScene.panelOpacity,
  });

  previewScene.elements.push(nextElement);
  selectedElementId = nextElement.id;
  syncPresetFromState();
  renderLayers();
  renderElementInspector();
  renderPreview(previewScene);
  updateDashboardMeta(undefined, previewScene);
  setStatus(editorStatus, `${elementKindLabel(kind)} ajouté au canvas.`, "success");
}

function duplicateSelectedElement() {
  const element = getSelectedElement();
  if (!element) {
    return;
  }

  const duplicate = normalizeElement({
    ...element,
    id: crypto.randomUUID(),
    name: `${element.name} copy`.slice(0, 40),
    x: clamp(element.x + 24, 0, CANVAS_WIDTH - 80),
    y: clamp(element.y + 24, 0, CANVAS_HEIGHT - 60),
    zIndex: element.zIndex + 1,
  });

  previewScene.elements.push(duplicate);
  selectedElementId = duplicate.id;
  renderLayers();
  renderElementInspector();
  renderPreview(previewScene);
  setStatus(editorStatus, "Bloc dupliqué.", "success");
}

function toggleSelectedElement() {
  const element = getSelectedElement();
  if (!element) {
    return;
  }

  updateElement(element.id, (current) => {
    current.enabled = !current.enabled;
  });
  renderLayers();
  renderElementInspector();
  renderPreview(previewScene);
}

function removeSelectedElement() {
  const element = getSelectedElement();
  if (!element) {
    return;
  }

  previewScene.elements = previewScene.elements.filter((entry) => entry.id !== element.id);
  selectedElementId = previewScene.elements[0]?.id || null;
  renderLayers();
  renderElementInspector();
  renderPreview(previewScene);
  updateDashboardMeta(undefined, previewScene);
  setStatus(editorStatus, "Bloc supprimé.", "success");
}

function bumpElementZ(id, delta) {
  updateElement(id, (element) => {
    element.zIndex = clamp(element.zIndex + delta, 1, 999);
  });
}

function updateElement(id, updater) {
  previewScene.elements = previewScene.elements.map((element) => {
    if (element.id !== id) {
      return element;
    }

    const draft = normalizeElement(structuredClone(element));
    updater(draft);
    return normalizeElement(draft);
  });
}

function getSelectedElement() {
  return previewScene.elements.find((element) => element.id === selectedElementId) || null;
}

function renderPreview(scene) {
  paintScene(previewSurface, scene, { room: currentUserId || "preview", interactive: true, transparentPage: false });
  startClock(previewSurface, true, false);
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
    const scene = normalizeScene(migrateLegacyOverlay(snapshot.val(), normalizedRoom));
    paintScene(overlayStage, scene, { room: normalizedRoom, interactive: false, transparentPage: true });
    startClock(overlayStage, true, true);
  });
}

function paintScene(container, scene, options) {
  const { room, interactive, transparentPage } = options;
  const scale = interactive ? computeCanvasScale(container) : 1;
  const accentSoft = hexToRgba(scene.accent, 0.26);
  const secondarySoft = hexToRgba(scene.accentSecondary, 0.24);

  container.innerHTML = `
    <div class="canvas-shell">
      <div
        class="canvas-stage ${interactive ? "" : "overlay-mode"}"
        data-canvas-stage
        style="
          --scene-accent-soft:${accentSoft};
          --scene-secondary-soft:${secondarySoft};
          color:${scene.textColor};
          font-family:${scene.fontFamily};
          transform:${interactive ? `scale(${scale})` : "none"};
          transform-origin:${interactive ? "top center" : "top left"};
          ${transparentPage ? "background: transparent;" : ""}
        "
      >
        <div class="canvas-bg bg-${scene.backgroundStyle}"></div>
        ${scene.showGrid && interactive ? `<div class="canvas-grid" style="background-size:${scene.gridSize}px ${scene.gridSize}px"></div>` : ""}
        ${interactive ? `<div class="canvas-safe" style="margin:${scene.safeArea}px"></div>` : ""}
        <div class="canvas-elements">
          ${scene.elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => renderElementMarkup(scene, element, interactive, room))
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderElementMarkup(scene, element, interactive, room) {
  const background = hexToRgba(element.bgColor || scene.panelColor, element.bgOpacity);
  const border = hexToRgba(element.accentColor || scene.accent, 0.38);
  const text = element.textColor || scene.textColor;
  const accent = element.accentColor || scene.accent;
  const selected = interactive && element.id === selectedElementId;
  const visibility = element.enabled ? "" : "display:none;";
  const align = element.align || "left";
  const commonStyle = `
    left:${element.x}px;
    top:${element.y}px;
    width:${element.w}px;
    min-height:${element.h}px;
    z-index:${element.zIndex};
    border-radius:${element.radius}px;
    opacity:${element.opacity};
    transform:rotate(${element.rotation}deg);
    background:${background};
    --el-text:${text};
    --el-accent:${accent};
    --el-border:${border};
    --el-blur:${scene.blur}px;
    text-align:${align};
    font-size:${element.fontSize * scene.fontScale}px;
    font-weight:${element.fontWeight};
    ${visibility}
  `;

  const eyebrow = element.icon || element.kind === "clock" ? `<span class="eyebrow">${escapeHtml(element.icon || "✦")} ${escapeHtml(element.name)}</span>` : "";
  const value = element.value ? `<p class="value">${escapeHtml(element.kind === "custom" && element.value.includes("?room=") ? element.value.replace("?room=", `?room=${room === "preview" ? "preview" : room}`) : element.value)}</p>` : "";

  const bodyMap = {
    title: `
      ${eyebrow}
      <h2 class="title" style="font-size:${Math.max(32, element.fontSize * 1.2 * scene.fontScale)}px">${escapeHtml(element.title)}</h2>
      <p class="body">${escapeHtml(element.body)}</p>
    `,
    text: `
      ${eyebrow}
      <h3 class="title">${escapeHtml(element.title)}</h3>
      <p class="body">${escapeHtml(element.body)}</p>
      ${value}
    `,
    stat: `
      ${eyebrow}
      <h3 class="title">${escapeHtml(element.title)}</h3>
      ${value}
      <p class="body">${escapeHtml(element.body)}</p>
    `,
    goal: `
      ${eyebrow}
      <h3 class="title">${escapeHtml(element.title)}</h3>
      ${value}
      <p class="meta">${escapeHtml(element.body)}</p>
      <div class="goal-track"><div class="goal-bar" style="width:${element.progress}%"></div></div>
      <p class="meta">Progression : ${Math.round(element.progress)}%</p>
    `,
    clock: `
      ${eyebrow}
      <h3 class="title">${escapeHtml(element.title)}</h3>
      <p class="clock-display" data-clock="${element.id}">--:--:--</p>
      <p class="body">${escapeHtml(element.body)}</p>
    `,
    custom: `
      ${eyebrow}
      <h3 class="title">${escapeHtml(element.title)}</h3>
      <p class="body">${escapeHtml(element.body)}</p>
      ${value}
    `,
  };

  return `
    <article
      class="overlay-element card-${scene.cardStyle} ${selected ? "selected" : ""}"
      data-element-id="${element.id}"
      data-interactive="${interactive ? "true" : "false"}"
      style="${commonStyle}"
      title="${escapeHtml(element.note || element.name)}"
    >
      ${bodyMap[element.kind] || bodyMap.custom}
    </article>
  `;
}

function startClock(container, enabled, liveMode) {
  if (liveMode) {
    clearInterval(liveOverlayClockTimer);
  } else {
    clearInterval(previewClockTimer);
  }

  const tick = () => {
    Array.from(container.querySelectorAll("[data-clock]"))
      .forEach((clockTarget) => {
        clockTarget.textContent = new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      });
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

function onCanvasPointerDown(event) {
  const stage = previewSurface.querySelector("[data-canvas-stage]");
  const target = event.target.closest("[data-element-id]");
  if (!stage || !target) {
    return;
  }

  const elementId = target.dataset.elementId;
  const element = previewScene.elements.find((entry) => entry.id === elementId);
  if (!element) {
    return;
  }

  selectedElementId = elementId;
  const rect = stage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

  dragState = {
    id: elementId,
    offsetX: x - element.x,
    offsetY: y - element.y,
  };

  target.setPointerCapture?.(event.pointerId);
  target.classList.add("dragging");
  renderLayers();
  renderElementInspector();
  renderPreview(previewScene);
}

function onCanvasPointerMove(event) {
  if (!dragState) {
    return;
  }

  const stage = previewSurface.querySelector("[data-canvas-stage]");
  if (!stage) {
    return;
  }

  const rect = stage.getBoundingClientRect();
  const rawX = ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH - dragState.offsetX;
  const rawY = ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT - dragState.offsetY;
  const element = previewScene.elements.find((entry) => entry.id === dragState.id);
  if (!element) {
    return;
  }

  let x = clamp(rawX, 0, CANVAS_WIDTH - element.w);
  let y = clamp(rawY, 0, CANVAS_HEIGHT - element.h);
  if (previewScene.snapToGrid) {
    x = snap(x, previewScene.gridSize);
    y = snap(y, previewScene.gridSize);
  }

  updateElement(dragState.id, (current) => {
    current.x = x;
    current.y = y;
  });

  renderPreview(previewScene);
  renderElementInspector();
  renderLayers();
}

function onCanvasPointerUp() {
  dragState = null;
  Array.from(previewSurface.querySelectorAll(".overlay-element.dragging")).forEach((element) => {
    element.classList.remove("dragging");
  });
}

function switchAuthMode(nextMode) {
  authMode = nextMode;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === nextMode));
  authSubmit.textContent = nextMode === "signup" ? "Créer mon compte" : "Me connecter";
  setStatus(authStatus, "", "");
}

function updateDashboardMeta(timestamp = Date.now(), scene = previewScene) {
  syncStat.textContent = new Date(timestamp || Date.now()).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
  overlayLink.textContent = currentUserId ? buildOverlayLink(currentUserId) : "Connecte-toi pour générer un lien";
  roomStat.textContent = currentUserId || "preview";
  themeStat.textContent = PRESETS[activePresetKey]?.label || "Custom";
  layoutStat.textContent = `${scene.elements.length} blocs`;
}

function syncPresetFromState() {
  const matched = Object.entries(PRESETS).find(([, preset]) => compareScenePreset(previewScene, normalizeScene({ id: DEFAULT_SCENE_ID, version: 2, ...preset.create() })));
  activePresetKey = matched?.[0] || "custom";
  syncPresetButtons();
}

function compareScenePreset(left, right) {
  const normalizeForCompare = (scene) => {
    const normalized = sanitizeScene(scene);
    return {
      ...normalized,
      elements: normalized.elements.map(({ id, ...element }) => element),
    };
  };

  return JSON.stringify(normalizeForCompare(left)) === JSON.stringify(normalizeForCompare(right));
}

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
      const key = button.dataset.preset;
      previewScene = createSceneFromPreset(key);
      activePresetKey = key;
      selectedElementId = previewScene.elements[0]?.id || null;
      hydrateEditor(previewScene, `Preset ${PRESETS[key].label} appliqué.`);
      updateDashboardMeta(undefined, previewScene);
      syncPresetButtons();
    });
  });
}

function syncPresetButtons() {
  Array.from(presetButtonsContainer.querySelectorAll("[data-preset]")).forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === activePresetKey);
  });
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

function buildOverlayLink(accountId) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("room", accountId);
  return url.toString();
}

function migrateLegacyOverlay(overlay, accountId = "preview") {
  if (overlay?.version === 2 && Array.isArray(overlay.elements)) {
    return overlay;
  }

  if (!overlay || typeof overlay !== "object") {
    return createSceneFromPreset("nebula");
  }

  return normalizeScene({
    id: DEFAULT_SCENE_ID,
    version: 2,
    sceneName: overlay.title ? `Scene ${overlay.title}` : "Legacy scene",
    layoutMode: "freeform",
    backgroundStyle: pick(overlay.backgroundStyle, ["aurora", "grid", "spotlight"], "aurora") === "aurora" ? "nebula" : overlay.backgroundStyle,
    cardStyle: overlay.cardStyle || "glass",
    accent: overlay.accent || "#8b5cf6",
    accentSecondary: overlay.accentSecondary || "#38bdf8",
    textColor: overlay.textColor || "#f8fafc",
    panelColor: "#0f172a",
    panelOpacity: overlay.backgroundOpacity ?? 0.72,
    blur: 16,
    radius: 24,
    fontScale: overlay.fontScale ?? 1,
    fontFamily: "Inter, sans-serif",
    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
    safeArea: 24,
    elements: [
      createElement("title", {
        name: "Legacy hero",
        title: overlay.title || "Starting Soon",
        body: overlay.subtitle || "Le live démarre bientôt.",
        icon: overlay.sceneLabel || "●",
        x: 70,
        y: 110,
        w: 860,
        h: 230,
        fontSize: 52,
        accentColor: overlay.accent || "#8b5cf6",
      }),
      createElement("text", {
        name: "Legacy message",
        title: overlay.eventLabel || "Message stream",
        body: overlay.message || "Merci d'être là.",
        value: overlay.eventValue || "viewer_42",
        icon: "✨",
        x: 70,
        y: 380,
        w: 560,
        h: 190,
        fontSize: 22,
        accentColor: overlay.accentSecondary || "#38bdf8",
      }),
      createElement("goal", {
        name: "Legacy goal",
        title: overlay.goalLabel || "Objectif",
        body: overlay.cta || "Continue à soutenir le stream",
        value: overlay.goalValue || "42 / 100",
        progress: overlay.goalProgress ?? 42,
        icon: "🎯",
        x: 1310,
        y: 786,
        w: 540,
        h: 180,
        enabled: overlay.showGoal !== false,
        accentColor: overlay.accentSecondary || "#38bdf8",
      }),
      createElement("clock", {
        name: "Legacy clock",
        title: "Horloge",
        body: `Room ${accountId}`,
        icon: "🕒",
        x: 1490,
        y: 92,
        w: 360,
        h: 150,
        enabled: overlay.showClock !== false,
      }),
      createElement("custom", {
        name: "Legacy social",
        title: overlay.social || "@streamer",
        body: overlay.cta || "Abonne-toi et active les notifs",
        value: `?room=${accountId}`,
        icon: "📣",
        x: 1330,
        y: 600,
        w: 520,
        h: 150,
        enabled: overlay.showSocial !== false || overlay.showRoomBadge !== false || overlay.showCta !== false,
        accentColor: overlay.accent || "#8b5cf6",
      }),
    ],
  });
}

function sanitizeScene(scene) {
  return normalizeScene(scene);
}

function setFieldValue(form, name, value) {
  const field = form.elements.namedItem(name);
  if (field) {
    field.value = value;
  }
}

function readFormValue(form, name, fallback = "") {
  const field = form.elements.namedItem(name);
  return field ? String(field.value) : fallback;
}

function numberFormValue(form, name, fallback = 0) {
  const value = Number(readFormValue(form, name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function setStatus(target, message, type = "") {
  target.textContent = message;
  target.className = `status${type ? ` ${type}` : ""}`;
}

function computeCanvasScale(container) {
  const frame = container.closest(".preview-frame");
  if (!frame) {
    return 1;
  }

  const innerWidth = Math.max(frame.clientWidth - 32, 240);
  const innerHeight = Math.max(frame.clientHeight - 96, 180);
  return Math.min(innerWidth / CANVAS_WIDTH, innerHeight / CANVAS_HEIGHT);
}

function safeColor(value, fallback) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value || "")) ? value : fallback;
}

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function snap(value, step) {
  return Math.round(value / step) * step;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
