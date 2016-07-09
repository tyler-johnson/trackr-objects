# Trackr Objects

[![npm](https://img.shields.io/npm/v/trackr-objects.svg)](https://www.npmjs.com/package/trackr-objects) [![David](https://img.shields.io/david/tyler-johnson/trackr-objects.svg)](https://david-dm.org/tyler-johnson/trackr-objects) [![Build Status](https://travis-ci.org/tyler-johnson/trackr-objects.svg?branch=master)](https://travis-ci.org/tyler-johnson/trackr-objects)

This library provides basic reactive data types for use with [Trackr](http://ghub.io/trackr).

## Install

Install via NPM.

```sh
npm install trackr-objects --save
```

## Usage

Trackr Objects provides three base classes, Map, List and Variable. These aim to be reactive replacements for their native JavaScript counterparts, providing robust and efficient reactive support for functional applications.

### Variable

This is a very simple class that emulates the regular `var` in JavaScript. Call the constructor with the initial value to create.

```js
import {Variable} from "trackr-objects";

const val = new Variable("my value");
```

It is very easy to get and set data on a reactive variable.

```js
val.get(); // gets data
val.set("new value"); // sets the data
```

### Map

The Map class is similar to a normal JavaScript object, it assigns values to unique keys. To create a new map, call the constructor with some base data.

```js
import {Map as ReactiveMap} from "trackr-objects";

const data = new ReactiveMap({ foo: "bar" });
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
import {List} from "trackr-objects";

const list = new List([ "a", "b", "c" ]);
```

Lists have almost all of the same methods as arrays, making them easy drop-ins.

```js
list.push("another value");
list.sort();
list.forEach(function(){});
```

To retrieve and set data at a specific index in a list, use the `.get()` and `.set()` methods.

```js
let first = list.get(0);
list.set(2, { foo: "bar" });
```

### Object Property Tracking

You can easily track indivdual properties on existing objects with the `trackProperty()` method. Simply pass in an object and string for the property to track and the property will be made transparently reactive.

```js
import Trackr from "trackr";
import {trackProperty} from "trackr-objects";

let data = {};
trackProperty(data, "foo", "bar");

Trackr.autorun(function() {
	console.log(data.foo);
});

// later, change the value and it will be logged
data.foo = "boom";
```
