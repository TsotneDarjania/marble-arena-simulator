import { layoutData } from "../../../../config/layout";
import Menu from "../../../../scenes/Menu";
import { TeamDataType } from "../../../../types/gameTypes";
import { TeamFormation } from "../formation/formation";
import { TeamStrengthSelector } from "../teamStrengthSelector/TeamStrengthSelector";
import { TeamTacticSelector } from "../teamTacticSelector/teamTacticSelector";

export class TeamPlan extends Phaser.GameObjects.Container {
  teamFormation: TeamFormation;
  teamStrengthSelector: TeamStrengthSelector;

  defenceTacticSelector: TeamTacticSelector;
  midfilderTacticSelector: TeamTacticSelector;
  attackeTacticSelector: TeamTacticSelector;

  constructor(
    public scene: Menu,
    x: number,
    y: number,
    public isHost: boolean,
    public team: TeamDataType
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.init();
  }

  init() {
    this.addLogo();
    this.addName();
    this.addFormation();
    this.addTeamStrengthSelector();
    this.addTeamTacticSelectors();
  }

  addTeamTacticSelectors() {
    this.defenceTacticSelector = new TeamTacticSelector(
      this.scene,
      this.isHost
        ? layoutData.menu.menuTeamsSettings.teamPlan.teamFormation
            .tacticSelector.host.x
        : this.scene.game.canvas.width -
          layoutData.menu.menuTeamsSettings.teamPlan.teamFormation
            .tacticSelector.guest.x,
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.tacticSelector.defencSelectorY,
      this.team,
      "DF",
      this.teamFormation
    ).setScale(
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.tacticSelector
        .scale
    );
    this.midfilderTacticSelector = new TeamTacticSelector(
      this.scene,
      this.isHost
        ? layoutData.menu.menuTeamsSettings.teamPlan.teamFormation
            .tacticSelector.host.x
        : this.scene.game.canvas.width -
          layoutData.menu.menuTeamsSettings.teamPlan.teamFormation
            .tacticSelector.guest.x,
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.tacticSelector.midfilderY,
      this.team,
      "MD",
      this.teamFormation
    ).setScale(
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.tacticSelector
        .scale
    );
    this.attackeTacticSelector = new TeamTacticSelector(
      this.scene,
      this.isHost
        ? layoutData.menu.menuTeamsSettings.teamPlan.teamFormation
            .tacticSelector.host.x
        : this.scene.game.canvas.width -
          layoutData.menu.menuTeamsSettings.teamPlan.teamFormation
            .tacticSelector.guest.x,
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.tacticSelector.attackerY,
      this.team,
      "AT",
      this.teamFormation
    ).setScale(
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.tacticSelector
        .scale
    );
  }

  addTeamStrengthSelector() {
    this.teamStrengthSelector = new TeamStrengthSelector(
      this.scene,
      this.isHost
        ? layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.host
            .strengthSelector.x
        : this.scene.game.canvas.width -
          layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.guest
            .strengthSelector.x,
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.host.strengthSelector.y,
      this.team,
      {
        field: "attack_speed", // or any numeric stat
        width: 320, // bar width
        height: 24, // thicker line
        showLabel: true,
      }
    ).setScale(
      layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.host
        .strengthSelector.scale
    );

    this.teamStrengthSelector.on("change", (v: number) => {
      console.log("new strength:", v);

      this.team.attack_speed = v;
      this.team.defence_speed = v;
      this.team.goalkeeper_speed = v;
      this.team.midfielder_speed = v;
      this.team.pass_accuracy = v;
      this.team.pass_speed = v - 20;
      if (this.team.pass_speed < 1) {
        this.team.pass_speed = 1;
      }
      this.team.shoot_accuracy = v - 30;
      if (this.team.shoot_accuracy < 1) {
        this.team.shoot_accuracy = 1;
      }
    });
  }

  addFormation() {
    if (this.isHost) {
      this.teamFormation = new TeamFormation(
        this.scene,
        layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.host.x,
        layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.host.y,
        this.team
      ).setScale(
        layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.host.scale
      );
    } else {
      this.teamFormation = new TeamFormation(
        this.scene,
        this.scene.game.canvas.width -
          layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.guest.x,
        layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.guest.y,
        this.team
      ).setScale(
        layoutData.menu.menuTeamsSettings.teamPlan.teamFormation.guest.scale
      );
    }
  }

  addName() {
    if (this.isHost) {
      this.scene.add.text(
        layoutData.menu.menuTeamsSettings.teamPlan.hostName.x,
        layoutData.menu.menuTeamsSettings.teamPlan.hostName.y,
        this.team.name.toUpperCase(),
        {
          fontSize:
            layoutData.menu.menuTeamsSettings.teamPlan.hostName.fontSize,
          align: "center",
          color: "#ffffffff",
          stroke: "#ffffffff",
          strokeThickness: 1,
        }
      );
    } else {
      this.scene.add
        .text(
          this.scene.game.canvas.width -
            layoutData.menu.menuTeamsSettings.teamPlan.guestName.x,
          layoutData.menu.menuTeamsSettings.teamPlan.guestName.y,
          this.team.name.toUpperCase(),
          {
            fontSize:
              layoutData.menu.menuTeamsSettings.teamPlan.guestName.fontSize,
            align: "center",
            color: "#ffffffff",
            stroke: "#ffffffff",
            strokeThickness: 1,
          }
        )
        .setOrigin(1, 0);
    }
  }

  addLogo() {
    if (this.isHost) {
      this.scene.add
        .image(
          layoutData.menu.menuTeamsSettings.teamPlan.hostLogo.x,
          layoutData.menu.menuTeamsSettings.teamPlan.hostLogo.y,
          this.team.name
        )
        .setScale(layoutData.menu.menuTeamsSettings.teamPlan.hostLogo.scale);
    } else {
      this.scene.add
        .image(
          this.scene.game.canvas.width -
            layoutData.menu.menuTeamsSettings.teamPlan.guestLogo.x,
          layoutData.menu.menuTeamsSettings.teamPlan.guestLogo.y,
          this.team.name
        )
        .setScale(layoutData.menu.menuTeamsSettings.teamPlan.guestLogo.scale);
    }
  }
}
