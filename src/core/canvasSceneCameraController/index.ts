import CanvasScene from "../../scenes/CanvasScene";
import GamePlay from "../../scenes/GamePlay";
import { calculatePercentage } from "../../utils/math";
import CameraZoomSelectBar from "../uiMechanics/cameraZoomSelectBar";

export default class CanvasSceneCameraController {
  zoomProgressBar: CameraZoomSelectBar

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
    this.zoomProgressBar.onValueChanged((value : number) => {
      this.gamePlayScene.cameras.main.setZoom(
        Phaser.Math.Linear(0.5, 1.5, value / 100)
      );
    });
  }

  destroy() {
    this.zoomProgressBar.destroy(true);
  }
}