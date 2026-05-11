module.exports = async (req, res) => {

  // hanya izinkan POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method tidak diizinkan"
    });
  }

  try {

    // ambil pesan dari index.html
    const { message } = req.body;

    // cek jika kosong
    if (!message) {
      return res.status(400).json({
        error: "Pesan kosong"
      });
    }

    // request ke Gemini AI
    const response = await fetch(
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
              role: "user",
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

    // ambil response Gemini
    const data = await response.json();

    console.log("GEMINI:", JSON.stringify(data, null, 2));

    // ambil text jawaban
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, AI tidak memberi jawaban.";

    // kirim balik ke frontend
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
