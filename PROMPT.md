# Task: Add Configuration Page & Analytics Dashboard with Multi-Project Reporting

You are an expert Next.js developer working on a software audit application. Implement two new features following the existing codebase patterns (TypeScript, React Server Components, Tailwind CSS, Shadcn UI).

---

## Feature 1: Configuration Page

### Requirements

1. Add a "Configuración" navigation link/button in the dashboard layout (`app/dashboard/layout.tsx`)
2. Create a new page at `app/dashboard/config/page.tsx`
3. The configuration page should allow users to manage:
   - User profile settings (name, email)
   - Default AI model preferences
   - Notification preferences
   - Account settings
4. Use Shadcn UI components (Card, Input, Select, Button, etc.)
5. Implement proper form validation and save functionality
6. Display success/error toasts using the existing toast system

### Navigation Order

- Dashboard (Inicio)
- Projects (Proyectos)
- Analytics (Analítica) ← **NEW** (Feature 2)
- Configuration (Configuración) ← **NEW** (Feature 1)

---

## Feature 2: Analytics Dashboard ("Analítica")

### 2.1 Analytics Page - Project Selection Table

Create `app/dashboard/analytics/page.tsx` with:

#### Table Features

- Display all user's projects in a data table
- Columns: Name, Status, Score, Date Created, Last Analysis Date
- **Selectable rows** (checkboxes for multi-select)
- **Sortable columns** (by name, score, date)
- **Filterable** (by status: completed, analyzing, pending, failed)
- **Searchable** (by project name)
- Use Shadcn's Table or create a custom data table component

#### Action Button

- "Generar Reporte Consolidado" button
- Only enabled when 1+ projects are selected
- When clicked:
  1. Validate all selected projects have completed analyses
  2. Generate a combined report (server action)
  3. Create a unique public URL for the report
  4. Redirect to the public report page or show success with copy-to-clipboard URL

### 2.2 Public Report Generation

#### Database Schema (if needed)

Create a `consolidated_reports` table:

```sql
CREATE TABLE consolidated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  description TEXT,
  project_ids UUID[] NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Server Action

Create `lib/actions/generate-consolidated-report.ts`:

- Accept array of project IDs
- Validate user owns all projects
- Fetch all analyses, issues, valuations for selected projects
- Generate unique slug (e.g., `audit-report-2025-01-abc123`)
- Insert record into `consolidated_reports` table
- Return public URL

### 2.3 Public Report Pages

Create route: `app/reports/[slug]/...`

#### Page Structure

```
/reports/[slug]/ (root layout with navigation sidebar)
├── /reports/[slug]/page.tsx (Introduction)
├── /reports/[slug]/[projectId]/page.tsx (Individual Project Report)
└── /reports/[slug]/methodology/page.tsx (Audit Methodology)
```

#### Navigation Sidebar

- Introduction
- Project Reports (expandable list)
  - Project 1 Name
  - Project 2 Name
  - Project N Name
- Methodology

#### Page 1: Introduction (`/reports/[slug]/page.tsx`)

Display:

- Report title and generation date
- Executive summary
- Overview of included projects (count, total lines of code, languages)
- Aggregate statistics (average scores, total issues by severity)
- Visual charts (radar chart of average scores, pie chart of issues)

#### Page 2: Individual Project Reports (`/reports/[slug]/[projectId]/page.tsx`)

For each project, display:

- Project name and description
- Overall score and category scores
- Score radar chart
- Valuation information (estimated value, range, breakdown)
- Top 10 critical/high issues
- Recommendations
- Project metadata (files, lines, languages)

#### Page 3: Methodology (`/reports/[slug]/methodology/page.tsx`)

Document:

##### 1. Audit Approach

- How code is analyzed (AI-powered with Claude)
- Categories analyzed (security, quality, performance, bugs, maintainability, architecture)

##### 2. Scoring Formulas

- Overall Score = weighted average of 6 category scores
- Formula: `(security + code_quality + performance + bugs + maintainability + architecture) / 6`
- Each category scored 0-10 scale
- Confidence level calculation

##### 3. Valuation/Pricing Criteria

- Reconstruction cost = lines of code × complexity factor × hourly rate
- Annual costs (maintenance, infrastructure, technical debt)
- Depreciation factors (age, obsolescence, quality)
- Asset vs Liability classification

##### 4. Scoring Criteria per Category

- **Security:** Vulnerabilities, auth/auth issues, data exposure, crypto usage
- **Code Quality:** Complexity, duplication, naming, standards compliance
- **Performance:** Algorithmic efficiency, resource usage, caching, N+1 queries
- **Bugs:** Logic errors, edge cases, error handling, null safety
- **Maintainability:** Documentation, testability, modularity, readability
- **Architecture:** Design patterns, separation of concerns, scalability, dependencies

---

## Technical Requirements

### 1. Authentication

- Analytics page: Authenticated users only
- Public report pages: No authentication required (publicly accessible)

### 2. Styling

- Use existing Tailwind CSS and Shadcn UI components
- Maintain consistent design with current dashboard
- Mobile-responsive design

### 3. Data Fetching

- Use React Server Components for initial data loading
- Implement proper loading states
- Handle errors gracefully with error boundaries

### 4. SEO & Sharing

Public report pages should have:

- Meta tags (title, description, og:image)
- Shareable URLs
- Print-friendly CSS

### 5. Performance

- Optimize queries (select only needed columns)
- Implement pagination if needed for large project lists
- Cache consolidated report data

---

## Implementation Steps

1. Add "Analítica" and "Configuración" navigation items to dashboard layout
2. Create configuration page with basic user settings
3. Create analytics page with project selection table
4. Implement table sorting, filtering, and search
5. Create consolidated report generation server action
6. Create database migration for `consolidated_reports` table
7. Build public report pages with proper routing
8. Implement introduction page with aggregate statistics
9. Implement individual project report pages
10. Implement methodology page with detailed documentation
11. Add proper meta tags and SEO optimization
12. Test all functionality and edge cases

---

## Expected Deliverables

- [ ] Dashboard navigation updated with new links
- [ ] Configuration page (`/dashboard/config`)
- [ ] Analytics page with interactive table (`/dashboard/analytics`)
- [ ] Database migration for consolidated reports
- [ ] Server action for report generation
- [ ] Public report introduction page (`/reports/[slug]`)
- [ ] Public individual project pages (`/reports/[slug]/[projectId]`)
- [ ] Public methodology page (`/reports/[slug]/methodology`)
- [ ] All pages styled and mobile-responsive
- [ ] Proper error handling and loading states

---

**Start with Feature 1 (Configuration), then proceed to Feature 2 (Analytics) step by step. Ask clarifying questions if any requirements are unclear.**
