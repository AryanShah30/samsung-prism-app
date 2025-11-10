import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import formidable from 'formidable';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: false, // We'll handle multipart form-data via formidable
    sizeLimit: '10mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: false, keepExtensions: true });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const imageFile = files.image || files.file || files.photo;
    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageData = Array.isArray(imageFile) ? imageFile[0] : imageFile;
    const imagePath = imageData.filepath || imageData.path;

    // Use Gemini 2.5 Flash only. If no key configured, return error.
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const b64 = fs.readFileSync(imagePath, { encoding: 'base64' });

      const prompt = `You are a food recognition assistant. Analyze the attached image and RETURN ONLY valid JSON (no extra text) with keys: label (string or null), confidence (number between 0 and 1), estimated_expiry_days (integer, days until expiry), estimated_volume_ml (number, estimated volume in milliliters), and category (string or null). Example: {"label":"apple","confidence":0.92,"estimated_expiry_days":7,"estimated_volume_ml":150,"category":"Fruits"}. If you cannot identify a value, use null or 0 as appropriate.`;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: b64,
            mimeType: imageData.mimetype || 'image/jpeg'
          }
        }
      ], {
        temperature: 0,
        maxOutputTokens: 512,
      });

      const responseText = result.response.text().trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({ error: 'Invalid Gemini response', raw: responseText });
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return res.status(200).json({
        label: parsed.label ?? null,
        confidence: parsed.confidence ?? 0,
        estimated_expiry_days: parsed.estimated_expiry_days ?? null,
        estimated_volume_ml: parsed.estimated_volume_ml ?? null,
        category: parsed.category ?? null,
        provider: 'gemini',
        raw: parsed,
      });
    } catch (e) {
      console.error('Gemini detection error:', e);
      return res.status(500).json({ error: 'Gemini detection failed', details: e.message });
    }
  } catch (err) {
    console.error('Detect API error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
