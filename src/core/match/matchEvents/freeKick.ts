import Match from "..";
import CanvasScene from "../../../scenes/CanvasScene";
import { getRandomIntNumber, mapToRange } from "../../../utils/math";
import BoardFootballPlayer from "../team/footballplayers/boardFootballPlayer";

export class Freekick {
  shooterfootballer!: Phaser.GameObjects.Image;
  longDistanceSecondShooter!: Phaser.Physics.Arcade.Image;
  isLongDistanceFreeKick = false;
  isGoalScored = false;

  constructor(
    public match: Match,
    public teamWhoIsGuilty: "host" | "guest",
    public footballer: BoardFootballPlayer
  ) {
    this.init();
  }

  init() {
    this.match.scene.soundManager.referee.play();

    this.addShooterootballer();
    // Make Layout
    this.footballer.playerData.position === "attacker"
      ? this.makeLongFreeKickLayout()
      : this.makeShortFreeKickLayout();

    if (this.isLongDistanceFreeKick) {
      this.addColliders();
      return;
    }

    setTimeout(() => {
      this.shoot();
    }, getRandomIntNumber(2000, 3000));
  }

  stopFreeKick() {
    this.match.matchManager.matchEvenetManager.matchStatus = "finishFreeKick";
    this.match.ball.stop();
    this.match.hostTeam.stopFullMotion();
    this.match.guestTeam.stopFullMotion();

    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();

    setTimeout(() => {
      this.destroyFreeKick();
    }, 1000);
  }

  isGoal(whoScored: "host" | "guest") {
    if (whoScored === "host") {
      this.match.matchManager.hostScore++;
      const canvasScene = this.match.scene.scene.get(
        "CanvasScene"
      ) as CanvasScene;
      canvasScene.hostTeamScoretext.setText(
        this.match.matchManager.hostScore.toString()
      );
    } else {
      this.match.matchManager.guestScore++;
      const canvasScene = this.match.scene.scene.get(
        "CanvasScene"
      ) as CanvasScene;
      canvasScene.guestTeamScoretext.setText(
        this.match.matchManager.guestScore.toString()
      );
    }

    this.isGoalScored = true;
    this.match.stadium.startGoalSelebration(whoScored);
    this.match.ball.startBlinkAnimation();
    setTimeout(() => {
      this.match.ball.stop();
    }, 90);
    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.hostTeam.stopFullMotion();
    this.match.guestTeam.stopFullMotion();

    if (whoScored === "host") {
      this.match.hostTeamCoach.selebration();
      this.match.guestTeamCoach.angry();
    } else {
      this.match.guestTeamCoach.selebration();
      this.match.hostTeamCoach.angry();
    }

    setTimeout(() => {
      this.stopFreeKick();
    }, 4000);
  }

  destroyFreeKick() {
    const canvasScene = this.match.scene.scene.get(
      "CanvasScene"
    ) as CanvasScene;
    canvasScene.showTransition();

    setTimeout(() => {
      this.match.stadium.stopGoalSelebration();
      this.match.matchManager.matchEvenetManager.resumeUfterFreeKick(
        this.teamWhoIsGuilty,
        this.isGoalScored
      );

      this.shooterfootballer.destroy();
      this.longDistanceSecondShooter?.destroy();
    }, 500);
  }

