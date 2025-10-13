import Match from "..";
import { GameData } from "../../../config/gameData";
import CanvasScene from "../../../scenes/CanvasScene";
import { getRandomIntNumber } from "../../../utils/math";
import { Corner } from "../matchEvents/corner";
import { Freekick } from "../matchEvents/freeKick";
import { LastPenalties } from "../matchEvents/lastPenalties";
import { Penalty } from "../matchEvents/penalty";
import { FootballersMotionManager } from "./footballersMotionManager";
import { MatchEventManager } from "./matchEvenetManager";

export default class MatchManager {
  teamWhoHasBall: "hostTeam" | "guestTeam" = "hostTeam";
  matchTimeStatus:
    | "readyForStart"
    | "haltTimeEnd"
    | "fullTimeEnd"
    | "firstExtratimeEnd"
    | "secondExtraTimeEnd" = "readyForStart";

  hostScore = 0;
  guestScore = 0;

  freeKick?: Freekick;
  penalty?: Penalty;
  corner?: Corner;
  lastPenalties?: LastPenalties;

  // Core
  footballersMotionManager!: FootballersMotionManager;
  matchEvenetManager!: MatchEventManager;

  whichTeamHaveToResume!: "host" | "guest";

  constructor(public match: Match) {}

  startMatch() {
    this.makeFirstKick("host");
    this.startCamerFollow();
    this.match.matchTimer.startTimer();
    this.createFootballersMotionManager();
    this.createMatchEvenetManager();
    this.teamWhoHasBall = "hostTeam";
  }

  createFootballersMotionManager() {
    this.footballersMotionManager = new FootballersMotionManager(this.match);
  }

  createMatchEvenetManager() {
    this.matchEvenetManager = new MatchEventManager(this.match);
  }

  makeFirstKick(teamWhoWillGetBall: "host" | "guest") {
    const potentialFootballers =
      teamWhoWillGetBall === "host"
        ? this.match.hostTeam.boardFootballPlayers.middleColumn.footballers
        : this.match.guestTeam.boardFootballPlayers.middleColumn.footballers;
    const targetFootballer =
      potentialFootballers[getRandomIntNumber(0, potentialFootballers.length)];
    this.match.ball.kick(200, {
      x: targetFootballer.getBounds().centerX,
      y: targetFootballer.getBounds().centerY,
    });
  }

  startCamerFollow() {
    this.match.scene.cameraController.startFollow(this.match.ball);
  }

  resetUfterGoal() {
    this.match.ball.reset();
    this.match.hostTeam.reset();
    this.match.guestTeam.reset();

    setTimeout(() => {
      this.match.scene.soundManager.referee.play();
    }, 1000);

    setTimeout(() => {
      this.matchEvenetManager.matchStatus = "playing";
      this.teamWhoHasBall === "guestTeam"
        ? this.makeFirstKick("host")
        : this.makeFirstKick("guest");

      this.match.hostTeam.boardFootballPlayers.goalKeeper.startMotion();
      this.match.guestTeam.boardFootballPlayers.goalKeeper.startMotion();
      this.match.matchTimer.resumeTimer();
      this.match.scene.soundManager.pass.play();

      this.teamWhoHasBall =
        this.teamWhoHasBall === "guestTeam" ? "hostTeam" : "guestTeam";
    }, 3000);
  }

  // call that function for halt time end, full time end or first extra time end
  puaseMatch(
    whichTeamHaveToResume: "host" | "guest",
    status:
      | "halfTimeEnd"
      | "fullTimeEnd"
      | "firstExtraTimeEnd"
      | "secondExtraTimeEnd"
  ) {
    this.match.scene.soundManager.referee.play();

    this.whichTeamHaveToResume = whichTeamHaveToResume;

    this.match.matchManager.matchEvenetManager.matchStatus = "pause";
    this.match.hostTeam.stopFullMotion();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.hostTeam.footballers.forEach((f) => {
      f.stopFreeKickBehaviour();
    });

    this.match.guestTeam.stopFullMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.footballers.forEach((f) => {
      f.stopFreeKickBehaviour();
    });

    this.match.ball.stop();

    setTimeout(() => {
      this.match.hostTeam.reset();
      this.match.guestTeam.reset();
      this.match.ball.reset();
      this.match.matchTimer.stopTimer();

      const cavnasScene = this.match.scene.scene.get(
        "CanvasScene"
      ) as CanvasScene;

      if (status === "halfTimeEnd") {
        this.match.matchTimer.time = 45;
        if (GameData.matchSettings.showModals) {
          cavnasScene.showMatchContinueModal();
        }
      }
      if (status === "fullTimeEnd") {
        this.match.matchTimer.time = 90;

        if (!GameData.matchSettings.isExtraTimes) {
          cavnasScene.showLastresult(
            this.match.matchManager.hostScore.toString(),
            this.match.matchManager.guestScore.toString()
          );
        } else {
          if (
            this.match.matchManager.hostScore !==
            this.match.matchManager.guestScore
          ) {
            cavnasScene.showLastresult(
              this.match.matchManager.hostScore.toString(),
              this.match.matchManager.guestScore.toString()
            );
          } else {
            if (GameData.matchSettings.showModals) {
              cavnasScene.showMatchContinueModal();
            }
          }
        }
      }
      if (status === "firstExtraTimeEnd") {
        this.match.matchTimer.time = 105;
      }
      if (status === "secondExtraTimeEnd") {
        this.match.matchTimer.time = 120;

        if (
          this.match.matchManager.hostScore !==
          this.match.matchManager.guestScore
        ) {
          cavnasScene.showLastresult(
            this.match.matchManager.hostScore.toString(),
            this.match.matchManager.guestScore.toString()
          );
        } else {
          if (GameData.matchSettings.showModals) {
            cavnasScene.showMatchContinueModal();
          }
        }
      }

      cavnasScene.timerText.setText(this.match.matchTimer.time.toString());
    }, 1500);
  }

  resumeMatch() {
    const cavnasScene = this.match.scene.scene.get(
      "CanvasScene"
    ) as CanvasScene;
    cavnasScene.destoryMatchContinueModal();

    if(this.match.matchTimer.time === 90){
      if(!GameData.matchSettings.isExtraTimes) return;
      if(this.match.matchManager.hostScore !== this.match.matchManager.guestScore){
        return;
      }
    }


    this.match.scene.soundManager.referee.play();

    setTimeout(() => {
      this.matchEvenetManager.matchStatus = "playing";
      if (this.matchEvenetManager.isSecondExtraTimeEnded) {
        this.startLastPenalties();
      } else {
        this.match.hostTeam.boardFootballPlayers.goalKeeper.startMotion();
        this.match.guestTeam.boardFootballPlayers.goalKeeper.startMotion();
        this.match.matchManager.teamWhoHasBall =
          this.whichTeamHaveToResume === "host" ? "hostTeam" : "guestTeam";
        this.makeFirstKick(this.whichTeamHaveToResume);
        this.match.matchTimer.resumeTimer();
        this.match.scene.soundManager.pass.play();
      }
    }, 2000);
  }

  startLastPenalties() {
    this.match.hostTeam.hideTeam();
    this.match.guestTeam.hideTeam();
    setTimeout(() => {
      this.matchEvenetManager.matchStatus = "isLastPenalties";
      this.lastPenalties = new LastPenalties(this.match);
    }, 2000);
  }
}
