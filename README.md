# Trackr Objects

This library turns plain JavaScript arrays and objects into reactive resources for Trackr.

## Install

Download a UMD bundle from the [releases page](https://github.com/tyler-johnson/trackr-objects/releases). The variable `track` will be attached to `window`.

```html
<script type="text/javascript" src="trackr.js"></script>
<script type="text/javascript" src="trackr-objects.js"></script>
```

If using Browserify or Node.js, you can install via NPM.

```sh
$ npm install trackr trackr-objects
```

Trackr Objects depends on [Trackr](https://npmjs.com/package/trackr). Please include it before this library.

## Usage

You can deeply track changes to any plain object or array with the main `track` function. All existing properties are matched to Trackr dependency under the hood. This makes them easy to use in autorun statements.

```js
// deep tracking
var data = track({ foo: "bar" });

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
var obj = track.trackObject({ foo: "bar" });
var arr = track.trackArray([ "a" ]);

// property tracking
var data = {};
track.trackProperty(data, "foo");
```

This library can only track existing properties, so use the `defineProperty` method to add additional reactive properties.

```js
var data = track({});

// BAD: foo is not reactive
data.foo = "bar";

// GOOD: foo is reactive
data.defineProperty("foo");
data.foo = "bar";
```
