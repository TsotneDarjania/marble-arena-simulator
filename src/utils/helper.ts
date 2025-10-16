export function getTeamParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const hostTeamId = params.get("host");
  const guestTeamId = params.get("guest");

  if (!hostTeamId || !guestTeamId) {
    return null;
  }

  return { hostTeamId, guestTeamId };
}

export function detectMob() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}
