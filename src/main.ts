import { Game, Types } from "phaser";
import CanvasScene from "./scenes/CanvasScene";
import GamePlay from "./scenes/GamePlay";
import Menu from "./scenes/Menu";
import Preload from "./scenes/Preloader";
import { getTeams } from "./api/getTeams";
import { GameData } from "./config/gameData";
import { getTeamParamsFromURL } from "./utils/helper";

/* ---------- helpers ---------- */
function getViewportSize() {
  const vv = (window as any).visualViewport;
  return {
    width: Math.floor(vv?.width ?? window.innerWidth),
    height: Math.floor(vv?.height ?? window.innerHeight),
  };
}
const isLandscape = () =>
  (window.screen.orientation?.type?.startsWith("landscape") ?? false) ||
  window.matchMedia("(orientation: landscape)").matches ||
  window.innerWidth >= window.innerHeight;

/* ---------- overlay ---------- */
const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.innerHTML = `
  <div class="overlay-content">
    <div class="rotate-section" id="rotate-section">
      <div class="phone"><div class="screen"></div></div>
      <div class="hint">Rotate your device</div>
    </div>
    <div class="landscape-section" id="landscape-section">
      <div class="hint">Tap below to start</div>
      <button id="fs-btn" type="button">Go Fullscreen</button>
    </div>
  </div>
`;
document.body.appendChild(overlay);

const style = document.createElement("style");
style.textContent = `
  html, body { background: #000; margin: 0; padding: 0; }
  #overlay {
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: #000; color: #fff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }
  .overlay-content { text-align: center; }
  .hint { margin-top: 14px; font-size: 16px; opacity: 0.9; }

  #fs-btn {
    margin-top: 18px;
    border: 1px solid #9cf46a;
    background: #101510; color: #9cf46a;
    padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 600;
  }
  #fs-btn:active { transform: translateY(1px); }

  .phone {
    width: 80px; height: 130px; margin: 0 auto;
    border: 3px solid #9cf46a; border-radius: 14px;
    position: relative; box-shadow: 0 0 24px rgba(156,244,106,0.35);
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
  @keyframes tilt {
    0%, 100%   { transform: rotate(0deg); }
    30%        { transform: rotate(-12deg); }
    60%        { transform: rotate(90deg); }
  }
  @media (max-width: 380px) {
    .phone { width: 64px; height: 104px; }
    .hint { font-size: 14px; }
  }
`;
document.head.appendChild(style);

/* ---------- fullscreen helper ---------- */
function requestFullscreen() {
  const el = document.documentElement as any;
  const req =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen ||
    el.mozRequestFullScreen;
  if (req) { try { req.call(el); } catch {} }
}

/* ---------- start game ---------- */
let gameStarted = false;
let suppressReloadUntil = 0; // ms timestamp to ignore initial resizes

async function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  const teamParams = getTeamParamsFromURL();
  const teams = await getTeams();
  if (!teams) { console.error("Could not get teams..."); return; }

  GameData.teams = teams;
  if (teamParams) {
    GameData.teamsData.hostTeam = teams.find((t) => t.id === Number(teamParams.hostTeamId))!;
    GameData.teamsData.guestTeam = teams.find((t) => t.id === Number(teamParams.guestTeamId))!;
  } else {
    GameData.teamsData.hostTeam = teams[0];
    GameData.teamsData.guestTeam = teams[1];
  }

  const { width, height } = getViewportSize();

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#000000",
    physics: { default: "arcade", arcade: {} },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width, height },
    scene: [Preload, Menu, GamePlay, CanvasScene],
  };

  const game = new Game(config);

  // Debounced + suppressed reload
  let reloadTimer: number | undefined;
  const hardReload = () => {
    if (Date.now() < suppressReloadUntil) return; // ignore early fullscreen resizes
    if (reloadTimer) window.clearTimeout(reloadTimer);
    reloadTimer = window.setTimeout(() => window.location.reload(), 120);
  };

  window.addEventListener("resize", hardReload);
  window.addEventListener("orientationchange", hardReload);
  (window as any).visualViewport?.addEventListener("resize", hardReload);

  // Bump suppression when fullscreen changes (some browsers fire multiple resizes)
  const bumpSuppression = () => { suppressReloadUntil = Date.now() + 800; };
  document.addEventListener("fullscreenchange", bumpSuppression);
  (document as any).addEventListener?.("webkitfullscreenchange", bumpSuppression);

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

/* ---------- portrait wait listeners (removed before fullscreen) ---------- */
let portraitListenersAttached = false;
let removePortraitListeners = () => {};

function attachPortraitListeners() {
  if (portraitListenersAttached) return;
  const reloadOnChange = () => window.location.reload();

  window.addEventListener("orientationchange", reloadOnChange);
  window.addEventListener("resize", reloadOnChange);
  (window as any).visualViewport?.addEventListener("resize", reloadOnChange);

  removePortraitListeners = () => {
    window.removeEventListener("orientationchange", reloadOnChange);
    window.removeEventListener("resize", reloadOnChange);
    (window as any).visualViewport?.removeEventListener("resize", reloadOnChange);
    portraitListenersAttached = false;
  };

  portraitListenersAttached = true;
}

/* ---------- initial logic ---------- */
function boot() {
  updateOverlay();

  const fsBtn = document.getElementById("fs-btn") as HTMLButtonElement;

  // If in portrait, attach "reload when rotated" listeners
  if (!isLandscape()) attachPortraitListeners();

  fsBtn.onclick = async () => {
    // Prevent the fullscreen-triggered resize from reloading:
    // 1) remove portrait listeners
    removePortraitListeners();
    // 2) set a short suppression window
    suppressReloadUntil = Date.now() + 1000;

    requestFullscreen();
    overlay.remove();
    await startGame();
  };
}

boot();
