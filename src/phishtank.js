export async function checkUrlWithPhishTank(url) {
  const res = await fetch("https://checkurl.phishtank.com/checkurl/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      url: url,
      format: "json",
      app_key: "", // Optional
    }),
  });
  const data = await res.json();
  return data.results.in_database && data.results.verified;
}