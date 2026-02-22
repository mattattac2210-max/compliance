import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  X, Zap, Calendar, Archive, Bell, FileText,
  CheckCircle, AlertCircle, Loader2, ChevronRight,
  Globe, MapPin, Users, Sparkles, Edit3, Send,
  ToggleLeft, ToggleRight, Info,
} from "lucide-react";

interface IntelItem {
  id: string;
  source: string;
  url: string;
  title: string;
  summary: string;
  severity: string;
  regions: string[];
  gate: number;
  status: string;
  whatChanged: string;
  affected: string[];
  suggestedActions: string[];
}

interface ActionConfig {
  type: "filing_shift" | "vault_template" | "user_alert" | "process_guide";
  enabled: boolean;
  label: string;
  icon: React.ReactNode;
  filingTypes?: string[];
  shiftDays?: number;
  newDueNote?: string;
  templateSlug?: string;
  templateName?: string;
  templateGate?: number;
  guideId?: string;
}

interface ApplyResult {
  type: string;
  description: string;
  affectedCount: number;
  appliedAt: string;
}

const REGENCIES = ["Badung", "Gianyar", "Denpasar", "Tabanan", "Buleleng", "Karangasem", "Klungkung", "Jembrana", "Bangli"];

function inferActions(item: IntelItem): ActionConfig[] {
  const actions: ActionConfig[] = [];

  actions.push({
    type: "user_alert",
    enabled: true,
    label: "Notify Pro users",
    icon: <Bell size={14} />,
  });

  const filingKeywords = ["PPh 21", "PPh 25", "PPN", "PB1", "BPJS"];
  const matchedFilings = filingKeywords.filter(kw =>
    item.affected.some(a => a.includes(kw)) || item.whatChanged.includes(kw)
  );
  if (matchedFilings.length > 0 || item.suggestedActions.some(a => a.toLowerCase().includes("calendar") || a.toLowerCase().includes("filing"))) {
    actions.push({
      type: "filing_shift",
      enabled: true,
      label: "Adjust filing deadlines",
      icon: <Calendar size={14} />,
      filingTypes: matchedFilings.length > 0 ? matchedFilings : [],
      shiftDays: -3,
      newDueNote: item.title,
    });
  }

  if (item.suggestedActions.some(a => a.toLowerCase().includes("vault") || a.toLowerCase().includes("document") || a.toLowerCase().includes("upload"))) {
    actions.push({
      type: "vault_template",
      enabled: true,
      label: "Add vault document requirement",
      icon: <Archive size={14} />,
      templateSlug: `gate${item.gate}-${item.source.toLowerCase().replace(/[^a-z0-9]/g, "-")}-update`,
      templateName: "",
      templateGate: item.gate,
    });
  }

  return actions;
}

function draftMessage(item: IntelItem, actions: ActionConfig[]): string {
  const filingAction = actions.find(a => a.type === "filing_shift" && a.enabled);
  const vaultAction = actions.find(a => a.type === "vault_template" && a.enabled);

  let msg = `**Regulatory Update — Gate ${item.gate}**\n\n`;
  msg += `${item.summary}\n\n`;

  if (filingAction && filingAction.filingTypes && filingAction.filingTypes.length > 0) {
    const shift = filingAction.shiftDays!;
    const shiftLabel = shift < 0 ? `${Math.abs(shift)} days earlier than usual` : `${shift} days later`;
    msg += `📅 **Filing dates affected:** ${filingAction.filingTypes.join(", ")} should be submitted ${shiftLabel} due to this change.\n\n`;
  }

  if (vaultAction && vaultAction.templateName) {
    msg += `📎 **New document required:** ${vaultAction.templateName} has been added to your Gate ${vaultAction.templateGate} vault checklist.\n\n`;
  }

  msg += `**What this means for you:** Review your upcoming obligations in the Calendar and Timeline tabs. Your deadlines have been updated automatically${item.regions.includes("all") ? "" : ` for properties in ${item.regions.join(", ")}`}.\n\n`;
  msg += `Source: ${item.source}`;

  return msg;
}

