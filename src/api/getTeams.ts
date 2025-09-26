import { TeamDataType } from "../types/gameTypes";
import { supabase } from "./supabase";

// export async function getGameData() {
//   const params = new URLSearchParams(window.location.search);
//   const hostTeamId = params.get("host");
//   const guestTeamId = params.get("guest");

//   if (!hostTeamId || !guestTeamId) {
//     throw new Error("Missing host or guest team ID in URL");
//   }

//   const { data, error } = await supabase
//     .from("Teams")
//     .select("*")
//     .in("id", [hostTeamId, guestTeamId]);

//   if (error) throw new Error(error.message);
//   if (!data || data.length !== 2) throw new Error("Could not fetch both teams");

//   const hostTeam = data.find((team) => team.id === Number(hostTeamId));
//   const guestTeam = data.find((team) => team.id === Number(guestTeamId));

//   return { hostTeam, guestTeam };
// }

export async function getTeams() {
  try {
    const { data, error } = await supabase.from("Teams").select("*");

    if (error) {
      throw new Error(`Get Teams Error: ${error.message}`);
    }

    return data as Array<TeamDataType>;
  } catch (err) {
    console.error("Failed to get teams:", err);
    return null; 
  }
}
