/* ============================================================
   F1 Manager — static game data
   Extracted from DreamTeam.jsx so the component stays lean.
   ============================================================ */

export const DRIVERS = [
  { id:"verstappen", name:"Max Verstappen",    team:"Red Bull", cost:36, pace:98, quali:97, race:97, consistency:96, flag:"🇳🇱" },
  { id:"norris",     name:"Lando Norris",      team:"McLaren",  cost:32, pace:94, quali:94, race:93, consistency:92, flag:"🇬🇧" },
  { id:"piastri",    name:"Oscar Piastri",     team:"McLaren",  cost:30, pace:93, quali:92, race:93, consistency:92, flag:"🇦🇺" },
  { id:"leclerc",    name:"Charles Leclerc",   team:"Ferrari",  cost:31, pace:94, quali:96, race:90, consistency:90, flag:"🇲🇨" },
  { id:"hamilton",   name:"Lewis Hamilton",    team:"Ferrari",  cost:29, pace:92, quali:92, race:93, consistency:95, flag:"🇬🇧" },
  { id:"russell",    name:"George Russell",    team:"Mercedes", cost:27, pace:91, quali:92, race:90, consistency:91, flag:"🇬🇧" },
  { id:"antonelli",  name:"Kimi Antonelli",    team:"Mercedes", cost:17, pace:85, quali:84, race:84, consistency:82, flag:"🇮🇹" },
  { id:"sainz",      name:"Carlos Sainz",      team:"Williams", cost:26, pace:90, quali:91, race:90, consistency:92, flag:"🇪🇸" },
  { id:"albon",      name:"Alex Albon",        team:"Williams", cost:18, pace:86, quali:85, race:85, consistency:85, flag:"🇹🇭" },
  { id:"alonso",     name:"Fernando Alonso",   team:"Aston",    cost:24, pace:90, quali:89, race:90, consistency:93, flag:"🇪🇸" },
  { id:"stroll",     name:"Lance Stroll",      team:"Aston",    cost:14, pace:80, quali:81, race:80, consistency:83, flag:"🇨🇦" },
  { id:"tsunoda",    name:"Yuki Tsunoda",      team:"RB",       cost:18, pace:86, quali:86, race:85, consistency:84, flag:"🇯🇵" },
  { id:"lawson",     name:"Liam Lawson",       team:"RB",       cost:14, pace:82, quali:82, race:82, consistency:82, flag:"🇳🇿" },
  { id:"hulkenberg", name:"Nico Hülkenberg",   team:"Sauber",   cost:16, pace:84, quali:85, race:83, consistency:86, flag:"🇩🇪" },
  { id:"bortoleto",  name:"Gabriel Bortoleto", team:"Sauber",   cost:12, pace:80, quali:80, race:80, consistency:80, flag:"🇧🇷" },
  { id:"gasly",      name:"Pierre Gasly",      team:"Alpine",   cost:16, pace:84, quali:84, race:83, consistency:84, flag:"🇫🇷" },
  { id:"colapinto",  name:"Franco Colapinto",  team:"Alpine",   cost:12, pace:79, quali:79, race:79, consistency:80, flag:"🇦🇷" },
  { id:"ocon",       name:"Esteban Ocon",      team:"Haas",     cost:16, pace:84, quali:83, race:83, consistency:84, flag:"🇫🇷" },
  { id:"bearman",    name:"Oliver Bearman",    team:"Haas",     cost:14, pace:82, quali:82, race:81, consistency:82, flag:"🇬🇧" },
  { id:"doohan",     name:"Jack Doohan",       team:"Alpine",   cost:12, pace:79, quali:79, race:79, consistency:79, flag:"🇦🇺" },
];

