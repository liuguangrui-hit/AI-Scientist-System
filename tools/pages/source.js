// server/source/index.js for the static build: demo mode only. A static host has
// no project directory to read and nowhere to write verdicts back to.
import { makeWorkspace } from '../seed.js';

export const MODE = 'demo';
export const ROOT = null;
export const READONLY = false;
export function describe() { return { mode: 'demo', writable: true, root: null, problems: [], shared: false }; }
export function workspace() { return makeWorkspace(Date.now()); }
export const isShared = () => false;
export function invalidate() {}
export function persist() { return { written: false }; }
