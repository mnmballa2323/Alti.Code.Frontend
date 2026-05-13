import config from './config/index.js';
import https from 'https';

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.gemini_secret_key}`;
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available models:");
        json.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).forEach(m => console.log(m.name));
      } else {
        console.log("Error:", json);
      }
    } catch(e) { console.log(data); }
  });
});
