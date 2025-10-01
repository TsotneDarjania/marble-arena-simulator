// Menu.ts
import * as Phaser from "phaser";
import { calculatePercentage } from "../utils/math";
import { TeamsSelector } from "../core";
import { TeamDataType } from "../types/gameTypes";
import { GameData } from "../config/gameData";
import MenuTeamsSettings from "../core/uiMechanics/menuTeamsSettings/menuTeamsSettings";
import { MenuButton } from "../core/uiMechanics/menuButton/menuButton";

export default class Menu extends Phaser.Scene {
  private backgroundImage!: Phaser.GameObjects.Image;
  private nextBtn?: MenuButton;

  constructor() {
    super("Menu");
  }

  create() {
    this.backgroundImage = this.add
      .image(0, -5, "default")
      .setDisplaySize(this.game.canvas.width + 10, this.game.canvas.height + 10)
      .setOrigin(0)
      .setTint(0x165438)
      .setAlpha(1);

    const menuTeamsSettings = new MenuTeamsSettings(
      this,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2,
      GameData.teams![0],
      GameData.teams![1]
    );

    //   const title = this.add
    //     .text(this.game.canvas.width / 2, this.game.canvas.height / 2, "MARBLE ARENA", {
    //       fontSize: "50px",
    //       align: "center",
    //       color: "#25e000ff",
    //       stroke: "#68f54cff",
    //       strokeThickness: 2,
    //     })
    //     .setOrigin(0.5)
    //     .setAlpha(0);

    //   const subtitle = this.add
    //     .text(
    //       this.game.canvas.width / 2,
    //       this.game.canvas.height / 2 + 50,
    //       "SIMULATOR",
    //       {
    //         fontSize: "40px",
    //         align: "center",
    //         color: "#85ce77ff",
    //         strokeThickness: 2,
    //         stroke: "#58974cff",
    //       }
    //     )
    //     .setOrigin(0.5)
    //     .setAlpha(0);

    //   // Title & Subtitle Animation
    //   this.tweens.add({
    //     targets: [title, subtitle],
    //     duration: 1000,
    //     alpha: 1,
    //     onComplete: () => {
    //       this.tweens.add({
    //         targets: [title, subtitle],
    //         delay: 2000,
    //         duration: 1000,
    //         alpha: 0,
    //         onComplete: () => {
    //           subtitle.destroy();
    //           title.destroy();
    //           this.showMenuInterface();
    //         },
    //       });
    //     },
    //   });
    // }

    // private showMenuInterface() {
    //   // Background
    //   this.backgroundImage = this.add
    //     .image(0, -5, "default")
    //     .setDisplaySize(this.game.canvas.width + 10, this.game.canvas.height + 10)
    //     .setOrigin(0)
    //     .setTint(0x021f14)
    //     .setAlpha(0);

    //   this.tweens.add({ targets: this.backgroundImage, alpha: 1, duration: 2000 });

    //   // Titles
    //   const teamsTitle = this.add
    //     .text(
    //       this.game.canvas.width / 2,
    //       this.game.canvas.height / 2 - calculatePercentage(40, this.game.canvas.height),
    //       "Select Teams",
    //       {
    //         fontSize: "50px",
    //         align: "center",
    //         color: "#aff0a2ff",
    //         stroke: "#aff0a2ff",
    //         strokeThickness: 2,
    //       }
    //     )
    //     .setAlpha(0)
    //     .setOrigin(0.5);

    //   const hostTeamChooseTitle = this.add
    //     .text(
    //       this.game.canvas.width / 2,
    //       this.game.canvas.height / 2 - calculatePercentage(21, this.game.canvas.height),
    //       "Home Team",
    //       {
    //         fontSize: "40px",
    //         align: "center",
    //         color: "#c2f5c2ff",
    //         stroke: "#c2f5c2ff",
    //         strokeThickness: 2,
    //       }
    //     )
    //     .setAlpha(0)
    //     .setOrigin(0.5);

    //   // Home selector
    //   const homeTeamSelector = new TeamsSelector(
    //     this,
    //     this.game.canvas.width / 2,
    //     this.game.canvas.height / 2 - calculatePercentage(10, this.game.canvas.height),
    //     300,
    //     50,
    //     GameDataStore.teams!,
    //     GameDataStore.teams![0]
    //   ).setAlpha(0);

    //   const guestTeamChooseTitle = this.add
    //     .text(
    //       this.game.canvas.width / 2,
    //       this.game.canvas.height / 2 + calculatePercentage(10, this.game.canvas.height),
    //       "Away Team",
    //       {
    //         fontSize: "40px",
    //         align: "center",
    //         color: "#c2f5c2ff",
    //         stroke: "#c2f5c2ff",
    //         strokeThickness: 2,
    //       }
    //     )
    //     .setAlpha(0)
    //     .setOrigin(0.5);

    //   // Away selector
    //   const guestTeamSelector = new TeamsSelector(
    //     this,
    //     this.game.canvas.width / 2,
    //     this.game.canvas.height / 2 + calculatePercentage(21, this.game.canvas.height),
    //     300,
    //     50,
    //     GameDataStore.teams!,
    //     GameDataStore.teams![2]
    //   ).setAlpha(0);

    //   // Track current selections
    //   let selectedHome: TeamDataType = GameDataStore.teams![0];
    //   let selectedAway: TeamDataType = GameDataStore.teams![2];

    //   homeTeamSelector.eventEmitter.on("change", (team: TeamDataType) => {
    //     selectedHome = team;
    //     this.syncNextEnabled(selectedHome, selectedAway);
    //   });

    //   guestTeamSelector.eventEmitter.on("change", (team: TeamDataType) => {
    //     selectedAway = team;
    //     this.syncNextEnabled(selectedHome, selectedAway);
    //   });

    //   // Fade in the UI
    //   this.tweens.add({
    //     targets: [guestTeamSelector, guestTeamChooseTitle, homeTeamSelector, hostTeamChooseTitle, teamsTitle],
    //     duration: 1000,
    //     alpha: 1,
    //     onComplete: () => {
    //       // NEXT button (class-based)
    //       this.nextBtn = new MenuButton(
    //         this,
    //         this.game.canvas.width / 2,
    //         this.game.canvas.height - 56,
    //         "NEXT",
    //         200,
    //         48,
    //         14,
    //         undefined,
    //         () => {
    //           // Hide current UI
    //           hostTeamChooseTitle.alpha = 0;
    //           homeTeamSelector.alpha = 0;
    //           teamsTitle.alpha = 0;
    //           guestTeamChooseTitle.alpha = 0;
    //           guestTeamSelector.alpha = 0;
    //           this.nextBtn?.destroy();

    //           // Proceed
    //           // console.log("NEXT clicked:", { home: selectedHome?.name, away: selectedAway?.name });

    //           // Open next UI / scene
    //           new MenuTeamsSettings(
    //             this,
    //             this.game.canvas.width / 2,
    //             this.game.canvas.height / 2,
    //             selectedHome!,
    //             selectedAway!
    //           );
    //           // Or:
    //           // this.scene.start("GamePlay", { homeTeam: selectedHome, awayTeam: selectedAway });
    //         }
    //       )
    //         .setAlpha(0)
    //         .setEnabled(false); // will sync right after

    //       this.add.existing(this.nextBtn);
    //       this.tweens.add({ targets: this.nextBtn, duration: 300, alpha: 1 });

    //       // Initial enable/disable state
    //       this.syncNextEnabled(selectedHome, selectedAway);
    //     },
    //   });
  }

  // Enable only when teams are different (tweak if you allow mirror matches)
  private syncNextEnabled(home: TeamDataType, away: TeamDataType) {
    const enabled = !!home && !!away && home.name !== away.name;
    if (this.nextBtn) this.nextBtn.setEnabled(enabled);
  }
}
