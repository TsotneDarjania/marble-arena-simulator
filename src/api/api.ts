import { TeamDataType } from "../types/gameTypes";
import { supabase } from "./supabase";

export class API {
  static async getAllTeams(): Promise<Array<TeamDataType>> {
    const { data, error } = await supabase.from("Teams").select("*");
    if (error) throw new Error(error.message);
    return data as Array<TeamDataType>;
  }
}
