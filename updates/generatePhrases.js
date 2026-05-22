export function generatePhrases(inputDate) {
  
  //determines number of days since May 1st 2025
  const startDate = new Date("2025-05-01");
  const givenDate = new Date(inputDate);

  const diffDays = Math.floor((givenDate - startDate) / (1000 * 60 * 60 * 24));

  // turn date seed into 45 number hash
  // every entry uses 11 numbers of the hash
  // first number is number of entries for today (max 4).
  // for each entry
	//    number 1,2,3,4 is minute after 6am mod 1200
	//    5,6,7 main content
	//    8,9,10 for optional
	//    11 for location (2/10 chance)

  return diffDays;
  
}
