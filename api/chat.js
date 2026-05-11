module.exports = async (req, res) => {

  // hanya POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method tidak diizinkan"
    });
  }

  try {

    console.log("BODY:", req.body);

    // support banyak format body
    const message =
      req.body?.message ||
      req.body?.text ||
      req.body?.prompt ||
      req.body?.chat ||
      "";

    // cek pesan kosong
    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Pesan kosong"
      });
    }

    // request ke Gemini
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
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

    const data = await geminiResponse.json();

    console.log("GEMINI:", JSON.stringify(data, null, 2));

    // ambil jawaban AI
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI tidak memberi jawaban.";

    // response sukses
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
