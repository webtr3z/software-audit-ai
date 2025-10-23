# Analytics Table Data Loading Fix

## Issue

The analytics page (`/dashboard/analytics`) was not displaying the project list for the current user.

## Changes Made

### 1. Enhanced Error Handling in `app/dashboard/analytics/page.tsx`

**Added:**

- Explicit error handling for Supabase query
- Console logging for debugging:
  - User ID
  - Number of projects fetched
  - Any errors from the query
  - Final transformed data count
- Error message display in UI if query fails
- Default values for `fileCount` and `totalLines` (0 if undefined)

**Key improvements:**

```typescript
const { data: projects, error: projectsError } = await supabase
  .from("projects")
  .select(...)
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

// Added debugging logs
console.log("[v0 Analytics] User ID:", user.id);
console.log("[v0 Analytics] Projects fetched:", projects?.length || 0);
console.log("[v0 Analytics] Error:", projectsError);

// Added error display in UI
{projectsError && (
  <div className="border border-destructive rounded-lg p-4 text-destructive">
    Error al cargar proyectos: {projectsError.message}
  </div>
)}
```

### 2. Enhanced ProjectsTable Component (`components/projects-table.tsx`)

**Added:**

- Import statements for `ExternalLink` icon and `Link` component
- Console logging to track received data:
  ```typescript
  console.log("[v0 ProjectsTable] Received projects:", projects.length);
  console.log("[v0 ProjectsTable] Projects data:", projects);
  ```
- **Actions column** to the table:
  - Added "Acciones" header
  - Added "Ver" button with link to individual project page
  - Updated empty state colspan from 6 to 7

**New Actions Column:**

```typescript
<TableCell>
  <Button variant="outline" size="sm" asChild>
    <Link href={`/dashboard/projects/${project.id}`}>
      <ExternalLink className="h-4 w-4 mr-2" />
      Ver
    </Link>
  </Button>
</TableCell>
```

## Debugging Steps

To debug if projects are loading:

1. **Check browser console** for logs:

   - `[v0 Analytics] User ID: ...`
   - `[v0 Analytics] Projects fetched: ...`
   - `[v0 ProjectsTable] Received projects: ...`

2. **Check terminal** (server logs) for the same messages

3. **Verify in Supabase Dashboard:**

   - Navigate to Table Editor → `projects` table
   - Verify projects exist for your `user_id`
   - Check if RLS policies allow reading

4. **Check RLS Policies:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM projects WHERE user_id = auth.uid();
   ```

## Common Issues & Solutions

### Issue: No projects showing

**Possible causes:**

1. No projects exist for the user → Create a project first
2. RLS policies blocking access → Check RLS policies in Supabase
3. User not authenticated → Check authentication state

### Issue: Query error

**Possible causes:**

1. Database connection issue → Check Supabase URL/keys
2. Missing columns → Verify all columns exist in database
3. RLS policy error → Disable RLS temporarily to test

### Issue: Data not transforming correctly

**Possible causes:**

1. Missing analyses data → Ensure projects have completed analyses
2. Null values → Check default value handling (0 for numbers, null for dates)

## Testing Checklist

- [ ] Navigate to `/dashboard/analytics`
- [ ] Check browser console for debug logs
- [ ] Verify projects appear in table
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Test sorting (click column headers)
- [ ] Test checkbox selection
- [ ] Test "Ver" button navigation
- [ ] Test "Generar Reporte Consolidado" with selected projects

## Next Steps

If the issue persists:

1. **Verify Node.js version:** Upgrade to Node.js >= 20.9.0

   ```bash
   node --version  # Should show >= 20.9.0
   nvm install 20  # If using nvm
   nvm use 20
   ```

2. **Check database migrations:** Ensure all migrations are applied

   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM projects LIMIT 5;
   ```

3. **Review browser network tab:** Check for failed API calls

4. **Test with different user:** Create a new test user and projects

## Files Modified

- `app/dashboard/analytics/page.tsx`
- `components/projects-table.tsx`

## Related Documentation

- [Cursor Rules](.cursorrules) - Project coding conventions
- [AGENTS.md](AGENTS.md) - AI agent personas for development
- [PROMPT.md](PROMPT.md) - Analytics feature requirements
