import mongoose from 'mongoose';
import Team from './models/team.model.js';
import Race from './models/race.model.js';
import DriverStanding from './models/driverStanding.model.js';
import TeamStanding from './models/teamStanding.model.js';
import RaceResult from './models/raceResult.model.js';

const P = (team, code) =>
  `https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/${team}/${code}/2026${team}${code}right.webp`;
const C = (team) =>
  `https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/common/f1/2026/${team}/2026${team}carright.webp`;

const teams = [
  // Audi
  {
    team: "Audi",
    color: "#bb0a1e",
    drivers: [
      {
        name: "Nico Hulkenberg",
        age: 37,
        num: "27",
        country: "Germany",
        flag: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg",
        photo: P("audi", "nichul01"),
        car: C("audi")
      },
      {
        name: "Gabriel Bortoleto",
        age: 21,
        num: "5",
        country: "Brazil",
        flag: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",
        photo: P("audi", "gabbor01"),
        car: C("audi")
      }
    ]
  },

  // Alpine
  {
    team: "Alpine",
    color: "#2293d1",
    drivers: [
      {
        name: "Pierre Gasly",
        age: 28,
        num: "10",
        country: "France",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
        photo: P("alpine", "piegas01"),
        car: C("alpine")
      },
      {
        name: "Franco Colapinto",
        age: 20,
        num: "43",
        country: "Argentina",
        flag: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
        photo: P("alpine", "fracol01"),
        car: C("alpine")
      }
    ]
  },

  // Aston Martin
  {
    team: "Aston Martin",
    color: "#229971",
    drivers: [
      {
        name: "Fernando Alonso",
        age: 43,
        num: "14",
        country: "Spain",
        flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
        photo: P("astonmartin", "feralo01"),
        car: C("astonmartin")
      },
      {
        name: "Lance Stroll",
        age: 26,
        num: "18",
        country: "Canada",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg",
        photo: P("astonmartin", "lanstr01"),
        car: C("astonmartin")
      }
    ]
  },

  // Cadillac
  {
    team: "Cadillac",
    color: "#9e9e9e",
    drivers: [
      {
        name: "Sergio Perez",
        age: 35,
        num: "11",
        country: "Mexico",
        flag: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg",
        photo: P("cadillac", "serper01"),
        car: C("cadillac")
      },
      {
        name: "Valtteri Bottas",
        age: 35,
        num: "77",
        country: "Finland",
        flag: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Finland.svg",
        photo: P("cadillac", "valbot01"),
        car: C("cadillac")
      }
    ]
  },

  // Ferrari
  {
    team: "Ferrari",
    color: "#e10600",
    drivers: [
      {
        name: "Charles Leclerc",
        age: 27,
        num: "16",
        country: "Monaco",
        flag: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Flag_of_Monaco.svg",
        photo: P("ferrari", "chalec01"),
        car: C("ferrari")
      },
      {
        name: "Lewis Hamilton",
        age: 40,
        num: "44",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: P("ferrari", "lewham01"),
        car: C("ferrari")
      }
    ]
  },

  // Haas
  {
    team: "Haas",
    color: "#bababa",
    drivers: [
      {
        name: "Oliver Bearman",
        age: 20,
        num: "87",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: P("haas", "olibea01"),
        car: C("haas")
      },
      {
        name: "Esteban Ocon",
        age: 28,
        num: "31",
        country: "France",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
        photo: P("haas", "estoco01"),
        car: C("haas")
      }
    ]
  },

  // McLaren
  {
    team: "McLaren",
    color: "#ff8000",
    drivers: [
      {
        name: "Oscar Piastri",
        age: 24,
        num: "81",
        country: "Australia",
        flag: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",
        photo: P("mclaren", "oscpia01"),
        car: C("mclaren")
      },
      {
        name: "Lando Norris",
        age: 25,
        num: "4",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: P("mclaren", "lannor01"),
        car: C("mclaren")
      }
    ]
  },

  // Mercedes
  {
    team: "Mercedes",
    color: "#27f3e6",
    drivers: [
      {
        name: "George Russell",
        age: 27,
        num: "63",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: P("mercedes", "georus01"),
        car: C("mercedes")
      },
      {
        name: "Kimi Antonelli",
        age: 18,
        num: "12",
        country: "Italy",
        flag: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg",
        photo: P("mercedes", "andant01"),
        car: C("mercedes")
      }
    ]
  },

  // Racing Bulls
  {
    team: "Racing Bulls",
    color: "#465baa",
    drivers: [
      {
        name: "Liam Lawson",
        age: 23,
        num: "30",
        country: "New Zealand",
        flag: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg",
        photo: P("racingbulls", "lialaw01"),
        car: C("racingbulls")
      },
      {
        name: "Arvid Lindblad",
        age: 18,
        num: "8",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: P("racingbulls", "arvlin01"),
        car: C("racingbulls")
      }
    ]
  },

  // Red Bull
  {
    team: "Red Bull",
    color: "#1435aa",
    drivers: [
      {
        name: "Max Verstappen",
        age: 27,
        num: "1",
        country: "Netherlands",
        flag: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",
        photo: P("redbullracing", "maxver01"),
        car: C("redbullracing")
      },
      {
        name: "Isack Hadjar",
        age: 20,
        num: "6",
        country: "France",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
        photo: P("redbullracing", "isahad01"),
        car: C("redbullracing")
      }
    ]
  },

  // Williams
  {
    team: "Williams",
    color: "#0072c6",
    drivers: [
      {
        name: "Alex Albon",
        age: 29,
        num: "23",
        country: "Thailand",
        flag: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg",
        photo: P("williams", "alealb01"),
        car: C("williams")
      },
      {
        name: "Carlos Sainz",
        age: 30,
        num: "55",
        country: "Spain",
        flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
        photo: P("williams", "carsai01"),
        car: C("williams")
      }
    ]
  }
];

