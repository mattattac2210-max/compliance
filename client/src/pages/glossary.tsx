import PageHeader from "@/components/page-header";
import GlossarySection from "@/components/glossary";
import { useLanguage } from "@/i18n/context";

export default function GlossaryPage() {
  const { t } = useLanguage();
  return (
    <div className="relative z-[5] max-w-5xl mx-auto pt-10 pb-16 px-6 md:px-10">
      <PageHeader
        eyebrow={t.glossary.eyebrow}
        title={t.glossary.heading}
        titleAccent={t.glossary.headingAccent}
      />
      <GlossarySection hideHeading />
    </div>
  );
}