export const CHASSIS = [
  { id:"mclaren",  name:"McLaren",      cost:28, aero:94, mechGrip:92, tireDeg:90, weight:88, color:"#ff8000" },
  { id:"ferrari",  name:"Ferrari",      cost:27, aero:92, mechGrip:90, tireDeg:88, weight:88, color:"#e10600" },
  { id:"redbull",  name:"Red Bull",     cost:26, aero:91, mechGrip:90, tireDeg:89, weight:89, color:"#1435aa" },
  { id:"mercedes", name:"Mercedes",     cost:24, aero:89, mechGrip:88, tireDeg:88, weight:90, color:"#27f3e6" },
  { id:"aston",    name:"Aston",        cost:20, aero:86, mechGrip:86, tireDeg:85, weight:90, color:"#229971" },
  { id:"williams", name:"Williams",     cost:18, aero:84, mechGrip:84, tireDeg:83, weight:91, color:"#0072c6" },
  { id:"sauber",   name:"Sauber",       cost:17, aero:83, mechGrip:83, tireDeg:82, weight:92, color:"#52e252" },
  { id:"rb",       name:"Racing Bulls", cost:18, aero:84, mechGrip:84, tireDeg:83, weight:91, color:"#465baa" },
  { id:"alpine",   name:"Alpine",       cost:17, aero:83, mechGrip:83, tireDeg:82, weight:92, color:"#2293d1" },
  { id:"haas",     name:"Haas",         cost:16, aero:82, mechGrip:82, tireDeg:81, weight:93, color:"#bababa" },
];

export const ENGINES = [
  { id:"mercedesPU", name:"Mercedes PU", cost:18, power:92, reliability:93, efficiency:91 },
  { id:"ferrariPU",  name:"Ferrari PU",  cost:17, power:91, reliability:90, efficiency:90 },
  { id:"hondaPU",    name:"Honda RBPT",  cost:17, power:92, reliability:89, efficiency:89 },
  { id:"renaultPU",  name:"Renault PU",  cost:15, power:88, reliability:88, efficiency:87 },
];

export const PRINCIPALS = [
  { id:"seidl",     name:"Andreas Seidl",    strategy:92, risk:80, cost:6 },
  { id:"vasseur",   name:"Fred Vasseur",      strategy:90, risk:78, cost:6 },
  { id:"horner",    name:"Christian Horner",  strategy:91, risk:77, cost:6 },
  { id:"wolff",     name:"Toto Wolff",        strategy:89, risk:75, cost:5 },
  { id:"szafnauer", name:"Otmar Szafnauer",   strategy:83, risk:72, cost:3 },
];

export const PIT = [
  { id:"stock",    name:"Stock Crew",    cost:0, stopSkill:80, reliability:82 },
  { id:"silver",   name:"Silver Crew",   cost:3, stopSkill:86, reliability:85 },
  { id:"gold",     name:"Gold Crew",     cost:6, stopSkill:91, reliability:88 },
  { id:"platinum", name:"Platinum Crew", cost:9, stopSkill:94, reliability:91 },
];

/** Chassis ↔ Engine compatibility bonus table */
export const COMP = {
  mclaren:  { mercedesPU:+2, ferrariPU: 0, hondaPU:+1, renaultPU:-1 },
  ferrari:  { ferrariPU: +2, mercedesPU: 0, hondaPU: 0, renaultPU:-1 },
  redbull:  { hondaPU:   +2, mercedesPU: 0, ferrariPU: 0, renaultPU:-2 },
  mercedes: { mercedesPU:+2, ferrariPU: 0, hondaPU: 0, renaultPU:-1 },
  aston:    { mercedesPU:+1, ferrariPU: 0, hondaPU: 0, renaultPU:-1 },
  williams: { mercedesPU:+1, ferrariPU: 0, hondaPU: 0, renaultPU:-1 },
  sauber:   { ferrariPU: +1, mercedesPU: 0, hondaPU: 0, renaultPU:-1 },
  rb:       { hondaPU:   +1, mercedesPU: 0, ferrariPU: 0, renaultPU:-1 },
  alpine:   { renaultPU: +2, mercedesPU:-1, ferrariPU:-1, hondaPU:-1 },
  haas:     { ferrariPU: +1, mercedesPU: 0, hondaPU: 0, renaultPU:-1 },
};

