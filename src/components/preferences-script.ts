/**
 * Runs before the page paints (inline in the root layout's <head>): restores the visitor's stored theme and motion
 * choices onto <html>, so a chosen theme never flashes the other one first. Kept outside the "use client" module so
 * the server layout can read the string. Mirrors preferences.ts.
 */
export const RESTORE_PREFERENCES = `try{for(var k of["theme","motion"]){var v=localStorage.getItem(k);if(v)document.documentElement.dataset[k]=v}}catch(e){}`;
