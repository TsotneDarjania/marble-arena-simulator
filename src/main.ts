// main.ts
import { Game, Types } from "phaser";
import CanvasScene from "./scenes/CanvasScene";
import GamePlay from "./scenes/GamePlay";
import Menu from "./scenes/Menu";
import Preload from "./scenes/Preloader";
import {  getTeams } from "./api/getTeams";
import { GameData } from "./config/gameData";
import { getTeamParamsFromURL } from "./utils/helper";


async function initGame() {
  const teamParams = getTeamParamsFromURL();
  if (teamParams) {
    // gameConfig.gameMode = "marble-league"
  }

  const teams = await getTeams()
  if(!teams){
    console.log("can not get teams....");
    return;
  }

  GameData.teams = teams;
  
  // const teamData = (await getGameData()) as {
  //   hostTeam: TeamDataServerType;
  //   guestTeam: TeamDataServerType;
  // };

  // GameDataStore.teamData = teamData;

  // matchDataConfig.hostTeamData.logoURL = teamData.hostTeam.team_logo_url;
  // matchDataConfig.hostTeamData.logoKey = teamData.hostTeam.name;

  // matchDataConfig.guestTeamData.logoURL = teamData.guestTeam.team_logo_url;
  // matchDataConfig.guestTeamData.logoKey = teamData.guestTeam.name;

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    antialias: true,
    physics: {
      default: "arcade",
      arcade: {
        // debug: true
      },
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
