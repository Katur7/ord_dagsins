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
  if(req.header('Content-Type') === 'application/json') {
    res.type('application/json');
    res.send({  date: dateString, ...word });
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
