import Menu from "../../../../scenes/Menu";
import { TeamDataType } from "../../../../types/gameTypes";
import { TeamFormation } from "../formation/formation";

export class TeamTacticSelector extends Phaser.GameObjects.Container {
  valueText: Phaser.GameObjects.Text;

  constructor(
    public scene: Menu,
    x: number,
    y: number,
    public team: TeamDataType,
    public title: string,
    public formation: TeamFormation
  ) {
    super(scene, x, y);

    scene.add.existing(this);
    this.init();
  }

  init() {
    this.addTitlte();
    this.addLeftArrow();
    this.addRightArrow();
    this.addValueText();
  }

  addValueText() {
    let text = "";
    if (this.title === "DF") {
      text = this.team.defence_strategy;
    }
    if (this.title === "MD") {
      text = this.team.midfielder_strategy;
    }
    if (this.title === "AT") {
      text = this.team.attack_strategy;
    }

    this.valueText = this.scene.add
      .text(233, 15, text, {
        fontSize: "30px",
        align: "center",
        color: "#ffffffff",
        stroke: "#ffffffff",
        strokeThickness: 1,
      })
      .setOrigin(0.5);

    this.add(this.valueText);
  }

  addLeftArrow() {
    const arrow = this.scene.add
      .image(70, 16, "menuArrowButton")
      .setScale(0.6)
      .setInteractive({
        cursor: "pointer",
      });
    this.add(arrow);

    arrow.on("pointerdown", () => {
      this.scene.selectButtonClickSound.play()
      // @ts-ignore
      let strategies = [];
      let currentStrategyIndex = 0;

      if (this.title === "DF") {
        strategies = ["wide-attack", "wide-back", "normal"];
        currentStrategyIndex = strategies.indexOf(this.team.defence_strategy);

        currentStrategyIndex--;
        if (currentStrategyIndex < 0)
          currentStrategyIndex = strategies.length - 1;
        // @ts-ignore
        this.team.defence_strategy = strategies[currentStrategyIndex];
      }
      if (this.title === "MD") {
        strategies = ["wide-attack", "wide-back", "center-attack", "normal"];
        currentStrategyIndex = strategies.indexOf(
          this.team.midfielder_strategy
        );

        currentStrategyIndex--;
        if (currentStrategyIndex < 0)
          currentStrategyIndex = strategies.length - 1;
        // @ts-ignore
        this.team.midfielder_strategy = strategies[currentStrategyIndex];
      }
      if (this.title === "AT") {
        strategies = ["normal", "wide-back"];
        currentStrategyIndex = strategies.indexOf(this.team.attack_strategy);

        currentStrategyIndex--;
        if (currentStrategyIndex < 0)
          currentStrategyIndex = strategies.length - 1;
        // @ts-ignore
        this.team.attack_strategy = strategies[currentStrategyIndex];
      }

      this.valueText.destroy();
      this.addValueText();
      this.formation.destroyFormation();
      this.formation.addFormation();
    });
  }

  addRightArrow() {
    const arrow = this.scene.add
      .image(400, 16, "menuArrowButton")
      .setScale(0.6)
      .setFlipX(true)
      .setInteractive({
        cursor: "pointer",
      });
    this.add(arrow);

    arrow.on("pointerdown", () => {
      this.scene.selectButtonClickSound.play()
      // @ts-ignore
      let strategies = [];
      let currentStrategyIndex = 0;

      if (this.title === "DF") {
        strategies = ["wide-attack", "wide-back", "normal"];
        currentStrategyIndex = strategies.indexOf(this.team.defence_strategy);
        currentStrategyIndex++;
        if (currentStrategyIndex > strategies.length - 1)
          currentStrategyIndex = 0;
        // @ts-ignore
        this.team.defence_strategy = strategies[currentStrategyIndex];
      }
      if (this.title === "MD") {
        strategies = ["wide-attack", "wide-back", "center-attack", "normal"];
        currentStrategyIndex = strategies.indexOf(
          this.team.midfielder_strategy
        );

        currentStrategyIndex++;
        if (currentStrategyIndex > strategies.length - 1)
          currentStrategyIndex = 0;
        // @ts-ignore
        this.team.midfielder_strategy = strategies[currentStrategyIndex];
      }
      if (this.title === "AT") {
        strategies = ["normal", "wide-back"];
        currentStrategyIndex = strategies.indexOf(this.team.attack_strategy);

        currentStrategyIndex++;
        if (currentStrategyIndex > strategies.length - 1)
          currentStrategyIndex = 0;
        // @ts-ignore
        this.team.attack_strategy = strategies[currentStrategyIndex];
      }

      this.valueText.destroy();
      this.addValueText();
      this.formation.destroyFormation();
      this.formation.addFormation();
    });
  }

  addTitlte() {
    const title = this.scene.add.text(0, 0, this.title, {
      fontSize: "30px",
      align: "center",
      color: "#ffffffff",
      stroke: "#ffffffff",
      strokeThickness: 1,
    });

    this.add(title);
  }
}
