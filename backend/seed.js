import mongoose from 'mongoose';
import Team from './models/team.model.js';
import Race from './models/race.model.js';
import DriverStanding from './models/driverStanding.model.js';
import TeamStanding from './models/teamStanding.model.js';
import RaceResult from './models/raceResult.model.js';

const teams = [
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
        photo: "/assets/Alpine_1.png",
        car: "https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2025:fallback:car:2025fallbackcarright.webp/v1740000000/common/f1/2025/alpine/2025alpinecarright.webp"
      },
      {
        name: "Franco Colapinto",
        age: 20,
        num: "43",
        country: "Argentina",
        flag: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
        photo: "/assets/Alpine_2.png",
        car: "/assets/F1_car.png"
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
        age: 42,
        num: "14",
        country: "Spain",
        flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
        photo: "/assets/Aston_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Lance Stroll",
        age: 24,
        num: "18",
        country: "Canada",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg",
        photo: "/assets/Aston_2.png",
        car: "/assets/F1_car.png"
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
        photo: "/assets/Ferrari_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Lewis Hamilton",
        age: 39,
        num: "44",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: "/assets/Ferrari_2.png",
        car: "/assets/F1_car.png"
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
        age: 19,
        num: "87",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: "/assets/Haas_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Esteban Ocon",
        age: 28,
        num: "31",
        country: "France",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
        photo: "/assets/Haas_2.png",
        car: "/assets/F1_car.png"
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
        age: 22,
        num: "81",
        country: "Australia",
        flag: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",
        photo: "/assets/Mclaren_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Lando Norris",
        age: 24,
        num: "4",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: "/assets/Mclaren_2.png",
        car: "/assets/F1_car.png"
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
        age: 25,
        num: "63",
        country: "United Kingdom",
        flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
        photo: "/assets/Mercedes_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Kimi Antonelli",
        age: 18,
        num: "12",
        country: "Italy",
        flag: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg",
        photo: "/assets/Mercedes_2.png",
        car: "/assets/F1_car.png"
      }
    ]
  },

  // Racing Bulls (RB)
  {
    team: "Racing Bulls",
    color: "#465baa",
    drivers: [
      {
        name: "Liam Lawson",
        age: 21,
        num: "40",
        country: "New Zealand",
        flag: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg",
        photo: "/assets/RacingBull_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Isack Hadjar",
        age: 20,
        num: "6",
        country: "France",
        flag: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
        photo: "/assets/RacingBull_2.png",
        car: "/assets/F1_car.png"
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
        age: 26,
        num: "1",
        country: "Netherlands",
        flag: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",
        photo: "/assets/RedBull_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Yuki Tsunoda",
        age: 24,
        num: "22",
        country: "Japan",
        flag: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg",
        photo: "/assets/RedBull_2.png",
        car: "/assets/F1_car.png"
      }
    ]
  },

  // Sauber
  {
    team: "Sauber",
    color: "#52e252",
    drivers: [
      {
        name: "Nico Hulkenberg",
        age: 36,
        num: "27",
        country: "Germany",
        flag: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg",
        photo: "/assets/Sauber_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Gabriel Bortoleto",
        age: 20,
        num: "5",
        country: "Brazil",
        flag: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",
        photo: "/assets/Sauber_2.png",
        car: "/assets/F1_car.png"
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
        age: 27,
        num: "23",
        country: "Thailand",
        flag: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg",
        photo: "/assets/Williams_1.png",
        car: "/assets/F1_car.png"
      },
      {
        name: "Carlos Sainz",
        age: 30,
        num: "55",
        country: "Spain",
        flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
        photo: "/assets/Williams_2.png",
        car: "/assets/F1_car.png"
      }
    ]
  }
];

