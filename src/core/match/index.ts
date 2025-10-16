import { GameData } from "../../config/gameData";
import GamePlay from "../../scenes/GamePlay";
import { MatchDataType } from "../../types/gameTypes";
import { Ball } from "./ball";
import { Coach } from "./coach";
import CollisionDetector from "./collisionDetector";
import { MatchIntroEnvironment } from "./matchIntroEnvironment";
import MatchManager from "./mathManager";
import { Stadium } from "./stadium";
import Team from "./team";
import TimeManager from "./timeManager";

export default class Match {
  stadium: Stadium;
  ball: Ball;

  hostTeam: Team;
  guestTeam: Team;

  collisionDetector: CollisionDetector;

  matchTimer: TimeManager;

  matchManager: MatchManager;

  matchIntroEnvironment!: MatchIntroEnvironment;

  hostTeamCoach!: Coach;
  guestTeamCoach!: Coach;

  constructor(public matchData: MatchDataType, public scene: GamePlay) {
    this.init();
  }

  init() {
    this.addStadium();
    this.setFanColors();
    this.createTimer();
  }

  addStadium() {
    this.stadium = new Stadium(
      this.scene,
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2
    );
  }

  setFanColors() {
    this.stadium.spectators.fanColors = {
      hostColor: GameData.matchSettings.hostTeamFansColor,
      guestColor: GameData.matchSettings.guestTeamFansColor,
      hostQuantityPercent: 50,
    };
  }

  showMatchIntroEnvironment() {
    this.matchIntroEnvironment = new MatchIntroEnvironment(this);
  }

  startMatch() {
    this.matchIntroEnvironment.destroy();

    setTimeout(() => {
      this.addBall();
      this.addCollisionDetector();
      this.createMatchManager();
      this.addTeams();
      this.addCoaches();

      this.scene.soundManager.timeStartReferee.play();
    }, 1500);

    setTimeout(() => {
      this.matchManager.startMatch();
      this.scene.soundManager.pass.play();
    }, 3200);
  }

  createMatchManager() {
    this.matchManager = new MatchManager(this);
  }

  addBall() {
    this.ball = new Ball(
      this.scene,
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2,
      this.stadium
    );
  }

  addCoaches() {
    this.hostTeamCoach = new Coach(
      this.scene,
      this.scene.game.canvas.width / 2 - 290,
      this.scene.game.canvas.height / 2 + 300,
      GameData.teamsData.hostTeam!.name,
      true
    );

    this.guestTeamCoach = new Coach(
      this.scene,
      this.scene.game.canvas.width / 2 + 290,
      this.scene.game.canvas.height / 2 + 300,
      GameData.teamsData.guestTeam!.name,
      false
    );
  }

  addTeams() {
    this.hostTeam = new Team(
      this.scene,
      this.matchData.hostTeamData,
      this.matchData.gameConfig,
      this.stadium,
      "left"
    );

    this.guestTeam = new Team(
      this.scene,
      this.matchData.guestTeamData,
      this.matchData.gameConfig,
      this.stadium,
      "right"
    );
  }

  addCollisionDetector() {
    this.collisionDetector = new CollisionDetector(this.scene, this);
  }

  createTimer() {
    this.matchTimer = new TimeManager(this, this.scene);
  }
}
