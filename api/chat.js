export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Tarik sejarah percakapan dan instruksi sistem dari frontend
    const { history, systemPrompt } = req.body;
    
    // Kunci API Rahasia ini ditarik dari Environment Variables Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key belum disetting di Vercel' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Menyusun muatan data sesuai standar format Gemini API terbaru
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: history
    };

    try {
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await geminiRes.json();
        const text = data.candidates[0].content.parts[0].text;
        
        // Kirim jawaban kembali ke aplikasi HTML
        res.status(200).json({ text: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal terhubung ke otak Gemini' });
    }
}

4.  **Langkah Terakhir di Dashboard Vercel:**
    * Buka *dashboard* [Vercel](https://vercel.com).
    * Masuk ke proyek aplikasi RT Anda -> Buka tab **Settings** -> **Environment Variables**.
    * Tambahkan variabel baru:
        * Key: `GEMINI_API_KEY`
        * Value: *(Masukkan Kunci Rahasia Gemini yang Anda dapatkan dari Google AI Studio)*
    * Klik **Save**, lalu *Redeploy* (terapkan ulang) proyek Anda.

Dengan pengaturan ini, API Key Gemini Anda aman tersimpan di Server (Vercel) dan sama sekali tidak bisa diintip oleh warga yang nakal yang mencoba mengecek *Inspect Element* dari aplikasi HTML Anda!
