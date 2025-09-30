import * as Phaser from "phaser";
import { TeamDataType } from "../../../../types/gameTypes";

type StrengthSelectorOpts = {
  width?: number; // bar width (px)
  height?: number; // bar thickness (px)
  field?: keyof TeamDataType | string; // team field to bind (default: 'attack_speed')
  min?: number; // default 1
  max?: number; // default 100
  bgColor?: number; // default 0x2a2f38
  fillColor?: number; // default 0x36c460 (green)
  hoverColor?: number; // default 0xffffff (gray overlay)
  showLabel?: boolean; // default true
};

export class TeamStrengthSelector extends Phaser.GameObjects.Container {
  private team: TeamDataType;
  private field: string;

  private barWidth: number;
  private barHeight: number;
  private min: number;
  private max: number;

  private value: number;
  private isDragging = false;

  private bg!: Phaser.GameObjects.Graphics;
  private fill!: Phaser.GameObjects.Graphics;
  private hover!: Phaser.GameObjects.Graphics;
  private hit!: Phaser.GameObjects.Zone;
  private label?: Phaser.GameObjects.Text;

  private colors: { bg: number; fill: number; hover: number };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    team: TeamDataType,
    opts: StrengthSelectorOpts = {}
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.team = team;
    this.field = (opts.field as string) ?? "attack_speed";

    this.barWidth = opts.width ?? 300; // wider
    this.barHeight = opts.height ?? 20; // thicker line
    this.min = opts.min ?? 1;
    this.max = opts.max ?? 100;

    const initial =
      Number((team as any)[this.field]) ||
      0 ||
      Math.round((this.min + this.max) / 2);
    this.value = Phaser.Math.Clamp(initial, this.min, this.max);

    this.colors = {
      bg: opts.bgColor ?? 0x2a2f38,
      fill: opts.fillColor ?? 0x36c460,
      hover: opts.hoverColor ?? 0xffffff,
    };

    this.init(opts.showLabel !== false);
  }

  // --- public
  getValue() {
    return this.value;
  }
  setValue(v: number, emit = true) {
    const clamped = Phaser.Math.Clamp(v, this.min, this.max);
    if (clamped !== this.value) {
      this.value = clamped;
      (this.team as any)[this.field] = clamped;
      this.redraw();
      if (emit) this.emit("change", this.value);
    }
    return this;
  }
  // ---

  private init(showLabel: boolean) {
    this.bg = this.scene.add.graphics();
    this.fill = this.scene.add.graphics();
    this.hover = this.scene.add.graphics();
    this.add([this.bg, this.fill, this.hover]);

    if (showLabel) {
      this.label = this.scene.add
        .text(this.barWidth + 14, 0, String(this.value), {
          fontSize: "22px", // bigger font
          color: "#ffffff",
        })
        .setOrigin(0, 0.5);
      this.add(this.label);
    }

    // interactive zone
    this.hit = this.scene.add
      .zone(0, 0, this.barWidth, Math.max(this.barHeight, 30))
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });
    this.add(this.hit);

    this.drawBase();
    this.redraw();

    const updateFromPointer = (p: Phaser.Input.Pointer) => {
      const local = this.toLocalPoint(p);
      const val = this.xToValue(local.x);
      this.setValue(val);
    };

    this.hit.on("pointermove", (p: Phaser.Input.Pointer) => {
      const local = this.toLocalPoint(p);
      const val = this.xToValue(local.x);
      if (this.isDragging) {
        this.setValue(val);
      }
      this.drawHoverTo(val);
    });

    this.hit.on("pointerout", () => this.clearHover());

    this.hit.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.isDragging = true;
      updateFromPointer(p);
    });

    this.scene.input.on("pointerup", () => {
      this.isDragging = false;
      this.clearHover();
    });
  }

  private drawBase() {
    const r = this.barHeight / 2;

    this.bg.clear();
    this.bg.fillStyle(this.colors.bg, 1);
    this.bg.fillRoundedRect(
      0,
      -this.barHeight / 2,
      this.barWidth,
      this.barHeight,
      r
    );

    this.bg.lineStyle(1, 0xffffff, 0.4);
    this.bg.strokeRoundedRect(
      0.5,
      -this.barHeight / 2 + 0.5,
      this.barWidth - 1,
      this.barHeight - 1,
      r - 1
    );
  }

  private redraw() {
    const r = this.barHeight / 2;
    let w = ((this.value - this.min) / (this.max - this.min)) * this.barWidth;

    // prevent weird blob at very small widths
    w = Math.max(2, w);
    const efR = Math.min(r, w / 2);

    this.fill.clear();
    this.fill.fillStyle(this.colors.fill, 1);
    this.fill.fillRoundedRect(0, -this.barHeight / 2, w, this.barHeight, efR);

    if (this.label) this.label.setText(String(this.value));
  }

  private drawHoverTo(val: number) {
    const r = this.barHeight / 2;
    let w = ((val - this.min) / (this.max - this.min)) * this.barWidth;

    w = Math.max(2, w);
    const efR = Math.min(r, w / 2);

    this.hover.clear();
    this.hover.fillStyle(this.colors.hover, 0.18);
    this.hover.fillRoundedRect(0, -this.barHeight / 2, w, this.barHeight, efR);
  }

  private clearHover() {
    this.hover.clear();
  }

  private xToValue(localX: number): number {
    const clamped = Phaser.Math.Clamp(localX, 0, this.barWidth - 0.0001);
    const per = clamped / this.barWidth;
    const val = Math.round(this.min + per * (this.max - this.min));
    return Phaser.Math.Clamp(val, this.min, this.max);
  }

  private toLocalPoint(p: Phaser.Input.Pointer) {
    const m = this.getWorldTransformMatrix();
    const invDet = 1 / (m.a * m.d - m.b * m.c);
    const dx = p.worldX - m.tx;
    const dy = p.worldY - m.ty;
    const localX = (m.d * dx - m.c * dy) * invDet;
    const localY = (-m.b * dx + m.a * dy) * invDet;
    return new Phaser.Math.Vector2(localX, localY);
  }
}
