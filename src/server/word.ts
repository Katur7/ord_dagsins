import fs from 'fs';

const json = fs.readFileSync('./processed/shuffled.json', 'utf-8');
const words = JSON.parse(json);

// Compute day offset since a fixed start date
export function daysBetween(startDate: string, currentDate: string): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  const diff = current.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Main function: get the Word of the Day
export function getWordOfTheDay(dateString: string): WordOfTheDay {
  const startDate = "1991-12-07";
  const dayOffset = daysBetween(startDate, dateString);

  const index = dayOffset % words.length;
  return words[index];
}

export function findByFlid(flid: number): WordOfTheDay | null {
  return words.find((w: WordOfTheDay) => w.flid === flid) ?? null;
}

export function findByFletta(fletta: string): WordOfTheDay | null {
  return words.find((w: WordOfTheDay) => w.fletta === fletta) ?? null;
}

// const today = new Date().toISOString().split('T')[0];
// const wordOfTheDay = getWordOfTheDay(today);
// console.log(`Word of the Day for ${today}:`);
// console.log(`Fletta: ${wordOfTheDay.fletta}`);
// console.log(`Translations: ${wordOfTheDay.translations.join(', ')}`);
// console.log('Examples:');
// for (const example of wordOfTheDay.examples) {
//   console.log(`- ${example.example} (${example.translation})`);
// }

export interface WordOfTheDay {
  flid: number;
  fletta: string;
  pos: string;
  gender: string | null;
  stuttbeyg: string | null;
  translations: string[];
  examples: Example[];
}

export interface Example {
  is: string;
  se: string;
}
