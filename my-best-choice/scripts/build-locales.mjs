import fs from 'node:fs/promises';
const english=JSON.parse(await fs.readFile('locales/en.json','utf8')),seeds=JSON.parse(await fs.readFile('locales/seed-strings.json','utf8'));
await fs.writeFile('public/locale-en.mjs','// Local, reviewed UI translations. No runtime translation service.\nexport const english='+JSON.stringify(english)+';\n');
await fs.writeFile('public/locale-seeds.mjs','export const seedStrings='+JSON.stringify(seeds)+';\n');