const races = [
  {
    name: "Canadian Grand Prix",
    startDate: "2025-06-13",
    endDate: "2025-06-15",
    circuit: "Circuit Gilles Villeneuve",
    country: "Canada",
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg",
    race: "/assets/Canada.png"
  },
  {
    name: "Austrian Grand Prix",
    startDate: "2025-06-27",
    endDate: "2025-06-29",
    circuit: "Red Bull Ring",
    country: "Austria",
    flag: "https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Austria_Circuit"
  },
  {
    name: "British Grand Prix",
    startDate: "2025-07-04",
    endDate: "2025-07-06",
    circuit: "Silverstone Circuit",
    country: "United Kingdom",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1600px-Flag_of_the_United_Kingdom_%283-5%29.svg.png?20230715230526",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit"
  },
  {
    name: "Belgian Grand Prix",
    startDate: "2025-07-25",
    endDate: "2025-07-27",
    circuit: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    flag: "https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_Belgium_%28civil%29.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Belgium_Circuit"
  },
  {
    name: "Hungarian Grand Prix",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    circuit: "Hungaroring",
    country: "Hungary",
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_Hungary.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Hungary_Circuit"
  },
  {
    name: "Netherlands Grand Prix",
    startDate: "2025-08-29",
    endDate: "2025-08-31",
    circuit: "Circuit Zandvoort",
    country: "Netherlands",
    flag: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Netherlands_Circuit"
  },
  {
    name: "Italian Grand Prix",
    startDate: "2025-09-05",
    endDate: "2025-09-07",
    circuit: "Autodromo Nazionale Monza",
    country: "Italy",
    flag: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Italy_Circuit"
  },
  {
    name: "Azerbaijan Grand Prix",
    startDate: "2025-09-19",
    endDate: "2025-09-21",
    circuit: "Baku City Circuit",
    country: "Azerbaijan",
    flag: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Baku_Circuit"
  },
  {
    name: "Singapore Grand Prix",
    startDate: "2025-10-03",
    endDate: "2025-10-05",
    circuit: "Marina Bay Street Circuit",
    country: "Singapore",
    flag: "https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Singapore.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Singapore_Circuit"
  },
  {
    name: "United States Grand Prix",
    startDate: "2025-10-17",
    endDate: "2025-10-19",
    circuit: "Circuit of the Americas",
    country: "United States",
    flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/USA_Circuit"
  },
  {
    name: "Mexican Grand Prix",
    startDate: "2025-10-24",
    endDate: "2025-10-26",
    circuit: "Autódromo Hermanos Rodríguez",
    country: "Mexico",
    flag: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Mexico_Circuit"
  },
  {
    name: "Brazilian Grand Prix",
    startDate: "2025-11-07",
    endDate: "2025-11-09",
    circuit: "Autódromo José Carlos Pace",
    country: "Brazil",
    flag: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Brazil_Circuit"
  },
  {
    name: "Las Vegas Grand Prix",
    startDate: "2025-11-20",
    endDate: "2025-11-22",
    circuit: "Las Vegas Strip Circuit",
    country: "United States",
    flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Las_Vegas_Circuit"
  },
  {
    name: "Qatar Grand Prix",
    startDate: "2025-11-28",
    endDate: "2025-11-30",
    circuit: "Losail International Circuit",
    country: "Qatar",
    flag: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Qatar.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Qatar_Circuit"
  },
  {
    name: "Abu Dhabi Grand Prix",
    startDate: "2025-12-05",
    endDate: "2025-12-07",
    circuit: "Yas Marina Circuit",
    country: "United Arab Emirates",
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
    race: "https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Abu_Dhabi_Circuit"
  }
  
];

