var Trackr = require("trackr");
var hasOwn = require("has-own-prop");
var clone = require("shallow-copy");
var isPlainObject = require("is-plain-object");
var patchArray = require("array-spy");

var track =
module.exports = function(obj, replacer) {
	function replace(k, v) {
		var nval;
		if (typeof replacer === "function") nval = replacer.apply(this, arguments);
		if (typeof nval === "undefined" && typeof v !== "undefined") nval = track(v);
		return nval;
	}

	if (Array.isArray(obj)) return trackArray(obj, replace)
	if (isPlainObject(obj)) return trackObject(obj, replace);
	return obj;
}

var trackProperty =
track.trackProperty = function(obj, prop, value, options) {
	if (typeof obj !== "object" || obj == null) {
		throw new Error("Expecting object to define the reactive property on.");
	}

	if (typeof prop !== "string") throw new Error("Expecting string for property name.");

	var dep = new Trackr.Dependency;

	Object.defineProperty(obj, prop, {
		configurable: options == null || options.configurable !== false,
		enumerable: options == null || options.enumerable !== false,
		set: function(val) {
			if (val !== value) {
				value = val;
				dep.changed();
			}

			return value;
		},
		get: function() {
			dep.depend();
			return value;
		}
	});

	return obj;
}

var trackObject =
track.trackObject = function(props, replacer) {
	if (props.__reactive) return props;

	var values = {};
	var deps = {};
	var mainDep = new Trackr.Dependency();

	function replace(ctx, name, value) {
		if (typeof value === "undefined") return;
		return Trackr.nonreactive(function() {
			return typeof replacer === "function" ? replacer.call(ctx, name, value) : value;
		});
	}

	function getter(name) {
		deps[name].depend();
		return values[name];
	}

	function setter(name, value) {
		var old = values[name];
		values[name] = replace(this, name, value);

		var dep = deps[name];
		if (dep == null) dep = deps[name] = new Trackr.Dependency();
		if (old !== values[name]) dep.changed();

		mainDep.changed();
		return values[name];
	}

	var _proto = typeof props.constructor === "function" ? Object.create(props.constructor.prototype) : {};

	_proto.defineProperty = function(name, value, options) {
		Object.defineProperty(this, name, {
			configurable: options == null || options.configurable !== false,
			enumerable: options == null || options.enumerable !== false,
			get: getter.bind(this, name),
			set: setter.bind(this, name)
		});

		this[name] = value;
		return this;
	};

	_proto.deleteProperty = function(name) {
		var dep = deps[name];
		if (delete this[name]) { // in case configurable === false
			delete values[name];
			delete deps[name];
			if (dep) dep.changed();
		}
		return this;
	};

	_proto.toJSON = function() {
		mainDep.depend();
		return clone(values);
	};

	Object.defineProperty(_proto, "__reactive", {
		configurable: false,
		enumerable: false,
		value: true,
		writeable: false
	});

	var robj = Object.create(_proto);

	for (var key in props) {
		if (hasOwn(props, key)) robj.defineProperty(key, props[key]);
	}

	return robj;
}

var trackArray =
track.trackArray = function(arr, replacer) {
	if (!Array.isArray(arr)) throw new Error("Expecting array.");
	if (arr.__reactive) return arr;

	var deps = { length: new Trackr.Dependency() };
	var values = {};
	var narr = patchArray([]);

	function replace(ctx, name, value) {
		if (typeof value === "undefined") return;
		return Trackr.nonreactive(function() {
			return typeof replacer === "function" ? replacer.call(ctx, name, value) : value;
		});
	}

	function getter(name) {
		deps[name].depend();
		return values[name];
	}

	function setter(name, value) {
		var old = values[name];
		values[name] = replace(this, name, value);

		var dep = deps[name];
		if (dep == null) dep = deps[name] = new Trackr.Dependency();
		if (old !== values[name]) dep.changed();

		return values[name];
	}

	function define(i) {
		var dep;

		if (typeof i === "number" && i >= narr.length) {
			if ((dep = deps[i]) != null) {
				delete deps[i];
			}

			delete narr[i];
			delete values[i];
			dep.changed();
			return;
		}

		setter.call(this, i, narr[i]);

		Object.defineProperty(narr, i.toString(), {
			configurable: true,
			enumerable: true,
			get: getter.bind(narr, i),
			set: setter.bind(narr, i)
		});
	}

	narr.observe(function(chg) {
		var balance, start, end, len, i, prevlen;

		if (chg == null) return;

		balance = chg.added - chg.removed;
		if (!balance) return;

		len = narr.length;
		prevlen = len - balance;
		start = Math.min(prevlen, len);
		end = Math.max(prevlen, len);

		for (i = start; i < end; i++) define(i);
		deps.length.changed();
	});

	Object.defineProperty(narr, "__reactive", {
		configurable: false,
		enumerable: false,
		value: true,
		writeable: false
	});

	Object.defineProperty(narr, "$length", {
		configurable: false,
		enumerable: false,
		get: function() {
			deps.length.depend();
			return this.length;
		}
	});

	Object.defineProperty(narr, "depend", {
		configurable: false,
		enumerable: false,
		get: function() {
			deps.length.depend();
		}
	});

	narr.push.apply(narr, arr);
	return narr;
}
