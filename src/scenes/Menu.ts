import * as Phaser from "phaser";
import { calculatePercentage } from "../utils/math";
import { TeamsSelector } from "../core";
import { TeamDataType } from "../types/gameTypes";
import { GameDataStore } from "../config/gameDataStore";

export default class Menu extends Phaser.Scene {
  backgroundImage!: Phaser.GameObjects.Image;

  // keep a reference to the Next button
  private nextBtn?: Phaser.GameObjects.Container;

  constructor() {
    super("Menu");
  }

  create() {
    const title = this.add
      .text(this.game.canvas.width / 2, this.game.canvas.height / 2, "MARBLE ARENA", {
        fontSize: "50px",
        align: "center",
        color: "#25e000ff",
        stroke: "#68f54cff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const subtitle = this.add
      .text(this.game.canvas.width / 2, this.game.canvas.height / 2 + 50, "SIMULATOR", {
        fontSize: "40px",
        align: "center",
        color: "#85ce77ff",
        strokeThickness: 2,
        stroke: "#58974cff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Title & Subtitle Animation
    this.tweens.add({
      targets: [title, subtitle],
      duration: 1000,
      alpha: 1,
      onComplete: () => {
        this.tweens.add({
          targets: [title, subtitle],
          delay: 2000,
          duration: 1000,
          alpha: 0,
          onComplete: () => {
            subtitle.destroy();
            title.destroy();
            this.showMenuInterface();
          },
        });
      },
    });
  }

  showMenuInterface() {
    this.backgroundImage = this.add
      .image(0, -5, "default")
      .setDisplaySize(this.game.canvas.width + 10, this.game.canvas.height + 10)
      .setOrigin(0)
      .setTint(0x021f14)
      .setAlpha(0);

    this.tweens.add({ targets: this.backgroundImage, alpha: 1, duration: 2000 });

    const teamsTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 - calculatePercentage(40, this.game.canvas.height),
        "Select Teams",
        {
          fontSize: "50px",
          align: "center",
          color: "#aff0a2ff",
          stroke: "#aff0a2ff",
          strokeThickness: 2,
        }
      )
      .setAlpha(0)
      .setOrigin(0.5);

    // Home Team
    const hostTeamChooseTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 - calculatePercentage(21, this.game.canvas.height),
        "Home Team",
        {
          fontSize: "40px",
          align: "center",
          color: "#c2f5c2ff",
          stroke: "#c2f5c2ff",
          strokeThickness: 2,
        }
      )
      .setAlpha(0)
      .setOrigin(0.5);

    const homeTeamSelector = new TeamsSelector(
      this,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 - calculatePercentage(10, this.game.canvas.height),
      300,
      50,
      GameDataStore.teams!,
      GameDataStore.teams![0]
    ).setAlpha(0);

    // Guest Team
    const guestTeamChooseTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 + calculatePercentage(10, this.game.canvas.height),
        "Away Team",
        {
          fontSize: "40px",
          align: "center",
          color: "#c2f5c2ff",
          stroke: "#c2f5c2ff",
          strokeThickness: 2,
        }
      )
      .setAlpha(0)
      .setOrigin(0.5);

    const guestTeamSelector = new TeamsSelector(
      this,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 + calculatePercentage(21, this.game.canvas.height),
      300,
      50,
      GameDataStore.teams!,
      GameDataStore.teams![2]
    ).setAlpha(0);

    // Track current selections
    let selectedHome: TeamDataType = GameDataStore.teams![0];
    let selectedAway: TeamDataType = GameDataStore.teams![2];

    homeTeamSelector.eventEmitter.on("change", (team: TeamDataType) => {
      selectedHome = team;
      this.syncNextEnabled(selectedHome, selectedAway);
    });

    guestTeamSelector.eventEmitter.on("change", (team: TeamDataType) => {
      selectedAway = team;
      this.syncNextEnabled(selectedHome, selectedAway);
    });

    // Fade in the UI
    this.tweens.add({
      targets: [guestTeamSelector, guestTeamChooseTitle, homeTeamSelector, hostTeamChooseTitle, teamsTitle],
      duration: 1000,
      alpha: 1,
      onComplete: () => {
        // Create NEXT button at the bottom center
        this.nextBtn = this.createNextButton(
          this.game.canvas.width / 2,
          this.game.canvas.height - 56,
          "NEXT",
          () => {
            // ✅ Replace with your scene transition:
            console.log("NEXT clicked:", {
              home: selectedHome?.name,
              away: selectedAway?.name,
            });
            // Example:
            // this.scene.start("GamePlay", { homeTeam: selectedHome, awayTeam: selectedAway });
          }
        );
        this.nextBtn.setAlpha(0);
        this.add.existing(this.nextBtn);

        this.tweens.add({ targets: this.nextBtn, duration: 300, alpha: 1 });

        // Initial enable/disable state
        this.syncNextEnabled(selectedHome, selectedAway);
      },
    });
  }

  // Enable only when teams are different (tweak if you allow mirror matches)
  private syncNextEnabled(home: TeamDataType, away: TeamDataType) {
    const enabled = !!home && !!away && home.name !== away.name;
    if (this.nextBtn) this.setButtonEnabled(this.nextBtn, enabled);
  }

  // -------------------- BUTTON FACTORY --------------------

  private createNextButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const w = 200;
    const h = 48;
    const r = 14;

    const bg = this.add.graphics();
    const draw = (mode: "normal" | "hover" | "pressed" | "disabled") => {
      bg.clear();
      if (mode === "disabled") {
        bg.fillStyle(0xffffff, 0.08); // faint
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
        bg.lineStyle(2, 0xffffff, 0.25);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      } else {
        const fill =
          mode === "pressed" ? 0x1aa14a :
          mode === "hover"   ? 0x25cc63 :
                               0x25b457; // normal
        const alpha = 0.9;
        bg.fillStyle(fill, alpha);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
        bg.lineStyle(2, 0xffffff, 0.9);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      }
    };

    const txt = this.add.text(0, 0, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    const hit = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const c = this.add.container(x, y, [bg, txt, hit]);
    c.setDepth(1000);
    c.setData("enabled", true);

    draw("normal");

    const hoverIn  = () => {
      if (!c.getData("enabled")) return;
      draw("hover");
      this.tweens.add({ targets: c, scale: 1.04, duration: 90, ease: "Quad.easeOut" });
    };
    const hoverOut = () => {
      if (!c.getData("enabled")) return;
      draw("normal");
      this.tweens.add({ targets: c, scale: 1.0, duration: 90, ease: "Quad.easeOut" });
    };
    const press = () => {
      if (!c.getData("enabled")) return;
      draw("pressed");
      this.tweens.add({
        targets: c,
        scale: 0.97,
        duration: 70,
        yoyo: true,
        ease: "Quad.easeInOut",
        onComplete: () => draw("hover"),
      });
      onClick();
    };

    hit.on("pointerover", hoverIn);
    hit.on("pointerout", hoverOut);
    hit.on("pointerdown", press);

    return c;
  }

  private setButtonEnabled(btn: Phaser.GameObjects.Container, enabled: boolean) {
    btn.setData("enabled", enabled);
    // redraw bg according to state
    const bg = btn.list.find((child) => child instanceof Phaser.GameObjects.Graphics) as Phaser.GameObjects.Graphics | undefined;
    if (!bg) return;

    const w = 200, h = 48, r = 14;
    bg.clear();
    if (!enabled) {
      bg.fillStyle(0xffffff, 0.08);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      bg.lineStyle(2, 0xffffff, 0.25);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      btn.setAlpha(0.6);
    } else {
      bg.fillStyle(0x25b457, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      bg.lineStyle(2, 0xffffff, 0.9);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      btn.setAlpha(1);
    }
  }
}
