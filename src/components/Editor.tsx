/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Define the toolbar configuration
const DEFAULT_MODULES = {
	toolbar: [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ color: [] }, { background: [] }],
		[{ list: 'ordered' }, { list: 'bullet' }],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ align: [] }],
		['link', 'image'],
		['blockquote', 'code-block'],
		['clean']
	],
	clipboard: {
		matchVisual: false
	}
};

const DEFAULT_FORMATS = [
	'header',
	'bold',
	'italic',
	'underline',
	'strike',
	'color',
	'background',
	'list',
	'bullet',
	'indent',
	'align',
	'link',
	'image',
	'blockquote',
	'code-block'
];

interface EditorProps {
	readOnly?: boolean;
	defaultValue?: any;
	onTextChange?: (delta: any, oldDelta: any, source: any) => void;
	onSelectionChange?: (range: any, oldRange: any, source: any) => void;
	placeholder?: string;
	modules?: any;
	formats?: string[];
	style?: React.CSSProperties;
}

const Editor = forwardRef<Quill, EditorProps>((props, ref) => {
	const {
		readOnly = false,
		defaultValue,
		onTextChange,
		onSelectionChange,
		placeholder = 'Start writing your content...',
		modules = DEFAULT_MODULES,
		formats = DEFAULT_FORMATS,
		style
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const quillRef = useRef<Quill | null>(null);

	useLayoutEffect(() => {
		if (!containerRef.current) return;

		const container = containerRef.current;
		const editorContainer = container.appendChild(container.ownerDocument.createElement('div'));

		const quill = new Quill(editorContainer, {
			modules,
			formats,
			readOnly,
			theme: 'snow',
			placeholder
		});

		quillRef.current = quill;

		// Set default value if provided
		if (defaultValue) {
			quill.setContents(defaultValue);
		}

		// Set up event listeners
		if (onTextChange) {
			quill.on('text-change', onTextChange);
		}

		if (onSelectionChange) {
			quill.on('selection-change', onSelectionChange);
		}

		// Expose quill instance to ref
		if (ref) {
			if (typeof ref === 'function') {
				ref(quill);
			} else {
				ref.current = quill;
			}
		}

		return () => {
			if (ref) {
				if (typeof ref === 'function') {
					ref(null);
				} else {
					ref.current = null;
				}
			}

			quill.off('text-change', onTextChange);
			quill.off('selection-change', onSelectionChange);
			container.innerHTML = '';
		};
	}, [ref]);

	useEffect(() => {
		if (quillRef.current) {
			quillRef.current.enable(!readOnly);
		}
	}, [readOnly]);

	return (
		<div
			ref={containerRef}
			style={{
				...style,
				fontSize: '1rem',
				fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
			}}
		/>
	);
});

Editor.displayName = 'Editor';

export default Editor;
