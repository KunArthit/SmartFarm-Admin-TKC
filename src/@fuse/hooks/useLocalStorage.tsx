function useLocalStorage<T>(key: string) {
	function getValue() {
		try {
			const item = window.localStorage.getItem(key);

			if (!item) return null;

			try {
				// Try to parse as JSON
				return JSON.parse(item) as T;
			} catch {
				// If parsing fails, return as is
				return item as unknown as T;
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	const setValue = (value: T) => {
		try {
			if (typeof value === 'string') {
				window.localStorage.setItem(key, value);
			} else {
				window.localStorage.setItem(key, JSON.stringify(value));
			}
		} catch (error) {
			console.error(error);
		}
	};

	const removeValue = () => {
		window.localStorage.removeItem(key);
	};

	return { value: getValue(), setValue, getValue, removeValue };
}

export default useLocalStorage;
