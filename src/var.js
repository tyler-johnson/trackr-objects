import Trackr from "trackr";

export class Variable {
	constructor(value) {
		this._value = void 0;
		this._dep = new Trackr.Dependency();
		this.set(value);
	}

	set(value) {
		if (value !== this._value) {
			this._value = value;
			this._dep.changed();
		}
	}

	get() {
		this._dep.depend();
		return this._value;
	}
}
