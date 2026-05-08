export type RawItem = {
    itid: number;
    texti: string;
    paritem: number;
    teg: string;
};

export type RawRecord = {
    flid: number;
    fletta: string;
    ofl: string | null;
    stuttbeyg: string | null;
    items: RawItem[];
};

export type Example = { is: string; se: string };

export type WordRecord = {
    flid: number;
    fletta: string;
    pos: string;
    gender: string | null;
    stuttbeyg: string | null;
    translations: string[];
    examples: Example[];
};

export function parseOfl(ofl: string | null | undefined): { pos: string; gender: string | null } {
    const [pos = '', second] = (ofl ?? '').split(' ');
    const gender = pos === 'n' ? (second ?? null) : null;
    return { pos, gender };
}

export function processItems(items: RawItem[]): { translations: string[]; examples: Example[] } {
    const translations: string[] = [];
    const seen = new Set<string>();
    const examples: Example[] = [];
    for (const subitem of items) {
        if (subitem.teg === 'DÆMI') {
            const translation = items.find(i => i.teg === 'SE-þýð' && i.paritem === subitem.itid);
            if (translation) {
                examples.push({ is: subitem.texti, se: translation.texti });
            }
        } else if (subitem.teg === 'SE-jafn' && !seen.has(subitem.texti)) {
            seen.add(subitem.texti);
            translations.push(subitem.texti);
        }
    }
    return { translations, examples };
}

export function shouldKeep(item: RawRecord, ignoreSet: Set<string>): boolean {
    const { pos } = parseOfl(item.ofl);
    if (pos === 'skst') return false;
    const fletta = item.fletta ?? '';
    if (fletta.includes(' ')) return false;
    if (fletta.startsWith('-') || fletta.endsWith('-')) return false;
    if (fletta.replace(/[-\s]/g, '').length < 4) return false;
    if (ignoreSet.has(fletta.trim().toLowerCase())) return false;
    return true;
}

export function extractRecord(item: RawRecord, ignoreSet: Set<string>): WordRecord | null {
    if (!shouldKeep(item, ignoreSet)) return null;
    const { pos, gender } = parseOfl(item.ofl);
    const { translations, examples } = processItems(item.items);
    if (translations.length === 0 || examples.length === 0) return null;
    return {
        flid: item.flid,
        fletta: item.fletta,
        pos,
        gender,
        stuttbeyg: item.stuttbeyg ?? null,
        translations,
        examples,
    };
}

export function loadIgnoreSet(text: string): Set<string> {
    return new Set(
        text.split('\n')
            .map(line => line.trim().toLowerCase())
            .filter(line => line.length > 0)
    );
}
