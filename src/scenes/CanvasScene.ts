import * as Phaser from "phaser";
import GamePlay from "./GamePlay";
import { IntroOverlay } from "../uiComponents/overlay";
import { IntroWindow } from "../uiComponents/introWindow";
import { GameData } from "../config/gameData";
import { CanvasSceneCameraController } from "../core";

export default class CanvasScene extends Phaser.Scene {
  cameraController: CanvasSceneCameraController;
  introOverlay: IntroOverlay;

  gamePlayMenu: Phaser.GameObjects.Container;
  introWindow: IntroWindow;

  timerText: Phaser.GameObjects.Text;
  pressToStartText: Phaser.GameObjects.Text;
  hostTeamScoretext: Phaser.GameObjects.Text;
  guestTeamScoretext: Phaser.GameObjects.Text;

  lastPenaltiesLeftXPosition = -50;
  lastPenaltiesRightXPosition = 50;

  possibleToShowCommentatorTexrt = true;
  indicatorsContainer: Phaser.GameObjects.Container;

  matchContinueModal: Phaser.GameObjects.Container;

  constructor() {
    super("CanvasScene");
  }

  create() {
    this.addIntroOverlay();
    this.createCameraController();
    this.createIndicators();
  }

  showMatchContinueModal() {
    if (!GameData.matchSettings.showModals) return;

    this.matchContinueModal = this.add.container();

    const bck = this.add
      .image(0, 0, "default")
      .setDisplaySize(
        this.game.canvas.width + 100,
        this.game.canvas.height + 100
      )
      .setOrigin(0)
      .setTint(0x000000)
      .setAlpha(0.4)
      .setDepth(100);

    const text = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2,
        "Press anywhere to continue",
        {
          fontSize: "36px",
          align: "center",
          color: "#ffffffff",
          stroke: "#ffffffff",
          strokeThickness: 1,
        }
      )
      .setDepth(101)
      .setOrigin(0.5);

