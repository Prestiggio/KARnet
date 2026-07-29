import { detect } from '@tonaljs/chord-detect';

/**
 * Détection d'accord à partir d'un ensemble de notes MIDI jouées ensemble,
 * via `@tonaljs/chord-detect` (reconnaît triades, 7èmes, sus, renversements…).
 */

const NOTE_NAMES_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_SOLFEGE = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const LETTER_PITCH_CLASS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export type Notation = 'letters' | 'solfege';

export function noteName(pitchClass: number, notation: Notation): string {
	const names = notation === 'solfege' ? NOTE_NAMES_SOLFEGE : NOTE_NAMES_LETTERS;
	return names[((pitchClass % 12) + 12) % 12] as string;
}

/** Traduit le nom de note en tête d'un token ("C", "C#", "Bb"...) dans la notation choisie, en gardant le reste (suffixe d'accord). */
function translateNoteToken(token: string, notation: Notation): string {
	if (notation === 'letters') return token;

	const match = token.match(/^([A-G])(#|b)?/);
	if (!match) return token;

	const [full, letter, accidental] = match as [string, string, string | undefined];
	const offset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
	const pitchClass = (LETTER_PITCH_CLASS[letter]! + offset + 12) % 12;

	return noteName(pitchClass, notation) + token.slice(full.length);
}

/** Traduit un symbole d'accord ("Em#5/C"...) renvoyé par tonal, racine et note de basse (renversement) comprises. */
function translateSymbol(symbol: string, notation: Notation): string {
	if (notation === 'letters') return symbol;

	const [main, bass] = symbol.split('/');
	const translatedMain = translateNoteToken(main as string, notation);
	return bass ? `${translatedMain}/${translateNoteToken(bass, notation)}` : translatedMain;
}

/**
 * `notes` : numéros de notes MIDI (0-127) jouées ensemble.
 */
export function detectChord(notes: number[], notation: Notation): string {
	if (notes.length === 0) return '';

	const letterNames = [...new Set(notes.map((n) => noteName(n % 12, 'letters')))];
	if (letterNames.length === 1) {
		return noteName(notes[0] as number, notation);
	}

	const [best] = detect(letterNames);
	if (best) return translateSymbol(best, notation);

	// Rien reconnu par tonal : simple listing des notes triées par hauteur.
	return [...new Set(notes)]
		.sort((a, b) => a - b)
		.map((n) => noteName(n % 12, notation))
		.join('/');
}
