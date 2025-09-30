import { TeamDataType } from "../../../../types/gameTypes";
import { TeamFormation } from "../formation/formation";
import { TeamStrengthSelector } from "../teamStrengthSelector/TeamStrengthSelector";
import { TeamTacticSelector } from "../teamTacticSelector/teamTacticSelector";

export class TeamPlan extends Phaser.GameObjects.Container {
  teamFormation: TeamFormation;
  teamStrengthSelector: TeamStrengthSelector;

  defenceTacticSelector: TeamTacticSelector;
  midfilderTacticSelector: TeamTacticSelector;
  attackeTacticSelector: TeamTacticSelector;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public isHost: boolean,
    public team: TeamDataType
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.init();
  }

  init() {
    this.addLogo();
    this.addName();
    this.addFormation();
    this.addTeamStrengthSelector();
    this.addTeamTacticSelectors();
  }

  addTeamTacticSelectors() {
    this.defenceTacticSelector = new TeamTacticSelector(
      this.scene,
      this.isHost ? 100 : this.scene.game.canvas.width - 520,
      530,
      this.team,
      "DF",
      this.teamFormation
    );
    this.midfilderTacticSelector = new TeamTacticSelector(
      this.scene,
      this.isHost ? 100 : this.scene.game.canvas.width - 520,
      580,
      this.team,
      "MD",
      this.teamFormation
    );
    this.midfilderTacticSelector = new TeamTacticSelector(
      this.scene,
      this.isHost ? 100 : this.scene.game.canvas.width - 520,
      630,
      this.team,
      "AT",
      this.teamFormation
    );
  }

  addTeamStrengthSelector() {
    this.teamStrengthSelector = new TeamStrengthSelector(
      this.scene,
      this.isHost ? 170 : this.scene.game.canvas.width - 450,
      500,
      this.team,
      {
        field: "attack_speed", // or any numeric stat
        width: 320, // bar width
        height: 24, // thicker line
        showLabel: true,
      }
    );

    this.teamStrengthSelector.on("change", (v: number) => {
      console.log("new strength:", v);

      this.team.attack_speed = v;
      this.team.defence_speed = v;
      this.team.goalkeeper_speed = v;
      this.team.midfielder_speed = v;
      this.team.pass_accuracy = v;
      this.team.pass_speed = v - 20;
      if (this.team.pass_speed < 1) {
        this.team.pass_speed = 1;
      }
      this.team.shoot_accuracy = v - 30;
      if (this.team.shoot_accuracy < 1) {
        this.team.shoot_accuracy = 1;
      }
    });
  }

  addFormation() {
    if (this.isHost) {
      this.teamFormation = new TeamFormation(this.scene, 158, 250, this.team);
    } else {
      this.teamFormation = new TeamFormation(
        this.scene,
        this.scene.game.canvas.width - 475,
        250,
        this.team
      );
    }
  }

  addName() {
    if (this.isHost) {
      this.scene.add.text(100, 42, this.team.name.toUpperCase(), {
        fontSize: "36px",
        align: "center",
        color: "#ffffffff",
        stroke: "#ffffffff",
        strokeThickness: 1,
      });
    } else {
      this.scene.add
        .text(
          this.scene.game.canvas.width - 100,
          42,
          this.team.name.toUpperCase(),
          {
            fontSize: "36px",
            align: "center",
            color: "#ffffffff",
            stroke: "#ffffffff",
            strokeThickness: 1,
          }
        )
        .setOrigin(1, 0);
    }
  }

  addLogo() {
    if (this.isHost) {
      this.scene.add.image(50, 56, this.team.name).setScale(1.3);
    } else {
      this.scene.add
        .image(this.scene.game.canvas.width - 50, 56, this.team.name)
        .setScale(1.3);
    }
  }
}
