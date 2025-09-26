import { TeamDataType } from "../types/gameTypes";


export const GameDataStore = {
  teamData: {
    hostTeam: null as TeamDataType | null,
    guestTeam: null as TeamDataType | null,
  },
  teams : null as Array<TeamDataType> | null
};
