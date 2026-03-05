
const https = require("https");

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const body = event.body;

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.groq.com",
        path: "/openai/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + GROQ_API_KEY,
          "Content-Length": Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(JSON.parse(data)));
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
