// main.ts
import { Game, Types } from "phaser";
import CanvasScene from "./scenes/CanvasScene";
import GamePlay from "./scenes/GamePlay";
import Menu from "./scenes/Menu";
import Preload from "./scenes/Preloader";
import { getGameData } from "./api/getGameData";
import { matchDataConfig } from "./config/matchConfig";
import { GameDataStore } from "./config/gameDataStore";

// types.ts
export type TeamDataServerType = {
  id: number;
  created_at: string;
  name: string;
  tablo_name: string;
  team_logo_url: string;
  primary_color: string;
  secondary_color: string;
  fifa_raiting: number;
  default_strategy: string;

  attack_speed: number;
  attack_strategy: "wide-attack" | "normal" | "wide-back";
  midfielder_speed: number;
  midfielder_strategy: "wide-attack" | "normal" | "wide-back";
  defence_speed: number;
  defence_strategy: "wide-attack" | "normal";
  goalkeeper_speed: number;

  shoot_accuracy: number;
  pass_speed: number;
  pass_accuracy: number;
  fault_possibility: number;
};

async function initGame() {
  const teamData = (await getGameData()) as {
    hostTeam: TeamDataServerType;
    guestTeam: TeamDataServerType;
  };

  GameDataStore.teamData = teamData;

  matchDataConfig.hostTeamData.logoURL = teamData.hostTeam.team_logo_url;
  matchDataConfig.hostTeamData.logoKey = teamData.hostTeam.name;

  matchDataConfig.guestTeamData.logoURL = teamData.guestTeam.team_logo_url;
  matchDataConfig.guestTeamData.logoKey = teamData.guestTeam.name;

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    antialias: true,
    physics: {
      default: "arcade",
      arcade: {},
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Preload, Menu, GamePlay, CanvasScene],
  };

  const game = new Game(config);

  game.events.once("ready", () => {
    game.scene.start("Preload");
  });
}

initGame();
