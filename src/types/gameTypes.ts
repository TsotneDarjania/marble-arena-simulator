import BoardFootballPlayer from "../core/match/team/footballplayers/boardFootballPlayer";

export type MatchDataType = {
  hostTeamData: TeamDataType;
  guestTeamData: TeamDataType;
  gameConfig: GameConfigType;
};

export type Formation =
  | "4-4-2"
  | "5-3-2"
  | "3-4-4"
  | "3-5-2"
  | "3-3-4"
  | "4-3-3"
  | "3-4-3"
  | "5-4-1";

export type TeamDataType = {
  attack_speed: number;
  attack_strategy: "normal" | "wide-back";
  default_strategy: Formation;
  defence_speed: number;
  defence_strategy: "wide-attack" | "wide-back" | "center-attack" | "normal";
  fault_possibility: number;
  goalkeeper_speed: number;
  id: number;
  midfielder_speed: number;
  midfielder_strategy: "wide-attack" | "wide-back" | "normal";
  name: string;
  pass_accuracy: number;
  pass_speed: number;
  primary_color: string;
  secondary_color: string;
  shoot_accuracy: number;
  tablo_name: string;
  team_logo_url: string;
  fifa_raiting: number;
};
// export type TeamDataType = {
//   name: string;
//   initials: string;
//   logoKey: string;
//   logoURL: string;
//   formation: string;
//   fansColor: number;
//   tactics: {
//     formation: {
//       defenceLine: "wide-attack" | "normal";
//       centerLine: "wide-attack" | "wide-back" | "normal";
//       attackLine: "wide-attack" | "wide-back" | "normal";
//     };
//   };
//   passSpeed: number;
//   shootSpeed: number;
//   goalKeeperSpeed: number;
//   shootAccuracy: number;
//   motionSpeed: number;
//   comments: {
//     saveBallComments: Array<string>;
//     defenderComments: Array<string>;
//     shooterComments: Array<string>;
//   };
//   freeKiskFrequency: number;
//   penaltyFrequency: number;
// };

export type GameConfigType = {
  mode: MatchModeType;
  hostFansCountPercent: number; // her you can set how many host team fans you want on stadium (from 0 to 100)
  mathTime: number;
};

export type MatchModeType =
  | "board-football"
  | "old-style"
  | "new-style"
  | "marble-football"
  | "experimental";

export type MatchInfoType = {
  matchTitle: string;
  matchSubTitle: string;
};

export type FootballPlayerData = {
  who: "unkown" | "hostPlayer" | "guestPlayer";
  potentialShortPassVariants?: BoardFootballPlayer[];
  potentialLongPassVariants?: BoardFootballPlayer[];
  position: "goalKeeper" | "defender" | "middfielder" | "attacker";
};

export type GameDataType = {
  teamsData : {
      hostTeam : TeamDataType | null,
      guestTeam : TeamDataType | null
  }
  teams : Array<TeamDataType> | null
  matchSettings : {
    time : number,
    showModals : boolean
    hostTeamFansColor : number,
    guestTeamFansColor : number
  },
  gameSettings : {
    fansSounds: boolean,
    gameSounds : boolean,
    stadiumBackgroundColor : number
  }
}
export type GameModeType = "marble-league" | "friendly";
