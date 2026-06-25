function buildPath(baseUrl, pathname = "") {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  return `${normalizedBase}${normalizedPath}`;
}

export function getSlotNavigationItems(baseUrl) {
  return [
    { href: buildPath(baseUrl), label: "Start" },
    { href: buildPath(baseUrl, "wheel"), label: "Glücksrad" },
  ];
}

export function getNextLastWin(currentLastWin, creditedWin) {
  return creditedWin > 0 ? creditedWin : currentLastWin;
}
