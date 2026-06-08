/* ---------- Seeded RNG ---------- */
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

/* ---------- Tables ---------- */
const tables = {
  person: ["my brother",
    "my sister",
    "my dad",
    "my mom",
    "my brother",
    "my sister",
    "my dad",
    "my mom",
    "my brother",
    "my sister",
    "my brother",
    "my sister",
    "my friend Evan",
    "my friend Harry",
    "my friend Austin",
    "my friend Alex",
    "my friend Kaden",
    "a random person",
    "the director of operations for the Ohio Soybean Council",
    "my union rep",
    "my ex",
    "an engineer from another company (who has been a giant pain to work with)",
    "a coworker",
    "a retired coworker",
    "someone named Chariz",
    "someone who can fit seven apricots in his mouth",
    "the newest county judge",
    "owner of my local game store",
    "a guy at the my local game store (who has done nothing but play esper control for the last ten years)",
    "someone I met at Dollar General",
    "the reincarnation of George Berkeley",
    "my accountant",
    "my former boyscout leader",
    "my only coworker who watches anime",
    "the youngest police officer in my town",
    "a guy who kinda looks like Charlie Day",
    "the chairman of my local historical society",
    "Greg (you know who you are)",
    "the only guy i've ever met who smokes blue American Spirits",
    "my 7' friend",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""],
  food: ["bagel and cream cheese",
    "eggs with chorizo and sourdough bread",
    "oatmeal (I love chia seeds)",
    "a cappuccino",
    "rice and beans",
    "sushi",
    "pizza with mushrooms",
    "the soup that makes you blind",
    "some campbell's soup",
    "Walmart sushi",
    "beef from my deep freeze",
    "concrete paste",
    "a tub of insects",
    "hotdogs",
    "baklava",
    "a granny-smith apple",
    "a red delicious apple (gross)",
    "Haggen-Dazs",
    "steak",
    "steak (as a reference to Earthbound",
    "cannellini beans (pinecone.rodeo/updates/cannellini-beans.html)",
    "Chipotle",
    "McDonalds",
    "Subway (against my better judgement)",
    "food from my local north African restaurant (It's so good)",
    "Indian",
    "authentic Ohio Chinese food",
    "food based on a friend's recommendation",
    "food from an anime-themed bar in Dayton Ohio",
    "a crunchwrap",
    "dimethyl hexane",
    "vegetable soup",
    "mac & cheese with frozen peas in it",
    "paprika on chicken",
    "chocolate",
    "gnocchi",
    "spaghetti with red sauce",
    "bacon and eggs (with turkey bacon)",
    "bacon and eggs",
    "spinach and artichoke dip",
    "bruschetta",
    "really good vinegar",
    "olive oil that was confiscated on my flight home from Italy (I got more)",
    "something I saw on scrandle (scrandle.com)",
    "something I saw on wordle",
    "nothing (fasting today)",
    "something new",
    "blueberries",
    "cucumber (they are pretty good uncooked with just salt)",
    "cucumber",
    "something mom would not approve of",
    "oatmeal cream pies",
    "cherry pie",
    "rhubarb pie",
    "risotto",
    "charcoal grilled chicken",
    "Top Ramen",
    "the worst burger I've ever had in my life",
    "a burger",
    "Armenian food",
    "homemade bread",
    "Thai food",
    "the finest pizza the Midwest has to offer",
    "pizza"],
  place: ["a Meier parking lot",
    "in a barn",
    "in a cow pasture",
    "at my local game store",
    "at a grocery store",
    "at the car dealership",
    "at Aldi's",
    "in my car",
    "in a rusted train car"],
  topic: [ "a listing on Facebook Marketplace for a safe where the owner doesn't know the correct combination",
  "the roman empire",
  "Hobby Lobby",
  "scrapbooking",
  "the Bechdel Test",
  "a tricky problem in Revit",
  "getting better earbuds",
  "the Totsuka Blade",
  "if I was an anime character what color my aura would be",
  "living in a simulation",
  "Youtube Shorts",
  "how to fillet a fish",
  "Werner Herzog",
  "basketball",
  "baseball",
  "booty",
  "the AI summary of my Pax Transhumanity essay",
  "the fact that Mike Tyson fought Logan Paul",
  "the video game version of I Saw the Sign (https://youtu.be/C8H-k1z9Z7A?si=cOpR6-n2-jqCmpy_&t=68)",
  "The Monty Hall Problem",
  "a 1-phase 2-wire panelboard",
  "hyperdulia",
  "a guy on YouTube who builds a greenhouse out of discarded wooden pallets",
  "a guy on YouTube who makes unique icecream by infusing the cream with pieces of wood",
  "Chorocojo (https://www.youtube.com/@Chorocojo)",
  "Classics of Game (https://www.youtube.com/@ClassicsOfGame)",
  "the fact that the Les Miserables movie may be Hugh Jackman's worst performance of all time",
  "what's stopping me from writing a 5-figure check to Doctors Without Borders",
  "the fact that a decrease in community activity correlates to a decrease in charitable work",
  "a badass birthday party invitation",
  "Magic: The Gathering (1997)",
  "Artifact: The DOTA Card Game",
  "Fargo (1996)",
  "Yu-Gi-Oh: The Abridged Series and how it's very Monty Python",
  "borders",
  "tea strainers",
  "Joe Abercrombie",
  "The Sengoku Jidai",
  "metric vs imperial unis",
  "The Gospel of Thomas",
  "the best books of all time",
  "Arianism",
  "blue sticky notes",
  "the best flavor of tea",
  "The Onion",
  "A Fistfull of Dollars (1964)",
  "an egregious amount of information",
  "actuarial tables",
  "this image (https://ihaspinecone.github.io/updates/thinking.webp)",
  "GFCI outlets",
  "my screename when I was 12",
  "the weather",
  "my health",
  "The Dark Knight Rises (2008)",
  "The Passion of the Christ (2004)",
  "how my 4th grade computer class made a We Didn't Start the Fire parody for some reason that i'm pretty sure we never finished",
  "wrist pain",
  "Dennis Prager",
  "Jordan Peterson",
  "HBomberGuy",
  "basic arithmatic",
  "something the british do wrong",
  "accumulating wealth",
  "Hellfire from The Hunchback of Notre Dame (1996)",
  "Black Midi",
  "Worm (https://parahumans.wordpress.com/)",
  "cows",
  "strawberries",
  "emails",
  "death",
  "Old Spice body wash",
  "Las Vegas",
  "breaking a hog trough at a wedding",
  "life",
  "changing the world",
  "world domination",
  "NEMA-3R dust-tight panels",
  "how lame computer science is",
  "the end of the world",
  "Hitchhiker's Guide to the Galaxy",
  "The Speaker for the Dead",
  "how good Ohio's State Flag is",
  "To Live and Die in LA (1985)",
  "The Producers (1967)",
  "what'd I'd do differently if I were in charge",
  "how much rain was in the rain gauge",
  "Jackie Robinson's football career",
  "the health of all good men",
  "vaping",
  "9/11",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""]
};

