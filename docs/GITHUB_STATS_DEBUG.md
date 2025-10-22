# Debugging GitHub Stats Issues

## 🐛 Problem

When importing a GitHub repository, the **Archivos** (Files) and **Líneas de Código** (Lines of Code) stats show 0 instead of the actual counts.

## 🔍 What I've Fixed

### 1. Enhanced Logging

Added comprehensive logging throughout the GitHub analysis pipeline:

- `lib/actions/projects.ts`: Logs token presence, stats received, and update errors
- `lib/github/analyzer.ts`: Logs every step of the GitHub API calls

### 2. Improved Error Handling

- Better error messages for 401, 403, and 404 errors
- Rate limit detection with reset time
- Detailed error logging with stack traces

### 3. Database Update Validation

- Now checks if the database update succeeds
- Throws error if update fails
- Doesn't overwrite with 0 on failure

## 🧪 How to Debug

### Step 1: Test GitHub API Access

Run the diagnostic script to test if the GitHub API is working:

```bash
# For public repositories
node scripts/test-github-analyzer.js https://github.com/owner/repo

# For private repositories
node scripts/test-github-analyzer.js https://github.com/owner/repo ghp_YOUR_TOKEN
```

This will show you:

- ✅ If the repository is accessible
- 📊 How many files and lines it detects
- 🔑 Your rate limit status
- ❌ Specific error messages if something fails

### Step 2: Check Server Logs

When you import a repository, check your terminal/console for these logs:

```
[v0] Analyzing GitHub repository: https://github.com/owner/repo
[v0] Using token: Yes (provided) / No (public repo)
[v0] Fetching repository info...
[v0] Repository found: owner/repo
[v0] Default branch: main
[v0] Size: 1234 KB
[v0] Fetching languages...
[v0] Languages detected: TypeScript, JavaScript
[v0] Fetching repository tree (this may take a moment)...
[v0] Tree fetched: 523 total items
[v0] Code files found: 145
[v0] Total bytes: 245678
[v0] Estimated lines of code: 5,459
[v0] Stats received: { fileCount: 145, totalLines: 5459, languages: [...] }
[v0] GitHub analysis complete: 145 files, 5459 lines
```

### Step 3: Common Issues & Solutions

#### Issue 1: Rate Limit (403 Error)

**Symptoms**: Error says "rate limit" or "x-ratelimit"

**Solution**:

- GitHub has a rate limit of 60 requests/hour for unauthenticated requests
- Use a Personal Access Token (PAT) for 5,000 requests/hour
- Generate PAT: https://github.com/settings/tokens
- Required scope: `repo` (for private repos) or just `public_repo` (for public)

#### Issue 2: Repository Not Found (404 Error)

**Symptoms**: Error says "repositorio no encontrado"

**Solution**:

- Verify the repository URL is correct
- If it's a private repository, provide a PAT with proper permissions
- Check that the repository hasn't been deleted or renamed

#### Issue 3: Authentication Failed (401 Error)

**Symptoms**: Error says "token es inválido"

**Solution**:

- Your PAT is invalid or expired
- Generate a new one: https://github.com/settings/tokens
- Make sure you copied the entire token

#### Issue 4: Stats Still Show 0

**Possible causes**:

1. **Page Caching**:

   - Try hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache

2. **Analysis Failed Silently**:

   - Check server logs for error messages
   - Run the diagnostic script to verify API access

3. **Database Update Failed**:

   - Check for database errors in logs
   - Verify the `file_count` and `total_lines` columns exist in `projects` table

4. **Large Repository**:
   - GitHub truncates very large repository trees
   - You'll see: `[v0] Warning: Tree was truncated`
   - This is a GitHub API limitation

## 🚀 Manual Workaround

If the automatic analysis fails, you can manually update the stats:

1. Go to Supabase Dashboard
2. Open the `projects` table
3. Find your project row
4. Update `file_count` and `total_lines` columns manually
5. Refresh the page

## 📝 What Changed in the Code

### `lib/actions/projects.ts`

- Added detailed logging at each step
- Validates database update succeeded
- Doesn't overwrite with 0 on error

### `lib/github/analyzer.ts`

- Logs every API call
- Better error messages with specific solutions
- Detects rate limit issues
- Shows repository size and tree statistics

### New Files

- `scripts/test-github-analyzer.js` - Diagnostic tool for testing GitHub API access

## 🔧 Next Steps

1. **Run the diagnostic script** with a test repository
2. **Import a repository** through the UI
3. **Check the terminal** for `[v0]` log messages
4. **Share the logs** if you still see 0 stats

## 💡 Tips

- **Public repos**: Should work without a token, but may hit rate limits
- **Private repos**: Always require a PAT
- **Large repos**: May take 10-30 seconds to analyze
- **Browser refresh**: Try hard refresh if stats don't appear immediately

## 📞 Still Having Issues?

If stats still show 0 after trying these steps:

1. Run the diagnostic script and save the output
2. Check server logs during repository import
3. Share both outputs for further investigation

The diagnostic script will tell you exactly what's failing and why! 🎯
