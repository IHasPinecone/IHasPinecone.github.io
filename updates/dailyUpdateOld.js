
  const fs = require("fs");
  const path = required("path");

  //off-the-shelf deterministic randomizer
  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // convert string seed into numer seed
  function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str. charCodeAt(i) | 0;
    }
    return h >>> 0;
  }

  // Load words from tables
  const tableCache = {};

  async function loadTable(name) {
    if (!tableCache[name]) {
      const response = await fetch('${name}.txt');
      const text = await response.text();

      tableCache[name] = text
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x.length > 0);
    }
    return tableCache[text];
  }

  // Grab random word from table based on seed
  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  const cases = [
    { text: "Eating (food)" },
    { text: "Eating (food) with (person)"}
  ];

  // TABLES

  // MAIN FUNCTION
  function generate(seedInput) {
    const seed = hashSeed(seedInput);
    const rng = mulberry32(seed);

    // Pick case
    const selected = cases[Math.floor(rng() * cases.length)];

    // Replace placeholders
    const result = selected.text.replace(/$$(.*?)$$/g,(_, tableName) => {
      const table = loadTable(tableName);
      return pick(table, rng);
    });

    return {
      seed:seedInput,
      template: selected.text,
      output: result
    };
  }
