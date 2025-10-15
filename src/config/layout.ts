import { detectMob } from "../utils/helper";

export const layoutData = {
  menu: {
    teamsSelectorTItle: {
      fonstSize: detectMob() ? "18px" : "22px",
    },
    hostTeamChooseTitle: {
        fontSize : detectMob() ? "22px" : "40px",
        yPercent : detectMob() ? 28 : 21,
    },
    guestTeamChooseTitle: {
        fontSize : detectMob() ? "22px" : "40px",
        yPercent : detectMob() ? 2 : 10,
    },
  },
};
