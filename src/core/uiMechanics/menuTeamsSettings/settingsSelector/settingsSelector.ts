export class SettingsSelector extends Phaser.GameObjects.Container {
  valueText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public title: string,
    public values: Array<any>,
    public targetValue: any
  ) {
    super(scene, x, y);

    scene.add.existing(this);
    this.init();
  }

  init() {
    this.addTitle();
    this.addLeftArrow();
    this.addRightArrow();
    this.addValueText();
  }

  addValueText() {
    this.valueText = this.scene.add
      .text(65, 2, this.targetValue, {
        fontSize: "18px",
        align: "center",
        color: "#f79400ff",
        stroke: "#f79400ff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);

    this.add(this.valueText);
  }

  addTitle() {
    const title = this.scene.add
      .text(-180, 0, this.title, {
        fontSize: "26px",
        align: "center",
        color: "#f7de00ff",
        stroke: "#f7de00ff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);

    this.add(title);
  }

  addLeftArrow() {
    const arrow = this.scene.add
      .image(-70, 3, "menuArrowButton")
      .setScale(0.6)
      .setInteractive({
        cursor: "pointer",
      });
    this.add(arrow);

    arrow.on("pointerdown", () => {
      let currentIndex = this.values.indexOf(this.targetValue);

      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = this.values.length - 1;
      }

      this.targetValue = this.values[currentIndex];
      this.valueText.setText(this.targetValue);

      this.emit("change", this.targetValue);
    });
  }

  addRightArrow() {
    const arrow = this.scene.add
      .image(200, 3, "menuArrowButton")
      .setScale(0.6)
      .setFlipX(true)
      .setInteractive({
        cursor: "pointer",
      });
    this.add(arrow);

    arrow.on("pointerdown", () => {
      let currentIndex = this.values.indexOf(this.targetValue);

      currentIndex++;
      if (currentIndex > this.values.length - 1) {
        currentIndex = 0;
      }

      this.targetValue = this.values[currentIndex];
      this.valueText.setText(this.targetValue);

      this.emit("change", this.targetValue);
    });
  }
}
