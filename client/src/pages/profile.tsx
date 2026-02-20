import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Pencil, Trash2, X } from "lucide-react";

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
}

const emptyForm: PropertyFormData = {
  propertyName: "", entityName: "", nib: "", address: "", regency: "", kbli: "",
};

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-profile-heading">{t.profile.heading}</h1>
            <p className="text-slate-400 text-sm mt-1">{t.profile.subheading}</p>
          </div>
          <Link to="/app" className="text-[#14B8A6] hover:text-[#5EEAD4] text-sm transition-colors" data-testid="link-back-to-app">
            {t.profile.backToApp}
          </Link>
        </div>

        {properties.map(prop => (
          <Card key={prop.id} className="border-[#14B8A6]/10 bg-[#0F1A2E]/80 backdrop-blur-sm" data-testid={`card-property-${prop.id}`}>
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
                </CardContent>
              </>
            )}
          </Card>
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
      </div>
    </div>
  );
}
