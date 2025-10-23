# Report Export Options

## Overview

Simple and reliable export options for consolidated reports using Markdown and Plain Text formats instead of PDF. These formats are universally compatible and easy to share.

---

## 📥 Export Formats

### 1. **Markdown Export (.md)**

**Best for:**

- Documentation systems (GitHub, GitLab, Notion)
- Version control
- Easy editing and updates
- Web publishing

**Features:**

- ✅ Formatted tables
- ✅ Headers and sections
- ✅ Bullet points and lists
- ✅ Code blocks for formulas
- ✅ Emoji icons for visual clarity
- ✅ Clean, readable structure

**Example Output:**

```markdown
# Reporte Consolidado de Auditoría

## Resumen Ejecutivo

| Métrica                  | Valor  |
| ------------------------ | ------ |
| **Puntuación Promedio**  | 8.5/10 |
| **Proyectos Analizados** | 3      |

...
```

### 2. **Plain Text Export (.txt)**

**Best for:**

- Email attachments
- Maximum compatibility
- Terminal viewing
- Simple sharing

**Features:**

- ✅ ASCII box drawing
- ✅ Fixed-width formatting
- ✅ 70-character width (email-safe)
- ✅ Clear section separators
- ✅ No special characters needed
- ✅ Works everywhere

**Example Output:**

```
REPORTE CONSOLIDADO DE AUDITORÍA
======================================================================

RESUMEN EJECUTIVO
----------------------------------------------------------------------

Puntuación Promedio:     8.5/10
Proyectos Analizados:    3
...
```

---

## 🚀 How to Use

### For Users

1. Navigate to any consolidated report
2. Click the **"Exportar"** dropdown button
3. Select your preferred format:
   - **"Exportar como Markdown (.md)"**
   - **"Exportar como Texto (.txt)"**
4. File downloads immediately

### File Naming

Exports are automatically named:

- Markdown: `reporte-consolidado-{slug}.md`
- Text: `reporte-consolidado-{slug}.txt`

Where `{slug}` is your report's unique identifier.

---

## 📊 What's Included

Both formats include:

### 1. **Executive Summary**

- Overall score
- Project count
- Total files and lines
- Estimated value
- Value range

### 2. **Category Scores**

- Security
- Code Quality
- Performance
- Bug Detection
- Maintainability
- Architecture

### 3. **Issues Summary**

- Critical issues count
- High issues count
- Medium issues count
- Low issues count

### 4. **Languages Detected**

- List of all programming languages

### 5. **Project Details**

- Each project with:
  - Name and description
  - File count
  - Line count
  - Score
  - Analysis date
  - Summary

### 6. **Methodology**

- Analysis approach
- Scoring formula
- Rating scale
- Category descriptions

---

## 🔧 Technical Implementation

### Architecture

```
User clicks Export
    ↓
report-export-buttons.tsx (Client Component)
    ↓
export-report.ts (Server Action)
    ↓
Fetch data from Supabase
    ↓
Generate Markdown or Text
    ↓
Return to client
    ↓
Download file
```

### Files

1. **`lib/actions/export-report.ts`**

   - Server action for data fetching
   - Format generation logic
   - Both Markdown and Text generators

2. **`components/report-export-buttons.tsx`**

   - Client component with dropdown
   - Export button UI
   - File download handling

3. **`app/reports/[slug]/layout.tsx`**
   - Integration point
   - Header placement

---

## 💻 Code Examples

### Using the Component

```tsx
import { ReportExportButtons } from "@/components/report-export-buttons";

<ReportExportButtons reportSlug="your-report-slug" />;
```

### Calling the Export Action Directly

```tsx
import { exportConsolidatedReport } from "@/lib/actions/export-report";

const result = await exportConsolidatedReport({
  slug: "your-report-slug",
  format: "markdown", // or "text"
});

if (result.success) {
  console.log(result.content); // File content
  console.log(result.filename); // Suggested filename
}
```

