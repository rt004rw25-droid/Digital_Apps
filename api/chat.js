```js id="s44wde"
export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'API Key belum disetting'
            });
        }

        const { history, systemPrompt } = req.body;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: systemPrompt || "Kamu asisten RT."
                            }
                        ]
                    },
                    contents: history
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || 'Gemini Error'
            });
        }

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({
                error: 'Jawaban Gemini kosong'
            });
        }

        return res.status(200).json({
            text
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
}
```