/* ---------- Helper ---------- */
function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

/* ---------- Cases ---------- */
const cases = [
  { text: "Watched a YouTube video about (topic)." },
  { text: "Ate (food)." },
  { text: "Looked up recipes for (food)." },
  { text: "Ordered (food)." },
  { text: "Talked to (person) about (food)." },
  { text: "Ate (food) while thinking about (topic)." },
  { text: "Met (person) at (place)." },
  { text: "Learned about (topic) from (person)." },
  { text: "Tried cooking (food) for (person)." },
  { text: "Visited (place) to study (topic)." },
  { text: "Discussed (topic) over (food)." },
  { text: "Watched (person) order (food)." },
  { text: "Dreamed about (place) and (topic)." },
  { text: "Helped (person) with (topic)." },
  { text: "Found (place) with (food)." },
  { text: "Argued with (person) about (topic)." },
  { text: "Shared (food) with (person)." },
  { text: "Explored (place) with (person)." },
  { text: "Watched (person) talk about (topic)." },
  { text: "Dropped (food) at (place)." },
  { text: "Ate some (food) at (place)." },
  { text: "Gifted (food) to (person)." },
  { text: "Texted (person) about (topic)." },
  { text: "Ordered (food) at (place)." },
  { text: "Studied (topic) while eating (food)." },
  { text: "Ran into (person) near (place)." },
  { text: "Recorded a vlog about (topic) with (person)." }
];

// Precompile templates 
const compiledCases = cases.map(c => {
  const parts = c.text.split(/(\(.*?\))/g);

  return parts.map(part => {
    const match = part.match(/^\((.*?)\)$/);
    if (match) return { type: "table", name: match[1] };
    return { type: "text", value: part };
  });
});

// Generator Factory
function createGenerator(seedInput) {
  const seed = hashSeed(seedInput);
  const rng = mulberry32(seed);

  return function generateOne() {
    const selected = compiledCases[Math.floor(rng() * compiledCases.length)];

    return selected.map(part => {
      if (part.type === "text") return part.value;
      return pick(tables[part.name], rng);
    }).join("");
  };
}

// UI Hook
function runGenerator() {
  const seed = document.getElementById("seed").value;
  const generator = createGenerator(seed);

  let results = [];
  for (let i = 0; i < 40; i++) {
    results.push(`${i + 1}. ${generator()}`);
  }

  document.getElementById("result").innerHTML = results.join("<br>");
}
