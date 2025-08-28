// A small selection of ColorBrewer sequential palettes and a Colorgorical-like palette
// Colors ordered from light (low) to dark (high)

export type PaletteName =
  | 'Blues'
  | 'Greens'
  | 'OrRd'
  | 'PuBu'
  | 'YlGnBu'
  | 'Colorgorical1';

const BREWER: Record<PaletteName, string[]> = {
  Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
  PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
  YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
  Colorgorical1: ['#f3f4f6', '#bdd7e7', '#80b1d3', '#4f9da6', '#2f7e8d', '#1f5f74', '#184a61', '#10384d'],
};

export function getPalette(name: PaletteName, classes: number): string[] {
  const base = BREWER[name] || BREWER.Blues;
  const n = Math.max(3, Math.min(classes, base.length));
  // Evenly sample colors from the base array to get n classes
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i * (base.length - 1)) / (n - 1));
    out.push(base[idx]);
  }
  return out;
}

