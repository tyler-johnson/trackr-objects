import Trackr from "trackr";
import patchArray from "array-spy";

var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
var arrayLike = o => typeof o.length === "number" && o.length >= 0;

export class List {
	constructor() {
		this._itemDep = new Trackr.Dependency();
		this._lengthDep = new Trackr.Dependency();
		this._deps = {};
		this._items = [];
		for (let a of slice(arguments)) pushDynamic(this, a);
	}

	get length() {
		this._lengthDep.depend();
		return this._items.length;
	}

	get(index) {
		this._getDep(index).depend();
		return this._items[index];
	}

	_getDep(k) {
		if (this._deps[k] == null) this._deps[k] = new Trackr.Dependency();
		return this._deps[k];
	}

	splice() {
		let args = slice(arguments);
		let op = patchArray.summariseSpliceOperation(this._items, args);
		let r = this._items.splice.apply(this._items, args);

		this._itemDep.changed();
		if (op.added !== op.removed) this._lengthDep.changed();
		for (let i = 0; i < Math.max(op.added, op.removed); i++) {
			this._getDep(op.index + i).changed();
		}

		return r;
	}

	push() {
		let args = [ this._items.length, 0 ].concat(slice(arguments));
		this.splice.apply(this, args);
		return this._items.length;
	}

	pop() {
		return this.splice(this._items.length - 1, 1)[0];
	}

	unshift() {
		let args = [ 0, 0 ].concat(slice(arguments));
		this.splice.apply(this, args);
		return this._items.length;
	}

	shift() {
		return this.splice(0, 1)[0];
	}

	reverse() {
		this._items.reverse();

		this._itemDep.changed();
		for (let i = 0; i < this._items.length; i++) {
			this._getDep(i).changed();
		}

		return this;
	}

	sort(f) {
		this._items.sort(f);

		this._itemDep.changed();
		for (let i = 0; i < this._items.length; i++) {
			this._getDep(i).changed();
		}

		return this;
	}

	set(index, value) {
		this.splice(index, 1, value);
		return this;
	}

	concat() {
		var l = new List(this);
		for (let a of slice(arguments)) pushDynamic(l, a);
		return l;
	}

	join(char) {
		let str = "";
		let len = this.length;

		for (let v, i = 0; i < len; i++) {
			v = this.get(i);
			if (v == null) v = "";
			if (typeof v !== "string") v = v.toString();
			str += v + (i !== len - 1 ? char : "");
		}

		return str;
	}

	slice(start, end) {
		let i, cloned = [], upTo,
			size, len = this._items.length;

		// Handle negative value for "start"
		if (typeof start === "number" && !isNaN(start)) {
			if (start < 0) {
				this._lengthDep.depend();
				start = Math.max(0, len + start);
			}
		} else {
			start = 0;
		}

		// Handle negative value for "end"
		if (typeof end === "number" && !isNaN(end)) {
			upTo = Math.min(end, len);
			if (end < 0) {
				this._lengthDep.depend();
				upTo = len + end;
			}
		} else {
			upTo = len;
		}

		// Actual expected size of the slice
		size = upTo - start;

		if (size > 0) {
			cloned = new Array(size);
			for (i = 0; i < size; i++) {
				cloned[i] = this.get(start + i);
			}
		}

		return cloned;
	}

	indexOf(member, start) {
		var len = this._items.length;

		if (typeof start === "number" && !isNaN(start)) {
			start = Math.min(Math.max(start, 0), len);
		} else {
			start = 0;
		}

		for (let i = start; i < len; i++) {
			if (this.get(i) === member) return i;
		}

		// only depend on length change if member wasn't found
		this._lengthDep.depend();
		return -1;
	}

	forEach(fn, ctx) {
		this._itemDep.depend();

		for (let i = 0; i < this._items.length; i++) {
			fn.call(ctx, this._items[i], i, this);
		}

		return this;
	}

	reduce(fn, value) {
		this.forEach(function(current, index, list) {
			value = fn.call(null, value, current, index, list);
		});

		return value;
	}

	map(fn, ctx) {
		return this.reduce(function(els) {
			els.push(fn.apply(ctx, slice(arguments, 1)));
			return els;
		}, []);
	}

	filter(fn, ctx) {
		return this.reduce(function(els, item) {
			if (fn.apply(ctx, slice(arguments, 1))) els.push(item);
			return els;
		}, []);
	}

	some(fn, ctx) {
		var len = this._items.length;

		for (let i = 0; i < len; i++) {
			if (fn.call(ctx, this.get(i), i, this)) return true;
		}

		// only depend on length if none of the elements pass
		this._lengthDep.depend();
		return false;
	}

	every(fn, ctx) {
		var len = this._items.length;

		for (let i = 0; i < len; i++) {
			if (!fn.call(ctx, this.get(i), i, this)) return false;
		}

		// only depend on length if all of the elements pass
		this._lengthDep.depend();
		return true;
	}

	// TODO enable when ES6 settles
	// * values() {
	// 	let len = this._items.length;
	//
	// 	for (let i = 0; i < len; i++) {
	// 		yield this.get(i);
	// 	}
	//
	// 	// depend on length if it gets to the end
	// 	this._lengthDep.depend();
	// }

	toJSON() {
		return this.slice(0);
	}
}

// List.prototype[Symbol.iterator] = List.prototype.values;

List.isList = function(o) {
	return o instanceof List;
};

function pushDynamic(l, v) {
	if (arrayLike(v)) l.push.apply(l, slice(v));
	else if (List.isList(v)) v.forEach(i =>	l.push(i));
	else l.push(v);
}
