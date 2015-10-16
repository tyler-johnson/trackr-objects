import hasOwn from "has-own-prop";
import Trackr from "trackr";

export class Map {
	constructor(obj) {
		this._keysDep = new Trackr.Dependency();
		this._valuesDep = new Trackr.Dependency();
		this._deps = {};
		this._values = {};

		if (typeof obj === "object" && obj != null) {
			for (let key in obj) this.set(key, obj[key]);
		}
	}

	get __trackr() { return true; }
	get __trackr_type() { return "map"; }

	get size() {
		return this.keys().length;
	}

	set(key, value) {
		if (typeof key === "object") {
			for (var k in key) {
				if (hasOwn(key, k)) this.set(k, key[k]);
			}
			return this;
		}

		let has = hasOwn(this._values, key);

		if (!has || this._values[key] !== value) {
			this._values[key] = value;
			this._getDep(key).changed();
			if (!has) this._keysDep.changed();
			this._valuesDep.changed();
		}

		return this;
	}

	clear() {
		let keys = Object.keys(this._values);

		if (keys.length) {
			for (var k of keys) {
				delete this._values[k];
				this._getDep(k).changed();
			}

			this._keysDep.changed();
			this._valuesDep.changed();
		}

		return this;
	}

	delete(key) {
		if (hasOwn(this._values, key)) {
			delete this._values[key];
			this._getDep(key).changed();
			this._keysDep.changed();
			this._valuesDep.changed();
		}

		return this;
	}

	forEach(fn, ctx) {
		for (let k of this.keys()) {
			fn.call(ctx, this.get(k), k, this);
		}
		return this;
	}

	_getDep(k) {
		if (this._deps[k] == null) this._deps[k] = new Trackr.Dependency();
		return this._deps[k];
	}

	get(key) {
		this._getDep(key).depend();
		return this._values[key];
	}

	has(key) {
		this._getDep(key).depend();
		return hasOwn(this._values, key);
	}

	keys() {
		this._keysDep.depend();
		return Object.keys(this._values);
	}

	// TODO enable when ES6 settles
	// * entries() {
	// 	for (let k of this.keys()) {
	// 		yield [ k, this.get(k) ];
	// 	}
	// }
	//
	// * values() {
	// 	for (let k of this.keys()) {
	// 		yield this.get(k);
	// 	}
	// }

	toJSON() {
		let out = {};
		for (let k of this.keys()) out[k] = this.get(k);
		return out;
	}
}

// Map.prototype[Symbol.iterator] = Map.prototype.values;

Map.isMap = function(o) {
	return o && o.__trackr && o.__trackr_type === "map";
};
