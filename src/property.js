import Trackr from "trackr";

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export function trackProperty(obj, prop, value, options) {
	if (typeof obj !== "object" || obj == null) {
		throw new Error("Expecting object to define the reactive property on.");
	}

	if (typeof prop !== "string") throw new Error("Expecting string for property name.");

	const dep = new Trackr.Dependency();

	Object.defineProperty(obj, prop, {
		configurable: options != null && Boolean(options.configurable),
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

export function trackProperties(obj, props, options) {
	if (typeof obj !== "object" || obj == null) {
		throw new Error("Expecting object of properties to define.");
	}

	if (Array.isArray(props)) {
		props.forEach(p => trackProperty(obj, p, options));
		return obj;
	}

	Object.keys(props).map(prop => {
		const opts = props[prop];
		if (typeof opts !== "object" || opts == null || !has(opts, "value")) {
			throw new Error(`Property '${prop}' was not set to an object with a 'value' key.`);
		}

		return [prop,opts];
	}).forEach(([prop,opts]) => {
		trackProperty(obj, prop, opts.value, {
			...options,
			...opts.options
		});
	});

	return obj;
}