const CM = (slug) =>
  `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${slug}`;

const races = [
  { name: "Australian Grand Prix",      startDate: "2026-03-06", endDate: "2026-03-08", circuit: "Albert Park Circuit",              country: "Australia",             flag: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",                                                                                              race: CM("Australia_Circuit") },
  { name: "Chinese Grand Prix",         startDate: "2026-03-13", endDate: "2026-03-15", circuit: "Shanghai International Circuit",   country: "China",                 flag: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg",                                                                 race: CM("China_Circuit") },
  { name: "Japanese Grand Prix",        startDate: "2026-03-27", endDate: "2026-03-29", circuit: "Suzuka Circuit",                   country: "Japan",                 flag: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg",                                                                                               race: CM("Japan_Circuit") },
  { name: "Miami Grand Prix",           startDate: "2026-05-01", endDate: "2026-05-03", circuit: "Miami International Autodrome",    country: "United States",         flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",                                                                                   race: CM("Miami_Circuit") },
  { name: "Canadian Grand Prix",        startDate: "2026-05-22", endDate: "2026-05-24", circuit: "Circuit Gilles Villeneuve",        country: "Canada",                flag: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg",                                                                                              race: CM("Canada_Circuit") },
  { name: "Monaco Grand Prix",          startDate: "2026-06-05", endDate: "2026-06-07", circuit: "Circuit de Monaco",                country: "Monaco",                flag: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Flag_of_Monaco.svg",                                                                                               race: CM("Monaco_Circuit") },
  { name: "Spanish Grand Prix",         startDate: "2026-06-12", endDate: "2026-06-14", circuit: "Circuit de Barcelona-Catalunya",   country: "Spain",                 flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",                                                                                               race: CM("Spain_Circuit") },
  { name: "Austrian Grand Prix",        startDate: "2026-06-26", endDate: "2026-06-28", circuit: "Red Bull Ring",                    country: "Austria",               flag: "https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg",                                                                                              race: CM("Austria_Circuit") },
  { name: "British Grand Prix",         startDate: "2026-07-03", endDate: "2026-07-05", circuit: "Silverstone Circuit",              country: "United Kingdom",        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526", race: CM("Great_Britain_Circuit") },
  { name: "Belgian Grand Prix",         startDate: "2026-07-17", endDate: "2026-07-19", circuit: "Circuit de Spa-Francorchamps",     country: "Belgium",               flag: "https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_Belgium_%28civil%29.svg",                                                                                 race: CM("Belgium_Circuit") },
  { name: "Hungarian Grand Prix",       startDate: "2026-07-24", endDate: "2026-07-26", circuit: "Hungaroring",                      country: "Hungary",               flag: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_Hungary.svg",                                                                                              race: CM("Hungary_Circuit") },
  { name: "Dutch Grand Prix",           startDate: "2026-08-21", endDate: "2026-08-23", circuit: "Circuit Zandvoort",                country: "Netherlands",           flag: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",                                                                                      race: CM("Netherlands_Circuit") },
  { name: "Italian Grand Prix",         startDate: "2026-09-04", endDate: "2026-09-06", circuit: "Autodromo Nazionale Monza",        country: "Italy",                 flag: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg",                                                                                               race: CM("Italy_Circuit") },
  { name: "Madrid Grand Prix",          startDate: "2026-09-11", endDate: "2026-09-13", circuit: "Madrid Street Circuit",            country: "Spain",                 flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",                                                                                               race: CM("Spain_Circuit") },
  { name: "Azerbaijan Grand Prix",      startDate: "2026-09-24", endDate: "2026-09-26", circuit: "Baku City Circuit",                country: "Azerbaijan",            flag: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg",                                                                                          race: CM("Baku_Circuit") },
  { name: "Singapore Grand Prix",       startDate: "2026-10-09", endDate: "2026-10-11", circuit: "Marina Bay Street Circuit",        country: "Singapore",             flag: "https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Singapore.svg",                                                                                           race: CM("Singapore_Circuit") },
  { name: "United States Grand Prix",   startDate: "2026-10-23", endDate: "2026-10-25", circuit: "Circuit of the Americas",          country: "United States",         flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",                                                                                   race: CM("USA_Circuit") },
  { name: "Mexico City Grand Prix",     startDate: "2026-10-30", endDate: "2026-11-01", circuit: "Autódromo Hermanos Rodríguez",     country: "Mexico",                flag: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg",                                                                                              race: CM("Mexico_Circuit") },
  { name: "São Paulo Grand Prix",       startDate: "2026-11-06", endDate: "2026-11-08", circuit: "Autódromo José Carlos Pace",       country: "Brazil",                flag: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",                                                                                              race: CM("Brazil_Circuit") },
  { name: "Las Vegas Grand Prix",       startDate: "2026-11-19", endDate: "2026-11-21", circuit: "Las Vegas Strip Circuit",          country: "United States",         flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",                                                                                   race: CM("Las_Vegas_Circuit") },
  { name: "Qatar Grand Prix",           startDate: "2026-11-27", endDate: "2026-11-29", circuit: "Losail International Circuit",     country: "Qatar",                 flag: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Qatar.svg",                                                                                              race: CM("Qatar_Circuit") },
  { name: "Abu Dhabi Grand Prix",       startDate: "2026-12-04", endDate: "2026-12-06", circuit: "Yas Marina Circuit",               country: "United Arab Emirates",  flag: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",                                                                          race: CM("Abu_Dhabi_Circuit") },
];

const driverStandings = [
  { position: 1,  driver: "Antonelli",  nationality: "ITA", car: "Mercedes",        points: 72 },
  { position: 2,  driver: "Russell",    nationality: "GBR", car: "Mercedes",        points: 63 },
  { position: 3,  driver: "Leclerc",    nationality: "MON", car: "Ferrari",         points: 49 },
  { position: 4,  driver: "Hamilton",   nationality: "GBR", car: "Ferrari",         points: 41 },
  { position: 5,  driver: "Norris",     nationality: "GBR", car: "McLaren",         points: 25 },
  { position: 6,  driver: "Piastri",    nationality: "AUS", car: "McLaren",         points: 21 },
  { position: 7,  driver: "Bearman",    nationality: "GBR", car: "Haas F1 Team",    points: 17 },
  { position: 8,  driver: "Gasly",      nationality: "FRA", car: "Alpine",          points: 15 },
  { position: 9,  driver: "Verstappen", nationality: "NED", car: "Red Bull Racing", points: 12 },
  { position: 10, driver: "Lawson",     nationality: "NZL", car: "Racing Bulls",    points: 10 },
  { position: 11, driver: "Lindblad",   nationality: "GBR", car: "Racing Bulls",    points: 4  },
  { position: 12, driver: "Hadjar",     nationality: "FRA", car: "Red Bull Racing", points: 4  },
  { position: 13, driver: "Bortoleto",  nationality: "BRA", car: "Audi",            points: 2  },
  { position: 14, driver: "Sainz",      nationality: "ESP", car: "Williams",        points: 2  },
  { position: 15, driver: "Ocon",       nationality: "FRA", car: "Haas F1 Team",    points: 1  },
  { position: 16, driver: "Colapinto",  nationality: "ARG", car: "Alpine",          points: 1  },
  { position: 17, driver: "Hulkenberg", nationality: "GER", car: "Audi",            points: 0  },
  { position: 18, driver: "Albon",      nationality: "THA", car: "Williams",        points: 0  },
  { position: 19, driver: "Bottas",     nationality: "FIN", car: "Cadillac",        points: 0  },
  { position: 20, driver: "Perez",      nationality: "MEX", car: "Cadillac",        points: 0  },
  { position: 21, driver: "Alonso",     nationality: "ESP", car: "Aston Martin",    points: 0  },
  { position: 22, driver: "Stroll",     nationality: "CAN", car: "Aston Martin",    points: 0  },
];

const teamStandings = [
  { position: 1,  team: "Mercedes",        points: 135 },
  { position: 2,  team: "Ferrari",         points: 90  },
  { position: 3,  team: "McLaren",         points: 46  },
  { position: 4,  team: "Haas F1 Team",    points: 18  },
  { position: 5,  team: "Alpine",          points: 16  },
  { position: 6,  team: "Red Bull Racing", points: 16  },
  { position: 7,  team: "Racing Bulls",    points: 14  },
  { position: 8,  team: "Audi",            points: 2   },
  { position: 9,  team: "Williams",        points: 2   },
  { position: 10, team: "Cadillac",        points: 0   },
  { position: 11, team: "Aston Martin",    points: 0   },
];

const raceResults = [
  {
    grandPrix: "Australian Grand Prix",
    date: "2026-03-08",
    winner: "Russell", car: "Mercedes", laps: 58, time: "1:23:06.801",
    p2: "Antonelli", p2time: "+2.974",
    p3: "Leclerc",   p3time: "+15.519",
  },
  {
    grandPrix: "Chinese Grand Prix",
    date: "2026-03-15",
    winner: "Antonelli", car: "Mercedes", laps: 56, time: "1:33:15.607",
    p2: "Russell",  p2time: "+5.515",
    p3: "Hamilton", p3time: "+25.267",
  },
  {
    grandPrix: "Japanese Grand Prix",
    date: "2026-03-29",
    winner: "Antonelli", car: "Mercedes", laps: 53, time: "1:28:03.403",
    p2: "Piastri", p2time: "+13.722",
    p3: "Leclerc", p3time: "+15.270",
  },
];



const MONGODB_URI = 'mongodb://127.0.0.1:27017/F1-API';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    await Team.deleteMany({});
    await Team.insertMany(teams);

    await Race.deleteMany({});
    await Race.insertMany(races);

    await DriverStanding.deleteMany({});
    await DriverStanding.insertMany(driverStandings);

    await TeamStanding.deleteMany({});
    await TeamStanding.insertMany(teamStandings);

    await RaceResult.deleteMany({});
    await RaceResult.insertMany(raceResults);

    console.log('Seed done!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();