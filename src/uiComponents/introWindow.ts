import { GameData } from "../config/gameData";
import { layoutData } from "../config/layout";
import { calculatePercentage } from "../utils/math";

export class IntroWindow extends Phaser.GameObjects.Container {
  hostTeamIndicators: Phaser.GameObjects.Container;
  guestTeamIndicators: Phaser.GameObjects.Container;

  background: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.init();
  }

  init() {
    this.addBackground();
    this.showBrandTitle();
    if (GameData.matchSettings.showModals) {
      setTimeout(() => {
        this.showTeamsLogo();
      }, 2700);
    }
  }

  showTeamsLogo() {
    // ---------- HOST ----------
    const hostContainer = this.scene.add
      .container(0, this.scene.game.canvas.height / 2 - layoutData.gameplay.teamsLogosY)
      .setAlpha(0)
      .setScale(layoutData.gameplay.teamsLogosScale);
    this.add(hostContainer);

    const hostLogo = this.scene.add
      .image(0, -70, GameData.teamsData.hostTeam!.name)
      .setScale(1.3);
    const hostText = this.scene.add
      .text(0, 0, GameData.teamsData.hostTeam!.name, {
        fontFamily: "Arial",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#ffffffff",
        backgroundColor: "#05441eff",
        padding: { top: 2, bottom: 2, left: 8, right: 8 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#0a3a1dff",
          blur: 1,
          fill: true,
        },
      })
      .setOrigin(0.5);
    const hostStrengthText = this.scene.add
      .text(0, 50, `Strength : ${GameData.teamsData.hostTeam!.attack_speed}`, {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffffff",
        backgroundColor: "#05441eff",
        padding: { top: 2, bottom: 2, left: 8, right: 8 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#0a3a1dff",
          blur: 1,
          fill: true,
        },
      })
      .setOrigin(0.5);
    hostContainer.add([hostLogo, hostText, hostStrengthText]);

    this.scene.tweens.add({
      targets: hostContainer,
      duration: 500,
      x: this.scene.game.canvas.width / 2 - 150,
      alpha: 1,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          delay: 1000,
          targets: hostContainer,
          duration: 500,
          x: -hostContainer.width - 200,
          alpha: 0,
          ease: "Sine.easeIn",
          onComplete: () => hostContainer.destroy(true),
        });
      },
    });

    // ---------- GUEST ----------
    const guestContainer = this.scene.add
      .container(
        this.scene.game.canvas.width,
        this.scene.game.canvas.height / 2 - layoutData.gameplay.teamsLogosY
      )
      .setAlpha(0)
      .setScale(layoutData.gameplay.teamsLogosScale);
    this.add(guestContainer);

    const guestLogo = this.scene.add
      .image(0, -70, GameData.teamsData.guestTeam!.name)
      .setScale(1.3);
    const guestText = this.scene.add
      .text(0, 0, GameData.teamsData.guestTeam!.name, {
        fontFamily: "Arial",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#ffffffff",
        backgroundColor: "#05441eff",
        padding: { top: 2, bottom: 2, left: 8, right: 8 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#0a3a1dff",
          blur: 1,
          fill: true,
        },
      })
      .setOrigin(0.5);
    const guestStrengthText = this.scene.add
      .text(0, 50, `Strength : ${GameData.teamsData.guestTeam!.attack_speed}`, {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffffff",
        backgroundColor: "#05441eff",
        padding: { top: 2, bottom: 2, left: 8, right: 8 },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#0a3a1dff",
          blur: 1,
          fill: true,
        },
      })
      .setOrigin(0.5);
    guestContainer.add([guestLogo, guestText, guestStrengthText]);

    this.scene.tweens.add({
      targets: guestContainer,
      duration: 500,
      x: this.scene.game.canvas.width / 2 + 150,
      alpha: 1,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          delay: 1000,
          targets: guestContainer,
          duration: 500,
          x: this.scene.game.canvas.width + 200,
          alpha: 0,
          ease: "Sine.easeIn",
          onComplete: () => guestContainer.destroy(true),
        });
      },
    });
  }

  addBackground() {
    this.background = this.scene.add
      .image(-40, 0, "default")
      .setTint(0x000000)
      .setAlpha(0.3)
      .setDisplaySize(
        this.scene.game.canvas.width + 100,
        this.scene.game.canvas.height
      )
      .setOrigin(0);

    this.add(this.background);
  }

  showBrandTitle() {
    const title = this.scene.add
      .text(
        this.scene.game.canvas.width / 2,
        this.scene.game.canvas.height / 2,
        "Marble Arena",
        {
          fontSize: layoutData.gameplay.brandTitleFontSize,
          color: "#ffffff",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setScale(0)
      .setAlpha(0)
      .setOrigin(0.5);

    this.add(title);

    this.scene.tweens.add({
      targets: title,
      duration: 1200,
      scale: 1,
      alpha: 1,
      ease: "Expo.easeInOut",
    });

    setTimeout(() => {
      this.scene.tweens.add({
        targets: title,
        duration: 1200,
        scale: 0,
        alpha: 0,
        ease: "Expo.easeInOut",
      });
    }, 2000);
  }
}
