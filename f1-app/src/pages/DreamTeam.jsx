import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/DreamTeam.module.css";



/* =======================
   STORAGE KEYS
======================= */
const LS_KEY = "f1_manager_save_v2";
const SLOTS_KEY = "f1_manager_slots_v1";

/* =======================
   ANTI-SPAM ECONOMY GUARDS
======================= */
const MAX_WALLET = 20;          
const DAILY_CAP = 12;           
const COOLDOWN_MS = 25_000;     

/* =======================
   DATA
======================= */
const DRIVERS = [
  { id:"verstappen", name:"Max Verstappen", team:"Red Bull", cost:36, pace:98, quali:97, race:97, consistency:96, flag:"🇳🇱" },
  { id:"norris",     name:"Lando Norris",   team:"McLaren",  cost:32, pace:94, quali:94, race:93, consistency:92, flag:"🇬🇧" },
  { id:"piastri",    name:"Oscar Piastri",  team:"McLaren",  cost:30, pace:93, quali:92, race:93, consistency:92, flag:"🇦🇺" },
  { id:"leclerc",    name:"Charles Leclerc",team:"Ferrari",  cost:31, pace:94, quali:96, race:90, consistency:90, flag:"🇲🇨" },
  { id:"hamilton",   name:"Lewis Hamilton", team:"Ferrari",  cost:29, pace:92, quali:92, race:93, consistency:95, flag:"🇬🇧" },
  { id:"russell",    name:"George Russell", team:"Mercedes", cost:27, pace:91, quali:92, race:90, consistency:91, flag:"🇬🇧" },
  { id:"antonelli",  name:"Kimi Antonelli", team:"Mercedes", cost:17, pace:85, quali:84, race:84, consistency:82, flag:"🇮🇹" },
  { id:"sainz",      name:"Carlos Sainz",   team:"Williams", cost:26, pace:90, quali:91, race:90, consistency:92, flag:"🇪🇸" },
  { id:"albon",      name:"Alex Albon",     team:"Williams", cost:18, pace:86, quali:85, race:85, consistency:85, flag:"🇹🇭" },
  { id:"alonso",     name:"Fernando Alonso",team:"Aston",    cost:24, pace:90, quali:89, race:90, consistency:93, flag:"🇪🇸" },
  { id:"stroll",     name:"Lance Stroll",   team:"Aston",    cost:14, pace:80, quali:81, race:80, consistency:83, flag:"🇨🇦" },
  { id:"tsunoda",    name:"Yuki Tsunoda",   team:"RB",       cost:18, pace:86, quali:86, race:85, consistency:84, flag:"🇯🇵" },
  { id:"lawson",     name:"Liam Lawson",    team:"RB",       cost:14, pace:82, quali:82, race:82, consistency:82, flag:"🇳🇿" },
  { id:"hulkenberg", name:"Nico Hülkenberg",team:"Sauber",   cost:16, pace:84, quali:85, race:83, consistency:86, flag:"🇩🇪" },
  { id:"bortoleto",  name:"Gabriel Bortoleto",team:"Sauber", cost:12, pace:80, quali:80, race:80, consistency:80, flag:"🇧🇷" },
  { id:"gasly",      name:"Pierre Gasly",   team:"Alpine",   cost:16, pace:84, quali:84, race:83, consistency:84, flag:"🇫🇷" },
  { id:"colapinto",  name:"Franco Colapinto",team:"Alpine",  cost:12, pace:79, quali:79, race:79, consistency:80, flag:"🇦🇷" },
  { id:"ocon",       name:"Esteban Ocon",   team:"Haas",     cost:16, pace:84, quali:83, race:83, consistency:84, flag:"🇫🇷" },
  { id:"bearman",    name:"Oliver Bearman", team:"Haas",     cost:14, pace:82, quali:82, race:81, consistency:82, flag:"🇬🇧" },
  { id:"doohan",     name:"Jack Doohan",    team:"Alpine",   cost:12, pace:79, quali:79, race:79, consistency:79, flag:"🇦🇺" },
];
const CHASSIS = [
  { id:"mclaren",  name:"McLaren",  cost:28, aero:94, mechGrip:92, tireDeg:90, weight:88, color:"#ff8000" },
  { id:"ferrari",  name:"Ferrari",  cost:27, aero:92, mechGrip:90, tireDeg:88, weight:88, color:"#e10600" },
  { id:"redbull",  name:"Red Bull", cost:26, aero:91, mechGrip:90, tireDeg:89, weight:89, color:"#1435aa" },
  { id:"mercedes", name:"Mercedes", cost:24, aero:89, mechGrip:88, tireDeg:88, weight:90, color:"#27f3e6" },
  { id:"aston",    name:"Aston",    cost:20, aero:86, mechGrip:86, tireDeg:85, weight:90, color:"#229971" },
  { id:"williams", name:"Williams", cost:18, aero:84, mechGrip:84, tireDeg:83, weight:91, color:"#0072c6" },
  { id:"sauber",   name:"Sauber",   cost:17, aero:83, mechGrip:83, tireDeg:82, weight:92, color:"#52e252" },
  { id:"rb",       name:"Racing Bulls", cost:18, aero:84, mechGrip:84, tireDeg:83, weight:91, color:"#465baa" },
  { id:"alpine",   name:"Alpine",   cost:17, aero:83, mechGrip:83, tireDeg:82, weight:92, color:"#2293d1" },
  { id:"haas",     name:"Haas",     cost:16, aero:82, mechGrip:82, tireDeg:81, weight:93, color:"#bababa" },
];
const ENGINES = [
  { id:"mercedesPU", name:"Mercedes PU", cost:18, power:92, reliability:93, efficiency:91 },
  { id:"ferrariPU",  name:"Ferrari PU",  cost:17, power:91, reliability:90, efficiency:90 },
  { id:"hondaPU",    name:"Honda RBPT",  cost:17, power:92, reliability:89, efficiency:89 },
  { id:"renaultPU",  name:"Renault PU",  cost:15, power:88, reliability:88, efficiency:87 },
];
const PRINCIPALS = [
  { id:"seidl",     name:"Andreas Seidl",    strategy:92, risk:80, cost:6 },
  { id:"vasseur",   name:"Fred Vasseur",     strategy:90, risk:78, cost:6 },
  { id:"horner",    name:"Christian Horner", strategy:91, risk:77, cost:6 },
  { id:"wolff",     name:"Toto Wolff",       strategy:89, risk:75, cost:5 },
  { id:"szafnauer", name:"Otmar Szafnauer",  strategy:83, risk:72, cost:3 },
];
const PIT = [
  { id:"stock",    name:"Stock Crew",    cost:0, stopSkill:80, reliability:82 },
  { id:"silver",   name:"Silver Crew",   cost:3, stopSkill:86, reliability:85 },
  { id:"gold",     name:"Gold Crew",     cost:6, stopSkill:91, reliability:88 },
  { id:"platinum", name:"Platinum Crew", cost:9, stopSkill:94, reliability:91 },
];
const COMP = {
  mclaren: { mercedesPU:+2, ferrariPU:0, hondaPU:+1, renaultPU:-1 },
  ferrari: { ferrariPU:+2, mercedesPU:0, hondaPU:0, renaultPU:-1 },
  redbull: { hondaPU:+2, mercedesPU:0, ferrariPU:0, renaultPU:-2 },
  mercedes:{ mercedesPU:+2, ferrariPU:0, hondaPU:0, renaultPU:-1 },
  aston:   { mercedesPU:+1, ferrariPU:0, hondaPU:0, renaultPU:-1 },
  williams:{ mercedesPU:+1, ferrariPU:0, hondaPU:0, renaultPU:-1 },
  sauber:  { ferrariPU:+1, mercedesPU:0, hondaPU:0, renaultPU:-1 },
  rb:      { hondaPU:+1, mercedesPU:0, ferrariPU:0, renaultPU:-1 },
  alpine:  { renaultPU:+2, mercedesPU:-1, ferrariPU:-1, hondaPU:-1 },
  haas:    { ferrariPU:+1, mercedesPU:0, hondaPU:0, renaultPU:-1 },
};
const TRACKS = [
  { id:"balanced",      name:"Balanced",       w:{ aero:.25, mech:.25, power:.25, tire:.25 }, sd:4 },
  { id:"highDownforce", name:"High Downforce", w:{ aero:.40, mech:.30, power:.15, tire:.15 }, sd:3.5 },
  { id:"power",         name:"Power (Monza)",  w:{ aero:.10, mech:.20, power:.55, tire:.15 }, sd:4.5 },
  { id:"street",        name:"Street",         w:{ aero:.20, mech:.45, power:.15, tire:.20 }, sd:4.2 },
];
const CALENDAR = [
  { gp:"Bahrain",   track:"balanced" },
  { gp:"Jeddah",    track:"street" },
  { gp:"Australia", track:"balanced" },
  { gp:"Japan",     track:"highDownforce" },
  { gp:"China",     track:"balanced" },
  { gp:"Miami",     track:"street" },
  { gp:"Imola",     track:"highDownforce" },
  { gp:"Monaco",    track:"street" },
  { gp:"Spain",     track:"balanced" },
  { gp:"Canada",    track:"balanced" },
  { gp:"Austria",   track:"power" },
  { gp:"Britain",   track:"balanced" },
  { gp:"Belgium",   track:"power" },
  { gp:"Netherlands",track:"highDownforce" },
  { gp:"Italy",     track:"power" },
  { gp:"Abu Dhabi", track:"balanced" },
];
const RIVALS = [
  { name:"McLaren",  combo:{ d1:"norris", d2:"piastri", ch:"mclaren",  pu:"mercedesPU", tp:"seidl",     pit:"gold" } },
  { name:"Red Bull", combo:{ d1:"verstappen", d2:"tsunoda", ch:"redbull", pu:"hondaPU",   tp:"horner",    pit:"gold" } },
  { name:"Ferrari",  combo:{ d1:"leclerc", d2:"hamilton", ch:"ferrari",  pu:"ferrariPU", tp:"vasseur",   pit:"gold" } },
  { name:"Mercedes", combo:{ d1:"russell", d2:"antonelli", ch:"mercedes",pu:"mercedesPU",tp:"wolff",     pit:"gold" } },
  { name:"Aston",    combo:{ d1:"alonso", d2:"stroll",   ch:"aston",    pu:"mercedesPU",tp:"szafnauer",  pit:"silver" } },
  { name:"Williams", combo:{ d1:"sainz",  d2:"albon",    ch:"williams", pu:"mercedesPU",tp:"szafnauer",  pit:"gold" } },
  { name:"RB",       combo:{ d1:"tsunoda",d2:"lawson",   ch:"rb",       pu:"hondaPU",   tp:"horner",     pit:"silver" } },
  { name:"Sauber",   combo:{ d1:"hulkenberg", d2:"bortoleto", ch:"sauber", pu:"ferrariPU", tp:"szafnauer", pit:"silver" } },
  { name:"Alpine",   combo:{ d1:"gasly", d2:"colapinto", ch:"alpine",   pu:"renaultPU", tp:"szafnauer",  pit:"silver" } },
];

