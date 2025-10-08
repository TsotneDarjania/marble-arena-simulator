import CanvasScene from "../../scenes/CanvasScene";
import GamePlay from "../../scenes/GamePlay";

export class EventManager {
  status: "init" | "ready-for-start-match" | "match-is-started" = "init";

  constructor(public gamePlayScene: GamePlay, public canvasScene: CanvasScene) {
    this.manageUserEventListeners();
    this.manageGameEvents();
  }

  manageUserEventListeners() {
    // When you will click Start Simulation Button
    this.canvasScene.introOverlay.button.addOnClickEvent(() => {
      this.canvasScene.startIntroAnimation();
      this.canvasScene.cameraController.destroy();
    });

    this.gamePlayScene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.code === "Space") {
        if (this.gamePlayScene.match.matchManager === undefined) return;
        if (
          this.gamePlayScene.match.matchManager.matchEvenetManager === undefined
        )
          return;
        if (
          this.gamePlayScene.match.matchManager.matchEvenetManager
            .matchStatus === "pause"
        ) {
          this.gamePlayScene.match.matchManager.resumeMatch();
        }
      }
    });

    // Player Wants to Start match he will pressed space for that
    this.gamePlayScene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.status !== "ready-for-start-match") return;
      if (event.code === "Space") {
        this.startMatchCommand();
      }
      this.status = "match-is-started";
    });

    // Also trigger start when user clicks anywhere
    this.gamePlayScene.input.on("pointerdown", () => {
      if (this.status !== "ready-for-start-match") return;
      this.startMatchCommand();
      this.status = "match-is-started";
    });
  }

  private startMatchCommand() {
    this.canvasScene.hideIntroWindow();
    this.canvasScene.showMatchIndicators();
    this.canvasScene.destroyPressToStartText();
    this.gamePlayScene.match.startMatch();
  }

  manageGameEvents() {
    this.gamePlayScene.events.on("cameraZoomFinished", () => {
      this.status = "ready-for-start-match";
      this.canvasScene.showPressToStartText();
    });
  }
}
