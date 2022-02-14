import {Literal, Identifier, Array, Object} from './types/expression.js';

export default class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.current = 0;
	}

	parse() {
		return this.value();
	}

	value() {
		if (this.match('STRING', 'NUMBER')) return new Literal(this.previous().literal);
		if (this.match('TRUE')) return new Literal(true);
		if (this.match('FALSE')) return new Literal(false);

		if (this.check('LEFT_BRACE')) return this.object();
		if (this.check('LEFT_BRACKET')) return this.array();

		throw new SyntaxError(`Unexpected token ${this.peek().type}`);
	}

	key() {
		if (this.match('STRING')) return new Literal(this.previous().literal);
		if (this.match('IDENTIFIER')) return new Identifier(this.previous().lexeme);

		throw new SyntaxError(`Expected string or identifier, got ${this.peek().type}`);
	}

	array() {
		const elements = [];

		this.consume('LEFT_BRACKET', 'Expected "["');

		while (!this.check('RIGHT_BRACKET')) {
			elements.push(this.value());
		}

		this.consume('RIGHT_BRACKET', 'Expected "]"');

		return new Array(elements);
	}

	object() {
		const pairs = [];

		this.consume('LEFT_BRACE', 'Expected "{"');

		while (!this.check('RIGHT_BRACE')) {
			const key = this.key();
			this.consume('COLON', 'Expected ":"');
			const value = this.value();
			pairs.push([key, value]);
		}

		this.consume('RIGHT_BRACE', 'Expected "}"');

		return new Object(pairs);
	}

	consume(type, message) {
		if (this.check(type)) {
			return this.advance();
		}

		throw new SyntaxError(message);
	}

	match(...types) {
		for (const type of types) {
			if (this.check(type)) {
				this.advance();
				return true;
			}
		}

		return false;
	}

	check(type) {
		if (this.isAtEnd()) {
			return false;
		}

		return this.peek().type === type;
	}

	advance() {
		if (!this.isAtEnd()) {
			this.current++;
		}

		return this.previous();
	}

	isAtEnd() {
		return this.peek().type === 'EOF';
	}

	peek() {
		return this.tokens[this.current];
	}
	
	previous() {
		return this.tokens[this.current - 1];
	}
}
