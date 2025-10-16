import { Game, Types } from "phaser";
import CanvasScene from "./scenes/CanvasScene";
import GamePlay from "./scenes/GamePlay";
import Menu from "./scenes/Menu";
import Preload from "./scenes/Preloader";
import { getTeams } from "./api/getTeams";
import { GameData } from "./config/gameData";
import { getTeamParamsFromURL } from "./utils/helper";

/* ---------- CSS (avoid canvas blur) ---------- */
const style = document.createElement("style");
style.textContent = `
  html, body { margin: 0; padding: 0; background: #000; height: 100%; }
  #game-container { width: 100vw; height: 100vh; }
  #game-container canvas { image-rendering: auto; }
  #overlay {
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: #000; color: #fff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }
  .overlay-content { text-align: center; }
  .hint { margin-top: 14px; font-size: 16px; opacity: 0.9; }
  #fs-btn {
    margin-top: 18px; border: 1px solid #9cf46a;
    background: #101510; color: #9cf46a;
    padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600;
  }
  #fs-btn:active { transform: translateY(1px); }
  .phone {
    width: 80px; height: 130px; margin: 0 auto;
    border: 3px solid #9cf46a; border-radius: 14px; position: relative;
    box-shadow: 0 0 24px rgba(156,244,106,0.35);
    transform-origin: 50% 60%;
    animation: tilt 1.8s ease-in-out infinite;
  }
  .phone::before {
    content: ""; position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
    width: 28px; height: 3px; border-radius: 2px; background: #9cf46a; opacity: .7;
  }
  .screen {
    position: absolute; inset: 16px; border-radius: 8px; background: #1a1f1a;
    box-shadow: inset 0 0 10px rgba(156,244,106,0.25);
  }
  @keyframes tilt { 0%,100%{transform:rotate(0)} 30%{transform:rotate(-12deg)} 60%{transform:rotate(90deg)} }
  @media (max-width: 380px){ .phone{width:64px;height:104px} .hint{font-size:14px} }
`;
document.head.appendChild(style);

/* ---------- overlay ---------- */
const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.innerHTML = `
  <div class="overlay-content">
    <div class="rotate-section" id="rotate-section">
      <div class="phone"><div class="screen"></div></div>
      <div class="hint">Rotate your device</div>
    </div>
    <div class="landscape-section" id="landscape-section" style="display:none">
      <div class="hint">Tap below to start</div>
      <button id="fs-btn" type="button">Go Fullscreen</button>
    </div>
  </div>
`;
document.body.appendChild(overlay);

/* ---------- DOM container for Phaser ---------- */
let container = document.getElementById("game-container");
if (!container) {
  container = document.createElement("div");
  container.id = "game-container";
  document.body.appendChild(container);
}

/* ---------- helpers ---------- */
function getCSSViewport() {
  const vv = (window as any).visualViewport;
  return {
    w: Math.floor(vv?.width ?? window.innerWidth),
    h: Math.floor(vv?.height ?? window.innerHeight),
  };
}
const getDPR = () => Math.min(window.devicePixelRatio || 1, 2.5); // cap if needed

const isLandscape = () =>
  (window.screen.orientation?.type?.startsWith("landscape") ?? false) ||
  window.matchMedia("(orientation: landscape)").matches ||
  window.innerWidth >= window.innerHeight;

function requestFullscreen() {
  const el = document.documentElement as any;
  const req =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen ||
    el.mozRequestFullScreen;
  if (req) try { req.call(el); } catch {}
}

/* ---------- global refs ---------- */
let game: Game | null = null;

/* ---------- high-DPI resize (no reloads) ---------- */
function resizeToDPR(g: Game) {
  const dpr = getDPR();
  const { w, h } = getCSSViewport();

  // Internal buffer = CSS * DPR; CSS size kept by zoom = 1/DPR
  g.scale.setZoom(1 / dpr);
  g.scale.resize(Math.max(1, w * dpr), Math.max(1, h * dpr));

  // Optional: tighten camera rounding for smooth art
  const cam = g.scene.getScene("GamePlay")?.cameras?.main || g.scene.getScene("Menu")?.cameras?.main;
  if (cam) cam.setRoundPixels(false);
}

