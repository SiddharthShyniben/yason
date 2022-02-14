import {mkdirSync, writeFileSync} from 'node:fs';
const args = process.argv.slice(2);

// We are hackers; we automate

if (args.length !== 1) {
	console.error('Usage: generate-ast <file>');
	process.exit(64);
}

const outputDir = args[0];

function defineAst(outputDir, basename, types) {
	try {
		mkdirSync(outputDir);
	} catch (error) {}

	writeFileSync(`${outputDir}/${basename.toLowerCase()}.js`,
`
${types.map(
	type => defineType(...type.split(':').map(x => x.trim()))
).join('\n\n')}
`.trim()
	);
}

function defineType(className, contents) {
	return `
export class ${className} {
	constructor(${contents}) {
${
	contents
		.split(',')
		.map(x => x.trim())
		.map(type => `		this.${type} = ${type};`)
		.join`\n`
}
	}
}
	`.trim();
}

defineAst(outputDir, 'Expression', [
	'Literal: value',
	'Object: properties',
	'Array: elements',
	'Identifier: name',
]);
