import CanvasScene from "../../scenes/CanvasScene";
import GamePlay from "../../scenes/GamePlay";
import { detectMob } from "../../utils/helper";
import { calculatePercentage } from "../../utils/math";
import CameraZoomSelectBar from "../uiMechanics/cameraZoomSelectBar";

export default class CanvasSceneCameraController {
  zoomProgressBar: CameraZoomSelectBar;

  constructor(public scene: CanvasScene, public gamePlayScene: GamePlay) {
    this.addZoomProgressBar();
    this.updateCameraZoom();
  }

  addZoomProgressBar() {
    this.zoomProgressBar = new CameraZoomSelectBar(
      this.scene,
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height -
        calculatePercentage(this.scene.game.canvas.height, 6),
      calculatePercentage(this.scene.game.canvas.width, 70),
      calculatePercentage(this.scene.game.canvas.height, 2),
      "cameraZoomButton"
    );
  }

  updateCameraZoom() {
    const camera = this.gamePlayScene.cameras.main;

    // Save the initial zoom before setting up the listener
    let initialZoom = camera.zoom

    if(detectMob()){
      initialZoom -= 0.5;
    }

    // Example: set to a base zoom once
    camera.setZoom(initialZoom);

    // Now handle slider changes relative to that base zoom
    this.zoomProgressBar.onValueChanged((value: number) => {
      // Calculate new zoom relative to initial zoom
      // You can control the multiplier range (for example ±50%)
      const zoomFactor = Phaser.Math.Linear(0.5, 1.5, value / 100);
      camera.setZoom(initialZoom * zoomFactor);
    });
  }

  destroy() {
    this.zoomProgressBar.destroy(true);
  }
}
