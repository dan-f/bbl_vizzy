# BBL_VIZZY

A [bytebeat](http://countercomplex.blogspot.com/2011/10/algorithmic-symphonies-from-one-line-of.html) synthesizer & visualizer developed by Dan Friedman, Paul Batchelor, and Seamus Edson at the [Recurse Center](https://www.recurse.com/).

## Developing

`node` >= 22 must be installed. A `shell.nix` is provided if you want to use that.

Once you have node, run `npm i` to install all required node packages. To run the dev server, run `npm run dev`. See the `package.json` for other relevant scripts.

Note that [husky](https://typicode.github.io/husky/) is providing pre-commit hooks. You shouldn't have to do anything special for it to work out of the box.

## Releasing

Assuming you have the appropriate permissions, releases are done as follows.

- Code must be on `main` to release, unless we're hotfixing
- Identify the release candidate commit and PR it into `release`
  - When merging, select `rebase and merge`
- Once that PR lands, locally check out `release`
- Run `npm run release -- <version>` (see `npm run release -- --help` for usage)
- Assuming the release script succeeds, it will have created, tagged, and pushed a release commit. The deploy action should be underway.
- At this point, PR the `release` branch into `main`
  - When merging, select `rebase and merge`
