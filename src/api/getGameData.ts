import { supabase } from "./supabase";

export async function getGameData() {
  const params = new URLSearchParams(window.location.search);
  const hostTeamId = params.get("host");
  const guestTeamId = params.get("guest");

  if (!hostTeamId || !guestTeamId) {
    throw new Error("Missing host or guest team ID in URL");
  }

  const { data, error } = await supabase
    .from("Teams")
    .select("*")
    .in("id", [hostTeamId, guestTeamId]);

  if (error) throw new Error(error.message);
  if (!data || data.length !== 2) throw new Error("Could not fetch both teams");

  const hostTeam = data.find((team) => team.id === Number(hostTeamId));
  const guestTeam = data.find((team) => team.id === Number(guestTeamId));

  return { hostTeam, guestTeam };
}
