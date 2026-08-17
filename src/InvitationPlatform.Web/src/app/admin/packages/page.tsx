"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AdminPackage {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  tier: string;
  priceAmount: number;
  priceCurrency: string;
  features: {
    key: string;
    name: string;
    booleanValue: boolean | null;
    integerValue: number | null;
    stringValue: string | null;
  }[];
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editName, setEditName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const data = await api<AdminPackage[]>("/api/v1/packages");
      setPackages(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function startEdit(pkg: AdminPackage) {
    setEditing(pkg.id);
    setEditPrice(pkg.priceAmount.toString());
    setEditName(pkg.displayName);
  }

  async function saveEdit(packageId: string) {
    await api(`/api/v1/admin/packages/${packageId}`, {
      method: "PUT",
      body: JSON.stringify({
        displayName: editName,
        priceAmount: parseFloat(editPrice),
      }),
    });
    setEditing(null);
    fetchData();
  }

  if (loading) return <div className="text-gray-500">Φόρτωση...</div>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Πακέτα</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-5">
            {editing === pkg.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-md"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500">€</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(pkg.id)}
                    className="text-xs px-3 py-1.5 bg-[#2E5A4C] text-white rounded-md hover:bg-[#234a3d] cursor-pointer"
                  >
                    Αποθήκευση
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    Ακύρωση
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-gray-900">{pkg.displayName}</h2>
                    <span className="text-xs text-gray-500">{pkg.tier}</span>
                  </div>
                  <button
                    onClick={() => startEdit(pkg)}
                    className="text-xs text-[#2E5A4C] hover:underline cursor-pointer"
                  >
                    Επεξεργασία
                  </button>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-3">
                  {pkg.priceAmount}€
                </div>
                {pkg.description && (
                  <p className="text-xs text-gray-500 mb-3">{pkg.description}</p>
                )}
                <div className="space-y-1">
                  {pkg.features.map((f) => (
                    <div key={f.key} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{f.name}</span>
                      <span className="text-gray-900 font-medium">
                        {f.booleanValue != null
                          ? f.booleanValue ? "Ναι" : "Όχι"
                          : f.integerValue != null
                          ? f.integerValue === -1 ? "Unlimited" : f.integerValue
                          : f.stringValue ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
