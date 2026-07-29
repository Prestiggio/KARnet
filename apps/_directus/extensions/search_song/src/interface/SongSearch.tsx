import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface SongHit {
	id: string;
	_score?: number;
	[key: string]: unknown;
}

interface Props {
	value: string | null;
	disabled: boolean;
	placeholder: string;
	valuePath: string;
	search: (query: string) => Promise<SongHit[]>;
	onSelect: (song: SongHit) => void | Promise<void>;
	onInput: (value: string | null) => void;
}

function get(obj: unknown, path: string): unknown {
	return path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function useDebounced<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}

export default function SongSearch(props: Props) {
	const { value, disabled, placeholder, valuePath, search, onSelect, onInput } = props;

	const [query, setQuery] = useState(value ?? '');
	const [results, setResults] = useState<SongHit[]>([]);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [highlighted, setHighlighted] = useState(-1);
	const skipNextSearch = useRef(false);
	const rootRef = useRef<HTMLDivElement>(null);

	const debouncedQuery = useDebounced(query, 300);

	// Synchronise la valeur venant de Directus (ex: reset du formulaire)
	useEffect(() => {
		//skipNextSearch.current = true;
		setQuery(value ?? '');
	}, [value]);

	// Recherche debouncée
	useEffect(() => {
		if (skipNextSearch.current) {
			skipNextSearch.current = false;
			return;
		}
		if (!debouncedQuery || debouncedQuery.trim().length < 2) {
			setResults([]);
			setOpen(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setError(null);
		search(debouncedQuery.trim())
			.then((hits) => {
				if (cancelled) return;
				setResults(hits);
				setOpen(true);
				setHighlighted(hits.length > 0 ? 0 : -1);
			})
			.catch(() => {
				if (!cancelled) setError('Erreur lors de la recherche');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [debouncedQuery, search]);

	// Fermer le dropdown au clic extérieur
	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener('mousedown', onClickOutside);
		return () => document.removeEventListener('mousedown', onClickOutside);
	}, []);

	const select = useCallback(
		(song: SongHit) => {
			skipNextSearch.current = true;
			const label = get(song, valuePath);
			setQuery(label == null ? '' : String(label));
			setOpen(false);
			setResults([]);
			void onSelect(song);
		},
		[onSelect, valuePath],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!open || results.length === 0) return;
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setHighlighted((h) => (h + 1) % results.length);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setHighlighted((h) => (h - 1 + results.length) % results.length);
			} else if (e.key === 'Enter') {
				e.preventDefault();
				if (highlighted >= 0) select(results[highlighted]);
			} else if (e.key === 'Escape') {
				setOpen(false);
			}
		},
		[open, results, highlighted, select],
	);

	const styles = useMemo(
		() => ({
			wrapper: {
				position: 'relative',
				width: '100%',
				fontFamily: 'var(--theme--fonts--sans--font-family)',
			} as React.CSSProperties,
			input: {
				width: '100%',
				height: 'var(--theme--form--field--input--height, 60px)',
				padding: '0 16px',
				border: 'var(--theme--border-width, 2px) solid var(--theme--form--field--input--border-color, var(--theme--border-color))',
				borderRadius: 'var(--theme--border-radius, 6px)',
				background: 'var(--theme--form--field--input--background, var(--theme--background))',
				color: 'var(--theme--foreground)',
				fontSize: '15px',
				outline: 'none',
			} as React.CSSProperties,
			dropdown: {
				position: 'absolute',
				top: 'calc(100% + 4px)',
				left: 0,
				right: 0,
				zIndex: 100,
				maxHeight: '320px',
				overflowY: 'auto',
				background: 'var(--theme--background)',
				border: 'var(--theme--border-width, 2px) solid var(--theme--border-color)',
				borderRadius: 'var(--theme--border-radius, 6px)',
				boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			} as React.CSSProperties,
			item: (active: boolean) =>
				({
					padding: '10px 16px',
					cursor: 'pointer',
					background: active ? 'var(--theme--primary-background, rgba(0,0,0,0.05))' : 'transparent',
					borderBottom: '1px solid var(--theme--border-color-subdued, transparent)',
				}) as React.CSSProperties,
			title: {
				fontWeight: 600,
				color: 'var(--theme--foreground-accent, var(--theme--foreground))',
			} as React.CSSProperties,
			subtitle: {
				fontSize: '13px',
				color: 'var(--theme--foreground-subdued)',
			} as React.CSSProperties,
			meta: {
				marginTop: '6px',
				fontSize: '13px',
				color: 'var(--theme--foreground-subdued)',
			} as React.CSSProperties,
		}),
		[],
	);

	function subtitleFor(song: SongHit): string {
		const parts = [get(song, 'artist'), get(song, 'album'), get(song, 'year')]
			.filter((v) => v != null && v !== '')
			.map(String);
		return parts.join(' — ');
	}

	return (
		<div ref={rootRef} style={styles.wrapper}>
			<input
				type="text"
				value={query}
				placeholder={placeholder}
				disabled={disabled}
				style={styles.input}
				onChange={(e) => {
					setQuery(e.target.value);
					onInput(e.target.value || null);
				}}
				onFocus={() => results.length > 0 && setOpen(true)}
				onKeyDown={handleKeyDown}
			/>

			{loading && <div style={styles.meta}>Recherche en cours…</div>}
			{error && <div style={{ ...styles.meta, color: 'var(--theme--danger)' }}>{error}</div>}
			{!loading && !error && open && results.length === 0 && query.trim().length >= 2 && (
				<div style={styles.meta}>Aucun résultat</div>
			)}

			{open && results.length > 0 && (
				<div style={styles.dropdown} role="listbox">
					{results.map((song, i) => {
						const label = get(song, valuePath);
						return (
							<div
								key={song.id ?? i}
								role="option"
								aria-selected={i === highlighted}
								style={styles.item(i === highlighted)}
								onMouseEnter={() => setHighlighted(i)}
								onMouseDown={(e) => {
									// mousedown pour devancer le blur de l'input
									e.preventDefault();
									select(song);
								}}
							>
								<div style={styles.title}>{label == null ? '(sans titre)' : String(label)}</div>
								{subtitleFor(song) && <div style={styles.subtitle}>{subtitleFor(song)}</div>}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
