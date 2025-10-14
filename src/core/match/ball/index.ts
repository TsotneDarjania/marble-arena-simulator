import { Tweens } from "phaser";
import { Stadium } from "../stadium";
import GamePlay from "../../../scenes/GamePlay";

export class Ball extends Phaser.Physics.Arcade.Image {
  anglurarVelocity = 800;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  blinkAnimation!: Tweens.Tween;

  constructor(
    public scene: GamePlay,
    public x: number,
    public y: number,
    public stadium: Stadium
  ) {
    super(scene, x, y - 3, "ball");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.4);
    this.setCircle(22, 10, 11);

    this.setBounce(0.9);

    this.addParticles();
    this.createBlinkAnimation();
    this.setDepth(11);

    // enable damping
    this.setDamping(true);
    this.setDrag(0.65); // <-- THIS is realistic friction for damping mode
  }

  private addParticles() {
    this.emitter = this.scene.add.particles(this.x, this.y, "circle", {
      lifespan: 270,
      alpha: { start: 0.3, end: 0 },
      scale: { start: 0.15, end: 0 },
      tint: [0xf7332d, 0xf7e52d],
      frequency: 5,
      blendMode: "ADD",
    });
    this.emitter.setDepth(10);
    this.emitter.startFollow(
      this,
      -this.scene.game.canvas.width / 2,
      -this.scene.game.canvas.height / 2
    );
  }

  kick(speed: number, { x, y }: { x: number; y: number }) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    const velocity = this.scene.physics.velocityFromRotation(
      angle,
      speed * 1.35
    );

    this.setVelocity(velocity.x, velocity.y);
    this.setAngularVelocity(speed * 3.5);

    // ✅ Keep minimal constant velocity
    const body = this.body as Phaser.Physics.Arcade.Body;
    const minSpeed = 110; // adjust as needed

    this.scene.time.addEvent({
      delay: 120, // check every 50ms
      loop: true,
      callback: () => {
        const vx = body.velocity.x;
        const vy = body.velocity.y;
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);

        if (currentSpeed < minSpeed) {
          // normalize direction and reapply minimal speed
          const dir = new Phaser.Math.Vector2(vx, vy).normalize();
          body.setVelocity(dir.x * minSpeed, dir.y * minSpeed);
        }

        // stop enforcing when ball is almost stopped manually
        if (currentSpeed <= 1) {
          (this.scene.time as any).removeEvent(this);
        }
      },
    });
  }

  stop() {
    this.setVelocity(0, 0);
    this.setAngularVelocity(0);
  }

  goTowardFootballer(x: number, y: number) {
    this.scene.tweens.add({
      targets: this,
      x: x,
      y: y,
      duration: 120,
    });
  }

  startBlinkAnimation() {
    this.blinkAnimation.resume();
  }

  createBlinkAnimation() {
    this.blinkAnimation = this.scene.add.tween({
      targets: this,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: -1,
    });

    this.blinkAnimation.pause();
  }

  stopBlinkAnimation() {
    this.blinkAnimation.pause();
    this.setAlpha(1);
  }

  reset() {
    this.stop();
    this.blinkAnimation.pause();
    this.setAlpha(1);
    this.setPosition(
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2
    );
  }
}
