import "babel/polyfill";

import isPlainObject  from "is-plain-object";
import { trackProperty, trackObject } from "./object";
import { trackArray } from "./array";
import { Set } from "./set";
import { Map } from "./map";
import { List } from "./list";

export { Set, List, Map, trackProperty, trackObject, trackArray };

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