  shoot() {
    this.match.scene.soundManager.shoot.play();

    const teamData =
      this.teamWhoIsGuilty === "guest"
        ? this.match.matchData.hostTeamData
        : this.match.matchData.guestTeamData;
    let x = 0;
    const isfailShoot =
      getRandomIntNumber(0, 100) < teamData.shoot_accuracy ? false : true;

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

    if (this.teamWhoIsGuilty === "guest") {
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
    this.match.scene.soundManager.catchBall.play();

    this.match.ball.stop();
    this.match.hostTeam.stopFullMotion();
    this.match.guestTeam.stopFullMotion();

    this.match.hostTeam.boardFootballPlayers.goalKeeper.stopMotion();
    this.match.guestTeam.boardFootballPlayers.goalKeeper.stopMotion();

    this.stopFreeKick();
  }

  addColliders() {
    let alreadyShoot = false;
    this.match.scene.physics.add.overlap(
      this.match.ball,
      this.longDistanceSecondShooter,
      () => {
        if (alreadyShoot) return;
        alreadyShoot = true;
        this.shoot();
      }
    );
  }

  addShooterootballer() {
    this.shooterfootballer = this.match.scene.add.image(
      this.teamWhoIsGuilty === "host"
        ? this.match.ball.getBounds().centerX + 30
        : this.match.ball.getBounds().centerX - 30,
      this.match.ball.getBounds().centerY,
      this.teamWhoIsGuilty === "host"
        ? this.match.guestTeam.teamData.name
        : this.match.hostTeam.teamData.name
    );
    this.shooterfootballer.setScale(0.6);
  }

  makeLongFreeKickLayout() {
    this.isLongDistanceFreeKick = true;
    if (this.teamWhoIsGuilty === "host") {
      this.match.hostTeam.boardFootballPlayers.goalKeeper.startMotion();
      this.match.hostTeam.boardFootballPlayers.goalKeeper.activate();

      this.match.hostTeam.boardFootballPlayers.middleColumn.footballers.forEach(
        (f) => {
          f.activate();
        }
      );
      this.match.hostTeam.boardFootballPlayers.middleColumn.startMotion(
        this.match.matchData.hostTeamData.attack_speed
      );

      const randomFootballer =
        this.match.guestTeam.boardFootballPlayers.attackColumn.footballers[
          getRandomIntNumber(
            0,
            this.match.guestTeam.boardFootballPlayers.attackColumn.footballers
              .length
          )
        ];
      this.longDistanceSecondShooter = this.match.scene.physics.add.image(
        randomFootballer.getBounds().x,
        randomFootballer.getBounds().y,
        this.match.guestTeam.teamData.name
      );
      this.longDistanceSecondShooter.setDepth(110);
      this.longDistanceSecondShooter.setScale(0.6);
      this.longDistanceSecondShooter.setCircle(30);

      setTimeout(() => {
        const x = this.longDistanceSecondShooter.getBounds().centerX;
        const y = this.longDistanceSecondShooter.getBounds().centerY;

        this.match.scene.soundManager.pass.play();

        this.match.ball.kick(
          mapToRange(this.match.matchData.guestTeamData.pass_speed, 160, 300),
          {
            x,
            y,
          }
        );
      }, 2000);
    } else {
      this.match.guestTeam.boardFootballPlayers.goalKeeper.startMotion();
      this.match.guestTeam.boardFootballPlayers.goalKeeper.activate();

      this.match.guestTeam.boardFootballPlayers.middleColumn.footballers.forEach(
        (f) => {
          f.activate();
        }
      );
      this.match.guestTeam.boardFootballPlayers.middleColumn.startMotion(
        this.match.matchData.guestTeamData.attack_speed
      );

      const randomFootballer =
        this.match.hostTeam.boardFootballPlayers.attackColumn.footballers[
          getRandomIntNumber(
            0,
            this.match.hostTeam.boardFootballPlayers.attackColumn.footballers
              .length
          )
        ];

      this.longDistanceSecondShooter = this.match.scene.physics.add.image(
        randomFootballer.getBounds().x,
        randomFootballer.getBounds().y,
        this.match.hostTeam.teamData.name
      );
      this.longDistanceSecondShooter.setDepth(110);
      this.longDistanceSecondShooter.setScale(0.6);
      this.longDistanceSecondShooter.setCircle(30);

      setTimeout(() => {
        const x = this.longDistanceSecondShooter.getBounds().centerX;
        const y = this.longDistanceSecondShooter.getBounds().centerY;

        this.match.scene.soundManager.pass.play();

        this.match.ball.kick(
          mapToRange(this.match.matchData.hostTeamData.pass_speed, 160, 300),
          {
            x,
            y,
          }
        );
      }, 2000);
    }
  }

  makeShortFreeKickLayout() {
    if (this.teamWhoIsGuilty === "host") {
      this.match.hostTeam.boardFootballPlayers.goalKeeper.startMotion();
      this.match.hostTeam.boardFootballPlayers.goalKeeper.activate();

      this.match.hostTeam.boardFootballPlayers.defenceColumn.footballers.forEach(
        (f) => {
          f.activate();
        }
      );
    } else {
      this.match.guestTeam.boardFootballPlayers.goalKeeper.startMotion();
      this.match.guestTeam.boardFootballPlayers.goalKeeper.activate();

      this.match.guestTeam.boardFootballPlayers.defenceColumn.footballers.forEach(
        (f) => {
          f.activate();
        }
      );
    }
  }
}
