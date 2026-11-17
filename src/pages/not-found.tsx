import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useMeta } from '@/lib/store';
import { LogoMark } from '@/components/brand';

export default function NotFound() {
  useMeta('الصفحة غير موجودة', 'هذه الصفحة غير موجودة في نَسْج.');
  return (
    <section className="panel weave-bg relative overflow-hidden px-6 py-16 text-center sm:py-24" data-testid="empty-state">
      <LogoMark className="mx-auto h-14 w-14" />
      <p className="num mt-8 text-6xl font-medium text-[hsl(var(--lavender))] sm:text-7xl">404</p>
      <h1 className="mt-4 font-ar-head text-2xl sm:text-3xl">هذا الخيط لا يقود إلى أي مكان</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">الصفحة التي تبحث عنها غير موجودة في نسخة نَسْج التجريبية. ربما تغيّر الرابط أو كُتب بشكل مختلف.</p>
      <Link href="/" className="btn btn-primary mt-8">العودة إلى النظرة العامة <ArrowLeft className="h-4 w-4" /></Link>
    </section>
  );
}
