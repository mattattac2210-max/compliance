import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import type { Property, StaffMember, BanjarContribution } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Pencil, Trash2, X, ShieldCheck, ShieldOff, Users, HeartHandshake, Globe, MapPin, ChevronDown, ChevronUp, Check, AlertTriangle, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REGENCIES = [
  "Badung", "Bangli", "Buleleng", "Denpasar", "Gianyar",
  "Jembrana", "Karangasem", "Klungkung", "Tabanan",
];

interface PropertyFormData {
  propertyName: string;
  entityName: string;
  nib: string;
  address: string;
  regency: string;
  kbli: string;
  entityStructure: string;
  otaEntityName: string;
  otaIdentityChecked: boolean;
  landTitleType: string;
  landTitleExpiry: string;
  banjars: string;
  banjarIntroDate: string;
  banjarNotes: string;
}

const emptyForm: PropertyFormData = {
  propertyName: "", entityName: "", nib: "", address: "", regency: "", kbli: "",
  entityStructure: "pt_pma", otaEntityName: "", otaIdentityChecked: false,
  landTitleType: "", landTitleExpiry: "", banjars: "", banjarIntroDate: "", banjarNotes: "",
};

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.firstName ?? "");

  const nameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/auth/profile", { firstName: nameValue.trim() || null });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      setEditingName(false);
      toast({ title: t.profile.nameSaved });
    },
  });

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/properties", form);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/properties/${id}`, form);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setEditing(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const startEdit = (prop: Property) => {
    setEditing(prop.id);
    setShowForm(false);
    setForm({
      propertyName: prop.propertyName,
      entityName: prop.entityName,
      nib: prop.nib || "",
      address: prop.address || "",
      regency: prop.regency || "",
      kbli: prop.kbli || "",
      entityStructure: prop.entityStructure || "pt_pma",
      otaEntityName: prop.otaEntityName || "",
      otaIdentityChecked: prop.otaIdentityChecked || false,
      landTitleType: prop.landTitleType || "",
      landTitleExpiry: prop.landTitleExpiry || "",
      banjars: prop.banjars || "",
      banjarIntroDate: prop.banjarIntroDate || "",
      banjarNotes: prop.banjarNotes || "",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate(editing);
    } else {
      createMutation.mutate();
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.profile.confirmDelete)) {
      deleteMutation.mutate(id);
    }
  };

  const otaMatch = form.otaEntityName.trim().length > 0 && form.entityName.trim().toLowerCase() === form.otaEntityName.trim().toLowerCase();
  const otaMismatch = form.otaEntityName.trim().length > 0 && form.entityName.trim().toLowerCase() !== form.otaEntityName.trim().toLowerCase();

  const renderForm = () => (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.propertyNameLabel}</Label>
          <Input
            value={form.propertyName} onChange={e => setForm(f => ({ ...f, propertyName: e.target.value }))}
            placeholder={t.profile.propertyNamePlaceholder} required
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-property-name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.entityNameLabel}</Label>
          <Input
            value={form.entityName} onChange={e => setForm(f => ({ ...f, entityName: e.target.value }))}
            placeholder={t.profile.entityNamePlaceholder} required
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-entity-name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.nibLabel}</Label>
          <Input
            value={form.nib} onChange={e => setForm(f => ({ ...f, nib: e.target.value }))}
            placeholder={t.profile.nibPlaceholder}
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-nib"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.kbliLabel}</Label>
          <Input
            value={form.kbli} onChange={e => setForm(f => ({ ...f, kbli: e.target.value }))}
            placeholder="e.g. 55101"
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-kbli"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-slate-300 text-sm">{t.profile.addressLabel}</Label>
          <Input
            value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder={t.profile.addressPlaceholder}
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-address"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.regencyLabel}</Label>
          <Select value={form.regency} onValueChange={v => setForm(f => ({ ...f, regency: v }))}>
            <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white" data-testid="select-regency">
              <SelectValue placeholder={t.profile.regencyLabel} />
            </SelectTrigger>
            <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
              {REGENCIES.map(r => <SelectItem key={r} value={r} className="text-white hover:bg-[#14B8A6]/10">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.entityStructureLabel}</Label>
          <Select value={form.entityStructure} onValueChange={v => setForm(f => ({ ...f, entityStructure: v }))}>
            <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white" data-testid="select-entity-structure">
              <SelectValue placeholder={t.profile.entityStructureLabel} />
            </SelectTrigger>
            <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
              {Object.entries(t.profile.entityStructureOptions).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-white hover:bg-[#14B8A6]/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2 border-t border-[#14B8A6]/10 pt-4 mt-2">
          <Label className="text-slate-200 text-sm font-heading flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#14B8A6]" />
            {t.profile.otaIdentityHeading}
          </Label>
          <p className="text-xs text-slate-500">{t.profile.otaIdentityDesc}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.otaEntityNameLabel}</Label>
          <Input
            value={form.otaEntityName} onChange={e => setForm(f => ({ ...f, otaEntityName: e.target.value }))}
            placeholder={t.profile.otaEntityNamePlaceholder}
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-ota-entity-name"
          />
        </div>
        <div className="space-y-2 flex flex-col justify-end">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={form.otaIdentityChecked}
              onCheckedChange={(checked) => setForm(f => ({ ...f, otaIdentityChecked: !!checked }))}
              data-testid="checkbox-ota-identity"
            />
            <Label className="text-slate-300 text-sm">{t.profile.otaIdentityCheckedLabel}</Label>
          </div>
          {otaMatch && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> {t.profile.otaIdentityMatch}
            </span>
          )}
          {otaMismatch && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {t.profile.otaIdentityMismatch}
            </span>
          )}
        </div>

        <div className="space-y-2 md:col-span-2 border-t border-[#14B8A6]/10 pt-4 mt-2">
          <Label className="text-slate-200 text-sm font-heading flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#14B8A6]" />
            {t.profile.landTitleHeading}
          </Label>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.landTitleTypeLabel}</Label>
          <Select value={form.landTitleType} onValueChange={v => setForm(f => ({ ...f, landTitleType: v }))}>
            <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white" data-testid="select-land-title-type">
              <SelectValue placeholder={t.profile.landTitleTypeLabel} />
            </SelectTrigger>
            <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
              {Object.entries(t.profile.landTitleTypeOptions).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-white hover:bg-[#14B8A6]/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {form.landTitleType === "hgb" && (
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">{t.profile.landTitleExpiryLabel}</Label>
            <Input
              type="date"
              value={form.landTitleExpiry}
              onChange={e => setForm(f => ({ ...f, landTitleExpiry: e.target.value }))}
              className="bg-[#162036] border-[#14B8A6]/20 text-white"
              data-testid="input-land-title-expiry"
            />
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {t.profile.landTitleExpiryWarning}
            </p>
          </div>
        )}

        <div className="space-y-2 md:col-span-2 border-t border-[#14B8A6]/10 pt-4 mt-2">
          <Label className="text-slate-200 text-sm font-heading flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[#14B8A6]" />
            {t.profile.banjarHeading}
          </Label>
          <p className="text-xs text-slate-500">{t.profile.banjarDesc}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.banjarNameLabel}</Label>
          <Input
            value={form.banjars} onChange={e => setForm(f => ({ ...f, banjars: e.target.value }))}
            placeholder={t.profile.banjarNamePlaceholder}
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
            data-testid="input-banjar-name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm">{t.profile.banjarIntroDateLabel}</Label>
          <Input
            type="date"
            value={form.banjarIntroDate}
            onChange={e => setForm(f => ({ ...f, banjarIntroDate: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white"
            data-testid="input-banjar-intro-date"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-slate-300 text-sm">{t.profile.banjarNotesLabel}</Label>
          <Textarea
            value={form.banjarNotes}
            onChange={e => setForm(f => ({ ...f, banjarNotes: e.target.value }))}
            placeholder={t.profile.banjarNotesPlaceholder}
            className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500 min-h-[60px]"
            data-testid="input-banjar-notes"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit" disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white font-heading"
          data-testid="button-save-property"
        >
          {t.profile.saveProperty}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          data-testid="button-cancel-property"
        >
          {t.profile.cancelLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--app-bg)" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-profile-heading">{t.profile.heading}</h1>
          <p className="text-slate-400 text-sm mt-1">{t.profile.subheading}</p>
        </div>

        <Card className="border-[#14B8A6]/10 bg-[#0F1A2E]/80 backdrop-blur-sm" data-testid="card-user-name">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#14B8A6]/10">
                  <UserIcon className="h-5 w-5 text-[#14B8A6]" />
                </div>
                <div>
                  <CardTitle className="text-white font-heading text-lg">{t.profile.yourName}</CardTitle>
                  <p className="text-slate-400 text-xs mt-0.5">{t.profile.yourNameDesc}</p>
                </div>
              </div>
              {!editingName && (
                <Button size="sm" variant="ghost" onClick={() => { setNameValue(user?.firstName ?? ""); setEditingName(true); }}
                  className="text-slate-400 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10"
                  data-testid="button-edit-name"
                >
                  <Pencil className="h-4 w-4 mr-1" /> {t.profile.editProperty}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingName ? (
              <div className="flex items-center gap-3">
                <Input
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  placeholder={t.auth.firstNamePlaceholder}
                  className="bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500 max-w-xs"
                  data-testid="input-profile-name"
                  autoFocus
                  onKeyDown={e => { if (e.key === "Enter") nameMutation.mutate(); }}
                />
                <Button size="sm" onClick={() => nameMutation.mutate()} disabled={nameMutation.isPending}
                  className="bg-[#14B8A6] hover:bg-[#0D9488] text-white"
                  data-testid="button-save-name"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}
                  className="text-slate-400 hover:text-white"
                  data-testid="button-cancel-name"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-slate-200" data-testid="text-user-name">
                {user?.firstName || <span className="text-slate-500 italic">{t.auth.firstNamePlaceholder}</span>}
              </p>
            )}
          </CardContent>
        </Card>

        {properties.map(prop => (
          <div key={prop.id} className="space-y-4">
            <Card className="border-[#14B8A6]/10 bg-[#0F1A2E]/80 backdrop-blur-sm" data-testid={`card-property-${prop.id}`}>
              {editing === prop.id ? (
                <CardContent className="pt-6">{renderForm()}</CardContent>
              ) : (
                <>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#14B8A6]/10">
                        <Building2 className="h-5 w-5 text-[#14B8A6]" />
                      </div>
                      <div>
                        <CardTitle className="text-white font-heading text-lg" data-testid={`text-property-name-${prop.id}`}>{prop.propertyName}</CardTitle>
                        <p className="text-slate-400 text-sm">{prop.entityName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(prop)}
                        className="text-slate-400 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10"
                        data-testid={`button-edit-property-${prop.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> {t.profile.editProperty}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(prop.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        data-testid={`button-delete-property-${prop.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {prop.nib && <div><span className="text-slate-500 block">NIB</span><span className="text-slate-200">{prop.nib}</span></div>}
                      {prop.regency && <div><span className="text-slate-500 block">{t.profile.regencyLabel}</span><span className="text-slate-200">{prop.regency}</span></div>}
                      {prop.kbli && <div><span className="text-slate-500 block">KBLI</span><span className="text-slate-200">{prop.kbli}</span></div>}
                      {prop.address && <div className="col-span-2 md:col-span-4"><span className="text-slate-500 block">{t.profile.addressLabel}</span><span className="text-slate-200">{prop.address}</span></div>}
                    </div>

                    <PropertyExtendedInfo prop={prop} />
                  </CardContent>
                </>
              )}
            </Card>

            <StaffRosterSection propertyId={prop.id} />
            <BanjarContributionsSection propertyId={prop.id} />
          </div>
        ))}

        {showForm ? (
          <Card className="border-[#14B8A6]/20 bg-[#0F1A2E]/80 backdrop-blur-sm">
            <CardContent className="pt-6">{renderForm()}</CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}
            className="w-full bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 border border-dashed border-[#14B8A6]/30 text-[#14B8A6] font-heading"
            variant="ghost"
            data-testid="button-add-property"
          >
            <Plus className="h-4 w-4 mr-2" /> {t.profile.addProperty}
          </Button>
        )}

        {!isLoading && properties.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-heading" data-testid="text-no-properties">{t.profile.noProperties}</p>
            <p className="text-slate-500 text-sm mt-1">{t.profile.noPropertiesDesc}</p>
          </div>
        )}

        <SupportAccessSection />
      </div>
    </div>
  );
}

function PropertyExtendedInfo({ prop }: { prop: Property }) {
  const { t } = useLanguage();

  const hasExtendedInfo = prop.entityStructure || prop.otaEntityName || prop.landTitleType || prop.banjars;
  if (!hasExtendedInfo) return null;

  const otaMatch = prop.otaEntityName && prop.entityName.trim().toLowerCase() === prop.otaEntityName.trim().toLowerCase();
  const otaMismatch = prop.otaEntityName && prop.entityName.trim().toLowerCase() !== prop.otaEntityName.trim().toLowerCase();

  const hgbExpiringWithin2Years = prop.landTitleType === "hgb" && prop.landTitleExpiry && (() => {
    const expiry = new Date(prop.landTitleExpiry);
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    return expiry <= twoYearsFromNow;
  })();

  return (
    <div className="mt-4 pt-4 border-t border-[#14B8A6]/10 space-y-3 text-sm">
      {prop.entityStructure && (
        <div className="flex items-center gap-2" data-testid={`text-entity-structure-${prop.id}`}>
          <Building2 className="h-4 w-4 text-slate-500" />
          <span className="text-slate-500">{t.profile.entityStructureLabel}:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-heading">
            {t.profile.entityStructureOptions[prop.entityStructure] || prop.entityStructure}
          </span>
        </div>
      )}

      {prop.otaEntityName && (
        <div className="flex items-center gap-2" data-testid={`text-ota-identity-${prop.id}`}>
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-slate-500">{t.profile.otaIdentityHeading}:</span>
          {otaMatch && (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <Check className="h-3 w-3" /> {t.profile.otaIdentityMatch}
            </span>
          )}
          {otaMismatch && (
            <span className="flex items-center gap-1 text-red-400 text-xs">
              <AlertTriangle className="h-3 w-3" /> {t.profile.otaIdentityMismatch}
            </span>
          )}
        </div>
      )}

      {prop.landTitleType && (
        <div className="flex items-center gap-2 flex-wrap" data-testid={`text-land-title-${prop.id}`}>
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-slate-500">{t.profile.landTitleHeading}:</span>
          <span className="text-slate-200">
            {t.profile.landTitleTypeOptions[prop.landTitleType] || prop.landTitleType}
          </span>
          {prop.landTitleExpiry && (
            <span className="text-slate-400 text-xs">
              ({t.profile.landTitleExpiryLabel}: {new Date(prop.landTitleExpiry).toLocaleDateString()})
            </span>
          )}
          {hgbExpiringWithin2Years && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {t.profile.landTitleExpiryWarning}
            </span>
          )}
        </div>
      )}

      {prop.banjars && (
        <div className="flex items-center gap-2" data-testid={`text-banjar-${prop.id}`}>
          <HeartHandshake className="h-4 w-4 text-slate-500" />
          <span className="text-slate-500">{t.profile.banjarNameLabel}:</span>
          <span className="text-slate-200">{prop.banjars}</span>
          {prop.banjarIntroDate && (
            <span className="text-slate-400 text-xs">
              ({t.profile.banjarIntroDateLabel}: {new Date(prop.banjarIntroDate).toLocaleDateString()})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StaffRosterSection({ propertyId }: { propertyId: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);

  const emptyStaffForm = {
    name: "", role: "", startDate: "",
    bpjsKesehatanStatus: "not_registered",
    bpjsKesehatanMemberId: "",
    bpjsKetenagakerjaanStatus: "not_registered",
    bpjsKetenagakerjaanMemberId: "",
    kitas: "", kitasExpiry: "",
    thrDue: false, isActive: true,
  };

  const [staffForm, setStaffForm] = useState(emptyStaffForm);

  const { data: staff = [] } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff", propertyId],
    queryFn: () => fetch(`/api/staff?propertyId=${propertyId}`, { credentials: "include" }).then(r => r.json()),
  });

  const createStaffMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/staff", { ...staffForm, propertyId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff", propertyId] });
      setShowAddForm(false);
      setStaffForm(emptyStaffForm);
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/staff/${id}`, staffForm);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff", propertyId] });
      setEditingStaff(null);
      setStaffForm(emptyStaffForm);
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff", propertyId] });
    },
  });

  const startEditStaff = (s: StaffMember) => {
    setEditingStaff(s.id);
    setShowAddForm(false);
    setStaffForm({
      name: s.name,
      role: s.role || "",
      startDate: s.startDate || "",
      bpjsKesehatanStatus: s.bpjsKesehatanStatus || "not_registered",
      bpjsKesehatanMemberId: s.bpjsKesehatanMemberId || "",
      bpjsKetenagakerjaanStatus: s.bpjsKetenagakerjaanStatus || "not_registered",
      bpjsKetenagakerjaanMemberId: s.bpjsKetenagakerjaanMemberId || "",
      kitas: s.kitas || "",
      kitasExpiry: s.kitasExpiry || "",
      thrDue: s.thrDue || false,
      isActive: s.isActive,
    });
  };

  const handleStaffSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateStaffMutation.mutate(editingStaff);
    } else {
      createStaffMutation.mutate();
    }
  };

  const bpjsColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "registered": return "bg-blue-500";
      case "lapsed": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  const bpjsBadgeStyle = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400";
      case "registered": return "bg-blue-500/20 text-blue-400";
      case "lapsed": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const kitasExpiringWithin90Days = (expiry: string | null) => {
    if (!expiry) return false;
    const d = new Date(expiry);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  };

  const renderStaffForm = () => (
    <form onSubmit={handleStaffSave} className="space-y-3 p-4 border border-[#14B8A6]/10 rounded-lg bg-[#0F1A2E]/60">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffNameLabel}</Label>
          <Input
            value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))}
            required className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-staff-name"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffRoleLabel}</Label>
          <Input
            value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-staff-role"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffStartDateLabel}</Label>
          <Input
            type="date" value={staffForm.startDate}
            onChange={e => setStaffForm(f => ({ ...f, startDate: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-staff-start-date"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffBpjsKesehatanLabel}</Label>
          <Select value={staffForm.bpjsKesehatanStatus} onValueChange={v => setStaffForm(f => ({ ...f, bpjsKesehatanStatus: v }))}>
            <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm" data-testid="select-bpjs-kesehatan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
              {Object.entries(t.profile.staffBpjsStatusOptions).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-white hover:bg-[#14B8A6]/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffBpjsMemberIdLabel} ({t.profile.staffBpjsKesehatanLabel})</Label>
          <Input
            value={staffForm.bpjsKesehatanMemberId}
            onChange={e => setStaffForm(f => ({ ...f, bpjsKesehatanMemberId: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-bpjs-kesehatan-id"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffBpjsKetenagakerjaanLabel}</Label>
          <Select value={staffForm.bpjsKetenagakerjaanStatus} onValueChange={v => setStaffForm(f => ({ ...f, bpjsKetenagakerjaanStatus: v }))}>
            <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm" data-testid="select-bpjs-ketenagakerjaan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
              {Object.entries(t.profile.staffBpjsStatusOptions).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-white hover:bg-[#14B8A6]/10">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffBpjsMemberIdLabel} ({t.profile.staffBpjsKetenagakerjaanLabel})</Label>
          <Input
            value={staffForm.bpjsKetenagakerjaanMemberId}
            onChange={e => setStaffForm(f => ({ ...f, bpjsKetenagakerjaanMemberId: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-bpjs-ketenagakerjaan-id"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffKitasLabel}</Label>
          <Input
            value={staffForm.kitas} onChange={e => setStaffForm(f => ({ ...f, kitas: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-staff-kitas"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300 text-xs">{t.profile.staffKitasExpiryLabel}</Label>
          <Input
            type="date" value={staffForm.kitasExpiry}
            onChange={e => setStaffForm(f => ({ ...f, kitasExpiry: e.target.value }))}
            className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
            data-testid="input-staff-kitas-expiry"
          />
        </div>

        <div className="flex items-center gap-6 md:col-span-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={staffForm.thrDue}
              onCheckedChange={(checked) => setStaffForm(f => ({ ...f, thrDue: !!checked }))}
              data-testid="checkbox-staff-thr"
            />
            <Label className="text-slate-300 text-xs">{t.profile.staffThrLabel}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={staffForm.isActive}
              onCheckedChange={(checked) => setStaffForm(f => ({ ...f, isActive: !!checked }))}
              data-testid="checkbox-staff-active"
            />
            <Label className="text-slate-300 text-xs">{t.profile.staffActiveLabel}</Label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm"
          disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white font-heading"
          data-testid="button-save-staff"
        >
          {editingStaff ? t.profile.saveProperty : t.profile.staffAddButton}
        </Button>
        <Button type="button" size="sm" variant="outline"
          onClick={() => { setShowAddForm(false); setEditingStaff(null); setStaffForm(emptyStaffForm); }}
          className="border-slate-600 text-slate-300"
          data-testid="button-cancel-staff"
        >
          {t.profile.cancelLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="border border-[#14B8A6]/10 rounded-lg bg-[#0F1A2E]/60 overflow-visible" data-testid={`section-staff-${propertyId}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        data-testid={`button-toggle-staff-${propertyId}`}
      >
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[#14B8A6]" />
          <div>
            <span className="text-slate-100 font-heading text-sm">{t.profile.staffHeading}</span>
            <span className="text-slate-500 text-xs ml-2">({staff.length})</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-slate-500">{t.profile.staffDesc}</p>

          {staff.length === 0 && !showAddForm && (
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm" data-testid="text-no-staff">{t.profile.staffNoStaff}</p>
              <p className="text-slate-500 text-xs">{t.profile.staffNoStaffDesc}</p>
            </div>
          )}

          {staff.map(s => (
            editingStaff === s.id ? (
              <div key={s.id}>{renderStaffForm()}</div>
            ) : (
              <div key={s.id} className="flex items-center justify-between gap-3 p-3 border border-[#14B8A6]/5 rounded-md bg-[#162036]/50" data-testid={`staff-row-${s.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-200 text-sm font-heading" data-testid={`text-staff-name-${s.id}`}>{s.name}</span>
                    {s.role && <span className="text-slate-400 text-xs">({s.role})</span>}
                    {!s.isActive && <span className="px-1.5 py-0.5 rounded-md bg-slate-500/20 text-slate-400 text-xs">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <span className={`inline-block w-2 h-2 rounded-full ${bpjsColor(s.bpjsKesehatanStatus || "not_registered")}`} />
                      <span className={`px-1.5 py-0.5 rounded-md text-xs ${bpjsBadgeStyle(s.bpjsKesehatanStatus || "not_registered")}`}>
                        {t.profile.staffBpjsStatusOptions[s.bpjsKesehatanStatus || "not_registered"]}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <span className={`inline-block w-2 h-2 rounded-full ${bpjsColor(s.bpjsKetenagakerjaanStatus || "not_registered")}`} />
                      <span className={`px-1.5 py-0.5 rounded-md text-xs ${bpjsBadgeStyle(s.bpjsKetenagakerjaanStatus || "not_registered")}`}>
                        {t.profile.staffBpjsStatusOptions[s.bpjsKetenagakerjaanStatus || "not_registered"]}
                      </span>
                    </span>
                    {s.kitas && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        KITAS: {s.kitas}
                        {kitasExpiringWithin90Days(s.kitasExpiry) && (
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <AlertTriangle className="h-3 w-3" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEditStaff(s)}
                    className="text-slate-400 hover:text-[#14B8A6]"
                    data-testid={`button-edit-staff-${s.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost"
                    onClick={() => deleteStaffMutation.mutate(s.id)}
                    className="text-slate-400 hover:text-red-400"
                    data-testid={`button-delete-staff-${s.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          ))}

          {showAddForm && renderStaffForm()}

          {!showAddForm && !editingStaff && (
            <Button
              size="sm" variant="ghost"
              onClick={() => { setShowAddForm(true); setStaffForm(emptyStaffForm); }}
              className="text-[#14B8A6] hover:bg-[#14B8A6]/10"
              data-testid={`button-add-staff-${propertyId}`}
            >
              <Plus className="h-3 w-3 mr-1" /> {t.profile.staffAddButton}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function BanjarContributionsSection({ propertyId }: { propertyId: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const emptyContribForm = {
    contributionDate: "", contributionType: "monthly_dues", amount: "", description: "",
  };
  const [contribForm, setContribForm] = useState(emptyContribForm);

  const { data: contributions = [] } = useQuery<BanjarContribution[]>({
    queryKey: ["/api/banjar-contributions", propertyId],
    queryFn: () => fetch(`/api/banjar-contributions?propertyId=${propertyId}`, { credentials: "include" }).then(r => r.json()),
  });

  const createContribMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/banjar-contributions", {
        propertyId,
        contributionDate: contribForm.contributionDate,
        contributionType: contribForm.contributionType,
        amount: contribForm.amount ? parseInt(contribForm.amount) : null,
        description: contribForm.description || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banjar-contributions", propertyId] });
      setShowAddForm(false);
      setContribForm(emptyContribForm);
    },
  });

  const deleteContribMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/banjar-contributions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banjar-contributions", propertyId] });
    },
  });

  return (
    <div className="border border-[#14B8A6]/10 rounded-lg bg-[#0F1A2E]/60 overflow-visible" data-testid={`section-banjar-contributions-${propertyId}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        data-testid={`button-toggle-banjar-${propertyId}`}
      >
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-5 w-5 text-[#14B8A6]" />
          <div>
            <span className="text-slate-100 font-heading text-sm">{t.profile.banjarContributionsHeading}</span>
            <span className="text-slate-500 text-xs ml-2">({contributions.length})</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {contributions.length === 0 && !showAddForm && (
            <p className="text-slate-500 text-xs text-center py-4">{t.profile.banjarDesc}</p>
          )}

          {contributions.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3 border border-[#14B8A6]/5 rounded-md bg-[#162036]/50" data-testid={`contrib-row-${c.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-200 text-sm">{new Date(c.contributionDate).toLocaleDateString()}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#14B8A6]/10 text-[#14B8A6] text-xs">
                    {t.profile.banjarContribTypes[c.contributionType] || c.contributionType}
                  </span>
                  {c.amount && <span className="text-slate-300 text-sm">IDR {c.amount.toLocaleString()}</span>}
                </div>
                {c.description && <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>}
              </div>
              <Button size="icon" variant="ghost"
                onClick={() => deleteContribMutation.mutate(c.id)}
                className="text-slate-400 hover:text-red-400"
                data-testid={`button-delete-contrib-${c.id}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {showAddForm && (
            <form onSubmit={(e) => { e.preventDefault(); createContribMutation.mutate(); }} className="space-y-3 p-4 border border-[#14B8A6]/10 rounded-lg bg-[#0F1A2E]/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">{t.profile.banjarContribDateLabel}</Label>
                  <Input
                    type="date" value={contribForm.contributionDate}
                    onChange={e => setContribForm(f => ({ ...f, contributionDate: e.target.value }))}
                    required className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
                    data-testid="input-contrib-date"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">{t.profile.banjarContribTypeLabel}</Label>
                  <Select value={contribForm.contributionType} onValueChange={v => setContribForm(f => ({ ...f, contributionType: v }))}>
                    <SelectTrigger className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm" data-testid="select-contrib-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#162036] border-[#14B8A6]/20">
                      {Object.entries(t.profile.banjarContribTypes).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white hover:bg-[#14B8A6]/10">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">{t.profile.banjarContribAmountLabel}</Label>
                  <Input
                    type="number" value={contribForm.amount}
                    onChange={e => setContribForm(f => ({ ...f, amount: e.target.value }))}
                    className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
                    data-testid="input-contrib-amount"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">{t.profile.banjarContribDescLabel}</Label>
                  <Input
                    value={contribForm.description}
                    onChange={e => setContribForm(f => ({ ...f, description: e.target.value }))}
                    className="bg-[#162036] border-[#14B8A6]/20 text-white text-sm"
                    data-testid="input-contrib-desc"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm"
                  disabled={createContribMutation.isPending}
                  className="bg-[#14B8A6] hover:bg-[#0D9488] text-white font-heading"
                  data-testid="button-save-contrib"
                >
                  {t.profile.banjarAddContribution}
                </Button>
                <Button type="button" size="sm" variant="outline"
                  onClick={() => { setShowAddForm(false); setContribForm(emptyContribForm); }}
                  className="border-slate-600 text-slate-300"
                  data-testid="button-cancel-contrib"
                >
                  {t.profile.cancelLabel}
                </Button>
              </div>
            </form>
          )}

          {!showAddForm && (
            <Button
              size="sm" variant="ghost"
              onClick={() => { setShowAddForm(true); setContribForm(emptyContribForm); }}
              className="text-[#14B8A6] hover:bg-[#14B8A6]/10"
              data-testid={`button-add-contrib-${propertyId}`}
            >
              <Plus className="h-3 w-3 mr-1" /> {t.profile.banjarAddContribution}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SupportAccessSection() {
  const { t } = useLanguage();

  const { data: grant, isLoading } = useQuery<{
    isActive: boolean;
    grantedAt?: string;
    lastAccessedAt?: string;
    lastAccessedBy?: string;
  }>({
    queryKey: ["/api/support-access"],
  });

  const enableMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/support-access/grant"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-access"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/support-access/revoke"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-access"] });
    },
  });

  if (isLoading) return null;

  return (
    <Card className="border-[#14B8A6]/20 bg-[#0F1A2E]/80 backdrop-blur-sm mt-8" data-testid="card-support-access">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-slate-100 flex items-center gap-2">
          {grant?.isActive ? <ShieldCheck className="h-5 w-5 text-green-400" /> : <ShieldOff className="h-5 w-5 text-slate-500" />}
          {t.supportAccess.heading}
          <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${grant?.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
            {grant?.isActive ? t.supportAccess.statusActive : t.supportAccess.statusInactive}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">{t.supportAccess.description}</p>

        {grant?.isActive && (
          <div className="text-xs text-slate-500 space-y-1">
            {grant.grantedAt && <p>{t.supportAccess.grantedAt}: {new Date(grant.grantedAt).toLocaleDateString()}</p>}
            {grant.lastAccessedAt && <p>{t.supportAccess.lastAccessed}: {new Date(grant.lastAccessedAt).toLocaleDateString()}</p>}
          </div>
        )}

        <p className="text-xs text-slate-600 italic">{t.supportAccess.privacyNote}</p>

        {grant?.isActive ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm(t.supportAccess.confirmRevoke)) {
                revokeMutation.mutate();
              }
            }}
            disabled={revokeMutation.isPending}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            data-testid="button-revoke-support"
          >
            <ShieldOff className="h-4 w-4 mr-2" />
            {t.supportAccess.disableButton}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => enableMutation.mutate()}
            disabled={enableMutation.isPending}
            className="border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[#14B8A6]/10"
            data-testid="button-enable-support"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {t.supportAccess.enableButton}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
