// Menu.ts
import * as Phaser from "phaser";
import { calculatePercentage } from "../utils/math";
import { TeamsSelector } from "../core";
import { TeamDataType } from "../types/gameTypes";
import { GameData } from "../config/gameData";
import MenuTeamsSettings from "../core/uiMechanics/menuTeamsSettings/menuTeamsSettings";
import { MenuButton } from "../core/uiMechanics/menuButton/menuButton";
import { layoutData } from "../config/layout";

export default class Menu extends Phaser.Scene {
  private backgroundImage!: Phaser.GameObjects.Image;
  private nextBtn?: MenuButton;

  selectButtonClickSound!: Phaser.Sound.BaseSound;
  buttonClickSound!: Phaser.Sound.BaseSound;

  teams: Array<TeamDataType> = [];

  constructor() {
    super("Menu");
  }

  create() {
    console.log(GameData.teams);
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
        },
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
        },
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

            this.showChooseTypeInterface();
            // this.showMenuInterface();
          },
        });
      },
    });
  }

  private showChooseTypeInterface() {
    const button_1 = new MenuButton(
      this,
      this.scene.scene.game.canvas.width / 2,
      this.scene.scene.game.canvas.height / 2 - 35,
      "National Teams",
      240,
      53,
      1,
    )
      .setInteractive()
      .on("click", () => {
        this.teams = GameData.teams!.filter(
          (team) => team.is_national_team === "yes",
        ).sort((a, b) => a.name.localeCompare(b.name));
        button_1.destroy();
        button_2.destroy();
        this.showMenuInterface();
      });
    const button_2 = new MenuButton(
      this,
      this.scene.scene.game.canvas.width / 2,
      this.scene.scene.game.canvas.height / 2 + 35,
      "Teams",
      240,
      53,
      1,
    )
      .setInteractive()
      .on("click", () => {
        this.teams = GameData.teams!.filter(
          (team) => team.is_national_team === "no",
        ).sort((a, b) => a.name.localeCompare(b.name));

        button_1.destroy();
        button_2.destroy();
        this.showMenuInterface();
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
        },
      )
      .setAlpha(0)
      .setOrigin(0.5);

    const hostTeamChooseTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 -
          calculatePercentage(
            layoutData.menu.hostTeamChooseTitle.yPercent,
            this.game.canvas.height,
          ),
        "Home Team",
        {
          fontSize: layoutData.menu.hostTeamChooseTitle.fontSize,
          align: "center",
          color: "#c2f5c2ff",
          stroke: "#c2f5c2ff",
          strokeThickness: 2,
        },
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
      this.teams!,
      this.teams[0]!,
    )
      .setScale(layoutData.menu.teamsSelectorScale)
      .setAlpha(0);
      GameData.teamsData.hostTeam = this.teams[0]

    const guestTeamChooseTitle = this.add
      .text(
        this.game.canvas.width / 2,
        this.game.canvas.height / 2 +
          calculatePercentage(
            layoutData.menu.guestTeamChooseTitle.yPercent,
            this.game.canvas.height,
          ),
        "Away Team",
        {
          fontSize: layoutData.menu.guestTeamChooseTitle.fontSize,
          align: "center",
          color: "#c2f5c2ff",
          stroke: "#c2f5c2ff",
          strokeThickness: 2,
        },
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
      this.teams!,
      this.teams[1]!,
    )
      .setScale(layoutData.menu.teamsSelectorScale)
      .setAlpha(0);
      GameData.teamsData.guestTeam= this.teams[1]

    // Track current selections
    let selectedHome: TeamDataType = GameData.teamsData.hostTeam!;
    let selectedAway: TeamDataType = GameData.teamsData.guestTeam!;

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
          14,
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
            selectedAway!,
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
