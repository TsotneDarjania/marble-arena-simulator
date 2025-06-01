import { Game, Types } from "phaser";
import CanvasScene from "./scenes/CanvasScene";
import GamePlay from "./scenes/GamePlay";
import Menu from "./scenes/Menu";
import Preload from "./scenes/Preloader";
import { getGameData } from "./api/getGameData";
import { matchDataConfig } from "./config/matchConfig";

type TeamDataServerType = {
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

  matchDataConfig.hostTeamData.logoKey = teamData.hostTeam.name;
  matchDataConfig.hostTeamData.logoURL = teamData.hostTeam.team_logo_url;
  matchDataConfig.hostTeamData.initials = teamData.hostTeam.tablo_name;

  matchDataConfig.hostTeamData.formation = teamData.hostTeam.default_strategy;
  matchDataConfig.hostTeamData.tactics.formation.defenceLine =
    teamData.hostTeam.defence_strategy;
  matchDataConfig.hostTeamData.tactics.formation.centerLine =
    teamData.hostTeam.midfielder_strategy;
  matchDataConfig.hostTeamData.tactics.formation.attackLine =
    teamData.hostTeam.attack_strategy;
  matchDataConfig.hostTeamData.fansColor = Number(
    teamData.hostTeam.primary_color
  );
  matchDataConfig.hostTeamData.passSpeed = teamData.hostTeam.pass_speed;
  matchDataConfig.hostTeamData.shootSpeed =
    teamData.hostTeam.pass_speed + 15 > 99
      ? 99
      : teamData.hostTeam.pass_speed + 15;
  matchDataConfig.hostTeamData.shootAccuracy = teamData.hostTeam.shoot_accuracy;
  matchDataConfig.hostTeamData.goalKeeperSpeed =
    teamData.hostTeam.goalkeeper_speed;
  matchDataConfig.hostTeamData.motionSpeed = teamData.hostTeam.defence_speed;

  matchDataConfig.guestTeamData.logoKey = teamData.guestTeam.name;
  matchDataConfig.guestTeamData.logoURL = teamData.guestTeam.team_logo_url;
  matchDataConfig.guestTeamData.initials = teamData.guestTeam.tablo_name;

  matchDataConfig.guestTeamData.formation = teamData.guestTeam.default_strategy;
  matchDataConfig.guestTeamData.tactics.formation.defenceLine =
    teamData.hostTeam.defence_strategy;
  matchDataConfig.guestTeamData.tactics.formation.centerLine =
    teamData.hostTeam.midfielder_strategy;
  matchDataConfig.guestTeamData.tactics.formation.attackLine =
    teamData.hostTeam.attack_strategy;
  matchDataConfig.guestTeamData.fansColor = Number(
    teamData.hostTeam.primary_color
  );
  matchDataConfig.guestTeamData.passSpeed = teamData.guestTeam.pass_speed;
  matchDataConfig.guestTeamData.shootSpeed =
    teamData.guestTeam.pass_speed + 15 > 99
      ? 99
      : teamData.guestTeam.pass_speed + 15;
  matchDataConfig.guestTeamData.shootAccuracy =
    teamData.guestTeam.shoot_accuracy;
  matchDataConfig.guestTeamData.goalKeeperSpeed =
    teamData.guestTeam.goalkeeper_speed;
  matchDataConfig.guestTeamData.motionSpeed = teamData.guestTeam.defence_speed;

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

  // Wait until game is booted before starting scene with data
  game.events.once("ready", () => {
    game.scene.start("Preload");
  });
}

initGame();
