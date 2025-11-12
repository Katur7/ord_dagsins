import express from 'express';
import { getWordOfTheDay } from './word.ts';

const app = express();
const port = 3000;

app.set('views', './src/views');
app.set('view engine', 'pug')

app.get('/', (req: express.Request, res: express.Response) => {
  const dateParam = req.query.date as string | undefined;
  const date = dateParam ? new Date(dateParam) : new Date();
  const dateString = date.toISOString().split('T')[0];
  const word = getWordOfTheDay(dateString);
  const shuffledExamples = shuffle(word.examples).slice(0, 2); // Show only 2 random examples;
  shuffledExamples.sort((a, b) => {
    if(a.is < b.is) return -1;
    if(a.is > b.is) return 1;
    return 0;
  });
  if(req.header('Content-Type') === 'application/json') {
    res.type('application/json');
    res.send({  date: dateString, ...word, examples: shuffledExamples });
  } else {
    res.type('text/html');
    const title = `Orð dagsins ${dateString}`;
    const translations = word.translations.join(', ');
    res.render('index', { title, word, translations });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

function printWordOfTheDay(dateString: string) {
  const wordOfTheDay = getWordOfTheDay(dateString);
  console.log(`Word of the Day for ${dateString}:`);
  console.log(`Fletta: ${wordOfTheDay.fletta}`);
  console.log(`Translations: ${wordOfTheDay.translations.join(', ')}`);
  console.log('Examples:');
  for (const example of wordOfTheDay.examples) {
    console.log(`- ${example.is} (${example.se})`);
  }
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle(originalArray: any[]): any[] {
  // Create a copy of the original array
  const array = [...originalArray];   
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
