export function useTable(table1, seed) {
  const seedtest = Math.floor(Date.now() / 864000000);
  const hash = simpleHash(seed.toString());

  return [
    pickWord(hash.slice(0,3), table)
    ];
}
