import { detectMob } from "../utils/helper";

export const layoutData = {
  menu: {
    popup: {
      scale : detectMob() ? 0.6 : 1,
    },
    teamsTitle: {
      fontSize: detectMob() ? "30px" : "50px",
    },
    teamsSelectorTItle: {
      fonstSize: detectMob() ? "18px" : "22px",
    },
    hostTeamChooseTitle: {
      fontSize: detectMob() ? "22px" : "40px",
      yPercent: detectMob() ? 28 : 21,
    },
    guestTeamChooseTitle: {
      fontSize: detectMob() ? "22px" : "40px",
      yPercent: detectMob() ? 2 : 10,
    },
    nextButton: {
      width: detectMob() ? 120 : 200,
      height: detectMob() ? 35 : 48,
      fontSize: detectMob() ? "16px" : "20px",
      y: detectMob() ? 36 : 56,
    },
    menuTeamsSettings: {
      menuButton: {
        width: detectMob() ? 150 : 200,
        height: detectMob() ? 40 : 48,
        y: detectMob() ? 31 : 50,
      },
      teamPlan: {
        teamFormation: {
          tacticSelector: {
            scale: detectMob() ? 0.5 : 1,
            defencSelectorY: detectMob() ? 295 : 530,
            midfilderY: detectMob() ? 320 : 580,
            attackerY: detectMob() ? 345 : 630,
            host: {
              x: detectMob() ? 62 : 100,
            },
            guest: {
              x: detectMob() ? 285 : 520,
            },
          },
          host: {
            scale: detectMob() ? 0.6 : 1,
            x: detectMob() ? 80 : 158,
            y: detectMob() ? 140 : 250,
            strengthSelector: {
              y: detectMob() ? 280 : 500,
              x: detectMob() ? 108 : 170,
              scale: detectMob() ? 0.4 : 1,
            },
          },
          guest: {
            scale: detectMob() ? 0.6 : 1,
            x: detectMob() ? 270 : 475,
            y: detectMob() ? 140 : 250,
            strengthSelector: {
              x: detectMob() ? 238 : 450,
            },
          },
        },
        hostName: {
          fontSize: detectMob() ? " 24px" : "36px",
          x: detectMob() ? 48 : 100,
          y: detectMob() ? 15 : 42,
        },
        guestName: {
          fontSize: detectMob() ? " 24px" : "36px",
          x: detectMob() ? 48 : 100,
          y: detectMob() ? 15 : 42,
        },
        hostLogo: {
          scale: detectMob() ? 0.7 : 1.3,
          x: detectMob() ? 25 : 50,
          y: detectMob() ? 28 : 56,
        },
        guestLogo: {
          scale: detectMob() ? 0.7 : 1.3,
          x: detectMob() ? 25 : 50,
          y: detectMob() ? 28 : 56,
        },
      },
    },
  },
};
