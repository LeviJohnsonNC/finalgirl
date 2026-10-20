const labels = new Intl.Collator('en', { sensitivity: 'base', numeric: true, ignorePunctuation: true });

/** Sort display labels, without changing catalogs or the selected value. */
export const compareDropdownLabels = (a: string, b: string) => labels.compare(a, b);
