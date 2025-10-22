import { Octokit } from "@octokit/rest";

export interface GitHubRepoStats {
  fileCount: number;
  totalLines: number;
  languages: string[];
  primaryLanguage?: string;
}

interface GitHubTreeNode {
  path?: string;
  type?: string;
  size?: number;
  sha?: string;
}

/**
 * Analyzes a GitHub repository to extract statistics
 */
export async function analyzeGitHubRepo(
  githubUrl: string,
  token?: string
): Promise<GitHubRepoStats> {
  try {
    console.log(`[v0] 🔍 Raw GitHub URL received: "${githubUrl}"`);
    console.log(`[v0] URL length: ${githubUrl?.length || 0}`);
    console.log(`[v0] Token provided: ${!!token}`);

    // Clean the URL - remove whitespace and trailing slashes
    const cleanUrl = githubUrl.trim().replace(/\/+$/, "");
    console.log(`[v0] 🧹 Cleaned URL: "${cleanUrl}"`);

    // Parse GitHub URL to extract owner and repo
    // This handles various formats:
    // - https://github.com/owner/repo
    // - https://github.com/owner/repo.git
    // - github.com/owner/repo
    // - owner/repo
    const urlMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);

    if (!urlMatch) {
      console.error(`[v0] ❌ URL parsing failed for: "${cleanUrl}"`);
      throw new Error(`URL de GitHub inválida. Recibido: "${cleanUrl}"`);
    }

    let [, owner, repo] = urlMatch;

    // Remove .git suffix if present
    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -4);
      console.log(`[v0] 🔧 Removed .git suffix from repo name`);
    }

    console.log(`[v0] ✅ Parsed - Owner: "${owner}", Repo: "${repo}"`);
    console.log(`[v0] Analyzing GitHub repo: ${owner}/${repo}`);

    // Initialize Octokit with token if provided
    const octokit = new Octokit({
      auth: token || undefined,
    });

    // Fetch repository information
    console.log(`[v0] Fetching repository info...`);
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    console.log(`[v0] Repository found: ${repoData.full_name}`);
    console.log(`[v0] Default branch: ${repoData.default_branch}`);
    console.log(`[v0] Size: ${repoData.size} KB`);

    // Fetch languages
    console.log(`[v0] Fetching languages...`);
    const { data: languagesData } = await octokit.repos.listLanguages({
      owner,
      repo,
    });

    const languages = Object.keys(languagesData);
    console.log(`[v0] Languages detected: ${languages.join(", ") || "None"}`);

    // Get the repository tree (file structure)
    console.log(`[v0] Fetching repository tree (this may take a moment)...`);
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: repoData.default_branch,
      recursive: "1",
    });

    console.log(`[v0] Tree fetched: ${treeData.tree.length} total items`);
    if (treeData.truncated) {
      console.log(`[v0] Warning: Tree was truncated (repo is very large)`);
    }

    // Filter for code files only
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

    const codeFiles = (treeData.tree as GitHubTreeNode[]).filter((node) => {
      if (node.type !== "blob" || !node.path) return false;

      const ext = node.path.substring(node.path.lastIndexOf("."));
      return codeExtensions.has(ext.toLowerCase());
    });

    console.log(`[v0] Code files found: ${codeFiles.length}`);

    // Calculate total lines (estimate based on file sizes)
    // GitHub API provides size in bytes
    // Average: 1 line ≈ 40-50 characters (including whitespace)
    // We'll use 45 as a middle ground
    const CHARS_PER_LINE = 45;

    let totalBytes = 0;
    for (const file of codeFiles) {
      totalBytes += file.size || 0;
    }

    const estimatedLines = Math.round(totalBytes / CHARS_PER_LINE);

    console.log(`[v0] Total bytes: ${totalBytes.toLocaleString()}`);
    console.log(
      `[v0] Estimated lines of code: ${estimatedLines.toLocaleString()}`
    );

    return {
      fileCount: codeFiles.length,
      totalLines: estimatedLines,
      languages,
      primaryLanguage: repoData.language || undefined,
    };
  } catch (error: any) {
    console.error("[v0] ❌ Error analyzing GitHub repo");
    console.error("[v0] Error type:", error.constructor.name);
    console.error("[v0] Error status:", error.status);
    console.error("[v0] Error message:", error.message);
    console.error("[v0] Full error:", error);

    // Check if this is a GitHub API error (has status) or a local error
    if (error.status) {
      // GitHub API errors
      if (error.status === 404) {
        throw new Error(
          "Repositorio no encontrado. Verifica la URL y los permisos."
        );
      } else if (error.status === 401) {
        throw new Error(
          "Error de autenticación. Tu token es inválido o ha expirado."
        );
      } else if (error.status === 403) {
        const resetTime = error.response?.headers?.["x-ratelimit-reset"];
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          throw new Error(
            `Límite de tasa de GitHub alcanzado. Intenta de nuevo después de ${resetDate.toLocaleTimeString()}.`
          );
        }
        throw new Error(
          "Acceso denegado. Verifica tu token de acceso personal o los permisos del repositorio."
        );
      }
      throw new Error(
        `Error de GitHub API (${error.status}): ${error.message}`
      );
    } else {
      // Local errors (parsing, validation, etc.)
      throw error; // Re-throw the original error with its message
    }
  }
}

/**
 * Validates a GitHub URL format
 */
export function isValidGitHubUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/\?#]+/.test(url);
}