---

## 🎨 Format Comparison

| Feature           | Markdown          | Plain Text      |
| ----------------- | ----------------- | --------------- |
| **Tables**        | Formatted tables  | Aligned columns |
| **Headers**       | # Markdown syntax | UPPERCASE + === |
| **Lists**         | - Bullet points   | - Bullet points |
| **Emojis**        | ✅ Supported      | ❌ No emojis    |
| **Code blocks**   | `code`            | Simple quotes   |
| **File size**     | Slightly larger   | Smallest        |
| **Compatibility** | 95%               | 100%            |
| **Readability**   | Excellent         | Good            |
| **Editability**   | Excellent         | Good            |

---

## 📝 Use Cases

### Markdown Export

**Perfect for:**

- Adding to GitHub/GitLab repos
- Including in project documentation
- Publishing on documentation sites
- Converting to other formats (HTML, PDF with tools)
- Sharing with technical teams

### Plain Text Export

**Perfect for:**

- Email attachments (universal)
- Viewing in any terminal
- Including in legacy systems
- Maximum compatibility
- Simple sharing with non-technical users

---

## 🐛 Troubleshooting

### Export button not working

**Check:**

1. You're on a valid report page
2. Browser console for errors
3. Network tab for failed requests

### Downloaded file is empty

**Possible causes:**

1. Report has no data
2. Projects not found
3. Database connection issue

**Solution:**

- Check report exists in database
- Verify projects are linked to report
- Check Supabase connection

### Special characters look weird (Plain Text)

**This is normal if:**

- Viewing in some Windows apps
- Using non-UTF8 encoding

**Solution:**

- Use Markdown format instead
- Open with UTF-8 compatible editor

### File doesn't download

**Try:**

1. Check browser download permissions
2. Disable popup blocker
3. Try different browser
4. Check browser console for errors

---

## 🔮 Future Enhancements

Potential improvements:

1. **JSON Export**: Structured data for APIs
2. **CSV Export**: Spreadsheet-friendly format
3. **HTML Export**: Styled web page
4. **DOCX Export**: Microsoft Word format
5. **Custom Templates**: User-defined formats
6. **Batch Export**: Multiple reports at once
7. **Scheduled Exports**: Automatic generation
8. **Email Delivery**: Send directly via email
9. **Cloud Storage**: Save to Google Drive/Dropbox
10. **API Endpoint**: Programmatic access

---

## 📚 Related Documentation

- **Main PDF Export** (deprecated): See `PDF_EXPORT_FEATURE.md`
- **PDF Styling** (deprecated): See `PDF_STYLING_IMPROVEMENTS.md`
- **Analysis Export**: See `export.ts` for individual project exports

---

## 🆚 Why Not PDF?

**PDF Limitations:**

- ❌ Complex to generate correctly
- ❌ html2canvas compatibility issues
- ❌ Large file sizes
- ❌ Not editable
- ❌ Color function errors
- ❌ Difficult to maintain

**Markdown/Text Advantages:**

- ✅ Simple and reliable
- ✅ Universal compatibility
- ✅ Small file sizes
- ✅ Easily editable
- ✅ Version control friendly
- ✅ No browser dependencies
- ✅ Fast generation
- ✅ Zero errors

**Note:** If PDF is absolutely required, users can:

1. Export as Markdown
2. Use a Markdown-to-PDF converter (Pandoc, Typora, etc.)
3. Get better results than browser-generated PDFs

---

## ✨ Benefits

### For Users

- **Fast**: Instant download
- **Reliable**: No generation errors
- **Compatible**: Works everywhere
- **Editable**: Can modify after export
- **Lightweight**: Small file sizes

### For Developers

- **Simple**: Easy to maintain
- **Testable**: Plain string generation
- **Extensible**: Easy to add formats
- **Performant**: Server-side generation
- **Debuggable**: Clear error messages

---

**Last Updated**: October 2025  
**Version**: 1.0.0
