```javascript
module.exports = async (req, res) => {

  // hanya izinkan POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method tidak diizinkan"
    });
  }

  try {

    // ambil pesan dari berbagai format body
    let message =
      req.body?.message ||
      req.body?.text ||
      req.body?.prompt ||
      req.body?.chat ||
      "";

    // fallback jika body string
    if (!message && typeof req.body === "string") {
      message = req.body;
    }

    // fallback query
    if (!message) {
      message =
        req.query?.message ||
        req.query?.text ||
        "";
    }

    // default supaya tidak error
    if (!message || message.trim() === "") {
      message = "Halo";
    }

    // model Gemini yang stabil
    const MODEL = "gemini-1.5-flash";

    // request ke Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    // handle rate limit
    if (response.status === 429) {
      return res.status(200).json({
        success: false,
        reply: "AI sedang sibuk, coba lagi beberapa detik."
      });
    }

    // ambil response
    const data = await response.json();

    console.log("GEMINI:", JSON.stringify(data, null, 2));

    // ambil jawaban AI
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, AI tidak memberi jawaban.";

    // kirim ke frontend
    return res.status(200).json({
      success: true,
      reply: reply
    });

  } catch (error) {

    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });

  }

};
```
