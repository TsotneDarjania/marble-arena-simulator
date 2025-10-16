// Menu.ts
import * as Phaser from "phaser";
import { calculatePercentage } from "../utils/math";
import { TeamsSelector } from "../core";
import { TeamDataType } from "../types/gameTypes";
import { GameData } from "../config/gameData";
import MenuTeamsSettings from "../core/uiMechanics/menuTeamsSettings/menuTeamsSettings";
import { MenuButton } from "../core/uiMechanics/menuButton/menuButton";
import { detectMob } from "../utils/helper";
import { layoutData } from "../config/layout";

export default class Menu extends Phaser.Scene {
  private backgroundImage!: Phaser.GameObjects.Image;
  private nextBtn?: MenuButton;

  selectButtonClickSound!: Phaser.Sound.BaseSound;
  buttonClickSound!: Phaser.Sound.BaseSound;

  constructor() {
    super("Menu");
  }

  create() {
    // Add Sounds
    this.selectButtonClickSound = this.sound.add("selectTeamButtonSound", {
      volume: 1,
      loop: false,
    });
    this.buttonClickSound = this.sound.add("button", {
      volume: 0.2,
      loop: false,
    });

    const title = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2,
        "MARBLE ARENA",
        {
          fontSize: "50px",
          align: "center",
          color: "#25e000ff",
          stroke: "#68f54cff",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    const subtitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 + 50,
        "SIMULATOR",
        {
          fontSize: "40px",
          align: "center",
          color: "#85ce77ff",
          strokeThickness: 2,
          stroke: "#58974cff",
        }
      )
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
          delay: 300,
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

  private showMenuInterface() {
    // Background
    this.backgroundImage = this.add
      .image(0, -5, "default")
      .setDisplaySize(this.game.canvas.width + 10, this.game.canvas.height + 10)
      .setOrigin(0)
      .setTint(0x021f14)
      .setAlpha(0);

    this.tweens.add({
      targets: this.backgroundImage,
      alpha: 1,
      duration: 2000,
    });

    // Titles
    const teamsTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 -
          calculatePercentage(40, this.game.canvas.height),
        "Select Teams",
        {
          fontSize: layoutData.menu.teamsTitle.fontSize,
          align: "center",
          color: "#aff0a2ff",
          stroke: "#aff0a2ff",
          strokeThickness: 2,
        }
      )
      .setAlpha(0)
      .setOrigin(0.5);

    const hostTeamChooseTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 -
          calculatePercentage(
            layoutData.menu.hostTeamChooseTitle.yPercent,
            this.game.canvas.height
          ),
        "Home Team",
        {
          fontSize: layoutData.menu.hostTeamChooseTitle.fontSize,
          align: "center",
          color: "#c2f5c2ff",
          stroke: "#c2f5c2ff",
          strokeThickness: 2,
        }
      )
      .setAlpha(0)
      .setOrigin(0.5);

    // Home selector
    const homeTeamSelector = new TeamsSelector(
      this,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 -
        calculatePercentage(10, this.game.canvas.height),
      300,
      50,
      GameData.teams!,
      GameData.teamsData.hostTeam!
    ).setAlpha(0);

    const guestTeamChooseTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 +
          calculatePercentage(
            layoutData.menu.guestTeamChooseTitle.yPercent,
            this.game.canvas.height
          ),
        "Away Team",
        {
          fontSize: layoutData.menu.guestTeamChooseTitle.fontSize,
          align: "center",
          color: "#c2f5c2ff",
          stroke: "#c2f5c2ff",
          strokeThickness: 2,
        }
      )
      .setAlpha(0)
      .setOrigin(0.5);

    // Away selector
    const guestTeamSelector = new TeamsSelector(
      this,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 +
        calculatePercentage(21, this.game.canvas.height),
      300,
      50,
      GameData.teams!,
      GameData.teamsData.guestTeam!
    ).setAlpha(0);

    // Track current selections
    let selectedHome: TeamDataType = GameData.teams![0];
    let selectedAway: TeamDataType = GameData.teams![2];

    homeTeamSelector.eventEmitter.on("change", (team: TeamDataType) => {
      selectedHome = team;
      this.syncNextEnabled(selectedHome, selectedAway);

      this.selectButtonClickSound.play();
    });

    guestTeamSelector.eventEmitter.on("change", (team: TeamDataType) => {
      selectedAway = team;
      this.syncNextEnabled(selectedHome, selectedAway);

      this.selectButtonClickSound.play();
    });

    // Fade in the UI
    this.tweens.add({
      targets: [
        guestTeamSelector,
        guestTeamChooseTitle,
        homeTeamSelector,
        hostTeamChooseTitle,
        teamsTitle,
      ],
      duration: 1000,
      alpha: 1,
      onComplete: () => {
        // NEXT button (class-based)
        this.nextBtn = new MenuButton(
          this,
          this.game.canvas.width / 2,
          this.game.canvas.height - layoutData.menu.nextButton.y,
          "NEXT",
          layoutData.menu.nextButton.width,
          layoutData.menu.nextButton.height,
          14
        )
          .setAlpha(0)
          .setEnabled(false); // will sync right after

        this.nextBtn.on("click", () => {
          hostTeamChooseTitle.alpha = 0;
          homeTeamSelector.alpha = 0;
          teamsTitle.alpha = 0;
          guestTeamChooseTitle.alpha = 0;
          guestTeamSelector.alpha = 0;
          this.nextBtn?.destroy();

          GameData.teamsData.hostTeam = selectedHome;
          GameData.teamsData.guestTeam = selectedAway;
          this.buttonClickSound.play();

          new MenuTeamsSettings(
            this,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            selectedHome!,
            selectedAway!
          );
        });
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
    if (this.nextBtn) this.nextBtn.setEnabled(enabled);
  }
}
