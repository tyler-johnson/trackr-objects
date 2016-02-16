import Trackr from "trackr";

export class Variable {
	constructor(value) {
		this._value = void 0;
		this._dep = new Trackr.Dependency();
		this.set(value);
	}

	get __trackr() { return true; }
	get __trackr_type() { return "variable"; }

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

	toString() {
		return "" + this.get();
	}

	toJSON() {
		return this.get();
	}
}

Variable.isVariable = function(o) {
	return o && o.__trackr && o.__trackr_type === "variable";
};
