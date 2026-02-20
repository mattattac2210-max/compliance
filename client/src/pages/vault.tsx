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
import {
  ChevronDown, ChevronRight, FileText, AlertTriangle, CheckCircle2,
  Building2, MapPin, Search, Download, Shield, Lock, XCircle, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GATE_COLORS: Record<number, string> = { 0: "#94A3B8", 1: "#14B8A6", 2: "#60A5FA", 3: "#A78BFA", 4: "#F59E0B", 5: "#22C55E", 6: "#FCA5A5", 7: "#14B8A6" };
const GATE_ABBRS: Record<number, string> = { 0: "PT", 1: "ZONE", 2: "NIB", 3: "SLF", 4: "TAX", 5: "STAFF", 6: "SAFE", 7: "OTA" };

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

type DocFilter = "all" | "required" | "expiring" | "expired";

export default function VaultPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [openGates, setOpenGates] = useState<Set<number>>(new Set());
  const terms = useGlossaryTerms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "missing", expiryDate: "", notes: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [docFilter, setDocFilter] = useState<DocFilter>("all");
  const [hoveredGate, setHoveredGate] = useState<number | null>(null);

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: templates = [] } = useQuery<VaultDocumentTemplate[]>({
    queryKey: ["/api/vault/templates"],
  });

  const { data: vaultDocs = [] } = useQuery<VaultDocument[]>({
    queryKey: [`/api/vault?propertyId=${selectedPropertyId}`],
    enabled: !!selectedPropertyId,
  });

  const { data: summary } = useQuery<{ total: number; uploaded: number; missing: number; expiring: number; expired: number; completionPct: number; gateCompletions: { gateNumber: number; pct: number }[] }>({
    queryKey: [`/api/vault/summary?propertyId=${selectedPropertyId}`],
    enabled: !!selectedPropertyId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await apiRequest("POST", "/api/vault", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vault?propertyId=${selectedPropertyId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/vault/summary?propertyId=${selectedPropertyId}`] });
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

  const getGateStatusCounts = (gateNum: number) => {
    const tmpls = gateGroups.find(([g]) => g === gateNum)?.[1] || [];
    let uploaded = 0, missing = 0, expiring = 0, expired = 0;
    for (const tmpl of tmpls) {
      const s = getDocStatus(tmpl);
      if (s === "uploaded") uploaded++;
      else if (s === "expiring") expiring++;
      else if (s === "expired") expired++;
      else missing++;
    }
    return { uploaded, missing, expiring, expired, total: tmpls.length };
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const filteredDocs = useMemo(() => {
    if (!selectedPropertyId) return [];
    let allTemplates = templates;

    if (docFilter === "required") allTemplates = allTemplates.filter(t => t.isRequired);
    else if (docFilter === "expiring") allTemplates = allTemplates.filter(t => getDocStatus(t) === "expiring");
    else if (docFilter === "expired") allTemplates = allTemplates.filter(t => getDocStatus(t) === "expired");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      allTemplates = allTemplates.filter(t => getTemplateName(t, language).toLowerCase().includes(q));
    }

    return allTemplates;
  }, [templates, docFilter, searchQuery, language, selectedPropertyId, docMap]);

  const handleDownloadReport = async () => {
    if (!selectedPropertyId) return;
    try {
      const res = await fetch(`/api/vault/report?propertyId=${selectedPropertyId}`, { credentials: "include" });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "compliance_report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silently fail */ }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--app-bg)" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-vault-heading">{t.vault.heading}</h1>
          <span className="text-[9px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20" data-testid="badge-paid">
            {t.vault.paidBadge}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">{t.vault.subheading}</p>

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
            {/* Property Selector + Summary Card */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(20,184,166,0.15)", background: "rgba(15,26,46,0.8)" }}>
              <div className="p-5">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Property selector */}
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-slate-500 text-[10px] font-heading font-bold tracking-wider uppercase mb-1.5 block">{t.vault.propertyLabel}</Label>
                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                      <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white" data-testid="select-vault-property">
                        <SelectValue placeholder={t.vault.selectPropertyPrompt} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
                        {properties.map(p => <SelectItem key={p.id} value={p.id} className="text-white hover:bg-[#14B8A6]/10">{p.propertyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Details */}
                  {selectedProperty && (
                    <div className="flex gap-6 items-center flex-wrap">
                      {selectedProperty.entityName && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs text-slate-400">{t.vault.entityLabel}: <span className="text-slate-200">{selectedProperty.entityName}</span></span>
                        </div>
                      )}
                      {selectedProperty.regency && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs text-slate-400">{t.vault.locationLabel}: <span className="text-slate-200">{selectedProperty.regency}</span></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Overall Completion */}
                  {selectedPropertyId && summary && (
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14B8A6" strokeWidth="3" strokeDasharray={`${summary.completionPct}, 100`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-heading font-bold text-[#14B8A6]" data-testid="text-completion-pct">{summary.completionPct}%</span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <span className="text-slate-400 block">{t.vault.completionLabel}</span>
                        <div className="flex gap-2 text-[10px]">
                          <span className="text-[#22C55E]">{summary.uploaded} {t.vault.gateStatusUploaded}</span>
                          <span className="text-[#EF4444]">{summary.missing} {t.vault.gateStatusMissing}</span>
                          {summary.expiring > 0 && <span className="text-[#F59E0B]">{summary.expiring} {t.vault.gateStatusExpiring}</span>}
                          {summary.expired > 0 && <span className="text-[#EF4444]">{summary.expired} {t.vault.gateStatusExpired}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!selectedPropertyId && (
              <div className="text-center py-12">
                <p className="text-slate-400">{t.vault.noPropertySelected}</p>
              </div>
            )}

            {/* Gate Status Grid — hover to see status breakdown */}
            {selectedPropertyId && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" data-testid="grid-gate-status">
                {gateGroups.map(([gateNum]) => {
                  const pct = gatePct(gateNum);
                  const counts = getGateStatusCounts(gateNum);
                  const allDone = pct === 100;
                  const hasIssues = counts.expired > 0 || counts.expiring > 0;
                  const isHovered = hoveredGate === gateNum;

                  return (
                    <div
                      key={gateNum}
                      className="relative"
                      onMouseEnter={() => setHoveredGate(gateNum)}
                      onMouseLeave={() => setHoveredGate(null)}
                    >
                      <button
                        onClick={() => {
                          toggleGate(gateNum);
                          const el = document.getElementById(`gate-section-${gateNum}`);
                          if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
                        }}
                        className="w-full rounded-lg p-2.5 flex flex-col items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: `${GATE_COLORS[gateNum]}08`,
                          border: `1px solid ${GATE_COLORS[gateNum]}${allDone ? "44" : "22"}`,
                          boxShadow: allDone ? `0 0 12px ${GATE_COLORS[gateNum]}15` : undefined,
                        }}
                        data-testid={`button-gate-status-${gateNum}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-heading font-bold" style={{ color: GATE_COLORS[gateNum] }}>
                            {gateNum === 0 ? "PT" : gateNum}
                          </span>
                          {allDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                          ) : hasIssues ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#EF4444]/60" />
                          )}
                        </div>
                        <span className="text-[9px] font-heading font-bold tracking-wider uppercase text-slate-500">
                          {GATE_ABBRS[gateNum]}
                        </span>
                        <span className="text-[10px] font-heading font-bold" style={{ color: GATE_COLORS[gateNum] }}>
                          {pct}%
                        </span>
                      </button>

                      {/* Hover tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-20 rounded-lg p-3 min-w-[140px]"
                            style={{ background: "#0A1628", border: "1px solid rgba(20,184,166,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
                            data-testid={`tooltip-gate-${gateNum}`}
                          >
                            <p className="text-[10px] font-heading font-bold text-slate-300 mb-2">
                              {t.vault.gateLabel} {gateNum} — {GATE_ABBRS[gateNum]}
                            </p>
                            <div className="space-y-1 text-[10px]">
                              {counts.uploaded > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3 w-3 text-[#22C55E]" />
                                  <span className="text-slate-400">{counts.uploaded} {t.vault.gateStatusUploaded}</span>
                                </div>
                              )}
                              {counts.missing > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <XCircle className="h-3 w-3 text-[#EF4444]" />
                                  <span className="text-slate-400">{counts.missing} {t.vault.gateStatusMissing}</span>
                                </div>
                              )}
                              {counts.expiring > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-[#F59E0B]" />
                                  <span className="text-slate-400">{counts.expiring} {t.vault.gateStatusExpiring}</span>
                                </div>
                              )}
                              {counts.expired > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3 text-[#EF4444]" />
                                  <span className="text-slate-400">{counts.expired} {t.vault.gateStatusExpired}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Access Panel */}
            {selectedPropertyId && (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(20,184,166,0.1)", background: "rgba(15,26,46,0.6)" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(20,184,166,0.08)" }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="font-heading font-bold text-white text-sm" data-testid="text-quick-access-heading">{t.vault.quickAccessHeading}</h2>
                      <p className="text-slate-500 text-xs mt-0.5">{t.vault.quickAccessDesc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <Input
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder={t.vault.searchPlaceholder}
                          className="bg-[#162036] border-[#14B8A6]/20 text-white text-xs h-8 pl-8 w-48"
                          data-testid="input-search-docs"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    {(["all", "required", "expiring", "expired"] as DocFilter[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setDocFilter(f)}
                        className={`text-[10px] font-heading font-bold tracking-wider uppercase px-3 py-1 rounded-full transition-colors ${docFilter === f ? "bg-[#14B8A6]/15 text-[#14B8A6] border border-[#14B8A6]/30" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
                        data-testid={`button-filter-${f}`}
                      >
                        {f === "all" ? t.vault.filterAll : f === "required" ? t.vault.filterRequired : f === "expiring" ? t.vault.filterExpiring : t.vault.filterExpired}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">{t.vault.noResults}</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    {filteredDocs.map(tmpl => {
                      const status = getDocStatus(tmpl);
                      const dot = STATUS_DOT[status] || STATUS_DOT.missing;
                      const doc = docMap.get(tmpl.id);
                      const isEditing = editingId === tmpl.id;

                      return (
                        <div key={tmpl.id} className="px-5 py-3" style={{ borderColor: "rgba(255,255,255,0.04)" }} data-testid={`row-doc-${tmpl.documentSlug}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot.pulse ? "animate-pulse" : ""}`} style={{ background: dot.color }} />
                            {dot.icon && <AlertTriangle className="h-3.5 w-3.5 text-[#EF4444] shrink-0 -ml-2" />}
                            <span className="text-[9px] font-heading font-bold tracking-wider uppercase px-1.5 py-0.5 rounded" style={{ background: `${GATE_COLORS[tmpl.gateNumber]}10`, color: GATE_COLORS[tmpl.gateNumber] }}>
                              {GATE_ABBRS[tmpl.gateNumber]}
                            </span>
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
                              <span className="text-[10px] text-slate-500 hidden sm:inline">{t.vault.expiryLabel}: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => isEditing ? setEditingId(null) : startEdit(tmpl.id)}
                              className="text-slate-400 hover:text-[#14B8A6] text-xs"
                              data-testid={`button-edit-doc-${tmpl.documentSlug}`}
                            >
                              {isEditing ? t.vault.cancelButton : t.vault.editButton}
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
                )}
              </div>
            )}

            {/* Gate-by-Gate Detail Accordion */}
            {selectedPropertyId && (
              <div className="space-y-2">
                <h2 className="font-heading font-bold text-white text-sm mb-3" data-testid="text-all-gates-heading">{t.vault.allGatesLabel}</h2>
                {gateGroups.map(([gateNum, tmpls]) => {
                  const pct = gatePct(gateNum);
                  const counts = getGateStatusCounts(gateNum);
                  const allDone = pct === 100;

                  return (
                    <div key={gateNum} id={`gate-section-${gateNum}`} className="rounded-lg border overflow-hidden" style={{ borderColor: `${GATE_COLORS[gateNum]}22`, background: "rgba(15,26,46,0.8)" }}>
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
                        {/* Status indicators inline */}
                        <div className="flex items-center gap-1.5 mr-2">
                          {allDone ? (
                            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                          ) : (
                            <>
                              {counts.uploaded > 0 && <span className="flex items-center gap-0.5 text-[10px] text-[#22C55E]"><CheckCircle2 className="h-3 w-3" />{counts.uploaded}</span>}
                              {counts.missing > 0 && <span className="flex items-center gap-0.5 text-[10px] text-[#EF4444]"><XCircle className="h-3 w-3" />{counts.missing}</span>}
                              {counts.expiring > 0 && <span className="flex items-center gap-0.5 text-[10px] text-[#F59E0B]"><Clock className="h-3 w-3" />{counts.expiring}</span>}
                              {counts.expired > 0 && <span className="flex items-center gap-0.5 text-[10px] text-[#EF4444]"><AlertTriangle className="h-3 w-3" />{counts.expired}</span>}
                            </>
                          )}
                        </div>
                        <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${GATE_COLORS[gateNum]}15`, color: GATE_COLORS[gateNum] }} data-testid={`text-gate-pct-${gateNum}`}>
                          {pct}%
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
                                  <div key={tmpl.id} className="border-b last:border-b-0 px-5 py-3" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
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
                                        <span className="text-[10px] text-slate-500 hidden sm:inline">{t.vault.expiryLabel}: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                                      )}
                                      <Button size="sm" variant="ghost" onClick={() => isEditing ? setEditingId(null) : startEdit(tmpl.id)}
                                        className="text-slate-400 hover:text-[#14B8A6] text-xs"
                                      >
                                        {isEditing ? t.vault.cancelButton : t.vault.editButton}
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
                                                <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white text-xs h-8">
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
                                                />
                                              </div>
                                            )}
                                            <div className="space-y-1 md:col-span-full">
                                              <Label className="text-slate-400 text-xs">{t.vault.notesLabel}</Label>
                                              <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                                placeholder={t.vault.notesPlaceholder}
                                                className="bg-[#162036] border-[#14B8A6]/20 text-white text-xs min-h-[60px]"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleSave(tmpl.id)} disabled={upsertMutation.isPending}
                                              className="bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs"
                                            >
                                              {t.vault.saveButton}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                                              className="text-slate-400 text-xs"
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
                  );
                })}
              </div>
            )}

            {/* Generate Report + Pricing Note */}
            {selectedPropertyId && (
              <div className="rounded-xl p-5 space-y-4" style={{ background: "rgba(15,26,46,0.6)", border: "1px solid rgba(20,184,166,0.1)" }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-heading font-bold text-white text-sm flex items-center gap-2">
                      <Download className="h-4 w-4 text-[#14B8A6]" />
                      {t.vault.reportButton}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">{t.vault.reportHelper}</p>
                  </div>
                  <Button
                    onClick={handleDownloadReport}
                    className="bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-heading font-bold tracking-wider"
                    data-testid="button-generate-report"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    {t.vault.reportButton}
                  </Button>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: "rgba(20,184,166,0.08)" }}>
                  <Lock className="h-3.5 w-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                  <p className="text-[#F59E0B]/80 text-xs leading-relaxed">{t.vault.pricingNote}</p>
                </div>
              </div>
            )}

            {/* Disclaimer + Privacy Footer */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-xs leading-relaxed" data-testid="text-disclaimer">{t.vault.disclaimerText}</p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-xs leading-relaxed" data-testid="text-privacy">{t.vault.privacyText}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
