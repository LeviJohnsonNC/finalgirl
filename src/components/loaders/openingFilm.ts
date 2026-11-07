const stills = import.meta.glob<string>('../../assets/loaders/film/*/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
});

export function openingFilmStills(location: string) {
  const key = location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return ['01', '02', '03'].map(frame => stills[`../../assets/loaders/film/${key}/${key}-${frame}.webp`]);
}
