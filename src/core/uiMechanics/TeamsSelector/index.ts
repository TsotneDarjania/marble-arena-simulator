import { TeamDataType } from "../../../types/gameTypes";
import { detectMob } from "../../../utils/helper";

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

  // search bar replaces the old title text — it shows the selected team's name as
  // a placeholder when blurred, and lets the user filter teams by typing.
  private searchInput?: HTMLInputElement;
  private pendingSearchTarget: number | null = null;
  private onAnyResize = () => this.syncSearchPosition();
  private onSceneTick = () => this.syncSearchFrame();
  private static stylesInjected = false;

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
    this.buildSearch();
  }

  // ---------- INITIAL BUILD ----------

  private buildInitial() {
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

  private shortestDelta(from: number, to: number) {
    const forward = this.wrapIndex(to - from);
    const backward = -this.wrapIndex(from - to);
    return Math.abs(backward) < Math.abs(forward) ? backward : forward;
  }

  // ---------- TITLE / SELECTION LABEL ----------

  private syncTitleLabel() {
    if (!this.searchInput) return;
    const team = this.items[this.selectedIndex];
    this.searchInput.placeholder = team?.name ?? "";
  }

  // ---------- SELECTION / ANIMATION ----------

  private selectAbsolute(targetIndex: number) {
    if (targetIndex === this.selectedIndex) return;
    if (this.animating) {
      this.pendingSearchTarget = targetIndex;
      return;
    }
    const delta = this.shortestDelta(this.selectedIndex, targetIndex);
    this.move(delta);
  }

  private move(delta: number) {
    if (this.animating || !this.items.length || delta === 0) return;
    this.animating = true;

    this.selectedIndex = this.wrapIndex(this.selectedIndex + delta);
    this.value = this.items[this.selectedIndex];
    this.eventEmitter.emit("change", this.value, this.selectedIndex);
    this.syncTitleLabel();

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
      // consume any queued search target (handles fast typing)
      if (this.pendingSearchTarget !== null) {
        const target = this.pendingSearchTarget;
        this.pendingSearchTarget = null;
        if (target !== this.selectedIndex) this.selectAbsolute(target);
      }
    });
  }

  // ---------- INPUT ----------

  private addKeyboard() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    kb.on("keydown-LEFT", () => {
      if (TeamsSelector.isTextInputFocused()) return;
      this.move(-1);
    });
    kb.on("keydown-RIGHT", () => {
      if (TeamsSelector.isTextInputFocused()) return;
      this.move(1);
    });
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

  // ---------- SEARCH ----------

  private buildSearch() {
    TeamsSelector.ensureSearchStyles();

    const input = document.createElement("input");
    input.type = "search";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = "ts-search-input";
    // initial placeholder = current team name (the search bar doubles as the
    // selected-team label while not focused)
    input.placeholder = this.items[this.selectedIndex]?.name ?? "Search team…";

    const isMob = detectMob();
    Object.assign(input.style, {
      position: "fixed",
      left: "0px",
      top: "0px",
      width: isMob ? "170px" : "240px",
      height: isMob ? "30px" : "38px",
      padding: isMob ? "0 12px 0 30px" : "0 16px 0 36px",
      boxSizing: "border-box",
      borderRadius: "10px",
      border: "1px solid rgba(156, 244, 106, 0.4)",
      background:
        "linear-gradient(180deg, rgba(8, 38, 22, 0.85), rgba(2, 23, 14, 0.85))",
      color: "#eafff1",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      fontSize: isMob ? "13px" : "15px",
      fontWeight: "600",
      letterSpacing: "0.3px",
      textAlign: "center",
      outline: "none",
      boxShadow:
        "0 6px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
      pointerEvents: "none",
      opacity: "0",
      zIndex: "1000",
      transition:
        "border-color 140ms ease, box-shadow 140ms ease, opacity 200ms ease, transform 140ms ease",
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2f5c2" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
      )}")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: isMob ? "10px center" : "12px center",
    } as Partial<CSSStyleDeclaration>);

    input.addEventListener("focus", () => {
      input.style.borderColor = "rgba(156, 244, 106, 0.9)";
      input.style.boxShadow =
        "0 0 0 3px rgba(156, 244, 106, 0.22), 0 4px 14px rgba(0,0,0,0.35)";
      input.select();
    });
    input.addEventListener("blur", () => {
      input.style.borderColor = "rgba(156, 244, 106, 0.35)";
      input.style.boxShadow = "0 4px 14px rgba(0,0,0,0.35)";
      // clear any leftover query so the placeholder (selected team name) is visible
      input.value = "";
      this.syncTitleLabel();
    });

    input.addEventListener("input", () => this.handleSearchInput(input.value));
    input.addEventListener("keydown", (e) => {
      // keep arrow keys editing the text cursor (default behavior),
      // but let Enter/Escape act as commit/cancel
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        input.value = "";
        this.handleSearchInput("");
        input.blur();
      }
    });

    document.body.appendChild(input);
    this.searchInput = input;

    // initial position + per-frame sync (alpha + position track the container)
    this.syncSearchPosition();
    this.scene.scale.on("resize", this.onAnyResize);
    this.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onSceneTick);

    // tear down DOM when the container or scene goes away
    const cleanup = () => this.destroySearch();
    this.once(Phaser.GameObjects.Events.DESTROY, cleanup);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  private handleSearchInput(rawQuery: string) {
    if (!this.searchInput) return;
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      this.searchInput.style.borderColor = "rgba(156, 244, 106, 0.35)";
      return;
    }

    // 1) prefer prefix match, 2) fall back to substring match
    let idx = this.items.findIndex((t) => t.name.toLowerCase().startsWith(query));
    if (idx < 0) idx = this.items.findIndex((t) => t.name.toLowerCase().includes(query));

    if (idx < 0) {
      // no match — soft red glow
      this.searchInput.style.borderColor = "rgba(255, 110, 110, 0.85)";
      return;
    }

    this.searchInput.style.borderColor = "rgba(156, 244, 106, 0.85)";
    if (idx !== this.selectedIndex) this.selectAbsolute(idx);
  }

  private syncSearchFrame() {
    if (!this.searchInput || !this.scene) return;
    const a = (this as any).alpha as number;
    this.searchInput.style.opacity = String(a);
    this.searchInput.style.pointerEvents = a > 0.95 ? "auto" : "none";
    this.syncSearchPosition();
  }

  private syncSearchPosition() {
    if (!this.searchInput || !this.scene?.game?.canvas) return;
    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();

    // Anchor below the carousel. We mirror the title→logos distance defined
    // by layoutData (host title yPercent − host selector yPercent = 11% of
    // canvas height) so title → logos → search bar are evenly spaced.
    const distancePercent = 11;
    const titleToLogosWorld = canvas.height * (distancePercent / 100);
    const localOffset = titleToLogosWorld / (this.scaleY || 1);
    const mat = this.getWorldTransformMatrix();
    const world = new Phaser.Math.Vector2();
    mat.transformPoint(0, localOffset, world);

    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    const w = this.searchInput.offsetWidth || 240;
    const h = this.searchInput.offsetHeight || 38;

    const cssX = rect.left + world.x * scaleX - w / 2;
    const cssY = rect.top + world.y * scaleY - h / 2;

    this.searchInput.style.left = `${Math.round(cssX)}px`;
    this.searchInput.style.top = `${Math.round(cssY)}px`;
  }

  private destroySearch() {
    if (!this.searchInput) return;
    this.scene?.scale?.off("resize", this.onAnyResize);
    this.scene?.events?.off(Phaser.Scenes.Events.POST_UPDATE, this.onSceneTick);
    if (this.searchInput.parentElement) {
      this.searchInput.parentElement.removeChild(this.searchInput);
    }
    this.searchInput = undefined;
  }

  private static ensureSearchStyles() {
    if (TeamsSelector.stylesInjected) return;
    TeamsSelector.stylesInjected = true;
    const style = document.createElement("style");
    style.setAttribute("data-teams-selector", "search");
    style.textContent = `
      .ts-search-input::placeholder { color: rgba(195, 245, 195, 0.55); font-weight: 500; }
      .ts-search-input::-webkit-search-cancel-button {
        -webkit-appearance: none;
        width: 14px; height: 14px;
        background: url('data:image/svg+xml;utf8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2f5c2" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>'
        )}') center / contain no-repeat;
        cursor: pointer; opacity: 0.7;
      }
      .ts-search-input::-webkit-search-cancel-button:hover { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  private static isTextInputFocused(): boolean {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }
}
