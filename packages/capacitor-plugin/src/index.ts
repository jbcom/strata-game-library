import { registerPlugin } from '@capacitor/core';
import type { StrataPlugin } from './definitions';

const Strata = registerPlugin<StrataPlugin>('Strata', {
  web: () => import('./web').then(m => new m.StrataWeb()),
});

export * from './definitions';
export { Strata };
