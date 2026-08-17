"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Template {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  category: string | null;
  isActive: boolean;
  isPremium: boolean;
  sectionCount: number;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Use the existing templates endpoint (which already returns all active ones)
      // For admin we want all, but we can use the admin update endpoint
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
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Πρότυπα</h1>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Όνομα</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Τύπος</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Ενότητες</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Ενεργό</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Premium</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-gray-500">{t.eventType}</td>
                <td className="px-4 py-3 text-center text-gray-700">{t.sectionCount}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(t.id, t.isActive)}
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer ${
                      t.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.isActive ? "Ναι" : "Όχι"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => togglePremium(t.id, t.isPremium)}
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer ${
                      t.isPremium
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.isPremium ? "Ναι" : "Όχι"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {t.category && (
                    <span className="text-xs text-gray-400">{t.category}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
