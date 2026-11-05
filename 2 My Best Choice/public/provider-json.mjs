// Normalize a complete JSON code fence without accepting prose or partial results.
export function parseProviderJSON(content){if(typeof content!=='string')throw new SyntaxError('Expected JSON text');let text=content.trim();if(/^```(?:json)?\s*\n/i.test(text)&&text.endsWith('```'))text=text.replace(/^```(?:json)?\s*\n/i,'').slice(0,-3).trim();return JSON.parse(text);}
