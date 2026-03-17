export const stringToArray = (str) => {
	// Handle edge cases: null, undefined, empty string
	if (!str || typeof str !== "string") {
		return [];
	}

	return str
		.split(",")
		.map((item) => item.trim())
		.filter((item) => item.length > 0); // Remove any empty strings
};
