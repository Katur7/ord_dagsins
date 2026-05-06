import { getWordOfTheDay } from '../server/word.ts'

let today = new Date();
for(let i = 0; i < 100; i++) {
    const dateString = today.toISOString().split('T')[0];
    const wordOfTheDay = getWordOfTheDay(dateString);
    console.log(`Word of the Day for ${dateString}. Fletta: ${wordOfTheDay.fletta}. Translations: ${wordOfTheDay.translations.join(', ')}`);
    today = add24Hours(today);}

function add24Hours(date: Date) {
    const millisecondsIn24Hours = 24 * 60 * 60 * 1000;
    date.setTime(date.getTime() + millisecondsIn24Hours);
    return date;
}