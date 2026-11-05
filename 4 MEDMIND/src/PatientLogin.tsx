import React,{useState} from 'react';
import {ArrowRight,Eye,EyeOff,LockKeyhole,UserRound} from 'lucide-react';
import {LanguageSwitch,translate,useLanguage} from './i18n';
import './patient-login.css';

type Props={logo:React.ReactNode;email:string;password:string;busy:boolean;error:string;onEmail:(value:string)=>void;onPassword:(value:string)=>void;onChoose:(email:string,password:string)=>void;onSubmit:(event:React.FormEvent)=>void};
export default function PatientLogin({logo,email,password,busy,error,onEmail,onPassword,onChoose,onSubmit}:Props){
 useLanguage();const [visible,setVisible]=useState(false);
 return <main className="patient-auth-app">
  <header className="patient-auth-header">{logo}<LanguageSwitch/></header>
  <div className="patient-auth-content">
   <div className="patient-auth-intro"><span className="eyebrow">{translate('YOUR DAILY CHECK-IN')}</span><h1>{translate('Welcome to MEDMIND')}</h1><p>{translate('Record your medicine and prepare for your next conversation.')}</p></div>
   <div className="patient-auth-photo"><img src="/patient/images/daily-medication.jpg" alt=""/><span>{translate('Your day. Your pace. Your record.')}</span></div>
   <form className="patient-auth-form" onSubmit={onSubmit} aria-label={translate('Patient sign in')}>
    <h2>{translate('Sign in')}</h2>
    <label htmlFor="patient-email">{translate('Email address')}</label>
    <input id="patient-email" name="username" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} onChange={e=>onEmail(e.target.value)} required/>
    <label htmlFor="patient-password">{translate('Password')}</label>
    <div className="patient-password-field"><input id="patient-password" name="password" type={visible?'text':'password'} autoComplete="current-password" value={password} onChange={e=>onPassword(e.target.value)} required/><button type="button" aria-label={translate(visible?'Hide password':'Show password')} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>
    {error&&<div className="error" role="alert">{translate(error)}</div>}
    <button className="primary full patient-sign-in" type="submit" disabled={busy}>{translate(busy?'Signing in…':'Sign in')}<ArrowRight size={19}/></button>
   </form>
   <section className="patient-demo-picker" aria-label={translate('Demonstration accounts')}><p>{translate('Explore with a demo account')}</p><div>{[['Jason Wong','jason@medmind.demo','jason-demo'],['Mrs. Chan','chan@medmind.demo','chan-demo']].map(([name,address,pass])=><button type="button" key={address} aria-pressed={email===address} onClick={()=>onChoose(address,pass)}><UserRound size={18}/><span>{name}</span></button>)}</div></section>
   <p className="patient-auth-privacy"><LockKeyhole size={15}/><span>{translate('You choose which doctor can see your records.')}</span></p>
   <footer className="patient-auth-footer"><p>{translate('A synthetic demonstration system · No real patient data')}</p><a href="/doctor/">{translate('Open Doctor Web')}<ArrowRight size={14}/></a></footer>
  </div>
 </main>
}
