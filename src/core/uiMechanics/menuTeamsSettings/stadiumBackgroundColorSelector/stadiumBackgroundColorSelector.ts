import Menu from "../../../../scenes/Menu";

// StadiumBackgroundColorSelector.ts
export class StadiumBackgroundColorSelector extends Phaser.GameObjects.Container {
  private label?: Phaser.GameObjects.Text;
  private swatch!: Phaser.GameObjects.Rectangle;

  private _color: number;
  private _w: number;
  private _h: number;
  private colorInput: HTMLInputElement;

  private readonly live: boolean;

  constructor(
    public scene: Menu,
    x: number,
    y: number,
    {
      title = "Background",
      initialColor = 0x032E29,
      width = 120,
      height = 48,
      showLabel = true,
      depth = 10_000,
      live = false, // set true if you want continuous updates while dragging
    }: {
      title?: string;
      initialColor?: number;
      width?: number;
      height?: number;
      showLabel?: boolean;
      depth?: number;
      live?: boolean;
    } = {}
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(depth);

    this._color = initialColor;
    this._w = width;
    this._h = height;
    this.live = live;

    // Label (optional)
    if (showLabel) {
      this.label = scene.add
        .text(-this._w * 0.5 - 90, 0, title, {
          fontSize: "26px",
          align: "center",
          color: "#f7de00ff",
          stroke: "#f7de00ff",
          strokeThickness: 1,
        })
        .setOrigin(0.5);
      this.add(this.label);
    }

    // Swatch
    this.swatch = scene.add
      .rectangle(0, 0, this._w, this._h, this._color)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ cursor: "pointer" });
    this.add(this.swatch);

    // Color input (hidden but positionable)
    this.colorInput = this.createHiddenColorInput(this._color);

    // Open on pointerdown (fixes double-click issue)
    this.swatch.on("pointerdown", (ev: Phaser.Input.Pointer) => {
      ev.event?.preventDefault?.();
      this.openPicker();
    });

    // Handlers
    const onInput = () => {
      if (!this.live) return;
      const picked = this.cssHexToNumber(this.colorInput.value);
      this.setValue(picked, true);
    };
    const onChange = () => {
      const picked = this.cssHexToNumber(this.colorInput.value);
      this.setValue(picked, true); // emit once after dialog closes
      this.colorInput.style.left = "-9999px";
      this.colorInput.style.top = "-9999px";
    };

    if (this.live) this.colorInput.addEventListener("input", onInput);
    this.colorInput.addEventListener("change", onChange);

    // Cleanup
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.live) this.colorInput.removeEventListener("input", onInput);
      this.colorInput.removeEventListener("change", onChange);
      if (this.colorInput.parentElement) this.colorInput.parentElement.removeChild(this.colorInput);
    });
  }

  // ---- Public API ----
  getValue(): number {
    return this._color;
  }

  setValue(color: number, emit = false): this {
    this._color = color;
    this.swatch.fillColor = color;
    if (emit) this.emit("change", color);
    return this;
  }

  setSize(width: number, height: number): this {
    this._w = width;
    this._h = height;
    this.swatch.setSize(width, height);
    this.swatch.setStrokeStyle(3, 0xffffff);
    return this;
  }

  openPicker(): void {
    this.colorInput.value = this.numberToCssHex(this._color);

    // Position input near swatch
    const mat = this.getWorldTransformMatrix();
    const world = new Phaser.Math.Vector2();
    mat.transformPoint(this.swatch.x, this.swatch.y, world);

    const rect = this.scene.game.canvas.getBoundingClientRect();
    const px = rect.left + world.x - 8;
    const py = rect.top + world.y - this._h - 8;

    this.colorInput.style.left = `${px}px`;
    this.colorInput.style.top = `${py}px`;

    // Focus & open picker immediately
    setTimeout(() => {
      this.colorInput.focus();
      // @ts-ignore
      if (typeof this.colorInput.showPicker === "function") {
        // @ts-ignore
        this.colorInput.showPicker();
      } else {
        this.colorInput.click();
      }
    }, 0);
  }

  // ---- Internals ----
  private createHiddenColorInput(initialColor: number): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "color";
    input.value = this.numberToCssHex(initialColor);

    Object.assign(input.style, {
      position: "fixed",
      left: "-9999px",
      top: "-9999px",
      width: "1px",
      height: "1px",
      opacity: "0",
      border: "none",
      padding: "0",
      margin: "0",
      background: "transparent",
    });

    document.body.appendChild(input);
    return input;
  }

  private numberToCssHex(n: number): string {
    return `#${(n >>> 0).toString(16).padStart(6, "0")}`;
  }

  private cssHexToNumber(hex: string): number {
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;
    return parseInt(clean, 16);
  }
}
