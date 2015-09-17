import "babel/polyfill";

import isPlainObject  from "is-plain-object";
import { trackProperty, trackObject } from "./object";
import { trackArray } from "./array";
import { Map } from "./map";
import { List } from "./list";
import { Variable } from "./var";

export { List, Map, Variable, trackProperty, trackObject, trackArray };

export function track(obj, replacer) {
	function replace(k, v) {
		var nval;
		if (typeof replacer === "function") nval = replacer.apply(this, arguments);
		if (typeof nval === "undefined" && typeof v !== "undefined") nval = track(v);
		return nval;
	}

	if (Array.isArray(obj)) return trackArray(obj, replace);
	if (isPlainObject(obj)) return trackObject(obj, replace);
	return obj;
}
