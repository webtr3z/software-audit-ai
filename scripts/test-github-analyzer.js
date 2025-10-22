#!/usr/bin/env node

/**
 * Test script to diagnose GitHub analyzer issues
 * Usage: node scripts/test-github-analyzer.js <github-url> [token]
 */

const { Octokit } = require("@octokit/rest");

const githubUrl = process.argv[2];
const token = process.argv[3];

if (!githubUrl) {
  console.error(
    "❌ Usage: node scripts/test-github-analyzer.js <github-url> [token]"
  );
  console.log("\nExample:");
  console.log(
    "  node scripts/test-github-analyzer.js https://github.com/owner/repo"
  );
  console.log(
    "  node scripts/test-github-analyzer.js https://github.com/owner/repo ghp_xxx"
  );
  process.exit(1);
}

console.log("\n🧪 Testing GitHub Analyzer");
console.log("=".repeat(60));

// Parse URL
const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);

if (!urlMatch) {
  console.error("❌ Invalid GitHub URL");
  process.exit(1);
}

const [, owner, repo] = urlMatch;

console.log(`\n📦 Repository: ${owner}/${repo}`);
console.log(
  `🔑 Token: ${token ? "Provided ✓" : "Not provided (using unauthenticated)"}`
);

async function test() {
  try {
    const octokit = new Octokit({
      auth: token || undefined,
    });

    // Test 1: Fetch repository info
    console.log("\n1️⃣  Fetching repository info...");
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });
    console.log(`   ✅ Repository found: ${repoData.full_name}`);
    console.log(`   📂 Default branch: ${repoData.default_branch}`);
    console.log(`   💾 Size: ${repoData.size} KB`);
    console.log(
      `   👁️  Visibility: ${repoData.private ? "Private" : "Public"}`
    );

    // Test 2: Fetch languages
    console.log("\n2️⃣  Fetching languages...");
    const { data: languagesData } = await octokit.repos.listLanguages({
      owner,
      repo,
    });
    const languages = Object.keys(languagesData);
    console.log(`   ✅ Languages detected: ${languages.join(", ") || "None"}`);

    // Test 3: Fetch tree
    console.log("\n3️⃣  Fetching repository tree...");
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: repoData.default_branch,
      recursive: "1",
    });
    console.log(`   ✅ Tree fetched: ${treeData.tree.length} total items`);
    if (treeData.truncated) {
      console.log(`   ⚠️  Warning: Tree was truncated (repo is very large)`);
    }

    // Test 4: Count code files
    console.log("\n4️⃣  Analyzing code files...");
    const codeExtensions = new Set([
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".cs",
      ".go",
      ".rb",
      ".php",
      ".swift",
      ".kt",
      ".rs",
      ".scala",
      ".sh",
      ".html",
      ".css",
      ".scss",
      ".sass",
      ".less",
      ".vue",
      ".svelte",
      ".sql",
      ".graphql",
      ".yaml",
      ".yml",
      ".json",
      ".xml",
    ]);

    const codeFiles = treeData.tree.filter((node) => {
      if (node.type !== "blob" || !node.path) return false;
      const ext = node.path.substring(node.path.lastIndexOf("."));
      return codeExtensions.has(ext.toLowerCase());
    });

    console.log(`   ✅ Code files found: ${codeFiles.length}`);

    // Calculate lines
    const CHARS_PER_LINE = 45;
    let totalBytes = 0;
    for (const file of codeFiles) {
      totalBytes += file.size || 0;
    }
    const estimatedLines = Math.round(totalBytes / CHARS_PER_LINE);

    console.log(`   💾 Total bytes: ${totalBytes.toLocaleString()}`);
    console.log(`   📝 Estimated lines: ${estimatedLines.toLocaleString()}`);

    // Test 5: Check rate limits
    console.log("\n5️⃣  Checking rate limits...");
    const { data: rateLimitData } = await octokit.rateLimit.get();
    const core = rateLimitData.resources.core;
    console.log(`   ✅ Remaining: ${core.remaining}/${core.limit}`);
    const resetDate = new Date(core.reset * 1000);
    console.log(`   🔄 Resets at: ${resetDate.toLocaleString()}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests passed!");
    console.log("\n📊 Results:");
    console.log(`   Files: ${codeFiles.length}`);
    console.log(`   Lines: ${estimatedLines.toLocaleString()}`);
    console.log(`   Languages: ${languages.join(", ")}`);
    console.log(
      "\n✨ The GitHub analyzer should work correctly with this repository."
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n📋 Details:");
    console.error(`   Status: ${error.status || "N/A"}`);
    console.error(`   Message: ${error.message}`);

    if (error.status === 404) {
      console.log("\n💡 Solution:");
      console.log("   - Verify the repository exists");
      console.log("   - If it's private, provide a Personal Access Token");
      console.log(
        "   - Generate a token at: https://github.com/settings/tokens"
      );
    } else if (error.status === 401) {
      console.log("\n💡 Solution:");
      console.log("   - Your token is invalid or expired");
      console.log(
        "   - Generate a new token at: https://github.com/settings/tokens"
      );
    } else if (error.status === 403) {
      console.log("\n💡 Solution:");
      console.log("   - You may have hit GitHub's rate limit");
      console.log("   - Wait a few minutes and try again");
      console.log("   - Use a Personal Access Token for higher limits");
      console.log(
        "   - Generate a token at: https://github.com/settings/tokens"
      );
    }

    process.exit(1);
  }
}

test();
