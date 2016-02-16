BIN = ./node_modules/.bin
SRC = $(wildcard lib/*)

build: index.js dist/trackr-objects.js dist/trackr-objects.min.js

index.js: lib/index.js $(SRC)
	$(BIN)/rollup $< -c > $@

dist:
	mkdir -p $@

dist/trackr-objects.js: index.js dist
	$(BIN)/browserify $< --standalone TrackrObjects > $@

dist/trackr-objects.min.js: dist/trackr-objects.js dist
	$(BIN)/uglifyjs $< -m > $@

clean:
	rm index.js

.PHONY: build clean
