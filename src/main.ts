import { Game, Types } from "phaser";
import CanvasScene from "./scenes/CanvasScene";
import GamePlay from "./scenes/GamePlay";
import Menu from "./scenes/Menu";
import Preload from "./scenes/Preloader";
import { getTeams } from "./api/getTeams";
import { GameData } from "./config/gameData";
import { getTeamParamsFromURL } from "./utils/helper";

function getViewportSize() {
  const vv = (window as any).visualViewport;
  return {
    width: Math.floor(vv?.width ?? window.innerWidth),
    height: Math.floor(vv?.height ?? window.innerHeight),
  };
}

async function initGame() {
  const teamParams = getTeamParamsFromURL();
  const teams = await getTeams();

  if (!teams) {
    console.error("Could not get teams...");
    return;
  }

  GameData.teams = teams;

  if (teamParams) {
    GameData.teamsData.hostTeam = teams.find(
      (t) => t.id === Number(teamParams.hostTeamId)
    )!;
    GameData.teamsData.guestTeam = teams.find(
      (t) => t.id === Number(teamParams.guestTeamId)
    )!;
  } else {
    GameData.teamsData.hostTeam = teams[0];
    GameData.teamsData.guestTeam = teams[1];
  }

  const { width, height } = getViewportSize();

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#000000",
    physics: {
      default: "arcade",
      arcade: {
        // debug: true,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width,
      height,
    },
    scene: [Preload, Menu, GamePlay, CanvasScene],
  };

  const game = new Game(config);

  /** 🔄 Resize logic (keeps fitting visible viewport) */
  const resizeGame = () => {
    const { width, height } = getViewportSize();
    game.scale.resize(width, height);
  };

  window.addEventListener("resize", resizeGame);
  window.addEventListener("orientationchange", resizeGame);
  (window as any).visualViewport?.addEventListener("resize", resizeGame);

  /** 📱 Enable fullscreen on first interaction */
  const enableFullscreen = () => {
    document.body.requestFullscreen?.().catch(() => {});
    window.removeEventListener("pointerdown", enableFullscreen);
    window.removeEventListener("keydown", enableFullscreen);
  };
  window.addEventListener("pointerdown", enableFullscreen, { once: true });
  window.addEventListener("keydown", enableFullscreen, { once: true });

  game.scene.start("Preload");
}

initGame();
