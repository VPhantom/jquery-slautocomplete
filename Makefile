JS      = uglifyjs --compress --mangle --reserved window --comments
JSLINT  = jslint

help:
	@echo "Try one of: clean, all"

clean:
	rm -f *.min.js

all:	$(patsubst %.js,%.min.js,$(wildcard *.js))

%.min.js:	%.js
	$(JS) -o $@ -- $<

.PHONY: help all clean
