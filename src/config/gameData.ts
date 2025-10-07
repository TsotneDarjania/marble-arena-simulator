import { GameDataType } from "../types/gameTypes";

export const GameData : GameDataType = {
  teamsData: {
    hostTeam: null,
    guestTeam: null 
  },
  teams : null,
  matchSettings : {
    time : 2,
    showModals : true,
    hostTeamFansColor : 0xffffff,
    guestTeamFansColor : 0xffffff
  },
  gameSettings: {
    fansSounds: true,
    gameSounds: true,
    stadiumBackgroundColor : 0x032E29
  }
};
