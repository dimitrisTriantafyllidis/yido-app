"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TemplatePreviewImage } from "@/components/templates/template-preview";

interface Template {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  category: string | null;
  previewImageUrl?: string | null;
  isActive: boolean;
  isPremium: boolean;
  sectionCount: number;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await api<Template[]>("/api/v1/templates");
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleActive(templateId: string, isActive: boolean) {
    await api(`/api/v1/admin/templates/${templateId}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchData();
  }

  async function togglePremium(templateId: string, isPremium: boolean) {
    await api(`/api/v1/admin/templates/${templateId}`, {
      method: "PUT",
      body: JSON.stringify({ isPremium: !isPremium }),
    });
    fetchData();
  }

  if (loading) return <div className="text-gray-500">Φόρτωση...</div>;

  return (
    <div className="max-w-6xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Πρότυπα</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <article
            key={t.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <TemplatePreviewImage
              category={t.category}
              name={t.name}
              remoteUrl={t.previewImageUrl}
              className="h-36 w-full"
            />
            <div className="space-y-3 p-4">
              <div>
                <h2 className="font-semibold text-gray-900">{t.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t.eventType}
                  {t.category ? ` · ${t.category}` : ""}
                  {` · ${t.sectionCount} ενότητες`}
                </p>
                {t.description ? (
                  <p className="mt-2 text-sm text-gray-600">{t.description}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(t.id, t.isActive)}
                  className={`cursor-pointer rounded px-2 py-0.5 text-xs ${
                    t.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.isActive ? "Ενεργό" : "Ανενεργό"}
                </button>
                <button
                  type="button"
                  onClick={() => togglePremium(t.id, t.isPremium)}
                  className={`cursor-pointer rounded px-2 py-0.5 text-xs ${
                    t.isPremium
                      ? "bg-purple-50 text-purple-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.isPremium ? "Premium" : "Standard"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
