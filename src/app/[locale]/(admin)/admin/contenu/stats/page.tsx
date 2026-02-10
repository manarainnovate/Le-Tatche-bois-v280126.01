"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// CMS Stats/Counters Manager
// ═══════════════════════════════════════════════════════════

interface StatCounter {
  id: string;
  value: string;
  labelFr: string;
  labelEn: string | null;
  labelEs: string | null;
  labelAr: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
}

const ICONS = [
  { value: "projects", label: "Projets", emoji: "🏗️" },
  { value: "years", label: "Années", emoji: "📅" },
  { value: "clients", label: "Clients", emoji: "👥" },
  { value: "team", label: "Équipe", emoji: "👷" },
  { value: "awards", label: "Prix", emoji: "🏆" },
  { value: "surface", label: "Surface", emoji: "📐" },
];

export default function StatsPage() {
  const [stats, setStats] = useState<StatCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStat, setEditingStat] = useState<StatCounter | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/cms/stats");
      const data = await res.json();
      setStats(data.stats || []);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save stat
  const handleSave = async () => {
    if (!editingStat) return;
    setSaving(true);

    try {
      const method = editingStat.id ? "PUT" : "POST";
      const url = editingStat.id
        ? `/api/cms/stats/${editingStat.id}`
        : "/api/cms/stats";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStat),
      });

      if (res.ok) {
        fetchStats();
        setShowModal(false);
        setEditingStat(null);
      }
    } catch (error) {
      console.error("Failed to save stat:", error);
    } finally {
      setSaving(false);
    }
  };

  // Delete stat
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette statistique ?")) return;

    try {
      await fetch(`/api/cms/stats/${id}`, { method: "DELETE" });
      fetchStats();
    } catch (error) {
      console.error("Failed to delete stat:", error);
    }
  };

  // Toggle active
  const handleToggleActive = async (stat: StatCounter) => {
    try {
      await fetch(`/api/cms/stats/${stat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !stat.isActive }),
      });
      fetchStats();
    } catch (error) {
      console.error("Failed to toggle stat:", error);
    }
  };

  // Move stat order
  const handleMove = async (stat: StatCounter, direction: "up" | "down") => {
    const currentIndex = stats.findIndex((s) => s.id === stat.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= stats.length) return;

    const newStats = [...stats];
    [newStats[currentIndex], newStats[newIndex]] = [
      newStats[newIndex],
      newStats[currentIndex],
    ];

    // Update orders
    try {
      await Promise.all(
        newStats.map((s, i) =>
          fetch(`/api/cms/stats/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      );
      fetchStats();
    } catch (error) {
      console.error("Failed to reorder stats:", error);
    }
  };

  // New stat
  const handleNew = () => {
    setEditingStat({
      id: "",
      value: "",
      labelFr: "",
      labelEn: null,
      labelEs: null,
      labelAr: null,
      icon: null,
      order: stats.length,
      isActive: true,
    });
    setShowModal(true);
  };

  const getIconEmoji = (icon: string | null) => {
    return ICONS.find((i) => i.value === icon)?.emoji || "📊";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Statistiques / Compteurs
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les chiffres clés affichés sur le site (500+ Projets, 30+
            Années, etc.)
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Statistique
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-8 mb-6">
        <p className="text-amber-100 text-sm mb-4 text-center">
          Aperçu (comme affiché sur le site)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats
            .filter((s) => s.isActive)
            .map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl mb-2">{getIconEmoji(stat.icon)}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-amber-100">{stat.labelFr}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Stats List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune statistique configurée</p>
          <button
            onClick={handleNew}
            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            Ajouter une statistique
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Ordre
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Icône
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Valeur
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Libellé (FR)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.map((stat, index) => (
                <tr
                  key={stat.id}
                  className={!stat.isActive ? "bg-gray-50 opacity-60" : ""}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(stat, "up")}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-gray-500 w-6 text-center">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handleMove(stat, "down")}
                        disabled={index === stats.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-2xl">
                    {getIconEmoji(stat.icon)}
                  </td>
                  <td className="px-4 py-3 font-bold text-xl text-amber-600">
                    {stat.value}
                  </td>
                  <td className="px-4 py-3 font-medium">{stat.labelFr}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stat.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stat.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(stat)}
                        className={`p-2 rounded-lg ${
                          stat.isActive
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                        title={stat.isActive ? "Désactiver" : "Activer"}
                      >
                        {stat.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingStat(stat);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingStat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingStat.id
                  ? "Modifier la Statistique"
                  : "Nouvelle Statistique"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingStat(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur *
                </label>
                <input
                  type="text"
                  value={editingStat.value}
                  onChange={(e) =>
                    setEditingStat({
                      ...editingStat,
                      value: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="500+"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exemple: 500+, 30+, 1000+, 10K+
                </p>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() =>
                        setEditingStat({ ...editingStat, icon: icon.value })
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        editingStat.icon === icon.value
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{icon.emoji}</span>
                      <span className="text-sm">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Labels */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé (FR) *
                  </label>
                  <input
                    type="text"
                    value={editingStat.labelFr}
                    onChange={(e) =>
                      setEditingStat({
                        ...editingStat,
                        labelFr: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Projets Réalisés"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé (EN)
                  </label>
                  <input
                    type="text"
                    value={editingStat.labelEn || ""}
                    onChange={(e) =>
                      setEditingStat({
                        ...editingStat,
                        labelEn: e.target.value || null,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Projects Completed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé (ES)
                  </label>
                  <input
                    type="text"
                    value={editingStat.labelEs || ""}
                    onChange={(e) =>
                      setEditingStat({
                        ...editingStat,
                        labelEs: e.target.value || null,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Proyectos Completados"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingStat.labelAr || ""}
                    onChange={(e) =>
                      setEditingStat({
                        ...editingStat,
                        labelAr: e.target.value || null,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="المشاريع المنجزة"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingStat.isActive}
                  onChange={(e) =>
                    setEditingStat({
                      ...editingStat,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Statistique active (visible sur le site)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingStat(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingStat.value || !editingStat.labelFr}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
