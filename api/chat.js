```js
export default async function handler(req, res) {

    // Hanya izinkan POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {

        // Ambil data dari frontend
        const { history, systemPrompt } = req.body;

        // Ambil API Key dari Vercel Environment Variables
        const apiKey = process.env.GEMINI_API_KEY;

        // Validasi API Key
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY belum disetting di Vercel'
            });
        }

        // Validasi history
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({
                error: 'Format history tidak valid'
            });
        }

        // URL Gemini API
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Payload ke Gemini
        const payload = {
            systemInstruction: {
                parts: [
                    {
                        text: systemPrompt || "Kamu adalah asisten warga RT yang ramah."
                    }
                ]
            },
            contents: history
        };

        // Request ke Gemini
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Ambil response JSON
        const data = await geminiRes.json();

        // Debug log untuk Vercel
        console.log("===== GEMINI RESPONSE =====");
        console.log(JSON.stringify(data, null, 2));

        // Jika response gagal
        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({
                error:
                    data?.error?.message ||
                    'Terjadi error saat menghubungi Gemini'
            });
        }

        // Validasi response Gemini
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({
                error: 'Response Gemini kosong atau format berubah'
            });
        }

        // Kirim jawaban ke frontend
        return res.status(200).json({
            text
        });

    } catch (error) {

        // Log error detail di Vercel
        console.error("===== SERVER ERROR =====");
        console.error(error);

        return res.status(500).json({
            error:
                error?.message ||
                'Internal Server Error'
        });
    }
}
```
