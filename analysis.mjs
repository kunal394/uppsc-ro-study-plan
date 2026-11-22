export const categories = {
  polity:"Polity and institutions", modern:"Modern history / national movement",
  ancient:"Ancient and early India", medieval:"Medieval history", culture:"Culture and literature",
  geography:"Geography and resources", population:"Population and urbanisation",
  physics:"Physics", chemistry:"Chemistry", biology:"Biology and health",
  scienceTech:"Computers and technology", environment:"Environment and disasters",
  economy:"Economy, commerce and trade", agriculture:"Agriculture",
  up:"UP-specific knowledge", reasoning:"General intelligence", current:"Dated current affairs"
};

// Each page's entries follow the source booklet's question order.
function ledger(pages) {
  let number = 0;
  return pages.flatMap(([page, entries]) => entries.split("\n").filter(Boolean).map(entry => {
    const [primary,label] = entry.split("|");
    return {number:++number,page,primary,label};
  }));
}

export const analyses = [
  {
    year:2025, cycle:"2023 recruitment re-examination", date:"27 July 2025",
    booklet:"UNHSIV-01", pages:34, scheme:"Combined paper: 140 GS + 60 Hindi; 200 marks; 3 hours",
    url:"https://www.careerpower.in/blog/wp-content/uploads/2025/11/12193755/UPPCS-RO-ARO-2025-Prelims-Question-Paper.pdf",
    rows:ledger([
      [2,`current|Astronaut return spacecraft
current|2024 microRNA Nobel
current|2024 Olympic wrestling
current|2025 international sport
scienceTech|Manned deep-ocean mission
current|2026 Commonwealth Games host
current|Offshore wind-farm inauguration`],
      [3,`chemistry|Aqua regia composition
physics|SI prefix conversion
physics|Luminous objects
physics|Concave mirror application
physics|Astronomical distance unit
chemistry|Fats and oils`],
      [4,`geography|Harbour locations
population|UT population density
up|UP climatic vulnerability
environment|Air-pollution portal
geography|Hydrological cycle
population|State population density
environment|Trophic energy transfer
environment|Temperature tolerance`],
      [5,`modern|Constitutional mission chronology
modern|Congress membership history
ancient|Ajivika tradition`],
      [6,`reasoning|Word coding
reasoning|Coded arithmetic
reasoning|Missing number
reasoning|Position swapping
reasoning|Equation value
scienceTech|Processor architecture`],
      [7,`scienceTech|MAC address
medieval|Chola conquests
medieval|Haldighati commander
medieval|Sultanate royal titles
ancient|Amaravati art association
scienceTech|Application versus operating system`],
      [8,`biology|Photosynthesis
chemistry|Natural acids
agriculture|Hydroponics`],
      [9,`population|Growth versus population size
geography|Bass Strait
agriculture|Plantation crop countries
economy|Export composition
reasoning|Calendar calculation`],
      [10,`reasoning|Disease analogy
reasoning|Figure odd-one-out
reasoning|Number figure
reasoning|Letter coding`],
      [11,`medieval|Sultanate military terms
modern|Treaty of Lahore`],
      [12,`modern|Constitutional negotiation chronology
polity|Public employment equality
polity|Constitutional election provisions
polity|First Lok Sabha Speaker
polity|Rights and article ranges`],
      [13,`reasoning|Family relationship
reasoning|Time arithmetic
current|2024 chess championship
reasoning|Number pattern
reasoning|Family inference`],
      [14,`current|2024 award recipients
current|Padma Vibhushan 2025
current|Dated processor-engineer award
environment|Climate-friendly lifestyle initiative
current|Lunar landing milestone
current|2024 election milestone
economy|Export processing zone
up|UP poverty-reduction initiative`],
      [15,`environment|Biosphere reserves
geography|Coalfield locations
geography|Harbour states`],
      [16,`up|UP fiscal-health ranking
agriculture|Foodgrain production
up|Organic-farming institution
up|Farm-support scheme
up|UP cash crop
up|School-facilities scheme
reasoning|Missing number figure`],
      [17,`population|State literacy
geography|Hill-system locations
geography|Natural vegetation
geography|Storm terminology
geography|Mountain passes`],
      [18,`agriculture|Crop insect pest
current|Finance Commission appointment
economy|Rural development project
agriculture|Pest legislation
biology|Fruit-ripening hormone`],
      [19,`modern|Trade Union Congress presidency
modern|Doctrine of Lapse
modern|Congress-era Viceroy
up|Banaras educational institution
modern|National movement chronology`],
      [20,`biology|Brain region
biology|Blood tissue
biology|Amphibian circulation
environment|Fluoride contamination
biology|Water-soluble vitamins`],
      [21,`agriculture|Crop diseases
agriculture|Fruit-production leader
agriculture|Cash-crop classification
agriculture|Kisan Call Centre institution`],
      [22,`agriculture|Nutrient deficiency
culture|Folk-dance associations
ancient|Buddhist texts
agriculture|Pulse classification`],
      [23,`up|Investment-facilitation portal
medieval|Ain-i-Akbari
current|Dated foreign-exchange reserves
ancient|Monumental Buddhist stupa
culture|Guru Nanak succession
economy|Largest state economy`],
      [24,`culture|First Bharat Ratna recipient
polity|Statutory institution
polity|Fiscal-transfer institution
polity|Quasi-federal description
economy|National-income institution
polity|NITI governing council`],
      [25,`modern|Purna Swaraj session
modern|Bose Congress election
medieval|Rebellion chronology
modern|Anti-partition demonstration
modern|Azad Hind recognition`],
      [26,`modern|Colonial revenue systems
ancient|Royal titles
ancient|Udaipur inscription
ancient|Royal ethical proclamation`],
      [27,`population|Urban population growth
geography|Atlantic ocean current
population|Scheduled Tribe share
geography|River location
population|Urbanisation
culture|Pushkar temple association`],
      [28,`population|Urban heat-island context
agriculture|Agricultural research institute
up|State financial portal
population|State sex ratio
agriculture|Biofertiliser mechanism
population|Population text association
up|Mineral policy`]
    ])
  },
  {
    year:2021, cycle:"2021 recruitment", date:"5 December 2021",
    booklet:"RRST-01-A", pages:30, scheme:"Older separate GS paper: 140 questions/140 marks/2 hours; Hindi was a separate paper",
    url:"https://www.adda247.com/jobs/wp-content/uploads/2025/07/15160356/UPPSC-ROARO-General-Studies-Paper-2021.pdf",
    rows:ledger([
      [3,`modern|Nationalist event chronology
up|Congress sessions in UP`],
      [4,`modern|Anglo-Indian war chronology
modern|East India Association`],
      [5,`modern|Organisation/publication chronology
culture|Bhojpuri anti-colonial poem
modern|Fort William College
modern|Colonial military expenditure`],
      [6,`up|Fair-region matching
up|Agra Presidency formation
up|Prayagraj fort chronology
modern|Company authority and local office
modern|Colonial industrial chronology`],
      [7,`modern|Indian Civil Service history
modern|Tagore knighthood
polity|State-legislature quorum`],
      [8,`up|Bismil execution location
modern|European visitors
economy|Five-Year Plan models
culture|Guru Nanak successor
medieval|Sultanate religious practice`],
      [9,`medieval|Sultanate frontier army
medieval|Bengal Subedar succession
up|Shared fair traditions
up|Banaras rebellion leadership
up|Early-medieval UP city names
up|Mahajanapadas in present UP`],
      [10,`up|Regional heroic folk saying
ancient|Selection of early rulers
ancient|Foreign traveller dates
up|Early agriculture heritage`],
      [11,`up|Bhitargaon brick temple
physics|Sitar vibrations
physics|Bulb connections
biology|Spider silk`],
      [12,`chemistry|Natural carbohydrate composition
environment|Ecosystem productivity
scienceTech|Computer storage units
biology|Human sensory properties
biology|Fasting and liver`],
      [13,`geography|Energy-source contribution
geography|Mineral industrial uses
environment|Water-quality measure
environment|Hydrogen-sulphide pollution
biology|Tulsi phytochemicals`],
      [14,`biology|Essential amino-acid source
culture|Hindi novel author
economy|Women/nutrition scheme dates
environment|Environmental law dates
polity|Regional diplomatic formula`],
      [15,`polity|State-list international obligations
polity|Preamble justice
polity|Eighth Schedule additions
polity|President and Speaker offices
geography|Energy classification
up|UP workforce share`],
      [16,`economy|Heritage-city programme
current|2020 farm-law provisions
culture|Folk-drama association
up|Shabri Sankalp initiative
up|Folk songs and occasions`],
      [17,`economy|RBI governors chronology
economy|MSME threshold definition
economy|Business legislation dates
economy|National-income sector
economy|Rural-development chronology`],
      [18,`economy|E-ration service milestone
scienceTech|CPU terminology
agriculture|Landholding classification
agriculture|Crop rotation
current|Rubber-tyred metro project
economy|Brent index`],
      [19,`agriculture|Kashi Lalima variety
agriculture|Mustard nutrient
agriculture|Potato research centre
agriculture|Tube-well irrigation
agriculture|Animal breeds
agriculture|Niger oilseed`],
      [20,`agriculture|Gootee propagation
agriculture|Fruit-production leaders
up|Sugarcane and milk production
culture|Language-country matching`],
      [21,`geography|Soil-state matching
up|UP million cities
population|Urban observatory
current|SDG Index 2020–21
geography|Dhoopgarh location`],
      [22,`environment|Biodiversity hotspot
population|Scheduled Tribe population order
population|UT sex ratio
population|Urban population share
environment|Monoclimax theory
environment|Disaster Management Act`],
      [23,`current|Smart Cities award
population|Slum population share
current|Forest Report 2019
current|Van Dhan training award
current|Railway electrification targets`],
      [24,`geography|Cyclone formation basin
geography|Mitali Express endpoints
economy|Sangam scheme purpose
culture|Sanskriti Ke Char Adhyay
current|Ek Pahal launch
polity|Djibouti anti-piracy code
environment|Climate Risk Index publisher`],
      [25,`current|Abraham Accord signatories
up|Defence-corridor investment MOU
current|Bimal Jalan 2021 book
current|Khelo India traditional sports
current|2021 food mega park`],
      [26,`current|NASA Venus missions
up|East-UP cable-car service
up|Black-pottery GI
up|UP river exclusion
up|Nepal-border districts
geography|Indonesia land neighbours
geography|Polynesian islands`],
      [27,`agriculture|Fish-production leader
economy|Skill-development schemes
geography|Land of Promise island
geography|Country capitals
agriculture|Crop-country matching
geography|Hydropower reliance`],
      [28,`geography|Hot-spring locations
geography|Steel-plant river location
population|Tamaria tribe location
geography|Freshwater lake
reasoning|City odd-one-out
reasoning|Category odd-one-out`],
      [29,`reasoning|Flow analogy
reasoning|Letter-number coding
reasoning|Squares and triangles
culture|Hindu-calendar seasons
reasoning|Mirror capitals`],
      [30,`reasoning|Number figure
reasoning|Odd-one-out
reasoning|Sequence counting
reasoning|Word formation
reasoning|Dictionary ordering
reasoning|Wrong-number series`]
    ])
  }
];

