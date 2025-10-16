import { Scene } from "phaser";
import { GameData } from "../config/gameData";

export default class Preload extends Scene {
  // private teamData: {
  //   hostTeam: TeamDataServerType;
  //   guestTeam: TeamDataServerType;
  // };

  constructor() {
    super("Preload");
  }

  preload() {
    this.load.setPath("assets/");

    // Stadium
    this.load.image("stadiumField", "image/gameObjects/stadium-field.png");
    this.load.image("spectatorCornerLine", "image/gameObjects/spectator-corner-line.png");
    this.load.image("spectatorLine", "image/gameObjects/spectator-line.png");
    this.load.image(
      "stadiumSurrounding",
      "image/gameObjects/stadium-surrounding.png"
    );
    this.load.image("stadiumBck", "image/gameObjects/stadium-bck.png");
    this.load.image("stadiumLight", "image/gameObjects/stadium-light.png");
    this.load.image("triangle", "image/gameObjects/triangle.png");
    this.load.image("grid", "image/gameObjects/grid.png");

    // UI
    this.load.image("menu-stadium-field", "image/ui/fitch.png");
    this.load.image("menuArrowButton", "image/ui/arrow.png");
    this.load.image("defaultButton", "image/ui/default-button.png");
    this.load.image("default", "image/ui/default.png");
    this.load.image("cameraZoomButton", "image/ui/camera-zoom-button.png");
    this.load.image("matchIndicatorBck", "image/ui/match-indicator-bck.png");
    this.load.image("penaltyDone", "image/ui/penalty-done.png");
    this.load.image("penaltyFail", "image/ui/penalty-fail.png");
    this.load.image("ballSaveIcon", "image/ui/ball-save-icon.png");
    this.load.image("comentator", "image/ui/commentator.png");
    this.load.image("live", "image/ui/live.png");
    this.load.image("mike", "image/ui/mike.png");
    this.load.image("marbleArenaLogo", "image/ui/logo.png");
    this.load.image("closeButton", "image/ui/close.png");

    // GameObjects
    this.load.image("ball", "image/gameObjects/ball.png");
    this.load.image("circle", "image/gameObjects/circle.png");

    //sounds
    this.load.audio("stadium-noice", ["sounds/fans-2.mp3"]);
    this.load.audio("time-start-referee", ["sounds/time-start-referee.mp3"]);
    this.load.audio("pass", ["sounds/pass.mp3"]);
    this.load.audio("catch-ball", ["sounds/catch-ball.mp3"]);
    this.load.audio("shoot", ["sounds/shoot.mp3"]);
    this.load.audio("goalBorder", ["sounds/goal-border.mp3"]);
    this.load.audio("border", ["sounds/border.mp3"]);
    this.load.audio("goalSelebration", ["sounds/goal-2.mp3"]);
    this.load.audio("halt-time-referee", ["sounds/first-half-end.mp3"]);
    this.load.audio("faul", ["sounds/is-faul.mp3"]);
    this.load.audio("referee", ["sounds/referee.mp3"]);
    this.load.audio("goalkeeperJumpSound", ["sounds/goalkeeperJumpSound.mp3"]);
    this.load.audio("selectTeamButtonSound", ["sounds/ui/select-button-click.mp3"]);
    this.load.audio("button", ["sounds/ui/button.mp3"]);

    

    // Teams
    GameData.teams!.forEach((team) => {
      this.load.image(team.name, team.team_logo_url);
    });
  }

  create() {
    this.scene.start("Menu");
  }
}
