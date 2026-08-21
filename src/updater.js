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

function parseTargetRepo(targetRepo) {
  const parts = typeof targetRepo === "string" ? targetRepo.split("/") : [];
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid TARGET_REPO format: "${targetRepo}". Expected: owner/repo`);
  }
  return { owner: parts[0], repo: parts[1] };
}

async function fetchReadme(octokit, owner, repo) {
  const { data } = await octokit.repos.getContent({ owner, repo, path: "README.md" });
  return data;
}

async function writeReadme(octokit, owner, repo, readmeData, content) {
  return octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: "README.md",
    message: "📊 Update sports stats via readme-scoreboard",
    content: Buffer.from(content).toString("base64"),
    sha: readmeData.sha,
  });
}

async function updateReadme(octokit, targetRepo, content, markerName) {
  let owner;
  let repo;
  try {
    ({ owner, repo } = parseTargetRepo(targetRepo));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
    return;
  }

  console.log(`📝 Updating README in ${owner}/${repo}...`);

  // Fetch current README
  let readmeData;
  try {
    readmeData = await fetchReadme(octokit, owner, repo);
  } catch (error) {
    console.error(`Failed to fetch README.md from ${owner}/${repo}: ${error.message}`);
    process.exit(1);
    return;
  }

  const currentContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
  const newReadme = injectContent(currentContent, content, markerName);

  // Check if content actually changed
  if (newReadme === currentContent) {
    console.log("ℹ️  No changes detected, skipping commit.");
    return false;
  }

  try {
    await writeReadme(octokit, owner, repo, readmeData, newReadme);
    console.log("✅ README.md updated successfully!");
    return true;
  } catch (error) {
    const status = error.status || error.response?.status;
    if (status === 409) {
      let retryError;
      try {
        const latestReadme = await fetchReadme(octokit, owner, repo);
        const latestContent = Buffer.from(latestReadme.content, "base64").toString("utf-8");
        const latestReadmeContent = injectContent(latestContent, content, markerName);

        if (latestReadmeContent === latestContent) {
          console.log("ℹ️  No changes detected after refreshing README, skipping commit.");
          return false;
        }

        await writeReadme(octokit, owner, repo, latestReadme, latestReadmeContent);
        console.log("✅ README.md updated successfully after refreshing its version!");
        return true;
      } catch (caughtError) {
        retryError = caughtError;
      }
      if (retryError) {
        console.error(`Failed to update README.md: ${retryError.message}`);
        process.exit(1);
        return;
      }
    }
    console.error(`Failed to update README.md: ${error.message}`);
    process.exit(1);
    return;
  }
}

function injectContent(currentContent, content, markerName) {
  const { START_MARKER: start, END_MARKER: end } = getMarkers(markerName);
  const startIdx = currentContent.indexOf(start);
  const endIdx = currentContent.indexOf(end);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `Marker not found in README.md. Add these lines where you want the stats:\n` +
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
    return false;
  }

  fs.writeFileSync(readmePath, newReadme, "utf-8");
  console.log("✅ README.md updated on disk — workflow will commit if changed.");
  return true;
}

module.exports = { updateReadme, updateReadmeLocal, parseTargetRepo };
