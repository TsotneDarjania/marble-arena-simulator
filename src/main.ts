// main.ts (copy-paste full file)
// ✅ Overlay renders instantly (no Phaser imports at top)
// ✅ Phaser + scenes load only after user clicks START
// ✅ Teams fetch starts early in parallel
// ✅ High-DPI resize logic preserved

import { getTeams } from "./api/getTeams";
import { GameData } from "./config/gameData";
import { getTeamParamsFromURL } from "./utils/helper";

/* ---------- CSS (pretty overlay + avoid canvas blur) ---------- */
const style = document.createElement("style");
style.textContent = `
  html, body { margin: 0; padding: 0; background: #060707; height: 100%; }
  #game-container { width: 100vw; height: 100vh; }
  #game-container canvas { image-rendering: auto; }

  #overlay{
    position: fixed; inset: 0; z-index: 99999;
    display:flex; align-items:center; justify-content:center;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color:#eafff1;
    background: #050606;
  }

  .overlay-content{ text-align:center; padding:24px; max-width:520px; }
  .title{
    font-size: 34px; font-weight: 900; letter-spacing: .6px;
    margin-bottom: 10px;
  }
  .hint{
    margin-top: 10px;
    font-size: 18px; line-height: 1.35;
    opacity: .92;
  }

  #fs-btn{
    margin-top: 22px;
    padding: 16px 22px;
    border-radius: 14px;
    border: 0;
    cursor: pointer;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: .4px;

    /* text-first button (no hard border) */
    color: #071007;
    background: linear-gradient(180deg, #9cf46a, #66e2a7);
    box-shadow: 0 14px 38px rgba(156,244,106,0.22);
    transform: translateZ(0);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  #fs-btn:hover{ filter: brightness(1.03); }
  #fs-btn:active{ transform: translateY(1px); filter: brightness(.98); }

  .phone{
    width: 88px; height: 144px; margin: 0 auto 14px;
    border-radius: 18px;
    position: relative;
    background: rgba(255,255,255,0.06);
    box-shadow:
      0 18px 60px rgba(0,0,0,0.5),
      0 0 38px rgba(156,244,106,0.12);
    outline: 2px solid rgba(156,244,106,0.35);
    transform-origin: 50% 60%;
    animation: tilt 1.8s ease-in-out infinite;
  }
  .phone::before{
    content:""; position:absolute; top:10px; left:50%; transform:translateX(-50%);
    width: 34px; height: 4px; border-radius: 3px;
    background: rgba(234,255,241,0.65);
  }
  .screen{
    position:absolute; inset: 18px;
    border-radius: 12px;
    background: rgba(0,0,0,0.28);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.07);
  }

  @keyframes tilt{
    0%,100%{transform:rotate(0deg)}
    30%{transform:rotate(-12deg)}
    60%{transform:rotate(90deg)}
  }

  @media (max-width: 380px){
    .title{ font-size: 28px; }
    .hint{ font-size: 16px; }
    #fs-btn{ font-size: 16px; padding: 14px 18px; }
    .phone{ width: 70px; height: 116px; }
  }
`;
document.head.appendChild(style);

