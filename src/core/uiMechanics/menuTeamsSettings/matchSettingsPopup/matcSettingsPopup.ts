import { GameData } from "../../../../config/gameData";
import { SettingsSelector } from "../settingsSelector/settingsSelector";
import { TeamColorSelector } from "../teamColorSelector/teamColorSelector";

// MatchSettingsPopup.ts
export type PopupStyle = {
  width?: number;
  height?: number;
  radius?: number;
  fillColor?: number;
  fillAlpha?: number;
  strokeColor?: number;
  strokeAlpha?: number;
  strokeWidth?: number;
  withShadow?: boolean;
  backdropAlpha?: number;
  depth?: number;
};

export class MatchSettingsPopup extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private backdrop?: Phaser.GameObjects.Rectangle;
  private style: Required<PopupStyle>;
  private closeButton!: Phaser.GameObjects.Image; // <<< added

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    style: PopupStyle = {}
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    // Defaults
    this.style = {
      width: style.width ?? 360,
      height: style.height ?? 240,
      radius: style.radius ?? 16,
      fillColor: style.fillColor ?? 0x111318,
      fillAlpha: style.fillAlpha ?? 0.95,
      strokeColor: style.strokeColor ?? 0xffffff,
      strokeAlpha: style.strokeAlpha ?? 0.12,
      strokeWidth: style.strokeWidth ?? 2,
      withShadow: style.withShadow ?? false,
      backdropAlpha: style.backdropAlpha ?? 0.45,
      depth: style.depth ?? 0,
    };

    this.init();
  }

  private init() {
    this.addBackground();

    this.setDepth(this.style.depth);
    this.setAlpha(0);
    this.setScale(0.92);
    this.setVisible(false);
    this.setActive(false);

    this.addTitle();
    this.addSelectors();
    this.addCloseButton(); // <<< added
  }

  addSelectors() {
    const matchTimeSelector = new SettingsSelector(
      this.scene,
      0,
      -80,
      "Match Time ",
      [0.5, 1, 2, 3, 4, 5, 10, 20],
      GameData.matchSettings.time
    );

    matchTimeSelector.on("change", (newVal: number) => {
      GameData.matchSettings.time = newVal;
    });

    this.add(matchTimeSelector);

    const showModalsSelector = new SettingsSelector(
      this.scene,
      0,
      -10,
      "Show Modals",
      ["yes", "no"],
      GameData.matchSettings.showModals ? "yes" : "no"
    );

    showModalsSelector.on("change", (newVal: string) => {
      GameData.matchSettings.showModals = newVal === "yes";
    });

    this.add(showModalsSelector);

    const homeTeamColorSelector = new TeamColorSelector(
      this.scene,
      0,
      60,
      GameData.teamsData.hostTeam!.name,
      [
        Number(`0x${GameData.teamsData.hostTeam!.primary_color.replace("#", "")}`),
        Number(`0x${GameData.teamsData.hostTeam!.secondary_color.replace("#", "")}`),
      ],
      Number(`0x${GameData.teamsData.hostTeam!.primary_color.replace("#", "")}`)
    );

    this.add(homeTeamColorSelector);

    const guestTeamColorSelector = new TeamColorSelector(
      this.scene,
      0,
      130,
      GameData.teamsData.guestTeam!.name,
      [
        Number(`0x${GameData.teamsData.guestTeam!.primary_color.replace("#", "")}`),
        Number(`0x${GameData.teamsData.guestTeam!.secondary_color.replace("#", "")}`),
      ],
      Number(`0x${GameData.teamsData.guestTeam!.primary_color.replace("#", "")}`)
    );

    this.add(guestTeamColorSelector);
  }

  private addTitle() {
    const title = this.scene.add
      .text(0, -this.style.height / 2 + 35, "Match Settings", {
        fontSize: "36px",
        align: "center",
        color: "#ffffffff",
        stroke: "#ffffffff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);
    this.add(title);
  }

  private addBackground() {
    const { width: w, height: h } = this.style;

    this.bg = this.scene.add.graphics();
    this.addAt(this.bg, 0);
    this.redrawBackground();

    this.setSize(w, h);
  }

  private addCloseButton() { // <<< added
    this.closeButton = this.scene.add
      .image(this.style.width / 2 + 27, -this.style.height / 2 - 27, "closeButton")
      .setOrigin(0.5)
      .setScale(0.8)
      .setInteractive({ cursor: "pointer" });

    this.closeButton.on("pointerdown", () => {
      this.hide(); // simply close popup
    });

    this.add(this.closeButton);
    this.bringToTop(this.closeButton);
  }

  public redrawBackground(partial?: PopupStyle) {
    this.style = { ...this.style, ...partial };

    const {
      width: w,
      height: h,
      radius: r,
      fillColor,
      fillAlpha,
      strokeColor,
      strokeAlpha,
      strokeWidth,
    } = this.style;

    this.bg.clear();

    const inset = strokeWidth > 0 ? strokeWidth / 2 : 0;
    const rFill = Math.max(0, r);
    const rStroke = Math.max(0, r - inset);

    // Fill only
    this.bg.fillStyle(fillColor, fillAlpha);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, rFill);

    // Stroke fully inside
    if (strokeWidth > 0 && strokeAlpha > 0) {
      this.bg.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      this.bg.strokeRoundedRect(
        -w / 2 + inset,
        -h / 2 + inset,
        w - strokeWidth,
        h - strokeWidth,
        rStroke
      );
    }

    this.setSize(w, h);
    this.input?.hitArea &&
      Phaser.Geom.Rectangle.CenterOn(
        this.input.hitArea as Phaser.Geom.Rectangle,
        0,
        0
      );
  }

  public show(opts?: {
    duration?: number;
    ease?: string;
    fromScale?: number;
    fromAlpha?: number;
  }) {
    const duration = opts?.duration ?? 220;
    const ease = opts?.ease ?? "Back.Out";
    const fromScale = opts?.fromScale ?? 0.92;
    const fromAlpha = opts?.fromAlpha ?? 0;

    if (this.backdrop) {
      this.backdrop.setVisible(true).setAlpha(0);
      this.scene.tweens.add({
        targets: this.backdrop,
        alpha: this.style.backdropAlpha,
        duration,
        ease: "Linear",
      });
    }

    this.setVisible(true).setActive(true);
    this.setScale(fromScale).setAlpha(fromAlpha);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration,
      ease,
    });
  }

  public hide(opts?: {
    duration?: number;
    ease?: string;
    toScale?: number;
    toAlpha?: number;
    destroy?: boolean;
  }) {
    const duration = opts?.duration ?? 180;
    const ease = opts?.ease ?? "Back.In";
    const toScale = opts?.toScale ?? 0.98;
    const toAlpha = opts?.toAlpha ?? 0;

    if (this.backdrop) {
      this.scene.tweens.add({
        targets: this.backdrop,
        alpha: 0,
        duration,
        ease: "Linear",
        onComplete: () => this.backdrop?.setVisible(false),
      });
    }

    this.scene.tweens.add({
      targets: this,
      scaleX: toScale,
      scaleY: toScale,
      alpha: toAlpha,
      duration,
      ease,
      onComplete: () => {
        this.setVisible(false).setActive(false);
        if (opts?.destroy) this.destroy(true);
      },
    });
  }
}
