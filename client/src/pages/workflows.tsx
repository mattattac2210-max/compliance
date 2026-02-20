import PageHeader from "@/components/page-header";
import { ProcessNavigation } from "@/components/process-navigation";
import { useLanguage } from "@/i18n/context";

export default function WorkflowsPage() {
  const { t } = useLanguage();
  return (
    <div className="relative z-[5] max-w-5xl mx-auto pt-10 pb-16 px-6 md:px-10">
      <PageHeader
        eyebrow={t.processNav.eyebrow}
        title={t.processNav.heading}
        titleAccent={t.processNav.headingAccent}
        subtitle={t.processNav.headingDesc}
      />
      <ProcessNavigation />
    </div>
  );
}
