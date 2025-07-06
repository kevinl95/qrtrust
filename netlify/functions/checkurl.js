// Simple XML parser for PhishTank responses
function parsePhishTankXML(xmlText) {
  try {
    // Check for error messages first
    const errorMatch = xmlText.match(/<errortext>(.*?)<\/errortext>/);
    if (errorMatch) {
      throw new Error(`PhishTank API Error: ${errorMatch[1]}`);
    }
    
    // Extract the key information from XML using regex
    // This is a simple parser for the specific PhishTank XML format
    
    const urlMatch = xmlText.match(/<url>(.*?)<\/url>/);
    const inDatabaseMatch = xmlText.match(/<in_database>(.*?)<\/in_database>/);
    const verifiedMatch = xmlText.match(/<verified>(.*?)<\/verified>/);
    const phishIdMatch = xmlText.match(/<phish_id>(.*?)<\/phish_id>/);
    const validMatch = xmlText.match(/<valid>(.*?)<\/valid>/);
    
    return {
      results: {
        url: urlMatch ? urlMatch[1] : null,
        in_database: inDatabaseMatch ? inDatabaseMatch[1] === 'true' : false,
        verified: verifiedMatch ? verifiedMatch[1] === 'true' : false,
        phish_id: phishIdMatch ? parseInt(phishIdMatch[1]) : null,
        valid: validMatch ? validMatch[1] === 'true' : false
      }
    };
  } catch (error) {
    console.error("Error parsing PhishTank XML:", error);
    throw error; // Re-throw to preserve the original error message
  }
}

export async function handler(event) {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const params = new URLSearchParams(event.body);
  const urlToCheck = params.get("url");

  console.log("Raw event body:", event.body);
  console.log("Parsed URL parameter:", urlToCheck);
  console.log("All parameters:", Object.fromEntries(params.entries()));

  if (!urlToCheck) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: "Missing 'url' parameter",
        receivedBody: event.body,
        parsedParams: Object.fromEntries(params.entries())
      })
    };
  }

  try {
    console.log("Checking URL with PhishTank:", urlToCheck);
    console.log("URL length:", urlToCheck.length);
        
    const response = await fetch("https://checkurl.phishtank.com/checkurl/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "phishtank/qrtrust-app"
        },
        body: new URLSearchParams({
            url: urlToCheck,
            format: 'json'
        }).toString()
    });

    
    console.log("PhishTank response status:", response.status);
    console.log("PhishTank response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("PhishTank API error:", response.status, response.statusText);
      
      if (response.status === 509) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`PhishTank API responded with ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log("PhishTank raw response:", responseText);

    // Check the content type to determine how to parse the response
    const contentType = response.headers.get("content-type") || "";
    let result;
    
    if (contentType.includes("application/json")) {
      result = JSON.parse(responseText);
    } else if (contentType.includes("text/xml") || contentType.includes("application/xml")) {
      // PhishTank returned XML, parse it
      result = parsePhishTankXML(responseText);
    } else {
      // Try to parse as JSON first, then XML
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        try {
          result = parsePhishTankXML(responseText);
        } catch (xmlError) {
          throw new Error(`Unexpected response format. Content-Type: ${contentType}, Response: ${responseText.substring(0, 200)}`);
        }
      }
    }
    
    console.log("Parsed PhishTank response:", result);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "X-Request-Limit": response.headers.get("X-Request-Limit") || "",
        "X-Request-Count": response.headers.get("X-Request-Count") || "",
        "X-Request-Limit-Interval": response.headers.get("X-Request-Limit-Interval") || ""
      },
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error("PhishTank proxy error:", err);
    
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: "Server error", 
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      })
    };
  }
}