/* ---------- overlay ---------- */
const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.innerHTML = `
  <div class="overlay-content">
    <div class="title">MARBLE ARENA</div>

    <div class="rotate-section" id="rotate-section">
      <div class="phone"><div class="screen"></div></div>
      <div class="hint">Rotate your device to landscape</div>
    </div>

    <div class="landscape-section" id="landscape-section" style="display:none">
      <div class="hint">Tap to enter fullscreen and start</div>
      <button id="fs-btn" type="button">START</button>
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
const getDPR = () => Math.min(window.devicePixelRatio || 1, 2.5);

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
  if (req) {
    try {
      req.call(el);
    } catch {}
  }
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

/* ---------- start fetching data early ---------- */
const teamsPromise = getTeams();

/* ---------- OPTIONAL: warm up Phaser chunk after first paint ---------- */
requestAnimationFrame(() => {
  import("phaser").catch(() => {});
});

/* ---------- game start (lazy) ---------- */
let gameStarted = false;

async function startGameLazy() {
  if (gameStarted) return;
  gameStarted = true;

  // Data
  const teamParams = getTeamParamsFromURL();
  const teams = await teamsPromise;

  if (!teams) {
    console.error("Could not get teams...");
    gameStarted = false;
    return;
  }

  GameData.teams = teams;

  if (teamParams) {
    GameData.teamsData.hostTeam = teams.find(
      (t) => t.id === Number(teamParams.hostTeamId),
    )!;
    GameData.teamsData.guestTeam = teams.find(
      (t) => t.id === Number(teamParams.guestTeamId),
    )!;
  } else {
    GameData.teamsData.hostTeam = teams[0];
    GameData.teamsData.guestTeam = teams[1];
  }

  // ✅ Lazy import heavy stuff only now
  const PhaserMod = await import("phaser");
  const { default: Preload } = await import("./scenes/Preloader");
  const { default: Menu } = await import("./scenes/Menu");
  const { default: GamePlay } = await import("./scenes/GamePlay");
  const { default: CanvasScene } = await import("./scenes/CanvasScene");

  const Phaser = PhaserMod;

  // High DPI config
  const dpr = getDPR();
  const { w, h } = getCSSViewport();

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#000000",
    physics: { default: "arcade", arcade: {} },

    // Internal buffer = CSS * DPR; CSS size via zoom
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: Math.max(1, w * dpr),
      height: Math.max(1, h * dpr),
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

  const game = new Phaser.Game(config);

  // Keep sound and game running when the tab/window loses focus
  game.sound.pauseOnBlur = false;
  game.events.on(Phaser.Core.Events.BLUR, () => {
    if (!game.loop.running) game.loop.wake();
  });
  game.events.on(Phaser.Core.Events.HIDDEN, () => {
    if (!game.loop.running) game.loop.wake();
  });

  // Expose DPR to scenes (for crisp text: resolution: dpr)
  game.registry.set("__dpr", getDPR());

  function resizeToDPR() {
    const d = getDPR();
    const { w, h } = getCSSViewport();
    game.scale.setZoom(1 / d);
    game.scale.resize(Math.max(1, w * d), Math.max(1, h * d));

    // Optional: tighten camera rounding for smooth art
    const cam =
      game.scene.getScene("GamePlay")?.cameras?.main ||
      game.scene.getScene("Menu")?.cameras?.main;
    if (cam) cam.setRoundPixels(false);

    // Update registry if DPR changes
    game.registry.set("__dpr", d);
  }

  const onWinResize = () => resizeToDPR();
  window.addEventListener("resize", onWinResize, { passive: true });
  window.addEventListener("orientationchange", onWinResize, { passive: true });
  (window as any).visualViewport?.addEventListener("resize", onWinResize, {
    passive: true,
  });

  // Scene content is laid out once at boot and doesn't react to RESIZE events,
  // so after the viewport settles (fullscreen toggle or a real window resize)
  // we stop every running scene and restart from Menu — this re-runs all
  //   // create() positioning against the new canvas size without a page reload.
  //   let baselineW = w;
  //   let baselineH = h;
  //   let menuResetTimer: ReturnType<typeof setTimeout> | undefined;
  //   const restartFromMenu = () => {
  //     const scenes = game.scene.getScenes(true);
  //     scenes.forEach((s) => game.scene.stop(s.scene.key));
  //     game.scene.start("Menu");
  //   };
  //   const scheduleMenuResetIfSizeChanged = (delay: number) => {
  //     if (menuResetTimer) clearTimeout(menuResetTimer);
  //     menuResetTimer = setTimeout(() => {
  //       const { w: nw, h: nh } = getCSSViewport();
  //       if (Math.abs(nw - baselineW) > 4 || Math.abs(nh - baselineH) > 4) {
  //         baselineW = nw;
  //         baselineH = nh;
  //         restartFromMenu();
  //       }
  //     }, delay);
  //   };
  //   const onFullscreenChange = () => scheduleMenuResetIfSizeChanged(250);
  //   document.addEventListener("fullscreenchange", onFullscreenChange);
  //   document.addEventListener("webkitfullscreenchange", onFullscreenChange as any);
  //   const onSettledResize = () => scheduleMenuResetIfSizeChanged(600);
  //   window.addEventListener("resize", onSettledResize, { passive: true });
  //   window.addEventListener("orientationchange", onSettledResize, {
  //     passive: true,
  //   });
  //   (window as any).visualViewport?.addEventListener("resize", onSettledResize, {
  //     passive: true,
  //   });

  //   // Initial adjust in case the browser changes DPR after fullscreen
  //   setTimeout(resizeToDPR, 0);

  //   game.scene.start("Preload");
}

/* ---------- boot ---------- */
function boot() {
  updateOverlay();

  window.addEventListener("resize", updateOverlay, { passive: true });
  window.addEventListener("orientationchange", updateOverlay, {
    passive: true,
  });
  (window as any).visualViewport?.addEventListener("resize", updateOverlay, {
    passive: true,
  });

  const fsBtn = document.getElementById("fs-btn") as HTMLButtonElement;

  fsBtn.onclick = async () => {
    requestFullscreen();
    overlay.remove();
    await startGameLazy();
  };
}

boot();

/* ---------- Notes for scenes ----------
  Crisp Phaser Text example:
    const dpr = this.game.registry.get('__dpr') || 1;
    this.add.text(100, 100, 'MARBLE ARENA', { fontSize: '48px', color:'#fff', resolution: dpr });
-------------------------------------- */
