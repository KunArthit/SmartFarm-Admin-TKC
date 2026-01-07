import Quill from 'quill';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

// Editor is an uncontrolled React component
interface EditorProps {
	readOnly?: boolean;
	defaultValue?: any;
	onTextChange?: (...args: any[]) => void;
	onSelectionChange?: (...args: any[]) => void;
}

const Editor = forwardRef<Quill | null, EditorProps>(
	({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
		const containerRef = useRef(null);
		const defaultValueRef = useRef(defaultValue);
		const onTextChangeRef = useRef(onTextChange);
		const onSelectionChangeRef = useRef(onSelectionChange);

		useLayoutEffect(() => {
			onTextChangeRef.current = onTextChange;
			onSelectionChangeRef.current = onSelectionChange;
		});

		useEffect(() => {
			if (ref && 'current' in ref && ref.current) {
				ref.current.enable(!readOnly);
			}
		}, [ref, readOnly]);

		useEffect(() => {
			const container = containerRef.current;
			const editorContainer = container.appendChild(container.ownerDocument.createElement('div'));
			const quill = new Quill(editorContainer, {
				theme: 'snow'
			});

			if (ref && typeof ref === 'object' && 'current' in ref) {
				ref.current = quill;
			}

			if (defaultValueRef.current) {
				quill.setContents(defaultValueRef.current);
			}

			quill.on(Quill.events.TEXT_CHANGE, (...args) => {
				onTextChangeRef.current?.(...args);
			});

			quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
				onSelectionChangeRef.current?.(...args);
			});

			return () => {
				if (ref && typeof ref === 'object' && 'current' in ref) {
					ref.current = null;
				}

				container.innerHTML = '';
			};
		}, [ref]);

		return <div ref={containerRef}></div>;
	}
);

Editor.displayName = 'Editor';

export default Editor;
