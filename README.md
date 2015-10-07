# Trackr Objects

This library provides basic reactive helpers for use with [Trackr](http://ghub.io/trackr).

## Install

Download a UMD bundle from the [releases page](https://github.com/tyler-johnson/trackr-objects/releases). The variable `TrackrObjects` will be attached to `window`.

```html
<script type="text/javascript" src="trackr-objects.js"></script>
```

If using Browserify or Node.js, you can install via NPM.

```sh
$ npm install trackr-objects
```

## Usage

Trackr Objects provides three base classes, Map, List and Variable. These aim to be reactive replacements for their native JavaScript counterparts, providing robust and efficient reactive support for functional applications.

### Variable

This is a very simple class that emulates the regular `var` in JavaScript. Call the constructor with the initial value to create.

```js
var val = new TrackrObjects.Variable("my value");
```

It is very easy to get and set data on a reactive variable.

```js
val.get(); // gets data
val.set("new value"); // sets the data
```

### Map

The Map class is similar to a normal JavaScript object, it assigns values to unique keys. To create a new map, call the constructor with some base data.

```js
var data = new TrackrObjects.Map({ foo: "bar" });
```

There are several methods for retrieving data from the map reactively.

```js
data.get("foo"); // gets value at key
data.has("foo"); // boolean for if key is in map
data.keys(); // an array of all keys in map
data.toJSON(); // a plain javascript object representing all data
```

There are also several methods for setting data on the map reactively.

```js
data.set("foo", "new value"); // sets value at key
data.delete("foo"); // deletes key from map
data.clear(); // deletes all data from the map
```

### List

The List class aims to duplicate the functionality of the JavaScript array. To create, pass the constructor an array with initial data.

```js
var list = new TrackrObjects.List([ "a", "b", "c" ]);
```

Lists have almost all of the same methods as arrays, making them easy drop-ins.

```js
list.push("another value");
list.sort();
list.forEach(function(){});
```

To retrieve and set data at a specific index in a list, use the `.get()` and `.set()` methods.

```js
var first = list.get(0);
list.set(2, { foo: "bar" });
```

### Object and Array Patching

**Note:** It is not recommended to patch objects and arrays to obtain reactivity. In JavaScript, it is impossible to see all changes that happen to an object, resulting in only partial reactivity. For a guarantee, wrap unpatched objects with Map and List and use those objects. `trackProperty()`, on the other hand, is a very useful method that you are encouraged to used.

You can deeply track changes to any plain object or array with the main `track` function. All existing properties are matched to a Trackr dependency under the hood. This makes them easy to use in autorun statements.

```js
// deep tracking
var data = TrackrObjects.track({ foo: "bar" });

// runs whenever foo changes
Trackr.autorun(function() {
	console.log(data.foo);
});

// later, change foo property
data.foo = "something else";
```

If you don't want to track deep changes, use `trackObject` and `trackArray`.

```js
// shallow tracking
var obj = TrackrObjects.trackObject({ foo: "bar" });
var arr = TrackrObjects.trackArray([ "a" ]);

// property tracking
var data = {};
TrackrObjects.trackProperty(data, "foo");
```

This library can only track existing properties, so use the `defineProperty` method to add additional reactive properties.

```js
var data = TrackrObjects.track({});

// BAD: foo is not reactive
data.foo = "bar";

// GOOD: foo is reactive
data.defineProperty("foo");
data.foo = "bar";
```
