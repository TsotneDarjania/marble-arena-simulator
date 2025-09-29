import { TeamDataType } from "../../../../types/gameTypes";
import { TeamFormation } from "../formation/formation";

export class TeamPlan extends Phaser.GameObjects.Container {
  teamFormation: TeamFormation;

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
  }

  addFormation() {
    this.teamFormation = new TeamFormation(this.scene, 145, 340, this.team);
  }

  addName() {
    this.scene.add.text(100, 42, this.team.name.toUpperCase(), {
      fontSize: "36px",
      align: "center",
      color: "#ffffffff",
      stroke: "#ffffffff",
      strokeThickness: 1,
    });
  }

  addLogo() {
    this.scene.add.image(50, 56, this.team.name).setScale(1.3);
  }
}
