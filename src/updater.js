const START_MARKER = "<!-- readme-scoreboard start -->";
const END_MARKER = "<!-- readme-scoreboard end -->";

async function updateReadme(octokit, targetRepo, content) {
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

  // Find markers
  const startIdx = currentContent.indexOf(START_MARKER);
  const endIdx = currentContent.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `Markers not found in README.md. Add these lines where you want the stats:\n` +
      `  ${START_MARKER}\n` +
      `  ${END_MARKER}`
    );
    process.exit(1);
  }

  if (startIdx >= endIdx) {
    console.error("Start marker must appear before end marker in README.md");
    process.exit(1);
  }

  // Replace content between markers
  const before = currentContent.substring(0, startIdx + START_MARKER.length);
  const after = currentContent.substring(endIdx);
  const newReadme = `${before}\n${content}\n${after}`;

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

module.exports = { updateReadme, START_MARKER, END_MARKER };
