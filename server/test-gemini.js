const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'Missing');

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: ['Xin chào Gemini, hãy trả về JSON: {"status": "ok"}'],
    });

    console.log('Response text:', response.text);
  } catch (err) {
    console.error('Error with gemini-2.0-flash:', err.message);

    try {
      console.log('Trying gemini-1.5-flash-latest...');
      const resp2 = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: ['Hello'],
      });
      console.log('Response text 2:', resp2.text);
    } catch (err2) {
      console.error('Error with gemini-1.5-flash-latest:', err2.message);
    }
  }
}

test();