const driverStandings = [
  { position: 1, driver: "Piastri",      nationality: "AUS", car: "McLaren Mercedes",                  points: 186 },
  { position: 2, driver: "Norris",       nationality: "GBR", car: "McLaren Mercedes",                  points: 176 },
  { position: 3, driver: "Verstappen",   nationality: "NED", car: "Red Bull Racing Honda RBPT",        points: 137 },
  { position: 4, driver: "Russell",      nationality: "GBR", car: "Mercedes",                          points: 111 },
  { position: 5, driver: "Leclerc",      nationality: "MON", car: "Ferrari",                           points: 94 },
  { position: 6, driver: "Hamilton",     nationality: "GBR", car: "Ferrari",                           points: 71 },
  { position: 7, driver: "Antonelli",    nationality: "ITA", car: "Mercedes",                          points: 48 },
  { position: 8, driver: "Albon",        nationality: "THA", car: "Williams Mercedes",                 points: 42 },
  { position: 9, driver: "Hadjar",       nationality: "FRA", car: "Racing Bulls Honda RBPT",           points: 21 },
  { position: 10, driver: "Ocon",        nationality: "FRA", car: "Haas Ferrari",                      points: 20 },
  { position: 11, driver: "Hulkenberg",  nationality: "GER", car: "Kick Sauber Ferrari",               points: 16 },
  { position: 12, driver: "Stroll",      nationality: "CAN", car: "Aston Martin Aramco Mercedes",      points: 14 },
  { position: 13, driver: "Sainz",       nationality: "ESP", car: "Williams Mercedes",                 points: 12 },
  { position: 14, driver: "Gasly",       nationality: "FRA", car: "Alpine Renault",                    points: 11 },
  { position: 15, driver: "Tsunoda",     nationality: "JPN", car: "Red Bull Racing Honda RBPT",        points: 10 },
  { position: 16, driver: "Bearman",     nationality: "GBR", car: "Haas Ferrari",                      points: 6 },
  { position: 17, driver: "Lawson",      nationality: "NZL", car: "Racing Bulls Honda RBPT",           points: 4 },
  { position: 18, driver: "Alonso",      nationality: "ESP", car: "Aston Martin Aramco Mercedes",      points: 2 },
  { position: 19, driver: "Bortoleto",   nationality: "BRA", car: "Kick Sauber Ferrari",               points: 0 },
  { position: 20, driver: "Doohan",      nationality: "AUS", car: "Alpine Renault",                    points: 0 },
  { position: 21, driver: "Colapinto",   nationality: "ARG", car: "Alpine Renault",                    points: 0 }
];

const teamStandings = [
  { position: 1,  team: "McLaren Mercedes",             points: 362 },
  { position: 2,  team: "Ferrari",                      points: 165 },
  { position: 3,  team: "Mercedes",                     points: 159 },
  { position: 4,  team: "Red Bull Racing Honda RBPT",   points: 144 },
  { position: 5,  team: "Williams Mercedes",            points: 54 },
  { position: 6,  team: "Racing Bulls Honda RBPT",      points: 28 },
  { position: 7,  team: "Haas Ferrari",                 points: 26 },
  { position: 8,  team: "Kick Sauber Ferrari",          points: 16 },
  { position: 9,  team: "Aston Martin Aramco Mercedes", points: 16 },
  { position: 10, team: "Alpine Renault",               points: 11 }
];

const raceResults = [
  {
    grandPrix: "Australia",
    date: "2025-03-16",
    winner: "Norris",
    car: "McLaren Mercedes",
    laps: 57,
    time: "1:42:06.304"
  },
  {
    grandPrix: "China",
    date: "2025-03-23",
    winner: "Piastri",
    car: "McLaren Mercedes",
    laps: 56,
    time: "1:30:55.026"
  },
  {
    grandPrix: "Japan",
    date: "2025-04-06",
    winner: "Verstappen",
    car: "Red Bull Racing Honda RBPT",
    laps: 53,
    time: "1:22:06.983"
  },
  {
    grandPrix: "Bahrain",
    date: "2025-04-13",
    winner: "Piastri",
    car: "McLaren Mercedes",
    laps: 57,
    time: "1:35:39.435"
  },
  {
    grandPrix: "Saudi Arabia",
    date: "2025-04-20",
    winner: "Piastri",
    car: "McLaren Mercedes",
    laps: 50,
    time: "1:21:06.758"
  },
  {
    grandPrix: "Miami",
    date: "2025-05-04",
    winner: "Piastri",
    car: "McLaren Mercedes",
    laps: 57,
    time: "1:28:51.587"
  },
  {
    grandPrix: "Emilia-Romagna",
    date: "2025-05-18",
    winner: "Verstappen",
    car: "Red Bull Racing Honda RBPT",
    laps: 63,
    time: "1:31:33.199"
  },
  {
    grandPrix: "Monaco",
    date: "2025-05-25",
    winner: "Norris",
    car: "McLaren Mercedes",
    laps: 78,
    time: "1:40:33.843"
  },
  {
    grandPrix: "Spain",
    date: "2025-06-01",
    winner: "Piastri",
    car: "McLaren Mercedes",
    laps: 66,
    time: "1:32:57.375"
  }
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