const IS_MONTHS = [
  'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní',
  'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember',
];

export function formatDateIs(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()}. ${IS_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const POS_MAP: Record<string, string> = {
  adj: 'lýsingarorð',
  n: 'nafnorð',
  v: 'sagnorð',
  adv: 'atviksorð',
  conj: 'samtenging',
  prae: 'forsetning',
  pron: 'fornafn',
  num: 'töluorð',
  int: 'upphrópun',
};

export function mapPos(code: string): string | null {
  if (!code) return null;
  const parts = code.split('/');
  const mapped: string[] = [];
  for (const part of parts) {
    const word = POS_MAP[part];
    if (!word) return null;
    mapped.push(word);
  }
  return mapped.join(' · ');
}

const GENDER_MAP: Record<string, string> = {
  m: 'karlkyn',
  f: 'kvenkyn',
  n: 'hvorugkyn',
  mpl: 'karlkyn fleirtala',
  fpl: 'kvenkyn fleirtala',
  npl: 'hvorugkyn fleirtala',
};

export function mapGender(code: string | null): string | null {
  if (!code) return null;
  const parts = code.split('/');
  const mapped: string[] = [];
  for (const part of parts) {
    const word = GENDER_MAP[part];
    if (!word) return null;
    mapped.push(word);
  }
  return mapped.join(' · ');
}