    this.matchContinueModal.add([bck, text]);
  }

  destoryMatchContinueModal() {
    this.matchContinueModal?.destroy(true);
  }

  destroyPressToStartText() {
    this.pressToStartText.destroy();
  }

  showPressToStartText() {
    this.pressToStartText = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2,
        "Press to start game",
        {
          fontSize: "36px",
          align: "center",
          color: "#ffffffff",
          stroke: "#ffffffff",
          strokeThickness: 1,
          backgroundColor: "black",
          padding: {
            left: 12,
            right: 12,
            top: 6,
            bottom: 6,
          },
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.pressToStartText,
      duration: 700,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
    });
  }

  createCameraController() {
    const gamePlayScene = this.scene.get("GamePlay") as GamePlay;
    this.cameraController = new CanvasSceneCameraController(
      this,
      gamePlayScene
    );
  }

  // During Transitions
  showTransition() {
    console.log("aq var");

    const container = this.add
      .container(this.game.canvas.width / 2, this.game.canvas.height / 2)
      .setAlpha(0)
      .setDepth(100);

    const bg = this.add.image(0, 0, "default").setTint(0x000000).setScale(100);

    const marbleArenaLogo = this.add
      .image(0, 0, "marbleArenaLogo")
      .setScale(0.5)
      .setOrigin(0.5);

    container.add([bg, marbleArenaLogo]);

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.tweens.add({
          targets: container,
          alpha: 0,
          delay: 1000,
          duration: 500,
          onComplete: () => {
            container.destroy(true);
          },
        });
      },
    });
  }

  drawPenaltyDone(side: "left" | "right") {
    const image = this.scene.scene.add.image(
      side === "left"
        ? this.game.canvas.width / 2 + this.lastPenaltiesLeftXPosition
        : this.game.canvas.width / 2 + this.lastPenaltiesRightXPosition,
      180,
      "penaltyDone"
    );
    image.setScale(0.65);

    side === "left"
      ? (this.lastPenaltiesLeftXPosition -= 56)
      : (this.lastPenaltiesRightXPosition += 56);
  }

  drawPenaltyFail(side: "left" | "right") {
    const image = this.scene.scene.add.image(
      side === "left"
        ? this.game.canvas.width / 2 + this.lastPenaltiesLeftXPosition
        : this.game.canvas.width / 2 + this.lastPenaltiesRightXPosition,
      180,
      "penaltyFail"
    );
    image.setScale(0.65);

    side === "left"
      ? (this.lastPenaltiesLeftXPosition -= 56)
      : (this.lastPenaltiesRightXPosition += 56);
  }

  createIndicators() {
    this.indicatorsContainer = this.add
      .container(this.game.canvas.width / 2, -20)
      .setAlpha(0);
    // Background
    const bck = this.add
      .image(0, 0, "matchIndicatorBck")
      .setTint(0x02010d)
      .setAlpha(0.8);

    this.timerText = this.add.text(
      this.indicatorsContainer.width / 2,
      this.indicatorsContainer.height / 2 + 20,
      "0",
      {
        fontSize: "25px",
        color: "#F3FFFF",
        align: "center",
        strokeThickness: 1,
      }
    );
    this.timerText.setOrigin(0.5);

    // hostTeamLogo
    const logo1 = this.add.image(
      -160,
      this.indicatorsContainer.height / 2 - 3,
      GameData.teamsData.hostTeam!.name
    );

    // guestTeamLogo
    const logo2 = this.add.image(
      160,
      this.indicatorsContainer.height / 2 - 3,
      GameData.teamsData.guestTeam!.name
    );

    // hostTeamInitials
    const initials1 = this.add
      .text(
        -125,
        this.indicatorsContainer.height / 2,
        GameData.teamsData.hostTeam!.tablo_name,
        {
          fontSize: "35px",
          color: "#E9FFFF",
          fontStyle: "bold",
          strokeThickness: 2,
          align: "left",
        }
      )
      .setOrigin(0, 0.5);

    //guestTeamInitials
    const initials2 = this.add
      .text(
        125,
        this.indicatorsContainer.height / 2,
        GameData.teamsData.guestTeam!.tablo_name,
        {
          fontSize: "35px",
          color: "#E9FFFF",
          fontStyle: "bold",
          strokeThickness: 2,
          align: "right",
        }
      )
      .setOrigin(1, 0.5);

    // hostTeamScore
    const score1 = (this.hostTeamScoretext = this.add
      .text(-20, this.indicatorsContainer.height / 2, "0", {
        fontSize: "45px",
        color: "#E9FFFF",
        fontStyle: "bold",
        strokeThickness: 2,
        align: "right",
      })
      .setOrigin(1, 0.5));

    const score2 = (this.guestTeamScoretext = this.add
      .text(50, this.indicatorsContainer.height / 2, "0", {
        fontSize: "45px",
        color: "#E9FFFF",
        fontStyle: "bold",
        strokeThickness: 2,
        align: "left",
      })
      .setOrigin(1, 0.5));

    // HorizontalLine
    const midline = this.add
      .image(0, this.indicatorsContainer.height / 2, "default")
      .setDisplaySize(20, 7);

    this.indicatorsContainer.add([
      bck,
      midline,
      score1,
      score2,
      logo1,
      logo2,
      initials1,
      initials2,
      this.timerText,
    ]);
    this.indicatorsContainer.setScale(0.75);
    this.indicatorsContainer.setDepth(10);

    this.indicatorsContainer.setAlpha(0);
  }

  addIntroOverlay() {
    this.introOverlay = new IntroOverlay(
      this,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2,
      this.game.canvas.width,
      this.game.canvas.height
    );

    this.introOverlay.addText(
      "Set Your Camera Zoom to Begin the Simulation",
      0,
      0
    );

    this.introOverlay.addButton("Start Simulation");
  }

  startIntroAnimation() {
    this.introOverlay.destroy(true);

    const gamePlayScene = this.scene.get("GamePlay") as GamePlay;
    gamePlayScene.startMatchPrepare();
    this.makeIntroAnimation();
  }

  makeIntroAnimation() {
    this.introWindow = new IntroWindow(this, 0, 0);
  }

  hideIntroWindow() {
    this.add.tween({
      targets: this.introWindow,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.introWindow.destroy(true);
      },
    });
  }

  showLastresult(hostScore: string, guestScore: string) {
    if (!GameData.matchSettings.showModals) return;

    const container = this.add.container();

    const background = this.scene.scene.add
      .image(this.game.canvas.width / 2, this.game.canvas.height / 2, "default")
      .setAlpha(0.8)
      .setDisplaySize(900, 250)
      .setTint(0x0c2114);

    const hostTeamText = this.scene.scene.add
      .text(
        this.game.canvas.width / 2 - 100,
        this.game.canvas.height / 2,
        GameData.teamsData.hostTeam!.name,
        {
          fontSize: "42px",
          color: "#E9FFFF",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(1, 0.5);

    const hostTeamScore = this.scene.scene.add
      .text(
        this.game.canvas.width / 2 - 60,
        this.game.canvas.height / 2,
        hostScore,
        {
          fontSize: "42px",
          color: "#00e4e4ff",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(1, 0.5);

    const line = this.scene.scene.add
      .text(this.game.canvas.width / 2, this.game.canvas.height / 2, "-", {
        fontSize: "42px",
        color: "#E9FFFF",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    const guestTeamText = this.scene.scene.add
      .text(
        this.game.canvas.width / 2 + 100,
        this.game.canvas.height / 2,
        GameData.teamsData.guestTeam!.name,
        {
          fontSize: "42px",
          color: "#E9FFFF",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(0, 0.5);

    const guestTeamScore = this.scene.scene.add
      .text(
        this.game.canvas.width / 2 + 60,
        this.game.canvas.height / 2,
        guestScore,
        {
          fontSize: "42px",
          color: "#00e4e4ff",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(0, 0.5);

    container.add([
      background,
      hostTeamScore,
      hostTeamText,
      guestTeamScore,
      guestTeamText,
    ]);
    container.alpha = 0;

    this.add.tween({
      targets: container,
      alpha: 1,
      duration: 1000,
    });
  }

  showMatchEvent(eventText: string) {
    const background = this.scene.scene.add.image(0, 0, "default");
    background.setDisplaySize(this.game.canvas.width, this.game.canvas.height);
    background.setOrigin(0);
    background.setTint(0x0f2721);
    background.setAlpha(0.4);
    background.setAlpha(0);

    const text = this.scene.scene.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height / 2,
      eventText,
      {
        fontSize: "60px",
        color: "#E9FFFF",
        fontStyle: "bold",
        strokeThickness: 2,
        align: "center",
      }
    );
    text.setOrigin(0.5);
    text.setAlpha(0);

    this.scene.scene.add.tween({
      targets: background,
      alpha: 0.4,
      duration: 400,
    });
    this.scene.scene.add.tween({
      targets: text,
      alpha: 1,
      duration: 400,
    });

    setTimeout(() => {
      background.destroy();
      text.destroy();
    }, 1500);
  }

  showMatchIndicators() {
    this.tweens.add({
      delay: 800,
      targets: this.indicatorsContainer,
      y: 100,
      alpha: 1,
      duration: 1000,
      ease: Phaser.Math.Easing.Sine.InOut,
    });
  }
}