export function countsFor(analysis) {
  return Object.fromEntries(Object.keys(categories).map(category =>
    [category,analysis.rows.filter(row=>row.primary===category).length]));
}

export const methodology = [
  "These are editorial primary classifications of every GS question Q1–140 in each exact linked booklet, not official subject weights or a prediction. Full question text and marked scans are not reproduced here.",
  "Each question gets exactly one primary category. UP-local facts take UP-specific priority; dated awards, launches, report editions and news take current-affairs priority unless the question specifically tests a UP-local fact. Other questions follow the principal static concept.",
  "Crop inputs, pests and farming practices go to agriculture; general human/plant biology goes to biology. Location/resource questions go to geography; ecosystem mechanisms, pollution, conservation and environmental law go to environment. Urban/population indicators go to population. History, culture and polity use the principal tested relationship.",
  "Borderline choices are judgments: 2025 Q18 water cycle is geography, Q134 urban heat is population/urbanisation, Q85 a dated commission appointment is current affairs; 2021 Q39 sensory properties and Q45 plant phytochemicals are biology, Q133 traditional calendar ordering is culture. Another consistent classifier may allocate them differently.",
  "Counts always sum to 140 GS, never to 200. Historical Hindi topic counts were not audited. The current six Hindi areas × 10 is an official scheme allocation, not an inferred historical distribution.",
  "2025's combined sitting belongs to the 2023 recruitment re-examination. 2021 used separate GS/Hindi papers. The 20 September 2020 sitting belongs to the 2016 recruitment re-examination; it is provided as an archive link, not a completed classification here. Compare concepts, not raw scores across schemes.",
  "A count shows past exposure, not guaranteed future weight. Study every syllabus heading; use the counts to plan revision and diagnostic sampling, not to omit low-count subjects."
];
