# PDF Export Feature for Consolidated Reports

## Overview

The PDF export feature allows users to download the entire consolidated report as a professional PDF document with optimized styling and formatting.

## Implementation

### Package Used

**react-to-pdf** ([GitHub](https://github.com/ivmarcos/react-to-pdf))

- Version: Latest
- Built on top of `html2canvas` and `jsPDF`
- Converts React components to PDF by capturing screenshots
- Installed with: `npm install react-to-pdf --save --legacy-peer-deps`

### Files Created/Modified

#### 1. **`components/export-consolidated-report-pdf.tsx`**

- Core module with PDF export logic
- Exports two functions:
  - `ExportConsolidatedReportPDF`: Simple component with button
  - `useReportPDFExport`: Custom hook for more control

**Configuration:**

```typescript
{
  filename: `reporte-consolidado-${reportSlug}.pdf`,
  method: "save",
  resolution: Resolution.MEDIUM, // Good balance between quality and size
  page: {
    margin: Margin.SMALL,
    format: "a4",
    orientation: "portrait",
  },
  canvas: {
    mimeType: "image/jpeg", // Better compression than PNG
    qualityRatio: 0.9,
  },
  overrides: {
    pdf: { compress: true },
    canvas: { useCORS: true, scale: 2 },
  },
}
```

#### 2. **`components/report-pdf-export-button.tsx`**

- Client component that renders the export button
- Automatically attaches to the main content area
- Handles loading states and user feedback

#### 3. **`app/reports/[slug]/layout.tsx`**

- Modified to include the PDF export button in the header
- Button positioned next to "Reporte Público" label

#### 4. **`app/globals.css`**

- Added PDF-specific styles under `.pdf-export-mode` class
- Hides navigation, sidebar, and footer during export
- Optimizes content layout for PDF format
- Includes print media queries for browser print functionality

## Features

### ✅ What's Included in the PDF

- **Introduction Page**: Executive summary, aggregate stats, scores
- **All Project Reports**: Individual project details
- **Methodology Page**: Scoring criteria and valuation methodology
- **Charts**: Radar charts and score visualizations
- **Issue Lists**: Top issues for each project
- **Valuations**: Cost estimates and value ranges
- **Styling**: Clean, professional layout with proper spacing

### ✅ Optimizations

1. **Resolution**: Medium quality (good balance between file size and clarity)
2. **Compression**: PDF compression enabled for smaller files
3. **Image Quality**: 90% JPEG quality ratio
4. **Page Breaks**: Prevents content splitting awkwardly
5. **Colors**: Exact color reproduction for charts and badges
6. **Margins**: Small margins for more content per page
7. **Scale**: 2x scaling for sharper text and graphics

### 🔒 What's Hidden in PDF

During PDF export, the following elements are automatically hidden:

- Header navigation
- Sidebar navigation
- Footer
- "Exportar PDF" button itself

## Usage

### For Users

1. Navigate to any consolidated report page (`/reports/[slug]`)
2. Click the **"Exportar PDF"** button in the header
3. Wait for the PDF to generate (usually 3-10 seconds)
4. PDF automatically downloads with filename: `reporte-consolidado-[slug].pdf`

### For Developers

**Using the hook directly:**

```typescript
import { useReportPDFExport } from "@/components/export-consolidated-report-pdf";

function MyComponent() {
  const { exportPDF, targetRef, isExporting } =
    useReportPDFExport("my-report-slug");

  return (
    <div>
      <button onClick={exportPDF} disabled={isExporting}>
        {isExporting ? "Generando..." : "Exportar PDF"}
      </button>
      <div ref={targetRef}>{/* Content to export */}</div>
    </div>
  );
}
```

**Using the button component:**

```typescript
import { ReportPDFExportButton } from "@/components/report-pdf-export-button";

<ReportPDFExportButton reportSlug="my-report-slug" />;
```

## Performance Considerations

### File Size

- **Small reports** (1-2 projects): ~500KB - 2MB
- **Medium reports** (3-5 projects): ~2MB - 5MB
- **Large reports** (6+ projects): ~5MB - 15MB

### Generation Time

- **Small reports**: 2-5 seconds
- **Medium reports**: 5-10 seconds
- **Large reports**: 10-20 seconds

### Optimization Tips

If PDFs are too large:

1. Reduce `resolution` from `MEDIUM` to `LOW`
2. Lower `qualityRatio` from 0.9 to 0.8
3. Remove some visual elements (charts, radar diagrams)

If quality is poor:

1. Increase `resolution` to `HIGH` (⚠️ increases file size)
2. Increase `qualityRatio` to 0.95
3. Increase `scale` to 3 or 4

## Limitations

### Known Issues

1. **Not vectorized**: PDF is generated from screenshots, not vector graphics
2. **Charts may vary**: Canvas-based charts might have slight inconsistencies
3. **Large reports**: Reports with 10+ projects may be slow to generate
4. **Memory**: Very large reports may cause browser slowdown

### When NOT to Use

For production-grade, vector-based PDFs, consider alternatives:

- **@react-pdf/renderer**: React renderer for vector PDFs (more complex)
- **Puppeteer**: Server-side PDF generation (requires backend)
- **Server-side rendering**: Pre-render static PDFs

## CSS Classes Reference

### `.pdf-export-mode`

Applied to `<body>` during PDF generation:

- Hides navigation and sidebar
- Optimizes layout for PDF
- Adjusts spacing and margins

### Print Media Queries

Standard browser print styles also apply:

```css
@media print {
  /* Styles here apply during browser print AND PDF export */
}
```

## Troubleshooting

### Error: "Attempting to parse an unsupported color function 'lab'"

**Problem**: `html2canvas` (used by `react-to-pdf`) doesn't support modern CSS color functions like `lab()`, `lch()`, `oklab()` that Tailwind CSS uses.

**Solution Applied**:

1. Added `.pdf-export-mode` class to override modern colors with compatible hex/RGB values
2. Configured canvas options with explicit `backgroundColor`
3. Increased delay to 500ms to ensure styles are applied
4. Added comprehensive color overrides for common Tailwind classes

**CSS Overrides**:

```css
.pdf-export-mode * {
  background-color: revert !important;
  color: revert !important;
  border-color: revert !important;
}

.pdf-export-mode .text-primary {
  color: #0ea5e9 !important;
}
/* ... more color overrides */
```

### PDF is blank

- Check that content is rendered before calling `toPDF()`
- Ensure `targetRef` is correctly attached
- Check console for errors
- Verify `.pdf-export-mode` class is being applied

### Charts not appearing

- Verify canvas elements are not hidden
- Check CORS settings if loading external images
- Try increasing delay before export (currently 500ms)
- Check that canvas has explicit `backgroundColor`

### Styles not applying

- Use `!important` for critical PDF styles
- Check that `.pdf-export-mode` class is added to body
- Verify styles are not being overridden
- Ensure sufficient delay for styles to apply (500ms)

### Colors look wrong in PDF

- Check that color overrides in `globals.css` match your design
- Add specific color overrides for custom classes
- Verify that Tailwind's modern color functions are being overridden
- Test with different browsers (Chrome/Firefox handle colors differently)

### File too large

- Reduce resolution setting from `MEDIUM` to `LOW`
- Lower quality ratio from 0.9 to 0.8 or lower
- Use JPEG instead of PNG (already configured)
- Compress PDF manually after generation
- Remove unnecessary visual elements before export

## Future Enhancements

Potential improvements for future versions:

1. **Multi-page support**: Better handling of very long reports
2. **Custom page breaks**: Manual control over page boundaries
3. **Vector graphics**: Migrate to @react-pdf/renderer for vector output
4. **Server-side generation**: Offload PDF generation to backend
5. **Progress indicator**: Show progress during long exports
6. **Preview mode**: Preview before download
7. **Custom branding**: Add logos, headers, footers
8. **Watermarks**: Add "DRAFT" or custom watermarks
9. **Compression options**: User-selectable quality settings
10. **Email delivery**: Send PDF via email instead of download

## References

- **react-to-pdf**: https://github.com/ivmarcos/react-to-pdf
- **html2canvas**: https://html2canvas.hertzen.com/
- **jsPDF**: https://artskydj.github.io/jsPDF/docs/jsPDF.html
- **Next.js Documentation**: https://nextjs.org/docs

## Support

For issues or questions:

1. Check browser console for errors
2. Verify all dependencies are installed
3. Test with different browsers
4. Review the implementation in the referenced files above

---

**Last Updated**: October 2025
**Version**: 1.0.0
