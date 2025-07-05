export async function checkUrlWithPhishTank(url) {
  try {
    const res = await fetch("/.netlify/functions/checkurl", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url })
    });

    if (!res.ok) {
      console.error("Netlify function error:", res.status, res.statusText);
      
      if (res.status === 509) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.");
      }
      
      throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Check if the response contains an error
    if (data.error) {
      console.error("PhishTank API error:", data.error, data.message);
      throw new Error(data.message || data.error);
    }

    // PhishTank JSON response structure based on docs:
    // { results: { url: "...", in_database: true/false, verified: "y"/"n", ... } }
    if (!data.results) {
      console.warn("PhishTank returned no results for URL:", url);
      return false; // Default to safe if no results
    }

    // According to the docs, verified can be "y"/"n" or true/false
    const verified = data.results.verified === "y" || data.results.verified === true;
    const inDatabase = data.results.in_database === true || data.results.in_database === "y";
    
    console.log("PhishTank analysis:", {
      url: data.results.url,
      in_database: inDatabase,
      verified: verified,
      phish_id: data.results.phish_id
    });

    // URL is considered phishing if it's in the database AND verified
    return inDatabase && verified;
    
  } catch (error) {
    console.error("Error checking URL with PhishTank:", error);
    // Re-throw the error so the UI can handle it
    throw error;
  }
}