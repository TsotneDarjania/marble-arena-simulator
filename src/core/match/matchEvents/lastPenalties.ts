import Match from "..";
import CanvasScene from "../../../scenes/CanvasScene";
import {
  calculatePercentage,
  getRandomIntNumber,
  mapToRange,
} from "../../../utils/math";

export class LastPenalties {
  whosTurn: "host" | "guest" = "host";
  attacker!: Phaser.GameObjects.Image;
  canCheckIfIsGoal = true;

  hostTeamScore = 0;
  guestTeamScore = 0;
  round = 1;

  constructor(public match: Match) {
    this.init();
  }

  init() {
    this.match.guestTeam.boardFootballPlayers.goalKeeper.setX(
      this.match.hostTeam.boardFootballPlayers.goalKeeper.x
    );
    this.prepareGoalkeeper();
    this.prepareAttaker();
    this.prepareBall();
    this.listenGoalEvents();

    setTimeout(() => {
      this.shoot();
    }, getRandomIntNumber(2000, 5000));
  }

  listenGoalEvents() {
    this.match.scene.events.on("update", () => {
      if (
        this.match.ball.x <
        this.match.hostTeam.boardFootballPlayers.goalKeeper.getBounds()
          .centerX -
          16
      ) {
        if (this.canCheckIfIsGoal === false) return;
        this.isGoal();
      }
    });
  }

  prepareGoalkeeper() {
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();

    if (this.whosTurn === "host") {
      this.match.guestTeam.boardFootballPlayers.goalKeeper.setActive(true);
      this.match.guestTeam.boardFootballPlayers.goalKeeper.activate();
      this.match.guestTeam.boardFootballPlayers.goalKeeper.setY(0);
      this.match.guestTeam.boardFootballPlayers.goalKeeper.startMotion();
    } else {
      this.match.hostTeam.boardFootballPlayers.goalKeeper.setActive(true);
      this.match.hostTeam.boardFootballPlayers.goalKeeper.activate();
      this.match.hostTeam.boardFootballPlayers.goalKeeper.setY(0);
      this.match.hostTeam.boardFootballPlayers.goalKeeper.startMotion();
    }
  }

  prepareAttaker() {
    this.attacker = new Phaser.GameObjects.Image(
      this.match.scene,
      -calculatePercentage(40, this.match.stadium.innerFielddWidth),
      0,
      this.whosTurn === "host"
        ? this.match.matchData.hostTeamData.name
        : this.match.matchData.guestTeamData.name
    );

    this.attacker.setScale(0.6);
    this.attacker.setDepth(100);

    this.match.stadium.add(this.attacker);
  }

  prepareBall() {
    this.match.ball.reset();
    this.match.ball.setPosition(
      this.attacker.getBounds().centerX - 30,
      this.match.scene.game.canvas.height / 2
    );
  }

  shoot() {
    console.log("shoot");
    this.match.scene.soundManager.shoot.play();

    const teamData =
      this.whosTurn === "host"
        ? this.match.matchData.hostTeamData
        : this.match.matchData.guestTeamData;
    let x = 0;
    const isfailShoot = getRandomIntNumber(0, 100) < 70 ? false : true;

    let y = this.match.stadium.stadiumField.getBounds().centerY;

    if (isfailShoot) {
      const isTop = getRandomIntNumber(0, 100);
      if (isTop > 50) {
        y += getRandomIntNumber(60, 90);
      } else {
        y -= getRandomIntNumber(60, 90);
      }
    } else {
      const isTop = getRandomIntNumber(0, 100);

      if (isTop > 50) {
        y += getRandomIntNumber(0, 55);
      } else {
        y -= getRandomIntNumber(0, 55);
      }
    }
    if (this.whosTurn === "host") {
      x =
        this.match.scene.match.guestTeam.boardFootballPlayers.goalKeeper.getBounds()
          .centerX + 10;
    } else {
      x =
        this.match.scene.match.hostTeam.boardFootballPlayers.goalKeeper.getBounds()
          .centerX - 10;
    }
    this.match.scene.match.ball.kick(
      mapToRange(teamData.pass_speed, 250, 500),
      {
        x,
        y,
      }
    );
  }

