// Utility: simple seeded random generator (based on date)
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a deterministic 45-digit string from today's date
function generateNumberString() {
  const today = new Date();
  const seedBase = today.getFullYear() * 10000 +
                   (today.getMonth() + 1) * 100 +
                   today.getDate();

  let result = "";
  let seed = seedBase;

  for (let i = 0; i < 45; i++) {
    seed += i;
    result += Math.floor(seededRandom(seed) * 10);
  }

  return result;
}

// Fetch text file and split into array
async function loadWords(file) {
  const response = await fetch(file);
  const text = await response.text();
  return text.split("\n").map(w => w.trim()).filter(w => w.length > 0);
}

// Main function
async function generatePhrases() {
  const numberString = generateNumberString();

  // Ensure first digit is between 1–4
  let phraseCount = parseInt(numberString[0]);
  if (phraseCount < 1 || phraseCount > 4) {
    phraseCount = (phraseCount % 4) + 1;
  }

  const foods = await loadWords("food.txt");
  const locations = await loadWords("locations.txt");

  let phrases = [];

  for (let i = 0; i < phraseCount; i++) {
    const food = foods[Math.floor(Math.random() * foods.length)];

    let phrase = `Eating ${food}`;

    // 10% chance to add location
    if (Math.random() < 0.1) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      phrase += ` at ${location}`;
    }

    phrases.push(phrase);
  }

  return phrases;
}
