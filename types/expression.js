export class Literal {
	constructor(value) {
		this.value = value;
	}
}

export class Object {
	constructor(properties) {
		this.properties = properties;
	}
}

export class Array {
	constructor(elements) {
		this.elements = elements;
	}
}

export class Identifier {
	constructor(name) {
		this.name = name;
	}
}