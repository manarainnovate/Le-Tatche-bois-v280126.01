"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  User,
  GripVertical,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: string | null;
  completedAt?: string | null;
  order: number;
  assignedTo?: { id: string; name: string | null } | null;
}

interface ProjectTasksProps {
  projectId: string;
  tasks: Task[];
  locale: string;
  users?: Array<{ id: string; name: string | null }>;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  addTask: string;
  noTasks: string;
  noTasksDescription: string;
  title: string;
  titlePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  priority: string;
  low: string;
  medium: string;
  high: string;
  dueDate: string;
  assignTo: string;
  selectUser: string;
  save: string;
  cancel: string;
  pending: string;
  inProgress: string;
  completed: string;
  cancelled: string;
  delete: string;
  confirmDelete: string;
}

const translations: Record<string, Translations> = {
  fr: {
    addTask: "Ajouter une tâche",
    noTasks: "Aucune tâche",
    noTasksDescription: "Ajoutez des tâches pour suivre l'avancement du projet",
    title: "Titre",
    titlePlaceholder: "Titre de la tâche",
    description: "Description",
    descriptionPlaceholder: "Description de la tâche...",
    priority: "Priorité",
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
    dueDate: "Échéance",
    assignTo: "Assigner à",
    selectUser: "Sélectionner",
    save: "Enregistrer",
    cancel: "Annuler",
    pending: "En attente",
    inProgress: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
    delete: "Supprimer",
    confirmDelete: "Confirmer la suppression ?",
  },
  en: {
    addTask: "Add task",
    noTasks: "No tasks",
    noTasksDescription: "Add tasks to track project progress",
    title: "Title",
    titlePlaceholder: "Task title",
    description: "Description",
    descriptionPlaceholder: "Task description...",
    priority: "Priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    dueDate: "Due date",
    assignTo: "Assign to",
    selectUser: "Select",
    save: "Save",
    cancel: "Cancel",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    delete: "Delete",
    confirmDelete: "Confirm deletion?",
  },
  es: {
    addTask: "Agregar tarea",
    noTasks: "Sin tareas",
    noTasksDescription: "Agregue tareas para seguir el progreso del proyecto",
    title: "Título",
    titlePlaceholder: "Título de la tarea",
    description: "Descripción",
    descriptionPlaceholder: "Descripción de la tarea...",
    priority: "Prioridad",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    dueDate: "Vencimiento",
    assignTo: "Asignar a",
    selectUser: "Seleccionar",
    save: "Guardar",
    cancel: "Cancelar",
    pending: "Pendiente",
    inProgress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    delete: "Eliminar",
    confirmDelete: "¿Confirmar eliminación?",
  },
  ar: {
    addTask: "إضافة مهمة",
    noTasks: "لا مهام",
    noTasksDescription: "أضف مهام لتتبع تقدم المشروع",
    title: "العنوان",
    titlePlaceholder: "عنوان المهمة",
    description: "الوصف",
    descriptionPlaceholder: "وصف المهمة...",
    priority: "الأولوية",
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    dueDate: "تاريخ الاستحقاق",
    assignTo: "إسناد إلى",
    selectUser: "اختر",
    save: "حفظ",
    cancel: "إلغاء",
    pending: "قيد الانتظار",
    inProgress: "جارٍ",
    completed: "مكتملة",
    cancelled: "ملغاة",
    delete: "حذف",
    confirmDelete: "تأكيد الحذف؟",
  },
};

// ═══════════════════════════════════════════════════════════
// Priority & Status Config
// ═══════════════════════════════════════════════════════════

const priorityColors: Record<string, string> = {
  low: "text-gray-500 bg-gray-100 dark:bg-gray-800",
  medium: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  high: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="h-5 w-5 text-gray-400" />,
  in_progress: <Clock className="h-5 w-5 text-blue-500" />,
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  cancelled: <AlertCircle className="h-5 w-5 text-red-500" />,
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectTasks({
  projectId,
  tasks: initialTasks,
  locale,
  users = [],
}: ProjectTasksProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;

  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedToId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const result = await response.json();
      setTasks((prev) => [...prev, result.data]);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedToId: "",
      });
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const result = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? result.data : task))
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const response = await fetch(
        `/api/crm/projects/${projectId}/tasks?taskId=${taskId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const cycleStatus = (currentStatus: string): string => {
    const statusOrder = ["pending", "in_progress", "completed"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return statusOrder[(currentIndex + 1) % statusOrder.length];
  };

  // Group tasks by status
  const groupedTasks = {
    pending: tasks.filter((t) => t.status === "pending"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
    cancelled: tasks.filter((t) => t.status === "cancelled"),
  };

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addTask}
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.title} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={t.titlePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder={t.descriptionPlaceholder}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.priority}
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.dueDate}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.assignTo}
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, assignedToId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">{t.selectUser}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t.noTasks}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.noTasksDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {groupedTasks.in_progress.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t.inProgress} ({groupedTasks.in_progress.length})
              </h4>
              <div className="space-y-2">
                {groupedTasks.in_progress.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    locale={locale}
                    t={t}
                    formatDate={formatDate}
                    priorityColors={priorityColors}
                    statusIcons={statusIcons}
                    updatingTaskId={updatingTaskId}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    cycleStatus={cycleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {groupedTasks.pending.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <Circle className="h-4 w-4" />
                {t.pending} ({groupedTasks.pending.length})
              </h4>
              <div className="space-y-2">
                {groupedTasks.pending.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    locale={locale}
                    t={t}
                    formatDate={formatDate}
                    priorityColors={priorityColors}
                    statusIcons={statusIcons}
                    updatingTaskId={updatingTaskId}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    cycleStatus={cycleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {groupedTasks.completed.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t.completed} ({groupedTasks.completed.length})
              </h4>
              <div className="space-y-2">
                {groupedTasks.completed.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    locale={locale}
                    t={t}
                    formatDate={formatDate}
                    priorityColors={priorityColors}
                    statusIcons={statusIcons}
                    updatingTaskId={updatingTaskId}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    cycleStatus={cycleStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Task Item Component
// ═══════════════════════════════════════════════════════════

interface TaskItemProps {
  task: Task;
  locale: string;
  t: Translations;
  formatDate: (date: string | null | undefined) => string | null;
  priorityColors: Record<string, string>;
  statusIcons: Record<string, React.ReactNode>;
  updatingTaskId: string | null;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  cycleStatus: (currentStatus: string) => string;
}

function TaskItem({
  task,
  t,
  formatDate,
  priorityColors,
  statusIcons,
  updatingTaskId,
  onStatusChange,
  onDelete,
  cycleStatus,
}: TaskItemProps) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-start gap-3 group",
        isOverdue
          ? "border-red-200 dark:border-red-800"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Status Toggle */}
      <button
        onClick={() => onStatusChange(task.id, cycleStatus(task.status))}
        disabled={updatingTaskId === task.id}
        className="flex-shrink-0 mt-0.5"
      >
        {updatingTaskId === task.id ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          statusIcons[task.status]
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "font-medium",
            task.status === "completed"
              ? "text-gray-500 line-through"
              : "text-gray-900 dark:text-white"
          )}
        >
          {task.title}
        </div>

        {task.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {task.description}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Priority */}
          <span
            className={cn(
              "px-2 py-0.5 text-xs rounded-full",
              priorityColors[task.priority]
            )}
          >
            {t[task.priority as keyof Translations] || task.priority}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}

          {/* Assigned To */}
          {task.assignedTo && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <User className="h-3 w-3" />
              {task.assignedTo.name}
            </span>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ProjectTasks;
