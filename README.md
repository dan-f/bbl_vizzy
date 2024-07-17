# BBL_VIZZY

A [bytebeat](http://countercomplex.blogspot.com/2011/10/algorithmic-symphonies-from-one-line-of.html) synthesizer & visualizer developed by Dan Friedman, Paul Batchelor, and Seamus Edson at the [Recurse Center](https://www.recurse.com/).

## Developing

`node` >= 22 must be installed. A `shell.nix` is provided if you want to use that.

Once you have node, run `npm i` to install all required node packages. To run the dev server, run `npm run dev`. See the `package.json` for other relevant scripts.

Note that [husky](https://typicode.github.io/husky/) is providing pre-commit hooks. You shouldn't have to do anything special for it to work out of the box.
