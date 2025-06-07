import * as Phaser from "phaser";
import { matchDataConfig, stadiumConfig } from "../config/matchConfig";
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

    // Stadium Background Color Picker
    this.add.text(100, 410, "Stadium Background:", { color: "#fff" });

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = "#008800"; // Default
    colorInput.style.position = "absolute";
    colorInput.style.left = `${this.scale.canvas.offsetLeft + 260}px`;
    colorInput.style.top = `${this.scale.canvas.offsetTop + 410}px`;
    colorInput.style.zIndex = "1000";
    document.body.appendChild(colorInput);

    let selectedStadiumColor = "0xffffff";
    colorInput.addEventListener("input", () => {
      selectedStadiumColor = "0x" + colorInput.value.replace("#", "");
    });

    this.events.on("shutdown", () => {
      colorInput.remove();
    });

    // Start Button
    const startBtn = this.add
      .text(400, 470, "Start Match", {
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

      const host = GameDataStore.teamData.hostTeam!;
      const guest = GameDataStore.teamData.guestTeam!;

      matchDataConfig.hostTeamData = {
        ...matchDataConfig.hostTeamData,
        initials: host.tablo_name,
        formation: host.default_strategy,
        tactics: {
          formation: {
            defenceLine: host.defence_strategy,
            centerLine: host.midfielder_strategy,
            attackLine: host.attack_strategy,
          },
        },
        fansColor: getColor(host, hostColorChoice),
        passSpeed: host.pass_speed,
        shootSpeed: Math.min(host.pass_speed + 15, 99),
        shootAccuracy: host.shoot_accuracy,
        goalKeeperSpeed: host.goalkeeper_speed,
        motionSpeed: host.defence_speed,
        freeKiskFrequency: host.fault_possibility,
      };

      matchDataConfig.guestTeamData = {
        ...matchDataConfig.guestTeamData,
        initials: guest.tablo_name,
        formation: guest.default_strategy,
        tactics: {
          formation: {
            defenceLine: guest.defence_strategy,
            centerLine: guest.midfielder_strategy,
            attackLine: guest.attack_strategy,
          },
        },
        fansColor: getColor(guest, guestColorChoice),
        passSpeed: guest.pass_speed,
        shootSpeed: Math.min(guest.pass_speed + 15, 99),
        shootAccuracy: guest.shoot_accuracy,
        goalKeeperSpeed: guest.goalkeeper_speed,
        motionSpeed: guest.defence_speed,
        freeKiskFrequency: guest.fault_possibility,
      };

      matchDataConfig.gameConfig.mathTime = selectedTime;
      stadiumConfig.spectatorsBackground = Number(selectedStadiumColor);

      this.scene.start("GamePlay", { extraTime });
    });
  }
}
