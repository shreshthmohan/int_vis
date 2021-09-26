const fs = require("fs");
const rawData = fs.readFileSync("src/data/counties-albers-10m.json").toString();
const states = JSON.parse(rawData).objects.states.geometries;

const stateNames = states.map((state) => state.properties.name);

quarters = [
  "2019-Q1",
  "2019-Q2",
  "2019-Q3",
  "2019-Q4",
  "2020-Q1",
  "2020-Q2",
  "2020-Q3",
  "2020-Q4",
  "2021-Q1",
  "2021-Q2",
];

const rateRange = [0.1, 0.95];

// deviation between frustration and unemployment
const devi = 0.15;

function randomBetween([low = 0, high = 1]) {
  return low + (high - low) * Math.random();
}

function deviated({ from, by, low, high }) {
  let value = from - from * by + from * 2 * by * Math.random();
  if (value > high) {
    value = high;
  } else if (value < low) {
    value = low;
  }
  return value;
}

const rows = [["quarter", "queue", "size", "frustration", "unemployment"]];

stateNames.forEach((state, i) => {
  // if (i > 10) {
  //   return;
  // }
  const size = Math.floor(2 * randomBetween([0.5, 6]));
  quarters.forEach((qtr) => {
    const frust = randomBetween(rateRange);
    const unemp = deviated({
      from: frust,
      by: devi,
      low: rateRange[0],
      high: rateRange[1],
    });
    const row = [
      qtr,
      state,
      size,
      parseFloat(frust.toFixed(2)),
      parseFloat(unemp.toFixed(2)),
    ];
    rows.push(row);
  });
});

const strForFile = rows.map((r) => r.join(",")).join("\n");

fs.writeFileSync("src/data/q1.csv", strForFile);
