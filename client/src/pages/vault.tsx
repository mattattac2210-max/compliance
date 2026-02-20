import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { Property, VaultDocumentTemplate, VaultDocument } from "@shared/schema";
import { GlossaryAwareText, useGlossaryTerms } from "@/components/glossary-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GATE_COLORS = ["#94A3B8", "#14B8A6", "#60A5FA", "#A78BFA", "#F59E0B", "#22C55E", "#FCA5A5", "#14B8A6"];
const GATE_ABBRS = ["PT", "ZONE", "NIB", "SLF", "TAX", "STAFF", "SAFE", "OTA"];

const STATUS_DOT: Record<string, { color: string; pulse?: boolean; icon?: boolean }> = {
  missing: { color: "#EF4444" },
  uploaded: { color: "#22C55E" },
  expiring: { color: "#F59E0B", pulse: true },
  expired: { color: "#EF4444", icon: true },
};

function getTemplateName(tmpl: VaultDocumentTemplate, lang: string): string {
  const tr = tmpl.translations as Record<string, { name: string; description: string }>;
  return tr?.[lang]?.name || tr?.en?.name || "";
}

function getTemplateDesc(tmpl: VaultDocumentTemplate, lang: string): string {
  const tr = tmpl.translations as Record<string, { name: string; description: string }>;
  return tr?.[lang]?.description || tr?.en?.description || "";
}

