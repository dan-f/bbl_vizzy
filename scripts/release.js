import { Argument, program } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import * as prettier from "prettier";
import semver from "semver";
import { simpleGit } from "simple-git";
import pkgJson from "../package.json" with { type: "json" };

program
  .name("release")
  .description("bbl_vizzy release script")
  .addArgument(
    new Argument("<release>", "semver release").choices(semver.RELEASE_TYPES),
  )
  .action(doRelease)
  .configureOutput({
    writeOut: (s) => process.stdout.write(`[out] ${s}`),
    writeErr: (s) => process.stderr.write(`[err] ${s}`),
  })
  .parse(process.argv);

async function doRelease(release) {
  const oldVersion = pkgJson.version;
  const newVersion = semver.inc(oldVersion, release);

  if (!newVersion) {
    program.error(`Failed to apply ${release} release to v${oldVersion}`);
  }
  console.log(
    `Preparing ${release} release [v${oldVersion} -> v${newVersion}]...`,
  );

  const git = simpleGit();
  const repoRoot = await git.revparse(["--show-toplevel"]);
  const releaseBranch = "release";

  const gitBranch = await git.branch();
  if (gitBranch.current !== releaseBranch) {
    program.error("Must be on `release` branch");
  }

  const gitStatus = await git.status();
  if (gitStatus.modified.length > 0) {
    program.error("Git index must be clean");
  }

  await tryOrDie(git.pull(["--ff-only"]), "Could not pull from `release`");

  const pkgJsonPath = path.join(repoRoot, "package.json");
  pkgJson.version = newVersion;
  await tryOrDie(
    prettier
      .format(JSON.stringify(pkgJson), { parser: "json-stringify" })
      .then((s) => fs.writeFile(pkgJsonPath, s)),
    "Failed to update `package.json`",
  );

  git.add([pkgJsonPath]);
  const commitMsg = `Release v${newVersion}`;
  await tryOrDie(git.commit(commitMsg), "Failed to commit the release");
  await tryOrDie(
    git.addAnnotatedTag(`v${newVersion}`, commitMsg),
    "Failed tag the release",
  );
  await tryOrDie(git.push(), `Failed to push to '${releaseBranch}'`);
  await tryOrDie(git.pushTags(), "Failed to push tags");

  console.log(`Released v${newVersion}!`);
  console.log(`IMPORTANT! You must now PR '${releaseBranch}' into 'main'`);
  console.log("  > if you have the github cli, run `gh pr create`");
  console.log("  > otherwise manually create the PR on github");
}

function tryOrDie(p, failureMsg) {
  return p.catch((error) => {
    console.error(error);
    program.error(failureMsg);
  });
}
