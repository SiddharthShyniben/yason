export function dedent(string) {
	let lines = string.split('\n');
	let mindent = Infinity;

	const re = /^\s+/;

	lines.forEach(line => {
		const match = line.match(re);
		if (match) {
			if (mindent > match[0].length) {
				mindent = match[0].length;
			}
		}
	});

	if (mindent !== Infinity) {
		lines = lines.map(line => re.test(line) ? line.slice(mindent) : line);
	}

	return lines.join('\n').trim()
}
