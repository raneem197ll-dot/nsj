import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, FileSpreadsheet, FileDown, ShieldAlert, AlertTriangle, RotateCcw, X } from 'lucide-react';
import type { AnalyticsReport } from '@/lib/analytics-report';
import { reportCellText } from '@/lib/analytics-report';
import { downloadReportCsv, downloadReportPdf } from '@/lib/analytics-report-export';

type Kind = 'csv' | 'pdf';

export function AnalyticsReportPreview({ createReport }: { createReport: () => AnalyticsReport }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [busy, setBusy] = useState<Kind | null>(null);
  const [error, setError] = useState<{ kind: Kind; msg: string } | null>(null);
  const [done, setDone] = useState<Kind | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const capture = () => {
    setError(null); setDone(null); setCaptureError(null);
    try { setReport(createReport()); } catch (e) { setReport(null); setCaptureError(e instanceof Error ? e.message : 'تعذّر إعداد التقرير.'); }
    setOpen(true);
  };

  const run = async (kind: Kind) => {
    if (!report || busy) return;
    const snap = report;
    setBusy(kind); setError(null); setDone(null);
    try {
      if (kind === 'csv') downloadReportCsv(snap); else await downloadReportPdf(snap);
      setDone(kind);
    } catch (e) {
      setError({ kind, msg: e instanceof Error && e.message ? e.message : 'حدث خطأ غير متوقع أثناء التصدير.' });
    } finally { setBusy(null); }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => { if (!busy) setOpen(o); }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={capture} data-testid="button-open-report-preview">
        <FileText className="h-4 w-4" aria-hidden /> معاينة وتصدير التقرير
      </button>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[hsl(217_31%_10%/.55)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content dir="rtl" data-testid="dialog-report-preview"
          className="panel fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-b-none font-arabic sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-b-[1.1rem] data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <header className="flex items-start justify-between gap-4 border-b p-5">
            <div className="min-w-0">
              <p className="eyebrow">معاينة قبل التنزيل · لقطة ثابتة</p>
              <DialogPrimitive.Title className="font-display text-xl font-semibold md:text-2xl" data-testid="text-report-title">{report?.title ?? 'تقرير التحليلات'}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">هذا بالضبط ما سيحتويه الملف. التقرير التُقط لحظة فتح المعاينة ولا يتغير إذا تغيّرت الفلاتر؛ أغلق وأعد الفتح لالتقاط نسخة أحدث.</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="btn btn-ghost btn-sm shrink-0" disabled={!!busy} data-testid="button-close-report-preview" aria-label="إغلاق المعاينة">
              <X className="h-4 w-4" aria-hidden /> إغلاق
            </DialogPrimitive.Close>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {captureError || !report ? (
              <div role="alert" className="rounded-xl border border-[hsl(var(--destructive)/.4)] bg-[hsl(var(--destructive)/.06)] p-4 text-sm">
                <p className="font-semibold">تعذّر إعداد التقرير</p>
                <p className="mt-1 text-xs text-muted-foreground">{captureError ?? 'لا توجد بيانات.'}</p>
                <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={capture} data-testid="button-retry-capture"><RotateCcw className="h-4 w-4" aria-hidden /> إعادة المحاولة</button>
              </div>
            ) : (<>
              <div className="flex gap-3 rounded-xl border border-dashed border-[hsl(var(--input))] bg-[hsl(var(--secondary)/.5)] p-4 text-xs leading-6" data-testid="text-report-privacy">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--madder))]" aria-hidden />
                <div>
                  <p className="font-semibold text-foreground">قبل أن تشارك الملف</p>
                  <p className="text-muted-foreground">البيانات تجريبية ومحسوبة محليًا على جهازك. التنزيل لا يرسل شيئًا ولا ينشر شيئًا؛ أنت من يقرر مع من تشاركه. الملف قد يحتوي اسمك ومهاراتك ودرجاتك، فراجعه قبل إرساله لمرشد أو جهة توظيف.</p>
                  <p className="mt-1 text-muted-foreground">ملف CSV بيانات خام بترميز UTF-8: بلا خطوط ولا تنسيق من اليمين لليسار. ملف PDF يحفظ التنسيق العربي والخط الكوفي كصور واضحة؛ النص فيه غير قابل للتحديد، وللبيانات القابلة للبحث والنسخ استخدم CSV.</p>
                </div>
              </div>

              <section aria-labelledby="rp-meta">
                <h3 id="rp-meta" className="eyebrow mb-2">بيانات التقرير</h3>
                {report.metadata.length ? (
                  <dl className="grid gap-x-6 gap-y-2 rounded-xl border p-4 text-sm sm:grid-cols-2">
                    {report.metadata.map((m, i) => <div key={i} className="flex justify-between gap-3 border-b border-dashed pb-1.5 last:border-0" data-testid={`text-report-meta-${i}`}><dt className="text-muted-foreground">{m.label}</dt><dd className="text-end font-semibold">{m.value || 'غير متاح'}</dd></div>)}
                  </dl>
                ) : <p className="text-xs text-muted-foreground">لا توجد بيانات وصفية.</p>}
              </section>

              {report.notices.length > 0 && (
                <section aria-labelledby="rp-notes">
                  <h3 id="rp-notes" className="eyebrow mb-2">ملاحظات منهجية</h3>
                  <ul className="space-y-1.5 text-xs leading-6">
                    {report.notices.map((n, i) => <li key={i} className="flex gap-2" data-testid={`text-report-notice-${i}`}><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--madder))]" aria-hidden />{n}</li>)}
                  </ul>
                </section>
              )}

              {report.sections.map((s, si) => (
                <section key={si} aria-labelledby={`rp-s-${si}`} className="rounded-xl border" data-testid={`section-report-${si}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b bg-[hsl(var(--secondary)/.4)] px-4 py-3">
                    <h3 id={`rp-s-${si}`} className="font-display text-base font-semibold">{s.title}</h3>
                    <span className="text-[11px] text-muted-foreground">{s.scope} · {s.rows.length} صف</span>
                  </div>
                  {s.rows.length ? (
                    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`جدول ${s.title}`}>
                      <table className="w-full min-w-[28rem] text-right text-xs" data-testid={`table-report-${si}`}>
                        <caption className="sr-only">{s.title}</caption>
                        <thead><tr>{s.columns.map((c, ci) => <th key={ci} scope="col" className="whitespace-nowrap border-b px-4 py-2 font-semibold text-muted-foreground">{c}</th>)}</tr></thead>
                        <tbody>{s.rows.map((r, ri) => (
                          <tr key={ri} className="odd:bg-[hsl(var(--secondary)/.25)]">{r.map((v, ci) => <td key={ci} className={`px-4 py-2 ${v === null ? 'text-muted-foreground italic' : ''} ${typeof v === 'number' ? 'tabular-nums' : ''}`}>{reportCellText(v)}</td>)}</tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ) : <p className="weave-bg px-4 py-6 text-center text-xs text-muted-foreground" data-testid={`text-report-empty-${si}`}>{s.emptyMessage}</p>}
                </section>
              ))}
              {!report.sections.length && <p className="text-xs text-muted-foreground">لا توجد أقسام في هذا التقرير.</p>}

              {report.definitions.length > 0 && (
                <section aria-labelledby="rp-defs">
                  <h3 id="rp-defs" className="eyebrow mb-2">تعريفات المؤشرات</h3>
                  <dl className="grid gap-3 text-sm md:grid-cols-2">{report.definitions.map((d, i) => <div key={i}><dt className="font-semibold">{d.label}</dt><dd className="text-xs leading-6 text-muted-foreground">{d.value}</dd></div>)}</dl>
                </section>
              )}
            </>)}
          </div>

          <footer className="space-y-3 border-t bg-[hsl(var(--card))] p-4">
            {error && (
              <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-[hsl(var(--destructive)/.4)] bg-[hsl(var(--destructive)/.06)] p-3 text-xs" data-testid="text-export-error">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[hsl(var(--destructive))]" aria-hidden />
                <span className="flex-1">فشل تنزيل {error.kind === 'csv' ? 'CSV' : 'PDF'}: {error.msg}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => run(error.kind)} disabled={!!busy} data-testid="button-retry-export"><RotateCcw className="h-4 w-4" aria-hidden /> إعادة المحاولة</button>
              </div>
            )}
            <p className="sr-only" aria-live="polite">{busy ? 'جارٍ تجهيز الملف' : done ? `اكتمل تنزيل ${done === 'csv' ? 'CSV' : 'PDF'}` : ''}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-foreground" data-testid="text-export-status">{busy ? 'جارٍ تجهيز الملف...' : done ? `تم تنزيل ${done === 'csv' ? 'CSV' : 'PDF'} على جهازك.` : 'التنزيل محلي فقط.'}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={() => run('csv')} disabled={!report || !!busy} aria-busy={busy === 'csv'} data-testid="button-download-csv">
                  <FileSpreadsheet className="h-4 w-4" aria-hidden /> {busy === 'csv' ? 'جارٍ التنزيل...' : 'تنزيل CSV'}
                </button>
                <button type="button" className="btn btn-primary flex-1 sm:flex-none" onClick={() => run('pdf')} disabled={!report || !!busy} aria-busy={busy === 'pdf'} data-testid="button-download-pdf">
                  <FileDown className="h-4 w-4" aria-hidden /> {busy === 'pdf' ? 'جارٍ التنزيل...' : 'تنزيل PDF'}
                </button>
              </div>
            </div>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
