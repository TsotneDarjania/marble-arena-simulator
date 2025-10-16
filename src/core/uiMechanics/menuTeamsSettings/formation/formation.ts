import Menu from "../../../../scenes/Menu";
import { Formation, TeamDataType } from "../../../../types/gameTypes";

export class TeamFormation extends Phaser.GameObjects.Container {
  w = 420;
  h = 350;

  footballers: Array<Phaser.GameObjects.Image> = [];
  formationTitle: Phaser.GameObjects.Text;

  formations: Formation[] = [
    "4-4-2",
    "5-3-2",
    "3-5-2",
    "3-3-4",
    "4-3-3",
    "3-4-3",
    "5-4-1",
  ];

  constructor(
    public  scene: Menu,
    x: number,
    y: number,
    public team: TeamDataType
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.init();
  }

  init() {
    this.addFormation();
    this.addLeftArrow();
    this.addRightArrow();

    const bck = this.scene.add
      .image(165, -15, "menu-stadium-field")
      .setScale(5)
      .setAlpha(0.1);
    this.add(bck);
  }

  addFormation() {
    const formation = this.team.default_strategy
      .split("-")
      .map((n) => Number(n));

    this.formationTitle = this.scene.add
      .text(160, 190, formation.join("-"), {
        fontSize: "36px",
        align: "center",
        color: "#ffffffff",
        stroke: "#ffffffff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);
    this.add(this.formationTitle);

    let posX = 0;

    for (let i = 0; i < 3; i++) {
      const padding = this.h / (formation[i] + 1);
      let posY = -this.h / 2 + padding;

      for (let j = 0; j < formation[i]; j++) {
        const img = this.scene.add
          .image(posX, posY, this.team.name)
          .setScale(0.7)
          .setAlpha(0.8);
        this.scene.add.tween({
          targets: img,
          duration: 400,
          yoyo: true,
          alpha: 0.5,
          repeat: -1,
        });
        this.add(img);
        this.footballers.push(img);

        if (i === 0) {
          if (this.team.defence_strategy === "wide-attack") {
            if (j === 0 || j === formation[i] - 1) {
              img.setPosition(img.x + 20, img.y);
            }
          }
          if (this.team.defence_strategy === "wide-back") {
            if (j === 0 || j === formation[i] - 1) {
              img.setPosition(img.x - 20, img.y);
            }
          }
        }

        if (i === 1) {
          if (this.team.midfielder_strategy === "wide-attack") {
            if (j === 0 || j === formation[i] - 1) {
              img.setPosition(img.x + 20, img.y);
            }
          }
          if (this.team.midfielder_strategy === "wide-back") {
            if (j === 0 || j === formation[i] - 1) {
              img.setPosition(img.x - 20, img.y);
            }
          }
          if (this.team.midfielder_strategy === "center-attack") {
            if (j !== 0 && j !== formation[i] - 1) {
              img.setPosition(img.x + 20, img.y);
            }
          }
        }

        if (i === 2) {
          if (this.team.attack_strategy === "wide-back") {
            if (j === 0 || j === formation[i] - 1) {
              img.setPosition(img.x - 20, img.y);
            }
          }
        }

        posY += padding;
      }

      posX += this.w / 3;
    }
  }

  destroyFormation() {
    this.footballers.forEach((f) => f.destroy());
    this.formationTitle.destroy();
  }

  addLeftArrow() {
    const arrow = this.scene.add.image(-80, 0, "menuArrowButton");
    this.add(arrow);

    arrow.setInteractive({
      cursor: "pointer",
    });
    arrow.on("pointerdown", () => {
      this.scene.selectButtonClickSound.play()

      let currentIndex = this.formations.indexOf(this.team.default_strategy);
      currentIndex--;

      if (currentIndex < 0) currentIndex = this.formations.length - 1;

      this.team.default_strategy = this.formations[currentIndex];

      this.destroyFormation();
      this.addFormation();
    });
  }

  addRightArrow() {
    const arrow = this.scene.add
      .image(400, 0, "menuArrowButton")
      .setFlipX(true);
    this.add(arrow);

    arrow.setInteractive({
      cursor: "pointer",
    });
    arrow.on("pointerdown", () => {
      this.scene.selectButtonClickSound.play()
      let currentIndex = this.formations.indexOf(this.team.default_strategy);
      currentIndex++;

      if (currentIndex > this.formations.length - 1) currentIndex = 0;

      this.team.default_strategy = this.formations[currentIndex];

      this.destroyFormation();
      this.addFormation();
    });
  }
}
