import { getWordOfTheDay } from '../server/word.ts'

const count = Number(process.argv[2]) || 100;
let today = new Date();
for(let i = 0; i < count; i++) {
    const dateString = today.toISOString().split('T')[0];
    const wordOfTheDay = getWordOfTheDay(dateString);
    console.log(`Word of the Day for ${dateString}. Fletta: ${wordOfTheDay.fletta}. Translations: ${wordOfTheDay.translations.join(', ')}`);
    today = add24Hours(today);}

function add24Hours(date: Date) {
    const millisecondsIn24Hours = 24 * 60 * 60 * 1000;
    date.setTime(date.getTime() + millisecondsIn24Hours);
    return date;
}