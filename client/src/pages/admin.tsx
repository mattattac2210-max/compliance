import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ComplianceTerm } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-provider";
import { useLanguage, LanguageSelector } from "@/i18n/context";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface TermFormData {
  term: string;
  plainDefinition: string;
  whyItMatters: string;
  typicalProcessSteps: string;
  whatToStore: string;
  commonPitfalls: string;
  synonyms: string;
  tags: string;
  lastUpdated: string;
  isActive: boolean;
}

const emptyForm: TermFormData = {
  term: "",
  plainDefinition: "",
  whyItMatters: "",
  typicalProcessSteps: "",
  whatToStore: "",
  commonPitfalls: "",
  synonyms: "",
  tags: "",
  lastUpdated: new Date().toISOString().split("T")[0],
  isActive: true,
};

function termToForm(t: ComplianceTerm): TermFormData {
  return {
    term: t.term,
    plainDefinition: t.plainDefinition,
    whyItMatters: (t.whyItMatters as string[]).join("\n"),
    typicalProcessSteps: t.typicalProcessSteps ? (t.typicalProcessSteps as string[]).join("\n") : "",
    whatToStore: (t.whatToStore as string[]).join("\n"),
    commonPitfalls: t.commonPitfalls ? (t.commonPitfalls as string[]).join("\n") : "",
    synonyms: t.synonyms ? (t.synonyms as string[]).join(", ") : "",
    tags: (t.tags as string[]).join(", "),
    lastUpdated: t.lastUpdated,
    isActive: t.isActive,
  };
}

