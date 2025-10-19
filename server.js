// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// 🔑 Replace with your Google Gemini API key
const GEMINI_API_KEY = "AIzaSyDM3lTeov6Smi-hd8Oh_AxUDSBHHIjO2MA";

app.post('/ask', upload.single('image'), async (req, res) => {
    const question = req.body.question || "Please answer this question.";
    let imageData = "";
    if (req.file) {
        imageData = fs.readFileSync(req.file.path, { encoding: 'base64' });
        fs.unlinkSync(req.file.path);
    }

    const body = {
        contents: [
            { parts: [{ text: question }] }
        ]
    };

    if (imageData) {
        body.contents[0].parts.push({
            inline_data: { mime_type: req.file.mimetype, data: imageData }
        });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer received";
        res.json({ success: true, answer });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
