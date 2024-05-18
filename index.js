const fs = require("fs").promises;
const path = require("path");
const prompts = require("prompts");
const archiver = require("archiver");
const { createWriteStream } = require("fs");

function startSpinner(message) {
  const frames = ["-", "\\", "|", "/"];
  let i = 0;
  const spinner = setInterval(() => {
    process.stdout.write(`\r${message} ${frames[i]}`);
    i = (i + 1) % frames.length;
  }, 100);
  return spinner;
}

function stopSpinner(spinner, message) {
  clearInterval(spinner);
  process.stdout.write(`\r${message}\n`);
}

async function findBundlesFolders(dir) {
  let result = [];
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const fullPath = path.join(dir, file.name);
        if (file.name === "bundles") {
          result.push(fullPath);
        } else {
          const subResult = await findBundlesFolders(fullPath);
          result = result.concat(subResult);
        }
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
  return result;
}

async function zipFolders(folders, outputPath) {
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const output = createWriteStream(outputPath);
  archive.pipe(output);

  for (const folder of folders) {
    archive.directory(folder, path.basename(folder));
  }

  await archive.finalize();
}

async function main() {
  const currentDirectory = process.cwd();
  console.log(`Searching for "bundles" folders in ${currentDirectory}...`);

  const spinner = startSpinner("Searching...");
  const bundlesFolders = await findBundlesFolders(currentDirectory);
  stopSpinner(spinner, "Searching completed.");

  if (bundlesFolders.length > 0) {
    console.log('Folders containing "bundles":');
    bundlesFolders.forEach((folder) => console.log(folder));

    const zipFilePath = path.join(currentDirectory, "bundles_folders.zip");
    const zipSpinner = startSpinner(`Zipping folders to ${zipFilePath}...`);
    await zipFolders(bundlesFolders, zipFilePath);
    stopSpinner(zipSpinner, "Zipping completed.");

    console.log(`All folders have been zipped into: ${zipFilePath}`);
  } else {
    console.log('No folders containing "bundles" found.');
  }

  await prompts({
    type: "text",
    name: "exit",
    message: "Press Enter to exit...",
  });

  process.exit(0);
}

main();
