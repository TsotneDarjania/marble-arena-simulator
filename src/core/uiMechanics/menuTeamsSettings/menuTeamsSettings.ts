import { TeamDataType } from "../../../types/gameTypes";
import { MenuButton } from "../menuButton/menuButton";
import { TeamPlan } from "./teamPlan/teamPlan";

export default class MenuTeamsSettings extends Phaser.GameObjects.Container {
  startMatchButton!: MenuButton;
  matchSettingsButton!: MenuButton;
  gameSettingsButton!: MenuButton;

  hostTeamPlan : TeamPlan;
  guestTeamPlan : TeamPlan;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public homeTeam: TeamDataType,
    public guestTeam: TeamDataType
  ) {
    super(scene, x, y);

    scene.add.existing(this);

    this.init();
  }

  init() {
    this.addMainButtons();
    this.addTeamPlans()
  }

  addTeamPlans(){
   this.hostTeamPlan = new TeamPlan(this.scene, -this.scene.game.canvas.width/2,0,true, this.homeTeam)
  }

  addMainButtons() {
    this.startMatchButton = new MenuButton(this.scene, 0, (this.scene.game.canvas.height / 2) - 50, "Start Match");
    this.add(this.startMatchButton)
    
    this.matchSettingsButton = new MenuButton(this.scene, -220, (this.scene.game.canvas.height / 2) - 50, "Match Settings", undefined, undefined,undefined,0xF5D22B);
    this.add(this.matchSettingsButton)
   
    this.gameSettingsButton = new MenuButton(this.scene, 220, (this.scene.game.canvas.height / 2) - 50, "Game Settings", undefined, undefined,undefined,0xF5D22B);
    this.add(this.gameSettingsButton)
  }
}
