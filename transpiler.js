import {Object, Array, Literal, Identifier} from './types/expression.js';

export default function transpile(tree) {
	if (tree instanceof Object) return object(tree);
	if (tree instanceof Array) return array(tree);
	if (tree instanceof Literal) return literal(tree);
	if (tree instanceof Identifier) return identifier(tree);
}

function identifier(tree) {
	return tree.name;
}

function literal(tree) {
	return tree.value;
}

function array(tree) {
	return tree.elements.map(transpile);
}

function object(tree) {
	const result = {};

	for (const [key, val] of tree.properties) {
		result[transpile(key)] = transpile(val);
	}

	return result;
}
