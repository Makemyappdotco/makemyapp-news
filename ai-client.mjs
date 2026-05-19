
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const pf = process.argv[2], of = process.argv[3];
async function main() {
  try {
    const p = fs.readFileSync(pf,'utf8');
    const zai = await ZAI.create();
    const c = await zai.chat.completions.create({
      messages: [
        { role:'system', content:'You are the lead AI news editor at makemyapp. Follow format EXACTLY. Raw text only. No markdown. No code blocks.' },
        { role:'user', content:p }
      ],
      temperature:0.85, max_tokens:700
    });
    fs.writeFileSync(of, c.choices[0]?.message?.content||'');
    console.log('✅ AI done');
  } catch(e) { console.error('❌',e.message); process.exit(1); }
}
main();