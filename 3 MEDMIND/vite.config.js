import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig(({mode})=>{
 const surface=mode==='doctor'?'doctor':'patient';
 return {root:path.resolve(`apps/medmind-${surface}`),base:`/${surface}/`,publicDir:path.resolve('public'),plugins:[react()],build:{outDir:path.resolve(`dist/${surface}`),emptyOutDir:true},server:{port:surface==='patient'?5173:5174,proxy:{'/api':'http://127.0.0.1:3001'}}};
});
