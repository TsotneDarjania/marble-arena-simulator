import { TeamDataType } from "../../../types/gameTypes";

type LayoutItem = {
  teamIndex: number;
  key: string;
  x: number;
  scale: number;
  alpha: number;
  depth: number;
};

export default class TeamsSelector extends Phaser.GameObjects.Container {
  eventEmitter: Phaser.Events.EventEmitter;

  // visible count (odd number recommended)
  onStage = 5;

  // look & feel
  private maxScale = 1.2;
  private minScale = 0.6;
  private maxAlpha = 1.0;
  private minAlpha = 0.35;
  private baseGap = 12;

  // selection & controls
  public selectedIndex = 0;
  private leftArrow?: Phaser.GameObjects.Container;
  private rightArrow?: Phaser.GameObjects.Container;

  // tweening
  private animating = false;
  private tweenDuration = 220;

  // sprites cache
  private sprites = new Map<number, Phaser.GameObjects.Image>();

  // label for selected team name
  private titleText!: Phaser.GameObjects.Text;

  constructor(
    public scene: Phaser.Scene,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public items: TeamDataType[],
    public value: TeamDataType
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setSize(width, height);

    this.eventEmitter = new Phaser.Events.EventEmitter();
    const idx = this.items.findIndex((t) => t.name === this.value?.name);
    this.selectedIndex = idx >= 0 ? idx : 0;

    this.buildInitial();
  }

  // ---------- INITIAL BUILD ----------

  private buildInitial() {
    // label above the row
    this.titleText = this.scene.add.text(0, -this.height / 2 - 30, "", {
      fontSize: "22px",
      color: "#ffffffff",
      stroke: "#fbfffbff",
      strokeThickness: 1,
      align: "center",
    }).setOrigin(0.5);
    this.add(this.titleText);

    const layout = this.computeLayout(this.getVisibleIndices());
    layout.forEach((li) => {
      const img = this.scene.add.image(li.x, 0, li.key)
        .setOrigin(0.5)
        .setScale(li.scale)
        .setAlpha(li.alpha)
        .setDepth(li.depth)
        .setInteractive({ useHandCursor: true });

      // click-to-select
      img.on("pointerdown", () => this.selectAbsolute(li.teamIndex));

      this.add(img);
      this.sprites.set(li.teamIndex, img);
    });

    this.syncTitleImmediate();
    this.addArrows();
    this.addKeyboard();
  }

  // ---------- UTILS / LAYOUT ----------

  private getFrameWidth(key: string): number {
    const frame = this.scene.textures.getFrame(key);
    return frame ? frame.width : 100;
  }

  private wrapIndex(i: number) {
    const n = this.items.length;
    return ((i % n) + n) % n;
  }

  private getVisibleIndices(): number[] {
    const half = Math.floor(this.onStage / 2);
    const list: number[] = [];
    for (let d = -half; d <= half; d++) list.push(this.wrapIndex(this.selectedIndex + d));
    return list;
  }

  private computeLayout(indices: number[]): LayoutItem[] {
    const count = indices.length;
    const centerSlot = Math.floor((count - 1) / 2);

    const measures = indices.map((teamIndex, slot) => {
      const key = this.items[teamIndex].name;
      const dist = Math.abs(slot - centerSlot);
      const t = centerSlot === 0 ? 0 : dist / centerSlot;
      const scale = this.maxScale - (this.maxScale - this.minScale) * t;
      const alpha = this.maxAlpha - (this.maxAlpha - this.minAlpha) * t;
      const frameW = this.getFrameWidth(key);
      return { teamIndex, key, slot, dist, scale, alpha, wScaled: frameW * scale };
    });

    let sumWidths = measures.reduce((a, m) => a + m.wScaled, 0);
    const gapsCount = Math.max(count - 1, 0);
    let fitMul = 1;
    const minTotalNeeded = sumWidths + this.baseGap * gapsCount;
    if (minTotalNeeded > this.width) {
      fitMul = this.width / minTotalNeeded;
      sumWidths *= fitMul;
    }

    const remaining = Math.max(this.width - sumWidths, 0);
    const gap = gapsCount ? remaining / gapsCount : 0;

    let currentX = -this.width / 2;
    return measures.map((m) => {
      const w = m.wScaled * fitMul;
      const x = currentX + w / 2;
      currentX += w + gap;
      return {
        teamIndex: m.teamIndex,
        key: this.items[m.teamIndex].name,
        x,
        scale: m.scale * fitMul,
        alpha: m.slot === centerSlot ? 1 : m.alpha,
        depth: 200 - m.dist,
      };
    });
  }

  private shortestDelta(from: number, to: number, n: number) {
    const forward = this.wrapIndex(to - from);
    const backward = -this.wrapIndex(from - to);
    return Math.abs(backward) < Math.abs(forward) ? backward : forward;
  }

  // ---------- TITLE LABEL ----------

  private syncTitleImmediate() {
    const team = this.items[this.selectedIndex];
    this.titleText.setText(team?.name ?? "");
  }

