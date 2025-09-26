export function getTeamParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const hostTeamId = params.get("host");
  const guestTeamId = params.get("guest");

  if (!hostTeamId || !guestTeamId) {
    return null;
  }
  
  return {hostTeamId, guestTeamId}
}