/* ---------- expose a crisp text helper for your scenes ---------- */
// Use in scenes: this.game.registry.get('__dpr') to fetch DPR if needed.
function installGlobalDPR(g: Game) {
  g.registry.set("__dpr", getDPR());
}

/* ---------- game start ---------- */
let gameStarted = false;

async function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  // Data
  const teamParams = getTeamParamsFromURL();
  const teams = await getTeams();
  if (!teams) {
    console.error("Could not get teams...");
    return;
  }
  GameData.teams = teams;
  if (teamParams) {
    GameData.teamsData.hostTeam = teams.find(t => t.id === Number(teamParams.hostTeamId))!;
    GameData.teamsData.guestTeam = teams.find(t => t.id === Number(teamParams.guestTeamId))!;
  } else {
    GameData.teamsData.hostTeam = teams[0];
    GameData.teamsData.guestTeam = teams[1];
  }

  const dpr = getDPR() * 10;
  const { w, h } = getCSSViewport();

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#000000",
    physics: { default: "arcade", arcade: {} },

    // Core trick: internal buffer × DPR, CSS size via zoom
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: Math.max(3000, w * dpr),
      height: Math.max(3000, h * dpr),
      zoom: 1 / dpr,
    },

    render: {
      antialias: true,
      roundPixels: false,
      pixelArt: false,
      powerPreference: "high-performance",
    },

    scene: [Preload, Menu, GamePlay, CanvasScene],
  };

  game = new Game(config);
  installGlobalDPR(game);

  // Keep sharp on any viewport/DPR change
  const onWinResize = () => { if (game) resizeToDPR(game); };
  window.addEventListener("resize", onWinResize, { passive: true });
  window.addEventListener("orientationchange", onWinResize, { passive: true });
  (window as any).visualViewport?.addEventListener("resize", onWinResize, { passive: true });

  // Initial adjust in case the browser changes DPR after fullscreen
  setTimeout(onWinResize, 0);

  game.scene.start("Preload");
}

/* ---------- overlay logic ---------- */
function updateOverlay() {
  const rotateSection = document.getElementById("rotate-section")!;
  const landscapeSection = document.getElementById("landscape-section")!;
  if (isLandscape()) {
    rotateSection.style.display = "none";
    landscapeSection.style.display = "block";
  } else {
    rotateSection.style.display = "block";
    landscapeSection.style.display = "none";
  }
}

/* ---------- portrait wait listeners (no reload) ---------- */
let portraitListenersAttached = false;
let detachPortraitListeners = () => {};

function attachPortraitListeners() {
  if (portraitListenersAttached) return;
  const update = () => updateOverlay();
  window.addEventListener("orientationchange", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  (window as any).visualViewport?.addEventListener("resize", update, { passive: true });

  detachPortraitListeners = () => {
    window.removeEventListener("orientationchange", update);
    window.removeEventListener("resize", update);
    (window as any).visualViewport?.removeEventListener("resize", update);
    portraitListenersAttached = false;
  };
  portraitListenersAttached = true;
}

/* ---------- boot ---------- */
function boot() {
  updateOverlay();

  const fsBtn = document.getElementById("fs-btn") as HTMLButtonElement;

  if (!isLandscape()) attachPortraitListeners();

  fsBtn.onclick = async () => {
    // Remove listeners to avoid UI flicker during FS transition
    detachPortraitListeners();
    requestFullscreen();
    overlay.remove();
    await startGame();
    // After FS, one more resize pass
    if (game) resizeToDPR(game);
  };
}

boot();

/* ---------- OPTIONAL: helper you can call from scenes for crisp Text ---------- */
// Example usage inside a scene:
//   const dpr = this.game.registry.get('__dpr') || 1;
//   this.add.text(100, 100, 'MARBLE ARENA', { fontSize: '48px', color: '#fff', resolution: dpr });