const FIA_PTS = [25,18,15,12,10,8,6,4,2,1];
const clamp = (n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const initials = (name)=>name.split(" ").map(s=>s[0]).join("").toUpperCase().slice(0,2);

/* =======================
   SPONSORS (simple economy)
======================= */
const SPONSORS = [
  { id:"bronze", name:"Bronze", base:3, bonus:{ podium:1, doublePoints:1 }, desc:"Small retainer. Rewards consistent points." },
  { id:"silver", name:"Silver", base:4, bonus:{ podium:2, pole:1 },        desc:"Better retainer. Loves podiums and poles." },
  { id:"gold",   name:"Gold",   base:5, bonus:{ podium:3, fastest:1, doublePoints:1 }, desc:"High retainer. Pays for big results." },
];

/* =======================
   HELPERS / STATS
======================= */
function costOf(sel){
  const getCost=(list,id)=>list.find(x=>x.id===id)?.cost||0;
  return getCost(DRIVERS,sel.d1)+getCost(DRIVERS,sel.d2)+getCost(CHASSIS,sel.ch)+getCost(ENGINES,sel.pu)+getCost(PRINCIPALS,sel.tp)+getCost(PIT,sel.pit);
}
function chemistryBonus(d1,d2){
  let b=0;
  if(d1.team===d2.team) b+=1.5;
  if(d1.quali>=95 && d2.race>=95) b+=1;
  if(Math.abs(d1.consistency-d2.consistency)<=2) b+=.5;
  return b;
}
function computeStats(sel, trackId="balanced", upgrades){
  if(!sel.d1||!sel.d2||!sel.ch||!sel.pu||!sel.tp||!sel.pit)
    return { overall:0, pace:0, quali:0, race:0, reliability:0, color:"#e10600", strat:80 };

  const d1 = DRIVERS.find(d=>d.id===sel.d1);
  const d2 = DRIVERS.find(d=>d.id===sel.d2);
  const ch = CHASSIS.find(c=>c.id===sel.ch);
  const pu = ENGINES.find(e=>e.id===sel.pu);
  const tp = PRINCIPALS.find(p=>p.id===sel.tp);
  const pit= PIT.find(p=>p.id===sel.pit);
  const w  = TRACKS.find(t=>t.id===trackId)?.w || TRACKS[0].w;

  const u = upgrades || { aero:0, power:0, mech:0, rel:0, pit:0 };
  const aero = ch.aero + u.aero*1.5;
  const mech = ch.mechGrip + u.mech*1.5;
  const tire = ch.tireDeg + u.mech*0.6;
  const weight = Math.max(80, ch.weight - u.mech*0.8);
  const puPow = pu.power + u.power*1.4;
  const puRel = pu.reliability + u.rel*1.6;
  const pitStop = (pit?.stopSkill ?? 80) + u.pit*1.8;
  const pitRel  = (pit?.reliability ?? 82) + u.pit*1.0;
  const tpStrategy = (tp?.strategy ?? 80);

  const dPace  = (d1.pace + d2.pace)/2;
  const dQuali = (d1.quali + d2.quali)/2;
  const dRace  = (d1.race + d2.race)/2;
  const dCons  = (d1.consistency + d2.consistency)/2;

  const carGrip = aero*w.aero + mech*w.mech + tire*w.tire + (100 - weight)*0.10;
  const power   = puPow*w.power + (pu.efficiency)*0.15;

  const reli    = (puRel*0.5 + dCons*0.2 + pitRel*0.15 + (tp?.risk ?? 75)*0.15);
  const comp = (COMP[sel.ch]?.[sel.pu] ?? 0);
  const chem = chemistryBonus(d1,d2);

  const pace   = clamp(dPace*0.55 + carGrip*0.25 + power*0.20 + comp*1.2);
  const quali  = clamp(dQuali*0.65 + carGrip*0.25 + power*0.10 + comp*0.8);
  const race   = clamp(dRace*0.45 + carGrip*0.25 + power*0.15 + reli*0.15 + comp*1.0);
  const reliSc = clamp(reli + chem*2);
  const overall = Math.round(pace*0.35 + quali*0.20 + race*0.30 + reliSc*0.15 + chem*1.2);
  return { overall, pace:Math.round(pace), quali:Math.round(quali), race:Math.round(race), reliability:Math.round(reliSc), color:CHASSIS.find(c=>c.id===sel.ch)?.color || "#e10600", strat:tpStrategy };
}
function normalNoise(sd=3){
  let u=0,v=0; while(u===0) u=Math.random(); while(v===0) v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*sd;
}

/* =======================
   SIM
======================= */
function makeField(userSel){
  const field = [{ team:"You", d1:userSel.d1, d2:userSel.d2, combo:userSel, isUser:true }];
  RIVALS.forEach(r => field.push({ team:r.name, d1:r.combo.d1, d2:r.combo.d2, combo:r.combo, isUser:false }));
  return field;
}
function qualiSession(userSel, trackId, upgrades){
  const field = makeField(userSel);
  const entries = [];
  field.forEach(entry=>{
    ["d1","d2"].forEach(slot=>{
      const driver = DRIVERS.find(d=>d.id===entry[slot]);
      const base = computeStats(entry.combo, trackId, entry.isUser?upgrades:undefined).quali*0.6 + (driver?.quali||0)*0.4;
      const noise = normalNoise(3.8);
      entries.push({ team: entry.team, driver: driver?.name || "Unknown", isUser: entry.isUser, score: base + noise });
    });
  });
  const grid = entries.sort((a,b)=>b.score-a.score).map((x,i)=>({ pos:i+1, ...x }));
  return grid;
}
function dnfChanceFor(sel, trackId, upgrades){
  const rel = computeStats(sel, trackId, upgrades).reliability || 80;
  const base = clamp(12 - rel/10, 0.5, 8);
  return base/100;
}
function raceSession(userSel, trackId, grid, upgrades){
  const safetyCar = Math.random() < 0.27;
  const sd = safetyCar ? 3.2 : 4.0;
  const results = grid.map(row=>{
    const sel = row.team==="You" ? userSel : (RIVALS.find(r=>r.name===row.team)?.combo);
    const upgradesMaybe = row.team==="You" ? upgrades : undefined;
    const raceStat = computeStats(sel, trackId, upgradesMaybe).race;
    const gridPenalty = (row.pos-1)*0.7;
    const jitter = normalNoise(sd);
    const dnf = Math.random() < dnfChanceFor(sel, trackId, upgradesMaybe);
    const score = dnf ? -9999 : raceStat*0.9 - gridPenalty + jitter;
    return { ...row, dnf, raceScore:Math.round(score) };
  });
  const classified = results.filter(r=>!r.dnf).sort((a,b)=>b.raceScore-a.raceScore)
                    .concat(results.filter(r=>r.dnf));
  const withPoints = classified.map((r,i)=>({
    pos:i+1, team:r.team, driver:r.driver, isUser:r.isUser, dnf:r.dnf, score:r.raceScore,
    points: r.dnf ? 0 : (FIA_PTS[i] || 0)
  }));
  const cons = {};
  withPoints.forEach(r=>{ cons[r.team] = (cons[r.team]||0) + r.points; });
  return { results: withPoints, constructors: cons, safetyCar };
}
function weekend(userSel, trackId, upgrades){
  const quali = qualiSession(userSel, trackId, upgrades);
  const race = raceSession(userSel, trackId, quali, upgrades);
  return { quali, ...race };
}
function autoSeason(userSel, upgrades){
  const perRace = [];
  const driverTable = {};
  const consTable = {};
  CALENDAR.forEach(round=>{
    const wk = weekend(userSel, round.track, upgrades);
    perRace.push({ gp:round.gp, track:round.track, ...wk });
    wk.results.forEach(r=>{
      driverTable[r.driver]=(driverTable[r.driver]||0)+r.points;
      consTable[r.team]=(consTable[r.team]||0)+r.points;
    });
  });
  const drivers = Object.entries(driverTable).map(([name,pts])=>({name,pts})).sort((a,b)=>b.pts-a.pts);
  const cons    = Object.entries(consTable).map(([team,pts])=>({team,pts})).sort((a,b)=>b.pts-a.pts);
  return { perRace, drivers, cons };
}

/* =======================
   SLOTS
======================= */
function loadSlots() {
  try { return JSON.parse(localStorage.getItem(SLOTS_KEY)) || { slot1:null, slot2:null, slot3:null }; }
  catch { return { slot1:null, slot2:null, slot3:null }; }
}
function saveSlots(slots) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

/* =======================
   MAIN COMPONENT
======================= */
export default function Manager(){
  const [teamName, setTeamName] = useState("Your F1 Team");
  const [budget, setBudget] = useState(110);
  const [sel, setSel] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.sel || { d1:"", d2:"", ch:"", pu:"", tp:"", pit:"stock" };
  });
  const [track, setTrack] = useState("balanced");
  const [dev, setDev] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.dev || { points:0, aero:0, power:0, mech:0, rel:0, pit:0 };
  });
  const [funds, setFunds] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.funds ?? 0; 
  });
  const [sponsor, setSponsor] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.sponsor || "bronze";
  });

  const [lastWeekend, setLastWeekend] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.lastWeekend || null;
  });
  const [season, setSeason] = useState(null);

  const [seasonYear, setSeasonYear] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.seasonYear || 2025;
  });
  const [history, setHistory] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.history || [];
  });

  const [slots, setSlots] = useState(loadSlots);

  // anti-spam: daily cap + cooldown
  const [limit, setLimit] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    const today = new Date().toDateString();
    return saved.limit || { date: today, earned: 0 };
  });
  const [nextAllowedAt, setNextAllowedAt] = useState(()=> {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.nextAllowedAt || 0;
  });

  // persist
  useEffect(()=>{
    localStorage.setItem(LS_KEY, JSON.stringify({ sel, dev, teamName, budget, lastWeekend, season, seasonYear, history, sponsor, funds, limit, nextAllowedAt }));
  }, [sel, dev, teamName, budget, lastWeekend, season, seasonYear, history, sponsor, funds, limit, nextAllowedAt]);

  const total = costOf(sel);
  const remaining = budget - total;
  const canRace = sel.d1 && sel.d2 && sel.ch && sel.pu && sel.tp && sel.pit && remaining >= 0;
  const stats = computeStats(sel, track, dev);

  // options
  const driverOptions = (other) => DRIVERS.map(d=>(
    <option key={d.id} value={d.id} disabled={d.id===other}>
      {d.flag} {d.name} — {d.team} · {d.cost}
    </option>
  ));
  const chassisOptions = CHASSIS.map(c=> <option key={c.id} value={c.id}>{c.name} · {c.cost}</option>);
  const engineOptions  = ENGINES.map(e=> <option key={e.id} value={e.id}>{e.name} · {e.cost}</option>);
  const tpOptions      = PRINCIPALS.map(p=> <option key={p.id} value={p.id}>{p.name} · {p.cost}</option>);
  const pitOptions     = PIT.map(p=> <option key={p.id} value={p.id}>{p.name} · {p.cost}</option>);
  const trackOptions   = TRACKS.map(t=> <option key={t.id} value={t.id}>{t.name}</option>);

  // pickers
  const setPick = (k,v)=>{
    if ((k==="d1" && v===sel.d2) || (k==="d2" && v===sel.d1)) return alert("Pick two different drivers 🙂");
    setSeason(null); setLastWeekend(null);
    setSel(s=>({ ...s, [k]: v }));
  };

  // economy helpers
  function addDevPoints(n){
    setDev(d => ({ ...d, points: Math.min(MAX_WALLET, d.points + n) }));
  }
  function canEarn(n=0){
    const today = new Date().toDateString();
    if (limit.date !== today) {
      setLimit({ date: today, earned: 0 });
      return true;
    }
    return limit.earned + n <= DAILY_CAP;
  }
  function earn(n){
    const today = new Date().toDateString();
    setLimit(l => (l.date !== today ? { date: today, earned: n } : { ...l, earned: l.earned + n }));
    addDevPoints(n);
  }
  function gate(){
    const now = Date.now();
    if (now < nextAllowedAt) {
      const s = Math.ceil((nextAllowedAt - now)/1000);
      alert(`Cooldown… wait ${s}s`);
      return false;
    }
    setNextAllowedAt(now + COOLDOWN_MS);
    return true;
  }

  // sponsor payouts (funds)
  function sponsorPayout(wk){
    const sp = SPONSORS.find(s=>s.id===sponsor) || SPONSORS[0];
    let payout = sp.base; 
    const you = wk.results.filter(r=>r.isUser);
    const bestPos = Math.min(...you.map(r=>r.pos));
    const bothScored = you.filter(x=>x.points>0).length===2;
    const pole = wk.quali[0]?.isUser;
    const fastest = !wk.safetyCar && Math.random() < 0.18 && you.some(x=>!x.dnf); 

    if (sp.bonus.podium && bestPos<=3) payout += sp.bonus.podium;
    if (sp.bonus.doublePoints && bothScored) payout += sp.bonus.doublePoints;
    if (sp.bonus.pole && pole) payout += sp.bonus.pole;
    if (sp.bonus.fastest && fastest) payout += sp.bonus.fastest;

    setFunds(f => f + payout);
    return payout;
  }

  // upgrades purchase
  const upgradeCost = (lvl)=> [3,4,5,6,8][Math.min(lvl,4)];
  const buy = (key)=>{
    const lvl = dev[key];
    const cost = upgradeCost(lvl);
    if (dev.points < cost) return;
    setDev(d=>({ ...d, [key]: lvl+1, points: d.points - cost }));
  };

  // funds converters
  function buyDevWithFunds(){
    if (funds < 2) return alert("Need 2 funds");
    if (dev.points >= MAX_WALLET) return alert("Dev Point wallet full");
    setFunds(f => f - 2);
    addDevPoints(1);
  }
  function buyBudgetWithFunds(){
    if (funds < 3) return alert("Need 3 funds");
    setFunds(f => f - 3);
    setBudget(b => Math.min(140, b + 1));
  }

  // reset + slots
  function reset(){
    setSel({ d1:"", d2:"", ch:"", pu:"", tp:"", pit:"stock" });
    setDev({ points:0, aero:0, power:0, mech:0, rel:0, pit:0 });
    setSeason(null); setLastWeekend(null); setBudget(110); setTeamName("Your F1 Team");
    setFunds(0); setSponsor("bronze");
  }
  function snapshot() {
    return {
      meta: { savedAt: Date.now(), seasonYear, teamName, sponsor },
      state: { sel, dev, budget, lastWeekend, season, history, seasonYear, sponsor, funds, limit, nextAllowedAt }
    };
  }
  function restore(snap) {
    if (!snap) return;
    const { state } = snap;
    setSel(state.sel);
    setDev(state.dev);
    setBudget(state.budget);
    setLastWeekend(state.lastWeekend || null);
    setSeason(state.season || null);
    setHistory(state.history || []);
    setSeasonYear(state.seasonYear || 2025);
    setSponsor(state.sponsor || "bronze");
    setFunds(state.funds ?? 0);
    setLimit(state.limit || { date:new Date().toDateString(), earned:0 });
    setNextAllowedAt(state.nextAllowedAt || 0);
  }
  function saveToSlot(slotKey) {
    const next = { ...slots, [slotKey]: snapshot() };
    setSlots(next);
    saveSlots(next);
  }
  function loadFromSlot(slotKey) {
    const snap = slots[slotKey];
    if (!snap) return alert("Empty slot");
    restore(snap);
  }
  function deleteSlot(slotKey) {
    if (!slots[slotKey]) return;
    if (!confirm("Delete this save?")) return;
    const next = { ...slots, [slotKey]: null };
    setSlots(next);
    saveSlots(next);
  }

  // WEEKEND + rewards
  function runWeekend(){
    if (!canRace || !gate()) return;
    const wk = weekend(sel, track, dev);
    setLastWeekend({ gp: "Exhibition", track, ...wk });

    // Dev points: P1=5..P6=0; +2 if both score
    const you = wk.results.filter(r=>r.isUser);
    const bestPos = Math.min(...you.map(r=>r.pos));
    let gained = Math.max(0, 6 - bestPos);
    const bothScored = you.filter(x=>x.points>0).length===2;
    if (bothScored) gained += 2;

    if (gained>0 && canEarn(gained)) earn(gained);

    // Sponsor payout → funds
    sponsorPayout(wk);
  }

  function runAutoSeason(){
    if (!canRace || !gate()) return;
    const s = autoSeason(sel, dev);
    setSeason(s);

    // record champions & bump year
    const consChamp = s.cons[0]?.team || "—";
    const drvChamp  = s.drivers[0]?.name || "—";
    setHistory(h => [{ year: seasonYear, consChampion: consChamp, drvChampion: drvChamp }, ...h].slice(0, 20));
    setSeasonYear(y => y + 1);

    // season Dev bonus
    const youConstructor = s.cons.find(t=>t.team==="You");
    const bonus = youConstructor ? Math.round(youConstructor.pts/25) : 0;
    if (bonus>0 && canEarn(bonus)) earn(bonus);

    // sponsor funds over the calendar (sum of bases + approx bonuses)
    const base = SPONSORS.find(sp=>sp.id===sponsor)?.base ?? 3;
    // rough: 16 rounds * base + tiny bonus factor if top 3 constructor
    const top3 = s.cons.slice(0,3).some(t=>t.team==="You");
    const totalFunds = 16*base + (top3? 10 : 4);
    setFunds(f => f + totalFunds);
  }

  // UI bits
  const cooldownLeft = Math.max(0, nextAllowedAt - Date.now());
  const cooldownSecs = Math.ceil(cooldownLeft/1000);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.h1}>🛠️ F1 Manager — Build • Upgrade • Win</h1>
          <div className={styles.actions}>
            <div className={styles.devBadgePro}>Season: <strong>{seasonYear}</strong></div>
            <button className={styles.btn} onClick={reset}>Reset</button>
          </div>
        </header>

        {/* PROFILES */}
        <div className={styles.simBlock}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Profiles</h3>
            <div className={styles.devBadgePro}>Dev Pts: <strong>{dev.points}/{MAX_WALLET}</strong></div>
          </div>
          <div className={styles.profileGrid}>
            {["slot1","slot2","slot3"].map((key, i) => {
              const snap = slots[key];
              const title = snap ? (snap.meta.teamName || `Career ${i+1}`) : `Empty Slot ${i+1}`;
              const sub   = snap ? new Date(snap.meta.savedAt).toLocaleString() : "—";
              return (
                <div key={key} className={styles.profileCard}>
                  <div className={styles.profileHead}>
                    <div className={styles.profileTitle}>{title}</div>
                    <div className={styles.profileSub}>{sub}</div>
                  </div>
                  <div className={styles.profileBtns}>
                    <button className={styles.btnGhost} onClick={() => saveToSlot(key)}>Save</button>
                    <button className={styles.btnPrimary} disabled={!snap} onClick={() => loadFromSlot(key)}>Load</button>
                    <button className={styles.btnDanger} disabled={!snap} onClick={() => deleteSlot(key)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
          {history.length > 0 && (
            <>
              <h4 style={{marginTop:12}}>Career History</h4>
              <ul className={styles.historyList}>
                {history.slice(0,8).map((h,idx)=>(
                  <li key={idx}>
                    <strong>{h.year}</strong> — Constructors: {h.consChampion} · Drivers: {h.drvChampion}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* SPONSOR / ECONOMY */}
        <div className={styles.simBlock}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Sponsorship & Economy</h3>
            <div className={styles.fundsBadge}>Funds: <strong>{funds}</strong></div>
          </div>
          <div className={styles.sponsorGrid}>
            {SPONSORS.map(sp=>(
              <div key={sp.id} className={`${styles.sponsorCard} ${sponsor===sp.id ? styles.active : ""}`} onClick={()=>setSponsor(sp.id)}>
                <div className={styles.sponsorHeader}>
                  <div className={styles.sponsorTitle}>{sp.name}</div>
                  <div className={styles.sponsorPill}>Base +{sp.base}</div>
                </div>
                <div className={styles.sponsorDesc}>{sp.desc}</div>
                <div className={styles.sponsorPerks}>
                  {Object.entries(sp.bonus).map(([k,v])=>(
                    <div key={k} className={styles.perk}>+{v} {k}</div>
                  ))}
                </div>
                <div className={styles.sponsorPick}>{sponsor===sp.id ? "Selected" : "Pick"}</div>
              </div>
            ))}
          </div>
          <div className={styles.convertRow}>
            <button className={styles.btn} onClick={buyDevWithFunds}>Convert 2 Funds → +1 Dev Pt</button>
            <button className={styles.btn} onClick={buyBudgetWithFunds}>Convert 3 Funds → +1 Budget Cap</button>
            <div className={styles.capNote}>Daily Dev cap: {limit.earned}/{DAILY_CAP}</div>
          </div>
        </div>

        {/* BUILDER */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>Team name</label>
            <input className={styles.input} value={teamName} onChange={e=>setTeamName(e.target.value)} />
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Driver 1</label>
              <select className={styles.select} value={sel.d1} onChange={e=>setPick("d1", e.target.value)}>
                <option value="">— Select —</option>
                {driverOptions(sel.d2)}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Driver 2</label>
              <select className={styles.select} value={sel.d2} onChange={e=>setPick("d2", e.target.value)}>
                <option value="">— Select —</option>
                {driverOptions(sel.d1)}
              </select>
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Chassis</label>
              <select className={styles.select} value={sel.ch} onChange={e=>setPick("ch", e.target.value)}>
                <option value="">— Select —</option>
                {chassisOptions}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Engine</label>
              <select className={styles.select} value={sel.pu} onChange={e=>setPick("pu", e.target.value)}>
                <option value="">— Select —</option>
                {engineOptions}
              </select>
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Team Principal</label>
              <select className={styles.select} value={sel.tp} onChange={e=>setPick("tp", e.target.value)}>
                <option value="">— Select —</option>
                {tpOptions}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Pit Crew</label>
              <select className={styles.select} value={sel.pit} onChange={e=>setPick("pit", e.target.value)}>
                {pitOptions}
              </select>
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Track (for Weekend)</label>
              <select className={styles.select} value={track} onChange={e=>setTrack(e.target.value)}>
                {trackOptions}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Budget</label>
              <input type="number" className={styles.input} min={90} max={140} value={budget} onChange={e=>{ setBudget(Number(e.target.value||110)); }} />
              <div className={styles.budgetBarWrap}>
                <div className={styles.budgetBar}>
                  <div className={`${styles.budgetFill} ${budget-total<0?styles.over:""}`} style={{ width:`${Math.min(100, Math.round((total/Math.max(1,budget))*100))}%` }} />
                </div>
                <div className={styles.budgetText}>Total {total} / {budget} • {budget-total>=0?`${budget-total} left`:`${total-budget} over`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM CARD */}
        <div className={styles.card} style={{ ["--team"]: stats.color }}>
          <div className={styles.cardHeader}>
            <div className={styles.badge}/>
            <div>
              <div className={styles.cardTitle}>{teamName}</div>
              <div className={styles.cardSub}>
                {sel.ch ? CHASSIS.find(c=>c.id===sel.ch)?.name : "—"} • {sel.pu ? ENGINES.find(e=>e.id===sel.pu)?.name : "—"} • {sel.tp ? PRINCIPALS.find(p=>p.id===sel.tp)?.name : "—"}
              </div>
            </div>
            <div className={styles.overall}>
              <div className={styles.overallNum}>{stats.overall || "—"}</div>
              <div className={styles.overallLabel}>OVR</div>
            </div>
          </div>

          <div className={styles.driversRow}>
            <DriverChip id={sel.d1} />
            <DriverChip id={sel.d2} />
          </div>

          <div className={styles.statsGrid}>
            <StatBar label="Pace" value={stats.pace} />
            <StatBar label="Quali" value={stats.quali} />
            <StatBar label="Race" value={stats.race} />
            <StatBar label="Reliability" value={stats.reliability} />
          </div>
        </div>

        {/* UPGRADES */}
        <div className={`${styles.simBlock} ${styles.upgradesBlock}`}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Upgrades</h3>
            <div className={styles.devBadgePro}>Dev Pts: <strong>{dev.points}/{MAX_WALLET}</strong></div>
          </div>
          <p className={styles.simHint}>
            Lv cost: 3,4,5,6,8. Effects/level → <b>Aero</b> +1.5, <b>Power</b> +1.4, <b>Mechanical</b> +1.5 grip / +0.6 tire / −0.8 weight,
            <b> Reliability</b> +1.6, <b>Pit</b> +1.8 stop / +1.0 rel.
          </p>
          <div className={styles.upgradeGrid}>
            <UpgradeCard name="Aero"        lvl={dev.aero}  cost={upgradeCost(dev.aero)}  can={dev.points >= upgradeCost(dev.aero)}  onBuy={() => buy("aero")}  desc="Downforce for fast corners; big on high-DF tracks." />
            <UpgradeCard name="Power Unit"  lvl={dev.power} cost={upgradeCost(dev.power)} can={dev.points >= upgradeCost(dev.power)} onBuy={() => buy("power")} desc="Top speed & deployment; huge on power tracks." />
            <UpgradeCard name="Mechanical"  lvl={dev.mech}  cost={upgradeCost(dev.mech)}  can={dev.points >= upgradeCost(dev.mech)}  onBuy={() => buy("mech")}  desc="Mech grip, tire life, lower weight; loves street tracks." />
            <UpgradeCard name="Reliability" lvl={dev.rel}   cost={upgradeCost(dev.rel)}   can={dev.points >= upgradeCost(dev.rel)}   onBuy={() => buy("rel")}   desc="Fewer DNFs; steadier long-run pace." />
            <UpgradeCard name="Pit Crew"    lvl={dev.pit}   cost={upgradeCost(dev.pit)}   can={dev.points >= upgradeCost(dev.pit)}   onBuy={() => buy("pit")}   desc="Faster, cleaner stops & better pit reliability." />
          </div>
        </div>

        {/* WEEKEND */}
        <div className={styles.simBlock}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Race Weekend</h3>
            <div className={styles.actions}>
              <button className={styles.btn} disabled={!canRace || cooldownLeft>0} onClick={runWeekend}>
                {cooldownLeft>0 ? `Wait ${cooldownSecs}s` : "Simulate Weekend"}
              </button>
              <button className={styles.btn} disabled={!canRace || cooldownLeft>0} onClick={runAutoSeason}>
                {cooldownLeft>0 ? `Wait ${cooldownSecs}s` : "Run Season (auto)"}
              </button>
            </div>
          </div>
          {!canRace && <p className={styles.simHint}>Select your full lineup and stay under budget to enable.</p>}
          {lastWeekend && (
            <div className={styles.gridWeekend}>
              <div>
                <h4>Qualifying — {TRACKS.find(t=>t.id===track)?.name}</h4>
                <ol className={styles.resultsList}>
                  {lastWeekend.quali.slice(0,10).map(q=>(
                    <li key={`q-${q.pos}`} className={q.isUser?styles.you:""}>
                      <strong>P{q.pos}</strong> {q.driver} {q.isUser?"(You)":`— ${q.team}`} <span className={styles.score}>({Math.round(q.score)})</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4>Race — {lastWeekend.safetyCar ? "with Safety Car" : "green"} </h4>
                <ol className={styles.resultsList}>
                  {lastWeekend.results.slice(0,10).map(r=>(
                    <li key={`r-${r.pos}`} className={r.isUser?styles.you:""}>
                      <strong>#{r.pos}</strong> {r.driver} {r.isUser?"(You)":`— ${r.team}`} {r.dnf && <em> DNF</em>}
                      {r.points ? <span className={styles.points}>+{r.points}</span> : null}
                      <span className={styles.score}>({r.score})</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* SEASON */}
        {season && (
          <div className={styles.simBlock}>
            <div className={styles.simHeader}><h3 className={styles.h3}>Season Results</h3></div>
            <div className={styles.gridSeason}>
              <div>
                <h4>Constructors</h4>
                <ol className={styles.resultsList}>
                  {season.cons.map((t,i)=>(
                    <li key={t.team} className={t.team==="You"?styles.you:""}>
                      <strong>{i+1}.</strong> {t.team} <span className={styles.points}>{t.pts} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4>Drivers (Top 10)</h4>
                <ol className={styles.resultsList}>
                  {season.drivers.slice(0,10).map((d,i)=>(
                    <li key={d.name}>
                      <strong>{i+1}.</strong> {d.name} <span className={styles.points}>{d.pts} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <details className={styles.details}>
              <summary>Per-race breakdown</summary>
              {season.perRace.map((r,idx)=>(
                <div key={idx} className={styles.raceCard}>
                  <div className={styles.raceTitle}>{idx+1}. {r.gp} — {TRACKS.find(t=>t.id===r.track)?.name}</div>
                  <ol className={styles.resultsList}>
                    {r.results.slice(0,10).map(x=>(
                      <li key={x.pos} className={x.isUser?styles.you:""}>
                        <strong>#{x.pos}</strong> {x.driver} {x.isUser?"(You)":`— ${x.team}`} {x.dnf && <em> DNF</em>} <span className={styles.points}>{x.points?`+${x.points}`:""}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small UI bits ---------- */
function DriverChip({ id }){
  if (!id) return <div className={styles.driverEmpty}>No driver</div>;
  const d = DRIVERS.find(x=>x.id===id);
  return (
    <div className={styles.driverChip}>
      <div className={styles.avatar}>{initials(d.name)}</div>
      <div className={styles.driverMeta}>
        <div className={styles.driverName}>{d.flag} {d.name}</div>
        <div className={styles.driverSub}>{d.team} · Cost {d.cost}</div>
      </div>
    </div>
  );
}
function StatBar({ label, value=0 }){
  const v = clamp(value);
  return (
    <div className={styles.stat}>
      <div className={styles.statHeader}><span>{label}</span><span className={styles.statNum}>{v}</span></div>
      <div className={styles.statBar}><div className={styles.statFill} style={{ width:`${v}%` }} /></div>
    </div>
  );
}
function UpgradeCard({ name, lvl, cost, can, onBuy, desc }) {
  const pct = Math.min(100, lvl * 20);
  return (
    <div className={styles.upgradeCard}>
      <div className={styles.upgradeHeader}>
        <div className={styles.upgradeTitle}>{name}</div>
        <div className={styles.upgradeCostPill}>Next: {cost} pts</div>
      </div>
      <div className={styles.upgradeDesc}>{desc}</div>
      <div className={styles.upgradeBar} aria-label={`Progress ${pct}%`}>
        <div className={styles.upgradeBarFill} style={{ width: `${pct}%` }} />
        <div className={styles.upgradeTicks}>
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`${styles.tick} ${lvl >= i ? styles.done : ""}`} />
          ))}
        </div>
      </div>
      <div className={styles.upgradeFooter}>
        <div className={styles.upgradeLevel}>Level {lvl} / 5</div>
        <button className={styles.upgradeBuyBtn} disabled={!can} onClick={onBuy}>Buy</button>
      </div>
    </div>
  );
}
