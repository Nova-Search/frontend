// stores.js
import { writable } from 'svelte/store';

export const searchResults = writable([]);
export const currentPage = writable(1);
export const itemsPerPage = writable(15);