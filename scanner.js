import Token from './token.js';
import {dedent} from './util.js';

export default class Scanner {
	constructor(source) {
		this.source = source;
		this.tokens = [];

		this.start = 0;
		this.current = 0;
		this.line = 1;
		this.column = 1;
	}

	scan() {
		while (!this.isAtEnd()) {
			this.start = this.current;
			this.scanToken();
		}

		this.tokens.push(new Token('EOF', '', null, this.line, this.column));
		return this.tokens;
	}

	scanToken() {
		let c = this.advance();
		switch (c) {
			case '{': this.addToken('LEFT_BRACE'); break;
			case '}': this.addToken('RIGHT_BRACE'); break;
			case ',': break;
			case ':': this.addToken('COLON'); break;
			case '[': this.addToken('LEFT_BRACKET'); break;
			case ']': this.addToken('RIGHT_BRACKET'); break;
			case '/':
				if (this.match('/')) {
					while (this.peek() !== '\n' && !this.isAtEnd()) {
						this.advance();
					}
					break;
				} else if (this.match('*')) {
					// multiline comment
					while (this.peek() !== '*' && this.peekTwice() !== '/' && !this.isAtEnd()) {
						if (this.peek() === '\n') {
							this.line++;
							this.column = 1;
						}

						this.advance();
					}

					this.advance(); // star
					this.advance(); // slash
					break;
				} else {
					throw new SyntaxError(`Unexpected character: '${c}'`, this.line, this.column);
				}
			case '"' : this.doubleString(); break;
			case '\'': this.singleString(); break;
			case '`': this.backtickString(); break;
			case ' ': case '\r': case '\t': case '\n':
				if (c === '\n') {
					this.line++;
					this.column = 1;
				}

				break;
			default:
				if (this.isDigit(c)) {
					this.number();
				} else if (this.isAlpha(c)) {
					this.identifier();
				} else {
					throw new SyntaxError(`Unexpected character: '${c}'`, this.line, this.column);
				}
		}
	}

	isDigit(c) {
		return '0' <= c && c <= '9';
	}

	identifier() {
		while (this.isAlphaNumeric(this.peek())) {
			this.advance();
		}

		this.addToken('IDENTIFIER');
	}

	isAlpha(c) {
		return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_';
	}

	isAlphaNumeric(c) {
		return this.isAlpha(c) || this.isDigit(c);
	}

	number() {
		while (this.isDigit(this.peek())) {
			this.advance();
		}

		if (this.peek() === '.' && this.isDigit(this.peekTwice())) {
			this.advance();

			while (this.isDigit(this.peek())) {
				this.advance();
			}
		}

		const value = parseFloat(this.source.slice(this.start, this.current));
		this.addToken('NUMBER', value);
	}

	backtickString() {
		while (!this.isAtEnd()) {
			if (this.peek() === '`' && this.previous() !== '\\') {
				break;
			}

			if (this.peek() === '\n') {
				this.line++;
				this.column = 1;
			}

			this.advance();
		}

		if (this.isAtEnd()) {
			throw new SyntaxError('Unterminated string');
		}

		this.advance(); // closing quote

		const value = dedent(
			this.source.slice(this.start + 1, this.current - 1).replace(/\\`/g, '`')
		);
		this.addToken('STRING', value);

	}

	doubleString() {
		while (!this.isAtEnd()) {
			if (this.peek() === '"' && this.previous() !== '\\') {
				break;
			}

			if (this.peek() === '\n') {
				this.line++;
				this.column = 1;
			}

			this.advance();
		}

		if (this.isAtEnd()) {
			throw new SyntaxError('Unterminated string', this.line, this.column);
		}

		this.advance(); // closing quote

		const value = this.source.slice(this.start + 1, this.current - 1).replace(/\\"/g, '"');
		this.addToken('STRING', value);
	}

	singleString() {
		while (!this.isAtEnd()) {
			if (this.peek() === '\'' && this.previous() !== '\\') {
				break;
			}

			if (this.peek() === '\n') {
				this.line++;
				this.column = 1;
			}

			this.advance();
		}

		if (this.isAtEnd()) {
			throw new SyntaxError('Unterminated string', this.line, this.column);
		}

		this.advance(); // closing quote

		const value = this.source.slice(this.start + 1, this.current - 1).replace(/\\\'/g, '\'');
		this.addToken('STRING', value);
	}

	previous() {
		return this.source[this.current - 1];
	}

	peek() {
		return this.isAtEnd() ? '\0' : this.source[this.current];
	}

	peekTwice() {
		return this.current + 1 >= this.source.length ? '\0' : this.source[this.current + 1];
	}

	match(expected) {
		if (this.isAtEnd()) return false;
		if (this.source[this.current] !== expected) return false;

		this.current++;
		return true;
	}

	advance() {
		this.column++;
		return this.source[this.current++];
	}

	addToken(type, literal = null) {
		const text = this.source.slice(this.start, this.current);
		this.tokens.push(new Token(type, text, literal, this.line, this.column));
	}

	isAtEnd() {
		return this.current >= this.source.length;
	}
}

class SyntaxError extends Error {
	constructor(message, line, column) {
		super(message);
		this.name = 'YasonSyntaxError';
		this.line = line;
		this.column = column;
	}

	toString() {
		return `Yason SyntaxError at ${this.line}:${this.column} - ${this.message}`;
	}
}
