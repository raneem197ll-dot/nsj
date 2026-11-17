import type { AnalyticsReport } from './analytics-report';
import { reportToCsv, reportCellText } from './analytics-report';
import regularArabic from '@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-400-normal.woff2?url';
import boldArabic from '@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-700-normal.woff2?url';
import regularLatin from '@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-latin-400-normal.woff2?url';
import boldLatin from '@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-latin-700-normal.woff2?url';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  try { anchor.click(); } finally {
    anchor.remove();
    // Allow the browser to finish handing the URL to its download manager.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

export function downloadReportCsv(report: AnalyticsReport) {
  downloadBlob(new Blob([reportToCsv(report)], { type: 'text/csv;charset=utf-8' }), 'nasj-progress.csv');
}

const FONT = 'NASJ Report Kufi';
let fontLoad: Promise<void> | undefined;
const FONT_RANGES = [
  'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200E,U+2010-2011,U+FB50-FDFF,U+FE70-FEFC',
  'U+0000-05FF,U+2000-200B,U+200F-206F,U+20A0-20CF,U+2190-21FF',
];
const FONT_URLS = [regularArabic, boldArabic, regularLatin, boldLatin];
function fontCss() {
  return FONT_URLS.map((url, i) => `@font-face{font-family:"${FONT}";src:url("${new URL(url, document.baseURI).href}") format("woff2");font-weight:${i % 2 ? 700 : 400};font-style:normal;unicode-range:${FONT_RANGES[i < 2 ? 0 : 1]};}`).join('\n');
}
async function ensureReportFont() {
  if (!fontLoad) fontLoad = (async () => {
    const fonts = FONT_URLS.map((url, i) => new FontFace(FONT, `url("${url}")`, {
      weight: i % 2 ? '700' : '400',
      // Arabic face includes punctuation; Latin face includes numerals and Latin names.
      unicodeRange: FONT_RANGES[i < 2 ? 0 : 1],
    }));
    const loaded = await Promise.all(fonts.map((font) => font.load()));
    loaded.forEach((font) => document.fonts.add(font));
    await document.fonts.load(`400 17px "${FONT}"`, 'تقرير التقدم 0123456789');
    await document.fonts.load(`700 17px "${FONT}"`, 'نَسْج');
  })().catch((error: unknown) => { fontLoad = undefined; throw error; });
  await fontLoad;
}

/** Own DOM, textContent only: user-supplied labels cannot inject HTML or remote resources. */
export function reportPdfBlocks(report: AnalyticsReport): HTMLElement[] {
  const blocks: HTMLElement[] = [];
  const block = (text: string, kind: 'title' | 'heading' | 'note' | 'text' = 'text') => {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `padding:10px 12px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.95;color:#202d3d;background:#fff;font-family:"${FONT}",sans-serif;font-size:17px;box-sizing:border-box;`;
    if (kind === 'title') el.style.cssText += 'font-size:27px;font-weight:700;color:#7d3444;border-bottom:3px solid #7d3444;';
    if (kind === 'heading') {
      el.style.cssText += 'font-size:20px;font-weight:700;background:#f1eee8;border-top:1px solid #d4cec5;';
      el.dataset.keepWithNext = 'true';
    }
    if (kind === 'note') el.style.cssText += 'font-size:14px;color:#52606d;';
    blocks.push(el);
    return el;
  };
  const row = (values: (string | number | null)[], header = false) => {
    const el = block('');
    el.style.display = 'grid';
    el.style.gridTemplateColumns = `repeat(${Math.max(1, values.length)}, minmax(0, 1fr))`;
    el.style.gap = '12px';
    el.style.borderBottom = '1px solid #e1ddd6';
    if (header) {
      el.style.cssText += 'font-weight:700;background:#e9edf0;';
      el.dataset.keepWithNext = 'true';
    }
    values.forEach((value) => {
      const cell = document.createElement('div');
      cell.textContent = reportCellText(value);
      cell.style.unicodeBidi = 'plaintext';
      el.append(cell);
    });
    return el;
  };
  block(report.title, 'title');
  report.metadata.forEach((m) => block(`${m.label}: ${m.value}`));
  report.notices.forEach((n) => block(n, 'note'));
  for (const s of report.sections) {
    block(s.title, 'heading');
    block(s.scope, 'note').dataset.keepWithNext = 'true';
    if (!s.rows.length) { block(s.emptyMessage); continue; }
    row(s.columns, true);
    for (const values of s.rows) {
      const el = row(values);
      // Repeat context when a table continues onto a new PDF page.
      el.dataset.tableTitle = s.title;
      el.dataset.tableHeader = s.columns.join(' · ');
    }
  }
  block('تعريفات المؤشرات', 'heading');
  report.definitions.forEach((d) => { block(d.label, 'heading'); block(d.value); });
  return blocks;
}

/** Layout rows once, then rasterize whole pages instead of cloning the app per row. */
function paginateBlocks(host: HTMLElement, blocks: HTMLElement[], maxHeight: number): HTMLElement[] {
  host.replaceChildren(...blocks);
  const heights = blocks.map((el) => el.getBoundingClientRect().height);
  const pages: HTMLElement[] = [];
  let used = 0;
  const newPage = () => {
    const page = document.createElement('div');
    page.style.cssText = 'width:760px;background:#fff;direction:rtl;';
    pages.push(page);
    used = 0;
    return page;
  };
  let page = newPage();
  for (let i = 0; i < blocks.length; i++) {
    const el = blocks[i];
    let needed = heights[i];
    // Keep headings, scope descriptions and column headings with their next content.
    for (let j = i; blocks[j].dataset.keepWithNext && j + 1 < blocks.length; j++) needed += heights[j + 1];
    if (used && used + Math.min(needed, maxHeight) > maxHeight) {
      page = newPage();
      if (el.dataset.tableTitle) {
        const context = document.createElement('div');
        context.style.cssText = el.style.cssText + 'display:block;font-size:14px;font-weight:700;background:#e9edf0;';
        context.textContent = `${el.dataset.tableTitle} (تابع) — ${el.dataset.tableHeader}`;
        host.append(context);
        // Leave very large rows on their own page rather than adding an unusable header.
        if (context.getBoundingClientRect().height + heights[i] <= maxHeight) {
          used = context.getBoundingClientRect().height;
          page.append(context);
        } else context.remove();
      }
    }
    page.append(el);
    used += heights[i];
  }
  return pages;
}

/**
 * Render browser-shaped Arabic with the bundled Kufi font into a real multipage PDF.
 * Rasterized text preserves RTL shaping across PDF viewers; the CSV remains machine-readable.
 * Everything stays in memory on the device. No upload, iframe, popup or print service.
 */
export async function downloadReportPdf(report: AnalyticsReport): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  await ensureReportFont(); // Fail explicitly rather than silently substituting a non-Kufi font.
  const host = document.createElement('div');
  host.dir = 'rtl';
  host.lang = 'ar';
  // On-screen geometry inside the renderer's cloned document avoids off-screen canvas clipping.
  host.style.cssText = 'position:absolute;left:0;top:0;width:760px;background:#fff;z-index:-2147483647;pointer-events:none;';
  host.setAttribute('aria-hidden', 'true');
  const blocks = reportPdfBlocks(report);
  document.body.append(host);
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    pdf.setProperties({ title: report.title, subject: 'NASJ progress report — Arabic / RTL', creator: 'NASJ' });
    const margin = 14, width = 182, bottom = 283, usable = bottom - margin;
    let y = margin;
    // A little rounding allowance prevents a nearly full page spilling to another page.
    const pages = paginateBlocks(host, blocks, Math.floor(usable * 760 / width) - 2);
    const css = fontCss();
    const render = async (el: HTMLElement) => {
      // Clone only one report page at a time, not the entire (possibly long) report.
      host.replaceChildren(el);
      return html2canvas(el, {
        scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: false,
        windowWidth: 1024, scrollX: 0, scrollY: 0,
        onclone: async (clonedDocument) => {
          // Programmatically added FontFaces do not propagate into cloned documents.
          const style = clonedDocument.createElement('style');
          style.textContent = css;
          clonedDocument.head.append(style);
          await clonedDocument.fonts.load(`400 17px "${FONT}"`, 'تقرير التقدم 0123456789');
          await clonedDocument.fonts.load(`700 17px "${FONT}"`, 'نَسْج');
        },
      });
    };
    const addCanvas = (canvas: HTMLCanvasElement) => {
      const mmPerPixel = width / canvas.width;
      const height = canvas.height * mmPerPixel;
      if (y > margin && y + Math.min(height, usable) > bottom) { pdf.addPage(); y = margin; }
      if (height <= usable) {
        pdf.addImage(canvas, 'PNG', margin, y, width, height);
        y += height;
      } else {
        // Extremely long user-entered cells: retain every pixel instead of truncating.
        let offset = 0;
        while (offset < canvas.height) {
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = Math.min(canvas.height - offset, Math.floor((bottom - y) / mmPerPixel));
          const ctx = slice.getContext('2d');
          if (!ctx || slice.height < 1) throw new Error('تعذر إنشاء صفحة التقرير.');
          ctx.drawImage(canvas, 0, offset, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          const sliceHeight = slice.height * mmPerPixel;
          pdf.addImage(slice, 'PNG', margin, y, width, sliceHeight);
          offset += slice.height; y += sliceHeight;
          slice.width = slice.height = 0;
          if (offset < canvas.height) { pdf.addPage(); y = margin; }
        }
      }
    };
    for (const page of pages) {
      if (y > margin) { pdf.addPage(); y = margin; }
      const canvas = await render(page);
      addCanvas(canvas);
      canvas.width = canvas.height = 0;
    }
    for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
      pdf.setPage(page);
      pdf.setFontSize(9);
      pdf.setTextColor(90);
      pdf.text(`${page} / ${pdf.getNumberOfPages()}`, 105, 291, { align: 'center' });
    }
    downloadBlob(pdf.output('blob'), 'nasj-progress.pdf');
  } finally { host.remove(); }
}
