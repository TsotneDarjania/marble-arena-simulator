import { GameData } from "../../../config/gameData";
import { layoutData } from "../../../config/layout";
import Menu from "../../../scenes/Menu";
import { TeamDataType } from "../../../types/gameTypes";
import { MenuButton } from "../menuButton/menuButton";
import { GameSettingsPopup } from "./gameSettingsPopup/gameSettingsPopup";
import { MatchSettingsPopup } from "./matchSettingsPopup/matcSettingsPopup";
import { TeamPlan } from "./teamPlan/teamPlan";

export default class MenuTeamsSettings extends Phaser.GameObjects.Container {
  startMatchButton!: MenuButton;
  matchSettingsButton!: MenuButton;
  gameSettingsButton!: MenuButton;

  hostTeamPlan: TeamPlan;
  guestTeamPlan: TeamPlan;

  matchSettingsPopup: MatchSettingsPopup;
  gameSetgingsPopup: GameSettingsPopup;

  constructor(
    public scene: Menu,
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
    this.addTeamPlans();
    this.addPopups();

    // Initialize Fans Colors
    GameData.matchSettings.hostTeamFansColor =  Number(`0x${GameData.teamsData.hostTeam!.primary_color.replace("#", "")}`)
    GameData.matchSettings.guestTeamFansColor =  Number(`0x${GameData.teamsData.guestTeam!.primary_color.replace("#", "")}`)
  }

  addPopups() {
    this.matchSettingsPopup = new MatchSettingsPopup(
      this.scene,
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2,
      {
        width: 700,
        height: 500,
        fillColor: 0x0d3020,
        strokeWidth: 6,
        strokeColor: 0x071c13,
      }
    )

    this.gameSetgingsPopup = new GameSettingsPopup(
      this.scene,
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2,
      {
        width: 700,
        height: 500,
        fillColor: 0x0d3020,
        strokeWidth: 6,
        strokeColor: 0x071c13,
      }
    );
  }

  addTeamPlans() {
    console.log(this.homeTeam.name,this.guestTeam.name)
    this.hostTeamPlan = new TeamPlan(this.scene, 0, 0, true, this.homeTeam)
    this.guestTeamPlan = new TeamPlan(this.scene, 0, 0, false, this.guestTeam);
  }

  addMainButtons() {
    this.startMatchButton = new MenuButton(
      this.scene,
      0,
      this.scene.game.canvas.height / 2 - layoutData.menu.menuTeamsSettings.menuButton.y,
      "Start Match",
    );
    this.startMatchButton.on("click", () => {
      this.scene.buttonClickSound.play()
      this.scene.scene.start("GamePlay")
    })
    this.add(this.startMatchButton);

    this.matchSettingsButton = new MenuButton(
      this.scene,
      -220,
      this.scene.game.canvas.height / 2 - layoutData.menu.menuTeamsSettings.menuButton.y,
      "Match Settings",
      undefined,
      undefined,
      undefined,
      0xf5d22b
    );
    this.matchSettingsButton.on("click", () => {
      this.scene.buttonClickSound.play()
      this.gameSetgingsPopup.hide()
      this.matchSettingsPopup.show({
        duration: 1000,
        fromScale: 0,
      });
    });
    this.add(this.matchSettingsButton);

    this.gameSettingsButton = new MenuButton(
      this.scene,
      220,
      this.scene.game.canvas.height / 2 - layoutData.menu.menuTeamsSettings.menuButton.y,
      "Game Settings",
      undefined,
      undefined,
      undefined,
      0xf5d22b
    );
    this.gameSettingsButton.on("click", () => {
      this.scene.buttonClickSound.play()
      this.matchSettingsPopup.hide()
      this.gameSetgingsPopup.show({
        duration: 1000,
        fromScale: 0,
      });
    });
    this.add(this.gameSettingsButton);
  }
}
