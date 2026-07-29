<template>
	<div class="song-chord-root">
		<p class="song-chord-status">
			<template v-if="midiStatus === 'unsupported'">⚠️ Web MIDI non supporté par ce navigateur (utiliser Chrome/Edge).</template>
			<template v-else-if="midiStatus === 'denied'">⚠️ Accès MIDI refusé.</template>
			<template v-else-if="midiStatus === 'requesting'">Connexion au clavier MIDI…</template>
			<template v-else-if="connectedInputNames.length">🎹 {{ connectedInputNames.join(', ') }}</template>
			<template v-else>🎹 Aucun clavier MIDI détecté (branchez-en un puis rechargez la page).</template>
		</p>
		<textarea
			ref="textareaEl"
			v-model="localValue"
			:disabled="disabled"
			class="song-chord-textarea"
			rows="6"
			@input="onLocalInput"
		></textarea>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { detectChord, type Notation } from './chordDetection';

const props = withDefaults(
	defineProps<{
		value: string | null;
		disabled?: boolean;
		notation?: Notation;
	}>(),
	{
		disabled: false,
		notation: 'letters',
	},
);

const emit = defineEmits<{
	(e: 'input', value: string | null): void;
}>();

const textareaEl = ref<HTMLTextAreaElement | null>(null);
const localValue = ref(props.value ?? '');
const midiStatus = ref<'unsupported' | 'requesting' | 'connected' | 'denied'>('requesting');
const connectedInputNames = ref<string[]>([]);

// Notes actuellement enfoncées, et notes vues depuis le début du geste en
// cours (utile si les touches d'un même accord sont relâchées légèrement
// décalées dans le temps : on ne "commite" l'accord que quand tout est
// relâché, en se basant sur l'ensemble complet joué).
const heldNotes = new Set<number>();
const peakNotes = new Set<number>();

watch(
	() => props.value,
	(v) => {
		if (v !== localValue.value) localValue.value = v ?? '';
	},
);

function onLocalInput(): void {
	emit('input', localValue.value || null);
}

function insertAtCaret(text: string): void {
	const el = textareaEl.value;
	if (!el) {
		localValue.value = localValue.value ? `${localValue.value}${text}` : text;
		onLocalInput();
		return;
	}

	el.focus();
	const start = el.selectionStart ?? el.value.length;
	const end = el.selectionEnd ?? el.value.length;
	el.setSelectionRange(start, end);

	// document.execCommand('insertText', ...) plutôt qu'une affectation directe
	// de `.value` : c'est la seule façon fiable de préserver l'historique
	// d'annulation (Cmd/Ctrl+Z) du textarea lors d'une insertion programmatique
	// — écrire `.value` efface tout l'historique d'undo natif du champ.
	const inserted = document.execCommand('insertText', false, text);
	if (!inserted) {
		// Fallback si execCommand n'est pas supporté (perd l'undo, insère quand même).
		localValue.value = `${el.value.slice(0, start)}${text}${el.value.slice(end)}`;
		onLocalInput();
	}
}

function handleNoteOn(note: number): void {
	heldNotes.add(note);
	peakNotes.add(note);
}

function handleNoteOff(note: number): void {
	heldNotes.delete(note);
	if (heldNotes.size === 0 && peakNotes.size > 0) {
		const chord = detectChord([...peakNotes], props.notation);
		peakNotes.clear();
		if (chord) insertAtCaret(`[${chord.replace(/M$/, '')}]`);
	}
}

function attachInput(input: MIDIInput): void {
	input.onmidimessage = (event: MIDIMessageEvent) => {
		const data = event.data;
		if (!data || data.length < 3) return;
		const status = data[0] as number;
		const note = data[1] as number;
		const velocity = data[2] as number;
		const command = status & 0xf0;

		if (command === 0x90 && velocity > 0) handleNoteOn(note);
		else if (command === 0x80 || (command === 0x90 && velocity === 0)) handleNoteOff(note);
	};

	const name = input.name ?? 'Périphérique MIDI';
	if (!connectedInputNames.value.includes(name)) connectedInputNames.value.push(name);
}

let midiAccess: MIDIAccess | null = null;

onMounted(async () => {
	if (!navigator.requestMIDIAccess) {
		midiStatus.value = 'unsupported';
		return;
	}

	try {
		midiAccess = await navigator.requestMIDIAccess();
		midiStatus.value = 'connected';
		for (const input of midiAccess.inputs.values()) attachInput(input);

		midiAccess.onstatechange = (event) => {
			const port = event.port;
			if (port?.type === 'input' && port.state === 'connected') attachInput(port as MIDIInput);
		};
	} catch {
		midiStatus.value = 'denied';
	}
});

onBeforeUnmount(() => {
	if (midiAccess) {
		for (const input of midiAccess.inputs.values()) input.onmidimessage = null;
		midiAccess.onstatechange = null;
	}
});
</script>

<style scoped>
.song-chord-root {
	width: 100%;
}

.song-chord-status {
	margin: 0 0 8px;
	font-size: 13px;
	color: var(--theme--foreground-subdued, #6e6e6e);
}

.song-chord-textarea {
	width: 100%;
	min-height: 120px;
	font-family: monospace;
	padding: 8px;
	border: var(--theme--border-width, 1px) solid var(--theme--form--field--input--border-color, #ccc);
	border-radius: var(--theme--border-radius, 6px);
	background: var(--theme--form--field--input--background, transparent);
	color: inherit;
}
</style>