export default function VaultPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [openGates, setOpenGates] = useState<Set<number>>(new Set());
  const terms = useGlossaryTerms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "missing", expiryDate: "", notes: "" });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: templates = [] } = useQuery<VaultDocumentTemplate[]>({
    queryKey: ["/api/vault/templates"],
  });

  const { data: vaultDocs = [] } = useQuery<VaultDocument[]>({
    queryKey: ["/api/vault", selectedPropertyId],
    queryFn: () => fetch(`/api/vault?propertyId=${selectedPropertyId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPropertyId,
  });

  const { data: summary } = useQuery<{ total: number; uploaded: number; missing: number; expiring: number; expired: number; completionPct: number; gateCompletions: { gateNumber: number; pct: number }[] }>({
    queryKey: ["/api/vault/summary", selectedPropertyId],
    queryFn: () => fetch(`/api/vault/summary?propertyId=${selectedPropertyId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPropertyId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await apiRequest("POST", "/api/vault", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault", selectedPropertyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/vault/summary", selectedPropertyId] });
      setEditingId(null);
    },
  });

  useMemo(() => {
    if (properties.length === 1 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties]);

  const docMap = useMemo(() => {
    const m = new Map<string, VaultDocument>();
    for (const d of vaultDocs) m.set(d.templateId, d);
    return m;
  }, [vaultDocs]);

  const gateGroups = useMemo(() => {
    const groups = new Map<number, VaultDocumentTemplate[]>();
    for (const tmpl of templates) {
      const arr = groups.get(tmpl.gateNumber) || [];
      arr.push(tmpl);
      groups.set(tmpl.gateNumber, arr);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [templates]);

  const toggleGate = (g: number) => {
    setOpenGates(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const getDocStatus = (tmpl: VaultDocumentTemplate): string => {
    const doc = docMap.get(tmpl.id);
    if (!doc) return "missing";
    let status = doc.status;
    if (doc.expiryDate) {
      const exp = new Date(doc.expiryDate);
      const today = new Date();
      const ninety = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      if (exp < today) status = "expired";
      else if (exp < ninety) status = "expiring";
    }
    return status;
  };

  const startEdit = (tmplId: string) => {
    const doc = docMap.get(tmplId);
    setEditingId(tmplId);
    setEditForm({
      status: doc?.status || "missing",
      expiryDate: doc?.expiryDate || "",
      notes: doc?.notes || "",
    });
  };

  const handleSave = (tmplId: string) => {
    upsertMutation.mutate({
      propertyId: selectedPropertyId,
      templateId: tmplId,
      status: editForm.status,
      expiryDate: editForm.expiryDate || null,
      notes: editForm.notes || null,
    });
  };

  const gatePct = (gateNum: number): number => {
    const gc = summary?.gateCompletions?.find(g => g.gateNumber === gateNum);
    return gc?.pct ?? 0;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--app-bg)" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-vault-heading">{t.vault.heading}</h1>
            <p className="text-slate-400 text-sm mt-1">{t.vault.subheading}</p>
          </div>
          <Link to="/app" className="text-[#14B8A6] hover:text-[#5EEAD4] text-sm transition-colors" data-testid="link-vault-back">
            {t.vault.backToApp}
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-heading">{t.vault.noPropertySelected}</p>
            <Link to="/profile" className="text-[#14B8A6] hover:text-[#5EEAD4] text-sm mt-2 inline-block" data-testid="link-add-property-prompt">
              {t.profile.addProperty}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 flex-wrap">
              {properties.length > 1 && (
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger className="w-64 bg-[#162036] border-[#14B8A6]/20 text-white" data-testid="select-vault-property">
                    <SelectValue placeholder={t.vault.selectPropertyPrompt} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
                    {properties.map(p => <SelectItem key={p.id} value={p.id} className="text-white hover:bg-[#14B8A6]/10">{p.propertyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {selectedPropertyId && summary && (
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14B8A6" strokeWidth="3" strokeDasharray={`${summary.completionPct}, 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-heading font-bold text-[#14B8A6]" data-testid="text-completion-pct">{summary.completionPct}%</span>
                  </div>
                  <span className="text-slate-400 text-xs">{t.vault.completionLabel}</span>
                </div>
              )}
            </div>

            {!selectedPropertyId && (
              <div className="text-center py-12">
                <p className="text-slate-400">{t.vault.noPropertySelected}</p>
              </div>
            )}

            {selectedPropertyId && gateGroups.map(([gateNum, tmpls]) => (
              <div key={gateNum} className="rounded-lg border overflow-hidden" style={{ borderColor: `${GATE_COLORS[gateNum]}22`, background: "rgba(15,26,46,0.8)" }}>
                <button
                  onClick={() => toggleGate(gateNum)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                  data-testid={`button-gate-toggle-${gateNum}`}
                >
                  <span className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-heading font-bold" style={{ background: `${GATE_COLORS[gateNum]}15`, color: GATE_COLORS[gateNum], border: `1px solid ${GATE_COLORS[gateNum]}33` }}>
                    {gateNum === 0 ? "PT" : gateNum}
                  </span>
                  <span className="text-white font-heading text-sm flex-1 text-left">
                    {t.vault.gateLabel} {gateNum} — {GATE_ABBRS[gateNum]}
                  </span>
                  <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${GATE_COLORS[gateNum]}15`, color: GATE_COLORS[gateNum] }} data-testid={`text-gate-pct-${gateNum}`}>
                    {gatePct(gateNum)}%
                  </span>
                  {openGates.has(gateNum) ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                </button>

                <AnimatePresence>
                  {openGates.has(gateNum) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="border-t" style={{ borderColor: `${GATE_COLORS[gateNum]}15` }}>
                        {tmpls.map(tmpl => {
                          const status = getDocStatus(tmpl);
                          const dot = STATUS_DOT[status] || STATUS_DOT.missing;
                          const doc = docMap.get(tmpl.id);
                          const isEditing = editingId === tmpl.id;

                          return (
                            <div key={tmpl.id} className="border-b last:border-b-0 px-5 py-3" style={{ borderColor: "rgba(255,255,255,0.04)" }} data-testid={`row-doc-${tmpl.documentSlug}`}>
                              <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot.pulse ? "animate-pulse" : ""}`} style={{ background: dot.color }} />
                                {dot.icon && <AlertTriangle className="h-3.5 w-3.5 text-[#EF4444] shrink-0 -ml-2" />}
                                <span className="text-sm text-slate-200 flex-1">
                                  <GlossaryAwareText text={getTemplateName(tmpl, language)} terms={terms} />
                                </span>
                                <span className="text-[9px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-full" style={{
                                  background: tmpl.isRequired ? "rgba(239,68,68,0.08)" : "rgba(148,163,184,0.08)",
                                  color: tmpl.isRequired ? "#FCA5A5" : "#94A3B8",
                                  border: `1px solid ${tmpl.isRequired ? "rgba(239,68,68,0.15)" : "rgba(148,163,184,0.15)"}`,
                                }}>
                                  {tmpl.isRequired ? t.vault.requiredLabel : t.vault.optionalLabel}
                                </span>
                                {doc?.expiryDate && (
                                  <span className="text-[10px] text-slate-500">{t.vault.expiryLabel}: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => isEditing ? setEditingId(null) : startEdit(tmpl.id)}
                                  className="text-slate-400 hover:text-[#14B8A6] text-xs"
                                  data-testid={`button-edit-doc-${tmpl.documentSlug}`}
                                >
                                  {t.vault.editButton}
                                </Button>
                              </div>

                              <AnimatePresence>
                                {isEditing && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 ml-6 space-y-3">
                                    <p className="text-xs text-slate-500"><GlossaryAwareText text={getTemplateDesc(tmpl, language)} terms={terms} /></p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div className="space-y-1">
                                        <Label className="text-slate-400 text-xs">{t.timeline.statusLabel}</Label>
                                        <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                                          <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white text-xs h-8" data-testid={`select-status-${tmpl.documentSlug}`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
                                            <SelectItem value="missing" className="text-white text-xs">{t.vault.statusMissing}</SelectItem>
                                            <SelectItem value="uploaded" className="text-white text-xs">{t.vault.statusUploaded}</SelectItem>
                                            <SelectItem value="expiring" className="text-white text-xs">{t.vault.statusExpiring}</SelectItem>
                                            <SelectItem value="expired" className="text-white text-xs">{t.vault.statusExpired}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      {(tmpl.expiryMonths && tmpl.expiryMonths > 0) && (
                                        <div className="space-y-1">
                                          <Label className="text-slate-400 text-xs">{t.vault.expiryDateLabel}</Label>
                                          <Input type="date" value={editForm.expiryDate} onChange={e => setEditForm(f => ({ ...f, expiryDate: e.target.value }))}
                                            className="bg-[#162036] border-[#14B8A6]/20 text-white text-xs h-8"
                                            data-testid={`input-expiry-${tmpl.documentSlug}`}
                                          />
                                        </div>
                                      )}
                                      <div className="space-y-1 md:col-span-full">
                                        <Label className="text-slate-400 text-xs">{t.vault.notesLabel}</Label>
                                        <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                          placeholder={t.vault.notesPlaceholder}
                                          className="bg-[#162036] border-[#14B8A6]/20 text-white text-xs min-h-[60px]"
                                          data-testid={`input-notes-${tmpl.documentSlug}`}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleSave(tmpl.id)} disabled={upsertMutation.isPending}
                                        className="bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs"
                                        data-testid={`button-save-doc-${tmpl.documentSlug}`}
                                      >
                                        {t.vault.saveButton}
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                                        className="text-slate-400 text-xs"
                                        data-testid={`button-cancel-doc-${tmpl.documentSlug}`}
                                      >
                                        {t.vault.cancelButton}
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
