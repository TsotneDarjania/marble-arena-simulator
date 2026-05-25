import { detectMob } from "../utils/helper";

export const layoutData = {
  gameplay: {
    indicatorsContainer: {
      scale: detectMob() ? 0.4 : 0.75,
      y: detectMob() ? 40 : 100,
    },
    brandTitleFontSize: detectMob() ? "45px" : "144px",
    teamsLogosScale : detectMob() ? 0.7 : 1,
    teamsLogosY : detectMob() ? 30: 140,
    transitionLogoScale : detectMob() ? 0.24: 0.5,
    comentatorScale : detectMob() ? 0.15: 0.35,
  },
  menu: {
    teamsSelectorScale: detectMob() ? 0.6 : 1,
    popup: {
      scale: detectMob() ? 0.45 : 1,
    },
    teamsTitle: {
      fontSize: detectMob() ? "25px" : "50px",
    },
    teamsSelectorTItle: {
      fonstSize: detectMob() ? "18px" : "22px",
    },
    // host & guest layout below uses an 11%-of-canvas-height gap between section
    // title and selector — TeamsSelector mirrors the same 11% gap *below* the
    // carousel, so title → logos → search bar are evenly spaced. Keep the
    // yPercent values in sync with the distancePercent constant inside
    // TeamsSelector if they change.
    hostTeamChooseTitle: {
      fontSize: detectMob() ? "22px" : "40px",
      yPercent: 21,
    },
    hostTeamSelector: {
      yPercent: 10,
    },
    guestTeamChooseTitle: {
      fontSize: detectMob() ? "22px" : "40px",
      yPercent: 10,
    },
    guestTeamSelector: {
      yPercent: 21,
    },
    nextButton: {
      width: detectMob() ? 120 : 200,
      height: detectMob() ? 28 : 48,
      fontSize: detectMob() ? "16px" : "20px",
      // pulled closer to the bottom on mobile so the guest search bar fits above
      y: detectMob() ? 8 : 30,
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
            scale: detectMob() ? 0.4 : 1,
            defencSelectorY: detectMob() ? 225 : 530,
            midfilderY: detectMob() ? 250 : 580,
            attackerY: detectMob() ? 275 : 630,
            host: {
              x: detectMob() ? 45 : 100,
            },
            guest: {
              x: detectMob() ? 215 : 520,
            },
          },
          host: {
            scale: detectMob() ? 0.4 : 1,
            x: detectMob() ? 65 : 158,
            y: detectMob() ? 110 : 250,
            strengthSelector: {
              x: detectMob() ? 65 : 170,
              y: detectMob() ? 210 : 500,
              scale: detectMob() ? 0.4 : 1,
            },
          },
          guest: {
            scale: detectMob() ? 0.4 : 1,
            x: detectMob() ? 190 : 475,
            y: detectMob() ? 110 : 250,
            strengthSelector: {
              x: detectMob() ? 190 : 450,
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