export const TRACKS = [
  { id:"balanced",      name:"Balanced",       w:{ aero:.25, mech:.25, power:.25, tire:.25 }, sd:4 },
  { id:"highDownforce", name:"High Downforce", w:{ aero:.40, mech:.30, power:.15, tire:.15 }, sd:3.5 },
  { id:"power",         name:"Power (Monza)",  w:{ aero:.10, mech:.20, power:.55, tire:.15 }, sd:4.5 },
  { id:"street",        name:"Street",         w:{ aero:.20, mech:.45, power:.15, tire:.20 }, sd:4.2 },
];

export const CALENDAR = [
  { gp:"Bahrain",      track:"balanced" },
  { gp:"Jeddah",       track:"street" },
  { gp:"Australia",    track:"balanced" },
  { gp:"Japan",        track:"highDownforce" },
  { gp:"China",        track:"balanced" },
  { gp:"Miami",        track:"street" },
  { gp:"Imola",        track:"highDownforce" },
  { gp:"Monaco",       track:"street" },
  { gp:"Spain",        track:"balanced" },
  { gp:"Canada",       track:"balanced" },
  { gp:"Austria",      track:"power" },
  { gp:"Britain",      track:"balanced" },
  { gp:"Belgium",      track:"power" },
  { gp:"Netherlands",  track:"highDownforce" },
  { gp:"Italy",        track:"power" },
  { gp:"Abu Dhabi",    track:"balanced" },
];

export const RIVALS = [
  { name:"McLaren",  combo:{ d1:"norris",     d2:"piastri",    ch:"mclaren",  pu:"mercedesPU", tp:"seidl",     pit:"gold"   } },
  { name:"Red Bull", combo:{ d1:"verstappen", d2:"tsunoda",    ch:"redbull",  pu:"hondaPU",    tp:"horner",    pit:"gold"   } },
  { name:"Ferrari",  combo:{ d1:"leclerc",    d2:"hamilton",   ch:"ferrari",  pu:"ferrariPU",  tp:"vasseur",   pit:"gold"   } },
  { name:"Mercedes", combo:{ d1:"russell",    d2:"antonelli",  ch:"mercedes", pu:"mercedesPU", tp:"wolff",     pit:"gold"   } },
  { name:"Aston",    combo:{ d1:"alonso",     d2:"stroll",     ch:"aston",    pu:"mercedesPU", tp:"szafnauer", pit:"silver" } },
  { name:"Williams", combo:{ d1:"sainz",      d2:"albon",      ch:"williams", pu:"mercedesPU", tp:"szafnauer", pit:"gold"   } },
  { name:"RB",       combo:{ d1:"tsunoda",    d2:"lawson",     ch:"rb",       pu:"hondaPU",    tp:"horner",    pit:"silver" } },
  { name:"Sauber",   combo:{ d1:"hulkenberg", d2:"bortoleto",  ch:"sauber",   pu:"ferrariPU",  tp:"szafnauer", pit:"silver" } },
  { name:"Alpine",   combo:{ d1:"gasly",      d2:"colapinto",  ch:"alpine",   pu:"renaultPU",  tp:"szafnauer", pit:"silver" } },
];

export const SPONSORS = [
  { id:"bronze", name:"Bronze", base:3, bonus:{ podium:1, doublePoints:1 },              desc:"Small retainer. Rewards consistent points." },
  { id:"silver", name:"Silver", base:4, bonus:{ podium:2, pole:1 },                      desc:"Better retainer. Loves podiums and poles."  },
  { id:"gold",   name:"Gold",   base:5, bonus:{ podium:3, fastest:1, doublePoints:1 },   desc:"High retainer. Pays for big results."       },
];

/** FIA points scale (P1–P10) */
export const FIA_PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

/** Upgrade cost per level (index = current level, max level 5) */
export const UPGRADE_COST = [3, 4, 5, 6, 8];

/** Economy limits */
export const MAX_WALLET  = 20;
export const DAILY_CAP   = 12;
export const COOLDOWN_MS = 25_000;
