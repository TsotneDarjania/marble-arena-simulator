import * as Phaser from "phaser";
import { matchDataConfig } from "../config/matchConfig";
import { TeamDataServerType } from "../main";
import { GameDataStore } from "../config/gameDataStore";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    this.addGameMenu();
  }

  addGameMenu() {
    this.add
      .text(400, 50, "Match Settings", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Match Time Options
    const times = [1, 1.5, 2, 2.5, 3, 4, 5, 10];
    let selectedTime = times[0];
    let selectedTimeButton: Phaser.GameObjects.Text | null = null;

    this.add.text(100, 100, "Match Time (min):", { color: "#fff" });

    times.forEach((time, index) => {
      const btn = this.add
        .text(100 + index * 70, 130, `${time}`, {
          backgroundColor: "#444",
          padding: { x: 10, y: 5 },
          color: "#fff",
        })
        .setInteractive();

      if (index === 0) {
        btn.setStyle({ backgroundColor: "#00aaff" });
        selectedTimeButton = btn;
      }

      btn.on("pointerdown", () => {
        if (selectedTimeButton) {
          selectedTimeButton.setStyle({ backgroundColor: "#444" });
        }
        btn.setStyle({ backgroundColor: "#00aaff" });
        selectedTime = time;
        selectedTimeButton = btn;
      });
    });

    // Team Color Mode
    let hostColorChoice: "primary" | "secondary" = "primary";
    let guestColorChoice: "primary" | "secondary" = "primary";

    this.add.text(100, 200, "Host Team Color:", { color: "#fff" });
    const hostPrimaryBtn = this.add
      .text(100, 230, "Use Primary", {
        backgroundColor: "#00aaff",
        color: "#000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    const hostSecondaryBtn = this.add
      .text(220, 230, "Use Secondary", {
        backgroundColor: "#444",
        color: "#fff",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    hostPrimaryBtn.on("pointerdown", () => {
      hostColorChoice = "primary";
      hostPrimaryBtn.setStyle({ backgroundColor: "#00aaff", color: "#000" });
      hostSecondaryBtn.setStyle({ backgroundColor: "#444", color: "#fff" });
    });

    hostSecondaryBtn.on("pointerdown", () => {
      hostColorChoice = "secondary";
      hostSecondaryBtn.setStyle({ backgroundColor: "#00aaff", color: "#000" });
      hostPrimaryBtn.setStyle({ backgroundColor: "#444", color: "#fff" });
    });

    this.add.text(100, 280, "Guest Team Color:", { color: "#fff" });
    const guestPrimaryBtn = this.add
      .text(100, 310, "Use Primary", {
        backgroundColor: "#00aaff",
        color: "#000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    const guestSecondaryBtn = this.add
      .text(220, 310, "Use Secondary", {
        backgroundColor: "#444",
        color: "#fff",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    guestPrimaryBtn.on("pointerdown", () => {
      guestColorChoice = "primary";
      guestPrimaryBtn.setStyle({ backgroundColor: "#00aaff", color: "#000" });
      guestSecondaryBtn.setStyle({ backgroundColor: "#444", color: "#fff" });
    });

    guestSecondaryBtn.on("pointerdown", () => {
      guestColorChoice = "secondary";
      guestSecondaryBtn.setStyle({ backgroundColor: "#00aaff", color: "#000" });
      guestPrimaryBtn.setStyle({ backgroundColor: "#444", color: "#fff" });
    });

    // Extra Time Toggle
    let extraTime = false;
    const extraTimeText = this.add
      .text(100, 370, "Extra Time: OFF", {
        backgroundColor: "#444",
        color: "#fff",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    extraTimeText.on("pointerdown", () => {
      extraTime = !extraTime;
      extraTimeText.setText(`Extra Time: ${extraTime ? "ON" : "OFF"}`);
    });

    // Start Button
    const startBtn = this.add
      .text(400, 450, "Start Match", {
        fontSize: "24px",
        backgroundColor: "#0f0",
        padding: { x: 15, y: 10 },
        color: "#000",
      })
      .setOrigin(0.5)
      .setInteractive();

    startBtn.on("pointerdown", async () => {
      const getColor = (
        team: TeamDataServerType,
        type: "primary" | "secondary"
      ) =>
        parseInt(
          (type === "primary"
            ? team.primary_color
            : team.secondary_color
          ).replace("#", ""),
          16
        );

      matchDataConfig.hostTeamData.initials =
        GameDataStore.teamData.hostTeam!.tablo_name;

      matchDataConfig.hostTeamData.formation =
        GameDataStore.teamData.hostTeam!.default_strategy;

      matchDataConfig.hostTeamData.tactics.formation.defenceLine =
        GameDataStore.teamData.hostTeam!.defence_strategy;

      matchDataConfig.hostTeamData.tactics.formation.centerLine =
        GameDataStore.teamData.hostTeam!.midfielder_strategy;

      matchDataConfig.hostTeamData.tactics.formation.attackLine =
        GameDataStore.teamData.hostTeam!.attack_strategy;

      matchDataConfig.hostTeamData.fansColor = getColor(
        GameDataStore.teamData.hostTeam!,
        hostColorChoice
      );

      matchDataConfig.hostTeamData.passSpeed =
        GameDataStore.teamData.hostTeam!.pass_speed;

      matchDataConfig.hostTeamData.shootSpeed = Math.min(
        GameDataStore.teamData.hostTeam!.pass_speed + 15,
        99
      );
      matchDataConfig.hostTeamData.shootAccuracy =
        GameDataStore.teamData.hostTeam!.shoot_accuracy;

      matchDataConfig.hostTeamData.goalKeeperSpeed =
        GameDataStore.teamData.hostTeam!.goalkeeper_speed;

      matchDataConfig.hostTeamData.motionSpeed =
        GameDataStore.teamData.hostTeam!.defence_speed;

      // Guest Team
      matchDataConfig.guestTeamData.initials =
        GameDataStore.teamData.guestTeam!.tablo_name;

      matchDataConfig.guestTeamData.formation =
        GameDataStore.teamData.guestTeam!.default_strategy;

      matchDataConfig.guestTeamData.tactics.formation.defenceLine =
        GameDataStore.teamData.guestTeam!.defence_strategy;

      matchDataConfig.guestTeamData.tactics.formation.centerLine =
        GameDataStore.teamData.guestTeam!.midfielder_strategy;

      matchDataConfig.guestTeamData.tactics.formation.attackLine =
        GameDataStore.teamData.guestTeam!.attack_strategy;

      matchDataConfig.guestTeamData.fansColor = getColor(
        GameDataStore.teamData.guestTeam!,
        guestColorChoice
      );

      matchDataConfig.guestTeamData.passSpeed =
        GameDataStore.teamData.guestTeam!.pass_speed;

      matchDataConfig.guestTeamData.shootSpeed = Math.min(
        GameDataStore.teamData.guestTeam!.pass_speed + 15,
        99
      );

      matchDataConfig.guestTeamData.shootAccuracy =
        GameDataStore.teamData.guestTeam!.shoot_accuracy;

      matchDataConfig.guestTeamData.goalKeeperSpeed =
        GameDataStore.teamData.guestTeam!.goalkeeper_speed;

      matchDataConfig.guestTeamData.motionSpeed =
        GameDataStore.teamData.guestTeam!.defence_speed;

      matchDataConfig.gameConfig.mathTime = selectedTime;
      this.scene.start("GamePlay", {
        extraTime,
      });
    });
  }
}
