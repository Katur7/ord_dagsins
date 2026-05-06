import fs from 'fs';
import path from 'path';
import { extractRecord, loadIgnoreSet, type WordRecord } from './extract.ts';
import { deterministicShuffle, hashStringToSeed } from './shuffle.ts';

const ignoreSet = loadIgnoreSet(fs.readFileSync('./src/preprocess/ignore.txt', 'utf-8'));

const records: WordRecord[] = [];
let totalIn = 0;
for (const file of fs.readdirSync('./raw')) {
    const raw = JSON.parse(fs.readFileSync(path.join('./raw', file), 'utf-8'));
    const data = raw.results;
    let kept = 0;
    for (const item of data) {
        const r = extractRecord(item, ignoreSet);
        if (r) {
            records.push(r);
            kept++;
        }
    }
    console.log(`${file}: ${data.length} → ${kept}`);
    totalIn += data.length;
}
console.log(`total: ${totalIn} → ${records.length}`);

const shuffled = deterministicShuffle(records, hashStringToSeed('WORD'));
fs.writeFileSync('./processed/shuffled.json', JSON.stringify(shuffled, null, 2), 'utf-8');
