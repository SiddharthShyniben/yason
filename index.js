#!/usr/bin/env node
import fs from 'fs';

import Scanner from './scanner.js';
import Parser from './parser.js';
import Transpiler from './transpiler.js';
import {dedent} from './util.js';

import nanoparse from 'nanoparse';

const args = nanoparse(process.argv.slice(2));

if (args.flags.help || args.flags.h) {
	console.log(dedent(`
		Usage: yason [options]
		Flags:
			-i, --input	The file to parse
			-o, --output	The file to output to, if ommited the output will be printed to stdout
			-h, --help	Print this help message
	`));
	process.exit(0);
}

const file = args.flags.input || args.flags.i;

if (!file) {
	console.error('No input file specified');
	process.exit(64);
}

let contents;

try {
	contents = fs.readFileSync(file, 'utf8');
} catch (e) {
	console.error('Could not read file `' + file + '`');
	process.exit(66);
}

const scanner = new Scanner(contents);
let tokens;

try {
	tokens = scanner.scan();
} catch (e) {
	console.error(e.toString());
	process.exit(64);
}

const parser = new Parser(tokens);
const ast = parser.parse();

const transpiled = Transpiler(ast);
const json = JSON.stringify(transpiled, null, args.flags.pretty ?? '\t');

const outputFile = args.flags.output || args.flags.o;

if (outputFile) {
	fs.writeFileSync(outputFile, json, 'utf8');
} else {
	console.log(json);
}