  save() {
    const canvasScene = this.match.scene.scene.get(
      "CanvasScene"
    ) as CanvasScene;

    if (this.whosTurn === "host") {
      canvasScene.drawPenaltyFail("left");
    } else {
      canvasScene.drawPenaltyFail("right");
    }

    this.canCheckIfIsGoal = false;

    this.match.ball.stop();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();

    setTimeout(() => {
      this.match.hostTeam.boardFootballPlayers.goalKeeper.setActive(false);
      this.match.guestTeam.boardFootballPlayers.goalKeeper.setActive(false);
      this.again();
    }, 2000);
  }

  isGoal() {
    this.canCheckIfIsGoal = false;

    const canvasScene = this.match.scene.scene.get(
      "CanvasScene"
    ) as CanvasScene;

    this.match.stadium.startGoalSelebration(this.whosTurn);
    this.match.ball.startBlinkAnimation();
    this.match.ball.stop();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.deactive();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.deactive();

    if (this.whosTurn === "host") {
      canvasScene.drawPenaltyDone("left");

      this.match.hostTeamCoach.selebration();
      this.match.guestTeamCoach.angry();
      this.hostTeamScore++;

      this.match.matchManager.hostScore++;
      canvasScene.hostTeamScoretext.setText(
        this.match.matchManager.hostScore.toString()
      );
    } else {
      canvasScene.drawPenaltyDone("right");

      this.match.guestTeamCoach.selebration();
      this.match.hostTeamCoach.angry();
      this.guestTeamScore++;

      this.match.matchManager.guestScore++;
      canvasScene.guestTeamScoretext.setText(
        this.match.matchManager.guestScore.toString()
      );
    }

    setTimeout(() => {
      this.match.stadium.stopGoalSelebration();
    }, 3000);

    setTimeout(() => {
      this.again();
    }, 4000);
  }

  again() {
    const maxRounds = 5;
    const totalShotsTaken = this.round; // Keep track of the shots taken
    const hostShotsLeft = maxRounds - Math.ceil(totalShotsTaken / 2);
    const guestShotsLeft = maxRounds - Math.floor(totalShotsTaken / 2);

    // Early win check: Only end if the opponent **CANNOT** catch up
    if (this.hostTeamScore > this.guestTeamScore + guestShotsLeft) {
      console.log("Host Team Wins Early!");
      this.endGame();
      return;
    }
    if (this.guestTeamScore > this.hostTeamScore + hostShotsLeft) {
      console.log("Guest Team Wins Early!");
      this.endGame();
      return;
    }

    // If both teams have taken 5 shots, determine winner
    if (totalShotsTaken >= maxRounds * 2) {
      if (this.hostTeamScore > this.guestTeamScore) {
        console.log("Host Team Wins!");
        this.endGame();
        return;
      } else if (this.guestTeamScore > this.hostTeamScore) {
        console.log("Guest Team Wins!");
        this.endGame();
        return;
      } else {
        console.log("Sudden Death Begins!");
      }
    }

    // Sudden Death: Continue until one team scores and the other misses
    if (
      totalShotsTaken > maxRounds * 2 &&
      this.hostTeamScore !== this.guestTeamScore
    ) {
      console.log(
        this.hostTeamScore > this.guestTeamScore
          ? "Host Team Wins!"
          : "Guest Team Wins!"
      );
      this.endGame();
      return;
    }

    // Continue penalty shootout
    this.whosTurn = this.whosTurn === "host" ? "guest" : "host";

    this.match.hostTeam.boardFootballPlayers.goalKeeper.deactive();
    this.match.hostTeam.boardFootballPlayers.goalKeeper.setActive(false);
    this.match.guestTeam.boardFootballPlayers.goalKeeper.deactive();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.setActive(false);

    this.prepareGoalkeeper();
    this.prepareAttaker();
    this.prepareBall();
    this.canCheckIfIsGoal = true;

    setTimeout(() => {
      this.shoot();
      this.round++; // Increment round AFTER all conditions
    }, getRandomIntNumber(2000, 4000));
  }

  endGame() {
    console.log(
      `Final Score: Host ${this.hostTeamScore} - ${this.guestTeamScore} Guest`
    );
  }
}
