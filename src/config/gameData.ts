import { GameDataType } from "../types/gameTypes";

export const GameData : GameDataType = {
  teamsData: {
    hostTeam: null,
    guestTeam: null 
  },
  teams : null,
  matchSettings : {
    time : 0.5,
    showModals : true,
    hostTeamFansColor : 0xffffff,
    guestTeamFansColor : 0xffffff
  },
  gameSettings: {
    fansSounds: true,
    gameSounds: true,
    stadiumBackgroundColor : 0xffffff
  }
};
