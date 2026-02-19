import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ComplianceTerm } from "@shared/schema";

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
    tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    lastUpdated: form.lastUpdated,
    isActive: form.isActive,
  };
}

export default function AdminPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TermFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: terms = [], isLoading } = useQuery<ComplianceTerm[]>({
    queryKey: ["/api/terms?activeOnly=false"],
  });

  const createMutation = useMutation({
    mutationFn: (data: ReturnType<typeof formToPayload>) => apiRequest("POST", "/api/terms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      resetForm();
      setMessage({ type: "success", text: "Term created successfully." });
    },
    onError: (e: Error) => setMessage({ type: "error", text: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof formToPayload> }) =>
      apiRequest("PATCH", `/api/terms/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      resetForm();
      setMessage({ type: "success", text: "Term updated successfully." });
    },
    onError: (e: Error) => setMessage({ type: "error", text: e.message }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/terms/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
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
    <div className="min-h-screen bg-[#07101E] text-[#F1F5F9]">
      <header className="sticky top-0 z-[200] flex items-center justify-between px-14 py-4 bg-[rgba(7,16,30,0.95)] backdrop-blur-[14px] border-b border-[rgba(255,255,255,0.07)] max-md:px-5">
        <div className="font-heading font-black text-[20px] tracking-[2px] text-[#14B8A6]">
          DSCVR
          <span className="font-normal text-[10px] tracking-[3px] text-[#64748B] block mt-[2px] uppercase">
            Term Admin
          </span>
        </div>
        <a
          href="/"
          className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase text-[#14B8A6] py-[8px] px-[16px] rounded border border-[rgba(20,184,166,0.22)] bg-[rgba(13,148,136,0.06)] hover-elevate no-underline"
          data-testid="back-to-app"
        >
          {"\u2190"} Back to App
        </a>
      </header>

      <div className="max-w-[900px] mx-auto px-14 py-10 max-md:px-5">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-black text-[28px] tracking-[-0.5px]" data-testid="admin-title">
            Glossary <span className="text-[#14B8A6]">Admin</span>
          </h1>
          {!showForm && (
            <button
              data-testid="btn-add-term"
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setMessage(null); }}
              className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[10px] px-[18px] rounded-[8px] bg-[rgba(20,184,166,0.12)] border border-[rgba(20,184,166,0.25)] text-[#14B8A6] cursor-pointer hover-elevate"
            >
              + Add Term
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
            className="bg-[#0F2040] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-[24px] mb-8"
          >
            <h2 className="font-heading font-extrabold text-[16px] text-[#14B8A6] mb-5 tracking-[-0.1px]">
              {editingId ? "Edit Term" : "New Term"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Term *</label>
                <input
                  data-testid="input-term"
                  value={form.term}
                  onChange={(e) => updateField("term", e.target.value)}
                  required
                  className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)]"
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Plain-English Definition *</label>
                <textarea
                  data-testid="input-definition"
                  value={form.plainDefinition}
                  onChange={(e) => updateField("plainDefinition", e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)] resize-y"
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Why it Matters * (one per line)</label>
                <textarea
                  data-testid="input-why"
                  value={form.whyItMatters}
                  onChange={(e) => updateField("whyItMatters", e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)] resize-y"
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Typical Process Steps (one per line, optional)</label>
                <textarea
                  data-testid="input-steps"
                  value={form.typicalProcessSteps}
                  onChange={(e) => updateField("typicalProcessSteps", e.target.value)}
                  rows={4}
                  className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)] resize-y"
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">What to Store in DSCVR * (one per line)</label>
                <textarea
                  data-testid="input-store"
                  value={form.whatToStore}
                  onChange={(e) => updateField("whatToStore", e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)] resize-y"
                />
              </div>

              <div>
                <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Common Pitfalls (one per line, optional)</label>
                <textarea
                  data-testid="input-pitfalls"
                  value={form.commonPitfalls}
                  onChange={(e) => updateField("commonPitfalls", e.target.value)}
                  rows={2}
                  className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)] resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Tags * (comma-separated)</label>
                  <input
                    data-testid="input-tags"
                    value={form.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    required
                    placeholder="e.g. Documents, Legal, OSS"
                    className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)]"
                  />
                </div>
                <div>
                  <label className="block font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#64748B] mb-[6px]">Last Updated</label>
                  <input
                    data-testid="input-date"
                    type="date"
                    value={form.lastUpdated}
                    onChange={(e) => updateField("lastUpdated", e.target.value)}
                    className="w-full bg-[#07101E] border border-[rgba(255,255,255,0.07)] rounded-[6px] py-[9px] px-[12px] text-[13px] text-[#F1F5F9] outline-none focus:border-[rgba(20,184,166,0.35)]"
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
                    className="accent-[#14B8A6]"
                  />
                  <span className="text-[12px] text-[#94A3B8]">Active (visible in glossary)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                data-testid="btn-save-term"
                disabled={isPending}
                className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[10px] px-[20px] rounded-[8px] bg-[#14B8A6] text-[#07101E] cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Saving..." : editingId ? "Update Term" : "Create Term"}
              </button>
              <button
                type="button"
                data-testid="btn-cancel"
                onClick={resetForm}
                className="font-heading text-[11px] font-bold tracking-[1.5px] uppercase py-[10px] px-[20px] rounded-[8px] border border-[rgba(255,255,255,0.1)] text-[#64748B] cursor-pointer hover:text-[#94A3B8]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-[13px] text-[#64748B] py-8 text-center">Loading terms...</div>
        ) : (
          <div className="space-y-[4px]">
            {terms.map(t => (
              <div
                key={t.id}
                data-testid={`admin-term-${t.slug}`}
                className={`flex items-center justify-between gap-4 p-[14px_18px] rounded-[8px] border ${
                  t.isActive
                    ? "bg-[#0F2040] border-[rgba(255,255,255,0.07)]"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.04)] opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <div className="font-heading font-extrabold text-[14px] text-[#F1F5F9] tracking-[-0.1px] truncate">
                    {t.term}
                    {!t.isActive && <span className="ml-2 text-[10px] text-[#EF4444] font-normal">(inactive)</span>}
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate mt-[2px]">{t.plainDefinition}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    data-testid={`btn-edit-${t.slug}`}
                    onClick={() => startEdit(t)}
                    className="text-[10px] font-bold py-[5px] px-[12px] rounded bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.15)] text-[#14B8A6] cursor-pointer hover-elevate"
                  >
                    Edit
                  </button>
                  <button
                    data-testid={`btn-toggle-${t.slug}`}
                    onClick={() => toggleActiveMutation.mutate({ id: t.id, isActive: !t.isActive })}
                    className={`text-[10px] font-bold py-[5px] px-[12px] rounded border cursor-pointer ${
                      t.isActive
                        ? "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.15)] text-[#FCA5A5]"
                        : "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#86EFAC]"
                    }`}
                  >
                    {t.isActive ? "Deactivate" : "Activate"}
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
