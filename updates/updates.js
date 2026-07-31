function parseSeed(seed) {
  const [monthName, yearString] = seed.trim().split(/\s+/);
  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11
  };
  return new Date(parseInt(yearString, 10), monthMap[monthName], 1);
}

function formatSeed(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });
}
  
  function runMany() {
    const seed = currentSeed;
    document.getElementById("monthDisplay").textContent = seed;
    
    const generator = createGenerator(seed);
    const rng = mulberry32(hashSeed(seed + "-dates"));
    
    const { yearNum, monthNum } = parseSeed(seed);

    const [monthName, yearString] = seed.trim().split(/\s+/);
    const year = parseInt(yearString, 10);

    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    }

    const month = monthMap[monthName];
    const selectedMonth = new Date(year, month, 1);
    
    const currentEastern = new Date(
      new Date().toLocaleString("en-US", {
      timeZone: "America/New_York"
    })
  );
  
  const currentMonth = new Date(
    currentEastern.getFullYear(),
    currentEastern.getMonth(),
    1
  );

    const easternNow = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/New_York"
      })
    );

    // Determine latest allowable timestamp
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = new Date(year, month, 1, 0, 0, 0);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
    
    //if this is the current month, stop at current eastern time.
    let rangeEnd = monthEnd;
    if (
      year === currentEastern.getFullYear() &&
      month === currentEastern.getMonth()
    ) {
      rangeEnd = currentEastern;
    }

    // timestamp generation loop
    const entries = [];

    // generates between 25-40 entires per month
    const entryCount = 25 + Math.floor(rng() * 16);
    for (let i = 0; i < entryCount; i++) {
      let timestamp;

      while (true) {
        const randomTime =
        monthStart.getTime() +
        Math.floor(
          rng() * (monthEnd.getTime() - monthStart.getTime())
        );

        const d = new Date(randomTime);

        const hour = d.getHours();

        // valid times is 5AM through 10pm. or Midnight to 1AM
        if ((hour >= 5 && hour <= 22) || hour === 0) {
          timestamp = d;
          break;
        }
      }

      entries.push({
        timestamp,
        text: generator()
      });
    }

    // sort chronologically
    entries.sort((a, b) => b.timestamp - a.timestamp);

    // if it's the current month, remove future entries
    if (
      year === currentEastern.getFullYear() &&
      month === currentEastern.getMonth()
    ) {
      entries.splice(
        0,
        entries.length,
        ...entries.filter(
          entry => entry.timestamp <= currentEastern
        )
      );
    }


    let output = "";

    for (const entry of entries) {
      const stamp = entry.timestamp.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

      output += `
      <div class="update">
        <div class="post-header">
          <span class="post-date"">${stamp}</span>
        </div>
        <div class="post-text">
          ${linkify(entry.text)}
        </div>
      </div>
      `;
    }

    // identify most recent
    const latest = entries[entries.length - 1];

    document.getElementById("result").innerHTML = output;
    updateButtons();
  }

  function linkify(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    url => `<a href=${url}>link</a>`
  );
}

function getLatestUpdate() {
    const seed = getCurrentMonthSeed();
    const generator = createGenerator(seed);
    const rng = mulberry32(hashSeed(seed + "-dates"));

    // Generate one update
    return {
      timestamp: new Date(),
      text: generator()
    }
}

function getSeedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("date");

  if (!value) return null;

  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;

  return formatSeed(new Date(year, month, 1));
}

function updateUrlFromSeed(seed) {
  const d = parseSeed(seed);

  const month =
    String(d.getMonth() + 1).padStart(2, "0");

  const value = `${d.getFullYear()}-${month}`;

  const url = new URL(window.location);
  url.searchParams.set("date", value);

  history.replaceState({}, "", url);
}

  function getCurrentMonthSeed() {
    const now = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/New_York"
      })
    );

    return now.toLocaleString("en-US", {
      month: "long",
     year: "numeric"
    });
  }

  function getCurrentMonth() {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/New_York"
    })
  );
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function changeMonth(offset) {
  let d = parseSeed(currentSeed);

  d.setMonth(d.getMonth() + offset);

  const current = getCurrentMonth();

  if (d < FIRST_MONTH) d = new Date(FIRST_MONTH);
  if (d > current) d = new Date(current);

  currentSeed = formatSeed(d);

  updateUrlFromSeed(currentSeed);

  runMany();
}

function goPrevious() {
  changeMonth(-1);
}

function goNext() {
  changeMonth(1);
}

function goFirst() {
  currentSeed = formatSeed(FIRST_MONTH);
  updateUrlFromSeed(currentSeed);
  runMany();
}

function goLast() {
  currentSeed = formatSeed(getCurrentMonth());
  updateUrlFromSeed(currentSeed);
  runMany();
}

function updateButtons() {
  const current = getCurrentMonth();
  const viewed = parseSeed(currentSeed);

  const atFirst = viewed.getTime() === FIRST_MONTH.getTime();
  const atLast = viewed.getTime() === current.getTime();

  document.getElementById("firstBtn").style.visibility =
    atFirst ? "hidden" : "visible";

  document.getElementById("prevBtn").style.visibility =
    atFirst ? "hidden" : "visible";

  document.getElementById("nextBtn").style.visibility =
    atLast ? "hidden" : "visible";

  document.getElementById("lastBtn").style.visibility =
    atLast ? "hidden" : "visible";

  document.getElementById("botfirstBtn").style.visibility =
    atFirst ? "hidden" : "visible";

  document.getElementById("botprevBtn").style.visibility =
    atFirst ? "hidden" : "visible";

  document.getElementById("botnextBtn").style.visibility =
    atLast ? "hidden" : "visible";

  document.getElementById("botlastBtn").style.visibility =
    atLast ? "hidden" : "visible";
}