  private tweenTitle() {
    const team = this.items[this.selectedIndex];
    this.scene.tweens.add({
      targets: this.titleText,
      alpha: 0,
      duration: 80,
      onComplete: () => {
        this.titleText.setText(team?.name ?? "");
        this.scene.tweens.add({
          targets: this.titleText,
          alpha: 1,
          duration: 140,
          ease: "Quad.easeOut",
        });
      },
    });
  }

  // ---------- SELECTION / ANIMATION ----------

  private selectAbsolute(targetIndex: number) {
    if (this.animating || targetIndex === this.selectedIndex) return;
    const delta = this.shortestDelta(this.selectedIndex, targetIndex, this.items.length);
    this.move(delta);
  }

  private move(delta: number) {
    if (this.animating || !this.items.length || delta === 0) return;
    this.animating = true;

    this.selectedIndex = this.wrapIndex(this.selectedIndex + delta);
    this.value = this.items[this.selectedIndex];
    this.eventEmitter.emit("change", this.value, this.selectedIndex);
    this.tweenTitle();

    const nextIndices = this.getVisibleIndices();
    const nextLayout = this.computeLayout(nextIndices);
    const nextSet = new Set(nextIndices);

    const offX = (delta > 0 ? -1 : 1) * (this.width / 2 + 60);
    const tweens: Phaser.Tweens.Tween[] = [];

    // tween out leaving sprites
    for (const [teamIndex, sprite] of this.sprites) {
      if (!nextSet.has(teamIndex)) {
        tweens.push(this.scene.tweens.add({
          targets: sprite,
          x: offX,
          alpha: 0,
          duration: this.tweenDuration,
          ease: "Cubic.easeIn",
          onComplete: () => { sprite.destroy(); this.sprites.delete(teamIndex); }
        }));
      }
    }

    // tween existing / add entering
    nextLayout.forEach((li) => {
      const existing = this.sprites.get(li.teamIndex);
      if (existing) {
        existing.setDepth(li.depth);
        tweens.push(this.scene.tweens.add({
          targets: existing,
          x: li.x,
          scale: li.scale,
          alpha: li.alpha,
          duration: this.tweenDuration,
          ease: "Cubic.easeOut",
        }));
      } else {
        const startX = (delta > 0 ? this.width / 2 + 60 : -this.width / 2 - 60);
        const img = this.scene.add.image(startX, 0, li.key)
          .setOrigin(0.5)
          .setScale(li.scale * 0.9)
          .setAlpha(0)
          .setDepth(li.depth)
          .setInteractive({ useHandCursor: true });

        img.on("pointerdown", () => this.selectAbsolute(li.teamIndex));

        this.add(img);
        this.sprites.set(li.teamIndex, img);

        tweens.push(this.scene.tweens.add({
          targets: img,
          x: li.x,
          alpha: li.alpha,
          scale: li.scale,
          duration: this.tweenDuration,
          ease: "Cubic.easeOut",
        }));
      }
    });

    this.scene.time.delayedCall(this.tweenDuration + 20, () => {
      this.animating = false;
    });
  }

  // ---------- INPUT ----------

  private addKeyboard() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    kb.on("keydown-LEFT", () => this.move(-1));
    kb.on("keydown-RIGHT", () => this.move(1));
  }

  private makeArrowButton(dir: -1 | 1): Phaser.GameObjects.Container {
    const radius = 22;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.12);
    bg.fillCircle(0, 0, radius);
    bg.lineStyle(2, 0xffffff, 0.85);
    bg.strokeCircle(0, 0, radius);

    const chevron = this.scene.add.graphics();
    chevron.lineStyle(3, 0xffffff, 0.95);
    const s = 8;
    if (dir === -1) {
      chevron.strokePoints([{ x: +s, y: -s }, { x: -s, y: 0 }, { x: +s, y: +s }], false);
    } else {
      chevron.strokePoints([{ x: -s, y: -s }, { x: +s, y: 0 }, { x: -s, y: +s }], false);
    }

    const hit = this.scene.add.zone(0, 0, radius * 2.2, radius * 2.2).setOrigin(0.5);
    hit.setInteractive({ useHandCursor: true });

    const c = this.scene.add.container(0, 0, [bg, chevron, hit]).setDepth(999);

    const hoverIn  = () => this.scene.tweens.add({ targets: c, scale: 1.08, duration: 90, ease: "Quad.easeOut" });
    const hoverOut = () => this.scene.tweens.add({ targets: c, scale: 1.0,  duration: 90, ease: "Quad.easeOut" });
    const press    = () => this.scene.tweens.add({ targets: c, scale: 0.95, duration: 70, yoyo: true, ease: "Quad.easeInOut" });

    hit.on("pointerover", hoverIn);
    hit.on("pointerout", hoverOut);
    hit.on("pointerdown", () => { press(); this.move(dir); });

    return c;
  }

  private addArrows() {
    this.leftArrow?.destroy();
    this.rightArrow?.destroy();

    const offset = this.width / 2 + 28;
    this.leftArrow = this.makeArrowButton(-1);
    this.rightArrow = this.makeArrowButton(1);
    this.leftArrow.x = -offset;
    this.rightArrow.x = offset;

    this.add(this.leftArrow);
    this.add(this.rightArrow);
  }
}
