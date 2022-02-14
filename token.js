export default class Token {
	constructor(type, lexeme, literal, line, column) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
		this.column = column;
	}
}
