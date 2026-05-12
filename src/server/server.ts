import express from 'express';
import { findByFletta, findByFlid, getWordOfTheDay, type WordOfTheDay } from './word.ts';
import { formatDateIs, mapGender, mapPos } from './format.ts';

const app = express();
const port = 3000;

app.set('views', './src/server/views');
app.set('view engine', 'pug')
app.use('/styles', express.static('./src/server/styles'));
app.use('/public', express.static('./src/server/public'));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

app.get('/', (req: express.Request, res: express.Response) => {
  const dateParam = req.query.date as string | undefined;
  const flettaParam = req.query.fletta as string | undefined;
  const flidParam = req.query.flid as string | undefined;

  let dateString: string;
  if (dateParam) {
    if (!ISO_DATE.test(dateParam) || isNaN(new Date(dateParam + 'T12:00:00').getTime())) {
      res.status(400).type('text/plain').send('Invalid date');
      return;
    }
    dateString = dateParam;
  } else {
    dateString = new Date().toISOString().split('T')[0];
  }

  let word: WordOfTheDay | null;
  if (flidParam !== undefined) {
    const flid = Number(flidParam);
    word = Number.isInteger(flid) ? findByFlid(flid) : null;
    if (!word) {
      res.status(400).type('text/plain').send('Word not found');
      return;
    }
  } else if (flettaParam !== undefined) {
    word = findByFletta(flettaParam);
    if (!word) {
      res.status(400).type('text/plain').send('Word not found');
      return;
    }
  } else {
    word = getWordOfTheDay(dateString);
  }

  const shuffledExamples = shuffle(word.examples).slice(0, 2);
  shuffledExamples.sort((a, b) => {
    if (a.is < b.is) return -1;
    if (a.is > b.is) return 1;
    return 0;
  });

  if (req.header('Content-Type') === 'application/json' || req.header('Accept') === 'application/json') {
    res.type('application/json');
    res.send({ date: dateString, ...word, examples: shuffledExamples });
    return;
  }

  res.type('text/html');
  const posWord = mapPos(word.pos);
  const genderWord = mapGender(word.gender);
  const wordClassLine = posWord
    ? (genderWord ? `${posWord} · ${genderWord}` : posWord)
    : null;
  res.render('index', {
    formattedDate: formatDateIs(dateString),
    wordIs: word.fletta,
    wordClassLine,
    translations: word.translations,
    examples: shuffledExamples,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle(originalArray: any[]): any[] {
  const array = [...originalArray];
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
