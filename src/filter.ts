import fs from 'fs';
import path from 'path';

const dir = fs.readdirSync('./raw');
const allData: any[] = [];
for (const file of dir) {
    const json = fs.readFileSync(path.join('./raw', file), 'utf-8');
    const parsedJson = JSON.parse(json);
    const data = parsedJson.results;
    const usefulData = processData(data);
    allData.push(...usefulData);
}

console.log(allData.length);

const filteredDataJson = JSON.stringify(allData, null, 2);
fs.writeFileSync(path.join('./processed', 'filtered.json'), filteredDataJson, 'utf-8');

function processData(data: any[]) {
    const CATEGORIES_TO_EXCLUDE = ['skst', 'inf', 'prae/adv', 'adv'];
    const returnData: any[] = [];
    for (const item of data) {
        if(CATEGORIES_TO_EXCLUDE.includes(item.ofl)) {
            continue;
        }
        const processedItems = processItems(item.items);
        const translations = processedItems.filter((i: any) => i.type === 'translation') || [];
        const examples = processedItems.filter((i: any) => i.type === 'example') || [];
        if(translations.length === 0 || examples.length === 0) {
            continue;
        }

        returnData.push({
            flid: item.flid,
            fletta: item.fletta,
            translations: translations.map((t: any) => t.translation),
            examples: examples.map((e: any) => ({ is: e.example, se: e.translation })),
        });
    }
    return returnData;
}

function processItems(items: any[]) {
    const returnItems: any[] = [];
    for (const subitem of items) {
        if(subitem.teg === 'DÆMI') {
            const translation = items.find((i => i.teg === 'SE-þýð' && i.paritem === subitem.itid));
            if(translation) {
                returnItems.push({
                    type: 'example',
                    example: subitem.texti,
                    translation: translation.texti,
                    paritem: subitem.paritem
                });
            }
        } else if(subitem.teg === 'SE-jafn') {
            returnItems.push({
                type: 'translation',
                translation: subitem.texti,
            });
        }
    }
    return returnItems;
}
