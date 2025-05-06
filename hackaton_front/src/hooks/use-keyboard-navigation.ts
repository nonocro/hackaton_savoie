import { useEffect } from 'react';

export function useKeyboardNavigation(handleArrowDown: () => void, handleArrowUp: () => void) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown') {
				handleArrowDown();
			} else if (event.key === 'ArrowUp') {
				handleArrowUp();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleArrowDown, handleArrowUp]);
}