function formToPayload(form: TermFormData) {
  const splitLines = (s: string) => s.split("\n").map(l => l.trim()).filter(Boolean);
  return {
    term: form.term.trim(),
    slug: slugify(form.term),
    plainDefinition: form.plainDefinition.trim(),
    whyItMatters: splitLines(form.whyItMatters),
    typicalProcessSteps: form.typicalProcessSteps.trim() ? splitLines(form.typicalProcessSteps) : null,
    whatToStore: splitLines(form.whatToStore),
    commonPitfalls: form.commonPitfalls.trim() ? splitLines(form.commonPitfalls) : null,
    synonyms: form.synonyms.trim() ? form.synonyms.split(",").map(s => s.trim()).filter(Boolean) : null,
    tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    lastUpdated: form.lastUpdated,
    isActive: form.isActive,
  };
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TermFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: terms = [], isLoading } = useQuery<ComplianceTerm[]>({
    queryKey: ["/api/terms?activeOnly=false"],
  });

  const invalidateTerms = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
    queryClient.invalidateQueries({ queryKey: ["/api/terms?activeOnly=false"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: ReturnType<typeof formToPayload>) => apiRequest("POST", "/api/terms", data),
    onSuccess: () => {
      invalidateTerms();
      resetForm();
      setMessage({ type: "success", text: "Term created successfully." });
    },
    onError: (e: Error) => setMessage({ type: "error", text: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof formToPayload> }) =>
      apiRequest("PATCH", `/api/terms/${id}`, data),
    onSuccess: () => {
      invalidateTerms();
      resetForm();
      setMessage({ type: "success", text: "Term updated successfully." });
    },
    onError: (e: Error) => setMessage({ type: "error", text: e.message }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/terms/${id}`, { isActive }),
    onSuccess: () => {
      invalidateTerms();
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (t: ComplianceTerm) => {
    setForm(termToForm(t));
    setEditingId(t.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = formToPayload(form);
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const updateField = (field: keyof TermFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--txt)" }}>
      <header
        className="sticky top-0 z-[200] flex items-center justify-between px-14 py-4 backdrop-blur-[14px] border-b max-md:px-5"
        style={{ background: "var(--bg2)", borderColor: "var(--b)" }}
      >
        <div className="font-heading font-black text-[20px] tracking-[2px]" style={{ color: "var(--accent)" }}>
          DSCVR
          <span className="font-normal text-[10px] tracking-[3px] block mt-[2px] uppercase" style={{ color: "var(--t3)" }}>
            {t.admin.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          <a
            href="/app"
            className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[8px] px-[16px] rounded hover-elevate no-underline"
            style={{ color: "var(--accent)", border: "1px solid var(--accent-tint2)", background: "var(--accent-tint)" }}
            data-testid="back-to-app"
          >
            {t.admin.backToApp}
          </a>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-14 py-10 max-md:px-5">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-black text-[28px] tracking-[-0.5px]" data-testid="admin-title">
            Glossary <span style={{ color: "var(--accent)" }}>{t.admin.title}</span>
          </h1>
          {!showForm && (
            <button
              data-testid="btn-add-term"
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setMessage(null); }}
              className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[10px] px-[18px] rounded-[8px] cursor-pointer hover-elevate"
              style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)", color: "var(--accent)" }}
            >
              {t.admin.addTerm}
            </button>
          )}
        </div>

        {message && (
          <div
            data-testid="admin-message"
            className={`mb-6 p-[12px_16px] rounded-[8px] text-[13px] font-light border ${
              message.type === "success"
                ? "bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.2)] text-[#86EFAC]"
                : "bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)] text-[#FCA5A5]"
            }`}
          >
            {message.text}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            data-testid="term-form"
            className="border rounded-[10px] p-[24px] mb-8"
            style={{ background: "var(--surface)", borderColor: "var(--b)" }}
          >
            <h2 className="font-heading font-extrabold text-[16px] mb-5 tracking-[-0.1px]" style={{ color: "var(--accent)" }}>
              {editingId ? t.admin.editTerm : t.admin.createTerm}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.termLabel} *</label>
                <input
                  data-testid="input-term"
                  value={form.term}
                  onChange={(e) => updateField("term", e.target.value)}
                  required
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.plainDefLabel} *</label>
                <textarea
                  data-testid="input-definition"
                  value={form.plainDefinition}
                  onChange={(e) => updateField("plainDefinition", e.target.value)}
                  required
                  rows={3}
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none resize-y"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.whyItMattersLabel} *</label>
                <textarea
                  data-testid="input-why"
                  value={form.whyItMatters}
                  onChange={(e) => updateField("whyItMatters", e.target.value)}
                  required
                  rows={3}
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none resize-y"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.processStepsLabel}</label>
                <textarea
                  data-testid="input-steps"
                  value={form.typicalProcessSteps}
                  onChange={(e) => updateField("typicalProcessSteps", e.target.value)}
                  rows={4}
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none resize-y"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.whatToStoreLabel} *</label>
                <textarea
                  data-testid="input-store"
                  value={form.whatToStore}
                  onChange={(e) => updateField("whatToStore", e.target.value)}
                  required
                  rows={2}
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none resize-y"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.commonPitfallsLabel}</label>
                <textarea
                  data-testid="input-pitfalls"
                  value={form.commonPitfalls}
                  onChange={(e) => updateField("commonPitfalls", e.target.value)}
                  rows={2}
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none resize-y"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.synonymsLabel}</label>
                <input
                  data-testid="input-synonyms"
                  value={form.synonyms}
                  onChange={(e) => updateField("synonyms", e.target.value)}
                  placeholder="e.g. physical signature, ink signature"
                  className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none"
                  style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                />
                <div className="text-[10px] mt-[4px]" style={{ color: "var(--t4)" }}>Alternative names that will auto-link to this term in Process Navigation guides</div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>{t.admin.tagsLabel}</label>
                  <input
                    data-testid="input-tags"
                    value={form.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    required
                    placeholder="e.g. Documents, Legal, OSS"
                    className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none"
                    style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                  />
                </div>
                <div>
                  <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[6px]" style={{ color: "var(--t3)" }}>Last Updated</label>
                  <input
                    data-testid="input-date"
                    type="date"
                    value={form.lastUpdated}
                    onChange={(e) => updateField("lastUpdated", e.target.value)}
                    className="w-full border rounded-[6px] py-[9px] px-[12px] text-[13px] outline-none"
                    style={{ background: "var(--surface2)", borderColor: "var(--b)", color: "var(--txt)" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="input-active"
                    checked={form.isActive}
                    onChange={(e) => updateField("isActive", e.target.checked)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="text-[12px]" style={{ color: "var(--t2)" }}>{t.admin.activeLabel}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                data-testid="btn-save-term"
                disabled={isPending}
                className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[10px] px-[20px] rounded-[8px] cursor-pointer disabled:opacity-50"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                {isPending ? `${t.admin.saveLabel}...` : editingId ? t.admin.editTerm : t.admin.createTerm}
              </button>
              <button
                type="button"
                data-testid="btn-cancel"
                onClick={resetForm}
                className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[10px] px-[20px] rounded-[8px] border cursor-pointer"
                style={{ borderColor: "var(--b)", color: "var(--t3)" }}
              >
                {t.admin.cancelLabel}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-[13px] py-8 text-center" style={{ color: "var(--t3)" }}>Loading terms...</div>
        ) : (
          <div className="space-y-[4px]">
            {terms.map(term => (
              <div
                key={term.id}
                data-testid={`admin-term-${term.slug}`}
                className={`flex items-center justify-between gap-4 p-[14px_18px] rounded-[8px] border ${
                  !term.isActive ? "opacity-60" : ""
                }`}
                style={
                  term.isActive
                    ? { background: "var(--surface)", borderColor: "var(--b)" }
                    : { background: "var(--bg2)", borderColor: "var(--b)" }
                }
              >
                <div className="min-w-0">
                  <div className="font-heading font-extrabold text-[14px] tracking-[-0.1px] truncate" style={{ color: "var(--txt)" }}>
                    {term.term}
                    {!term.isActive && <span className="ml-2 text-[10px] text-[#EF4444] font-normal">{t.admin.inactiveStatus}</span>}
                  </div>
                  <div className="text-[11px] truncate mt-[2px]" style={{ color: "var(--t3)" }}>{term.plainDefinition}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    data-testid={`btn-edit-${term.slug}`}
                    onClick={() => startEdit(term)}
                    className="text-[10px] font-bold py-[5px] px-[12px] rounded cursor-pointer hover-elevate"
                    style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)", color: "var(--accent)" }}
                  >
                    Edit
                  </button>
                  <button
                    data-testid={`btn-toggle-${term.slug}`}
                    onClick={() => toggleActiveMutation.mutate({ id: term.id, isActive: !term.isActive })}
                    className={`text-[10px] font-bold py-[5px] px-[12px] rounded border cursor-pointer ${
                      term.isActive
                        ? "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.15)] text-[#FCA5A5]"
                        : "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#86EFAC]"
                    }`}
                  >
                    {term.isActive ? t.admin.inactiveStatus : t.admin.activeStatus}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
