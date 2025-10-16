import { layoutData } from "../../../config/layout";

export type ButtonMode = "normal" | "hover" | "pressed" | "disabled";

export class MenuButton extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private labelText!: Phaser.GameObjects.Text;
  private hit!: Phaser.GameObjects.Zone;

  private mode: ButtonMode = "normal";
  private enabled = true;

  // Store colors for each state
  private colors = {
    normal: 0x25b457,
    hover: 0x25cc63,
    pressed: 0x1aa14a,
    disabled: 0xffffff,
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    public w = layoutData.menu.menuTeamsSettings.menuButton.width,
    public h = layoutData.menu.menuTeamsSettings.menuButton.height,
    public r = 14,
    bckColor?: number,          // <-- Optional
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    // Override normal state color if passed
    if (bckColor) {
      this.colors.normal = bckColor;
    }

    this.build(label);
    this.draw("normal");
    this.setOnClick()

  }

  // ---------- Public API ----------
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.hit.setInteractive({ useHandCursor: enabled });
    if (!enabled) this.hit.disableInteractive();
    else this.hit.setInteractive({ useHandCursor: true });

    this.draw(enabled ? "normal" : "disabled");
    this.setAlpha(enabled ? 1 : 0.6);
    return this;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setLabel(label: string): this {
    this.labelText.setText(label);
    return this;
  }

  setSize(w: number, h: number, r: number = this.r): this {
    this.w = w;
    this.h = h;
    this.r = r;
    this.hit.setSize(w, h);
    this.draw(this.mode);
    return this;
  }

  setOnClick(): this {
    this.hit.removeAllListeners("pointerdown");
    this.hit.on("pointerdown", () => {
      if (!this.enabled) return;
      this.press();
      this.emit("click")
    });
    return this;
  }

  // ---------- Internal ----------
  private build(label: string) {
    this.bg = this.scene.add.graphics();

    this.labelText = this.scene.add
      .text(0, 0, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: layoutData.menu.nextButton.fontSize,
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.hit = this.scene.add
      .zone(0, 0, this.w, this.h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add([this.bg, this.labelText, this.hit]);

    this.hit.on("pointerover", () => this.hoverIn());
    this.hit.on("pointerout", () => this.hoverOut());
    this.hit.on("pointerup", () => this.hoverIn());
  }

  private draw(mode: ButtonMode) {
    this.mode = mode;
    this.bg.clear();

    if (mode === "disabled") {
      this.bg.fillStyle(this.colors.disabled, 0.08);
      this.bg.fillRoundedRect(-this.w / 2, -this.h / 2, this.w, this.h, this.r);
      this.bg.lineStyle(2, 0xffffff, 0.25);
      this.bg.strokeRoundedRect(-this.w / 2, -this.h / 2, this.w, this.h, this.r);
      return;
    }

    const fill = 
      mode === "pressed" ? this.colors.pressed :
      mode === "hover" ? this.colors.hover :
      this.colors.normal;

    this.bg.fillStyle(fill, 0.9);
    this.bg.fillRoundedRect(-this.w / 2, -this.h / 2, this.w, this.h, this.r);
    this.bg.lineStyle(2, 0xffffff, 0.9);
    this.bg.strokeRoundedRect(-this.w / 2, -this.h / 2, this.w, this.h, this.r);
  }

  private hoverIn() {
    if (!this.enabled) return;
    this.draw("hover");
    this.scene.tweens.add({ targets: this, scale: 1.04, duration: 90, ease: "Quad.easeOut" });
  }

  private hoverOut() {
    if (!this.enabled) return;
    this.draw("normal");
    this.scene.tweens.add({ targets: this, scale: 1.0, duration: 90, ease: "Quad.easeOut" });
  }

  private press() {
    if (!this.enabled) return;
    this.draw("pressed");
    this.scene.tweens.add({
      targets: this,
      scale: 0.97,
      duration: 70,
      yoyo: true,
      ease: "Quad.easeInOut",
      onComplete: () => this.draw("hover"),
    });
  }

  destroy(fromScene?: boolean): void {
    this.bg?.destroy();
    this.labelText?.destroy();
    this.hit?.destroy();
    super.destroy(fromScene);
  }
}
