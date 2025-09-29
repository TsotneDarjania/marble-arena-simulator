import { TeamDataType } from "../../../../types/gameTypes";

export class TeamFormation extends Phaser.GameObjects.Container {
  w = 550;
  h = 400;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public team: TeamDataType
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.init();
  }

  init() {
    const formation = this.team.default_strategy
      .split("-")
      .map((n) => Number(n));

    let posX = 0;

    for (let i = 0; i < 3; i++) {
      const padding = this.h / (formation[i] + 1);
      console.log(padding)
      let posY = -this.h / 2 + padding;

      for (let j = 0; j < formation[i]; j++) {
        const img = this.scene.add.image(posX, posY, this.team.name).setScale(0.7).setAlpha(0.8)
        this.scene.add.tween({
            targets: img,
            duration: 400,
            yoyo: true,
            alpha: 0.5,
            repeat: -1
        })
        this.add(img);

        posY += padding;
      }

      posX += this.w/3;
    }
  }
}
