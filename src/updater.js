const fs = require("fs");
const path = require("path");

const DEFAULT_MARKER = "readme-scoreboard";

function getMarkers(markerName) {
  const name = markerName || DEFAULT_MARKER;
  return {
    START_MARKER: `<!-- ${name} start -->`,
    END_MARKER: `<!-- ${name} end -->`,
  };
}

async function updateReadme(octokit, targetRepo, content, markerName) {
  const [owner, repo] = targetRepo.split("/");

  if (!owner || !repo) {
    console.error(`Invalid TARGET_REPO format: "${targetRepo}". Expected: owner/repo`);
    process.exit(1);
  }

  console.log(`📝 Updating README in ${owner}/${repo}...`);

  // Fetch current README
  let readmeData;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "README.md",
    });
    readmeData = data;
  } catch (error) {
    console.error(`Failed to fetch README.md from ${owner}/${repo}: ${error.message}`);
    process.exit(1);
  }

  const currentContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
  const newReadme = injectContent(currentContent, content, markerName);

  // Check if content actually changed
  if (newReadme === currentContent) {
    console.log("ℹ️  No changes detected, skipping commit.");
    return;
  }

  // Commit updated README
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "README.md",
      message: "📊 Update sports stats via readme-scoreboard",
      content: Buffer.from(newReadme).toString("base64"),
      sha: readmeData.sha,
    });
    console.log("✅ README.md updated successfully!");
  } catch (error) {
    console.error(`Failed to update README.md: ${error.message}`);
    process.exit(1);
  }
}

function injectContent(currentContent, content, markerName) {
  const { START_MARKER: start, END_MARKER: end } = getMarkers(markerName);
  const startIdx = currentContent.indexOf(start);
  const endIdx = currentContent.indexOf(end);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `Markers not found in README.md. Add these lines where you want the stats:\n` +
      `  ${start}\n` +
      `  ${end}`
    );
    process.exit(1);
  }

  if (startIdx >= endIdx) {
    console.error("Start marker must appear before end marker in README.md");
    process.exit(1);
  }

  const before = currentContent.substring(0, startIdx + start.length);
  const after = currentContent.substring(endIdx);
  return `${before}\n${content}\n${after}`;
}

function updateReadmeLocal(workspacePath, content, markerName) {
  const readmePath = path.join(workspacePath, "README.md");
  console.log(`📝 Updating ${readmePath} (local file)...`);

  if (!fs.existsSync(readmePath)) {
    console.error(`README.md not found at ${readmePath}`);
    process.exit(1);
  }

  const currentContent = fs.readFileSync(readmePath, "utf-8");
  const newReadme = injectContent(currentContent, content, markerName);

  if (newReadme === currentContent) {
    console.log("ℹ️  No changes detected, skipping write.");
    return;
  }

  fs.writeFileSync(readmePath, newReadme, "utf-8");
  console.log("✅ README.md updated on disk — workflow will commit if changed.");
}

module.exports = { updateReadme, updateReadmeLocal };
