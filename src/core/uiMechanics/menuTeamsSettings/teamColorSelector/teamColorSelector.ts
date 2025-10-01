export class TeamColorSelector extends Phaser.GameObjects.Container {
  private valueBox!: Phaser.GameObjects.Rectangle;
  private label!: Phaser.GameObjects.Text;
  private colors: number[];
  private index: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public title: string,
    colors: number[],
    initialColor: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.colors = colors;
    this.index = Math.max(0, this.colors.indexOf(initialColor));

    this.build();
    this.updateUI();
  }

  private build() {
    // Title
    this.label = this.scene.add
      .text(-180, 0, this.title, {
        fontSize: "26px",
        align: "center",
        color: "#f7de00ff",
        stroke: "#f7de00ff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);
    this.add(this.label);

    // Left Arrow
    const leftArrow = this.scene.add
      .image(-70, 0, "menuArrowButton")
      .setScale(0.6)
      .setInteractive({ cursor: "pointer" });
    this.add(leftArrow);

    leftArrow.on("pointerdown", () => {
      this.index--;
      if (this.index < 0) this.index = this.colors.length - 1;
      this.updateUI(true);
    });

    // Right Arrow
    const rightArrow = this.scene.add
      .image(200, 0, "menuArrowButton")
      .setScale(0.6)
      .setFlipX(true)
      .setInteractive({ cursor: "pointer" });
    this.add(rightArrow);

    rightArrow.on("pointerdown", () => {
      this.index++;
      if (this.index >= this.colors.length) this.index = 0;
      this.updateUI(true);
    });

    // Color Box
    this.valueBox = this.scene.add
      .rectangle(65, 0, 80, 80, this.colors[this.index])
      .setStrokeStyle(3, 0xffffff).setScale(0.5)
    this.add(this.valueBox);
  }

  private updateUI(emit = false) {
    this.valueBox.fillColor = this.colors[this.index];
    if (emit) this.emit("change", this.getValue());
  }

  // Public API
  getValue(): number {
    return this.colors[this.index];
  }
}
