const fs = require("fs");
const prompts = require("prompts");

const currentDirectory = process.cwd();

fs.readdir(currentDirectory, async (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  console.log(`Contents of ${currentDirectory}:`);
  files.forEach((file) => console.log(file));

  const response = await prompts({
    type: "text",
    name: "exit",
    message: "Press Enter to exit...",
  });

  process.exit(0);
});