function ActionRow({
  action, onChange,
}: {
  action: ActionConfig;
  onChange: (updates: Partial<ActionConfig>) => void;
}) {
  return (
    <div style={{
      background: action.enabled ? "var(--surface)" : "var(--bg2)",
      border: `1px solid ${action.enabled ? "var(--b)" : "var(--b2)"}`,
      borderRadius: 10, padding: "12px 14px",
      opacity: action.enabled ? 1 : 0.55,
      transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: action.enabled ? 12 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ color: action.enabled ? "var(--accent)" : "var(--t3)" }}>{action.icon}</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: action.enabled ? "var(--txt)" : "var(--t3)" }}>
            {action.label}
          </span>
        </div>
        <button
          onClick={() => onChange({ enabled: !action.enabled })}
          style={{ background: "none", border: "none", cursor: "pointer", color: action.enabled ? "var(--accent)" : "var(--t3)", display: "flex" }}
          data-testid={`toggle-action-${action.type}`}
        >
          {action.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        </button>
      </div>

      {action.enabled && action.type === "filing_shift" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--t3)", display: "block", marginBottom: 4 }}>
              Filing types (comma-separated)
            </label>
            <input
              value={action.filingTypes?.join(", ") || ""}
              onChange={e => onChange({ filingTypes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
              placeholder="PPh 21, PPh 25, PPN..."
              style={inputStyle}
              data-testid="input-filing-types"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={labelStyle}>Shift days (negative = earlier)</label>
              <input
                type="number"
                value={action.shiftDays ?? -3}
                onChange={e => onChange({ shiftDays: parseInt(e.target.value) || 0 })}
                style={inputStyle}
                data-testid="input-shift-days"
              />
            </div>
            <div>
              <label style={labelStyle}>Note for filing record</label>
              <input
                value={action.newDueNote || ""}
                onChange={e => onChange({ newDueNote: e.target.value })}
                placeholder="e.g. CoreTax maintenance"
                style={inputStyle}
                data-testid="input-due-note"
              />
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--t3)", display: "flex", alignItems: "center", gap: 4 }}>
            <Info size={11} />
            Auto-apply users: date shifts immediately. Approval users: prompted to accept.
          </div>
        </div>
      )}

      {action.enabled && action.type === "vault_template" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label style={labelStyle}>Document name</label>
            <input
              value={action.templateName || ""}
              onChange={e => onChange({ templateName: e.target.value })}
              placeholder="e.g. Property frontage photo"
              style={inputStyle}
              data-testid="input-template-name"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={labelStyle}>Gate number</label>
              <input
                type="number"
                value={action.templateGate ?? 2}
                min={1} max={8}
                onChange={e => onChange({ templateGate: parseInt(e.target.value) || 2 })}
                style={inputStyle}
                data-testid="input-template-gate"
              />
            </div>
            <div>
              <label style={labelStyle}>Document slug (auto-filled)</label>
              <input value={action.templateSlug || ""} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: 6,
  background: "var(--bg2)", border: "1px solid var(--b)",
  color: "var(--txt)", fontSize: 12, outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "var(--t3)", display: "block", marginBottom: 4,
};

export function IntelligenceActionPanel({
  item,
  onClose,
  onApplied,
}: {
  item: IntelItem;
  onClose: () => void;
  onApplied: (id: string) => void;
}) {
  const [actions, setActions] = useState<ActionConfig[]>(() => inferActions(item));
  const [regions, setRegions] = useState<string[]>(item.regions);
  const [message, setMessage] = useState<string>("");
  const [messageEdited, setMessageEdited] = useState(false);
  const [step, setStep] = useState<"configure" | "preview" | "done">("configure");
  const [results, setResults] = useState<ApplyResult[]>([]);
  const [isDraftingAI, setIsDraftingAI] = useState(false);

  useEffect(() => {
    setMessage(draftMessage(item, actions));
  }, []);

  useEffect(() => {
    if (!messageEdited) {
      setMessage(draftMessage(item, actions));
    }
  }, [actions, messageEdited]);

  const applyMutation = useMutation({
    mutationFn: async () => {
      const enabledActions = actions.filter(a => a.enabled);
      const res = await apiRequest("POST", `/api/admin/regulatory-changes/${item.id}/apply`, {
        actions: enabledActions,
        userMessage: message,
        regions,
        title: item.title,
        gate: item.gate,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data.actionsApplied || []);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/regulatory-changes"] });
      setTimeout(() => onApplied(item.id), 1500);
    },
  });

  const updateAction = (type: string, updates: Partial<ActionConfig>) => {
    setActions(prev => prev.map(a => a.type === type ? { ...a, ...updates } : a));
  };

  const toggleRegion = (r: string) => {
    if (r === "all") {
      setRegions(["all"]);
    } else {
      setRegions(prev => {
        const without = prev.filter(x => x !== "all");
        return without.includes(r) ? without.filter(x => x !== r) : [...without, r];
      });
    }
  };

  const enabledCount = actions.filter(a => a.enabled).length;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
    }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
      />

      <div style={{
        position: "relative", zIndex: 1,
        width: "min(520px, 100vw)", height: "100vh",
        background: "var(--bg)", borderLeft: "1px solid var(--b)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--b)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--sidebar)", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Apply Regulatory Change</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.title}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex" }} data-testid="button-close-panel">
            <X size={18} />
          </button>
        </div>

        {step === "done" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={28} style={{ color: "#16A34A" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--txt)", marginBottom: 6 }}>Changes Applied</div>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>Cascading updates complete</div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 12, color: "var(--txt)" }}>{r.description}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>{r.affectedCount} users</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {(["configure", "preview"] as const).map((s, i) => (
                <div
                  key={s}
                  onClick={() => s === "preview" && enabledCount > 0 ? setStep("preview") : setStep("configure")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    color: step === s ? "var(--accent)" : "var(--t3)",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: step === s ? "var(--accent)" : "var(--b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: step === s ? "#fff" : "var(--t3)",
                  }}>{i + 1}</div>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {i === 0 && <ChevronRight size={12} style={{ color: "var(--t4)" }} />}
                </div>
              ))}
            </div>

            {step === "configure" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Globe size={12} /> Region Scope
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <button
                      onClick={() => toggleRegion("all")}
                      data-testid="button-region-all"
                      style={{
                        padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid",
                        borderColor: regions.includes("all") ? "var(--accent)" : "var(--b)",
                        background: regions.includes("all") ? "var(--accent)" : "var(--surface)",
                        color: regions.includes("all") ? "#fff" : "var(--t2)",
                      }}
                    >
                      All Regions
                    </button>
                    {REGENCIES.map(r => (
                      <button
                        key={r}
                        onClick={() => toggleRegion(r)}
                        data-testid={`button-region-${r.toLowerCase()}`}
                        style={{
                          padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid",
                          borderColor: regions.includes(r) ? "var(--accent)" : "var(--b)",
                          background: regions.includes(r) ? "rgba(232,25,44,0.08)" : "var(--surface)",
                          color: regions.includes(r) ? "var(--accent)" : "var(--t2)",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={12} /> Actions ({enabledCount} enabled)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {actions.map(action => (
                      <ActionRow
                        key={action.type}
                        action={action}
                        onChange={updates => updateAction(action.type, updates)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Bell size={12} /> User Notification Message
                    </div>
                    <button
                      onClick={() => {
                        setMessageEdited(false);
                        setMessage(draftMessage(item, actions));
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 10, fontWeight: 700, cursor: "pointer",
                        border: "none", background: "none", color: "var(--accent)",
                      }}
                      data-testid="button-redraft"
                    >
                      <Sparkles size={11} /> Re-draft
                    </button>
                  </div>
                  <textarea
                    value={message}
                    onChange={e => { setMessage(e.target.value); setMessageEdited(true); }}
                    rows={8}
                    placeholder="Notification message to Pro users..."
                    data-testid="textarea-user-message"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      background: "var(--surface)", border: "1px solid var(--b)",
                      color: "var(--txt)", fontSize: 12, lineHeight: 1.6,
                      outline: "none", resize: "vertical", boxSizing: "border-box",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
                    Markdown supported. Sent as in-app notification to affected Pro users.
                  </div>
                </div>
              </div>
            )}

            {step === "preview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>
                  Review what will happen when you execute. This cannot be easily undone.
                </div>

                <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={11} /> Scope
                  </div>
                  <div style={{ fontSize: 12, color: "var(--txt)" }}>
                    {regions.includes("all") ? "All regions" : regions.join(", ")} · Pro users only
                  </div>
                </div>

                <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={11} /> Actions to Execute
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {actions.filter(a => a.enabled).map((action, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(232,25,44,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--accent)" }}>
                          {action.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt)" }}>{action.label}</div>
                          {action.type === "filing_shift" && (
                            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                              {action.filingTypes?.join(", ")} · {Math.abs(action.shiftDays!)} days {action.shiftDays! < 0 ? "earlier" : "later"}
                              <br />Auto-apply users: immediate · Approval users: prompted
                            </div>
                          )}
                          {action.type === "vault_template" && (
                            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                              New template: {action.templateName || "(unnamed)"} · Gate {action.templateGate}
                            </div>
                          )}
                          {action.type === "user_alert" && (
                            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                              In-app notification to all affected Pro users
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Bell size={11} /> Notification Preview
                  </div>
                  <div style={{
                    fontSize: 12, color: "var(--txt)", lineHeight: 1.6,
                    whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto",
                    padding: "10px 12px", background: "var(--bg2)", borderRadius: 8,
                    border: "1px solid var(--b)",
                  }}>
                    {message}
                  </div>
                </div>

                {applyMutation.isError && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 12, color: "#DC2626",
                  }}>
                    <AlertCircle size={14} />
                    Failed to apply changes. Try again.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step !== "done" && (
          <div style={{
            padding: "14px 20px", borderTop: "1px solid var(--b)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--sidebar)", flexShrink: 0,
          }}>
            {step === "configure" ? (
              <>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {enabledCount} action{enabledCount !== 1 ? "s" : ""} · {regions.includes("all") ? "All regions" : `${regions.length} region${regions.length !== 1 ? "s" : ""}`}
                </div>
                <button
                  onClick={() => setStep("preview")}
                  disabled={enabledCount === 0}
                  data-testid="button-next-preview"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: enabledCount === 0 ? "not-allowed" : "pointer",
                    border: "none",
                    background: enabledCount === 0 ? "var(--b)" : "var(--accent)",
                    color: "#fff", opacity: enabledCount === 0 ? 0.5 : 1,
                  }}
                >
                  Preview <ChevronRight size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep("configure")}
                  data-testid="button-back-configure"
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", border: "1px solid var(--b)",
                    background: "transparent", color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  data-testid="button-execute-apply"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: applyMutation.isPending ? "wait" : "pointer",
                    border: "none", background: "#DC2626", color: "#fff",
                  }}
                >
                  {applyMutation.isPending ? (
                    <><Loader2 size={14} className="animate-spin" /> Applying...</>
                  ) : (
                    <><Send size={14} /> Execute {enabledCount} Action{enabledCount !== 1 ? "s" : ""}</>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
