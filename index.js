const fs = require("fs").promises;
const path = require("path");
const prompts = require("prompts");

async function findBundlesFolders(dir) {
  let result = [];
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const fullPath = path.join(dir, file.name);
        if (file.name === "bundles") {
          result.push(dir);
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

async function main() {
  const currentDirectory = process.cwd();
  console.log(`Searching for "bundles" folders in ${currentDirectory}...`);

  const bundlesFolders = await findBundlesFolders(currentDirectory);
  if (bundlesFolders.length > 0) {
    console.log('Folders containing "bundles":');
    bundlesFolders.forEach((folder) => console.log(folder));
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
