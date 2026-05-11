module.exports = async (req, res) => {

  // hanya POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method tidak diizinkan"
    });
  }

  try {

    let message = "";

    // =========================
    // FORMAT JSON
    // =========================
    if (req.body) {

      if (typeof req.body === "string") {
        message = req.body;
      }

      // jika object
      if (typeof req.body === "object") {

        message =
          req.body.message ||
          req.body.text ||
          req.body.prompt ||
          req.body.chat ||
          "";
      }
    }

    // =========================
    // FORMAT FORM DATA
    // =========================
    if (!message && req.query) {

      message =
        req.query.message ||
        req.query.text ||
        req.query.prompt ||
        "";
    }

    // =========================
    // DEBUG
    // =========================
    console.log("BODY:", req.body);
    console.log("QUERY:", req.query);
    console.log("MESSAGE:", message);

    // fallback supaya tidak 400 terus
    if (!message || message.trim() === "") {
      message = "Halo";
    }

    // request ke Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI:", JSON.stringify(data, null, 2));

    // ambil jawaban AI
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI tidak memberi jawaban.";

    // sukses
    return res.status(200).json({
      success: true,
      reply: reply
    });

  } catch (error) {

    console.error("ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });

  }

};
