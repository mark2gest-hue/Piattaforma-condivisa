'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  FolderKanban,
  User,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  Save,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { Task, Project, Profile } from '@/types/index'
import { TaskStatus, TaskPriority } from '@/types/database.types'
import {
  getTasksAction,
  createTaskAction,
  updateTaskStatusAction,
  updateTaskDetailsAction,
  deleteTaskAction,
  createProjectAction,
} from '@/app/actions/tasks'

const COLUMNS: { id: TaskStatus; title: string; color: string; badgeVariant: 'secondary' | 'warning' | 'success' }[] = [
  { id: 'todo', title: 'Da Fare', color: 'border-amber-500/30 text-amber-500', badgeVariant: 'secondary' },
  { id: 'in_progress', title: 'In Corso', color: 'border-indigo-500/30 text-indigo-500', badgeVariant: 'warning' },
  { id: 'done', title: 'Completato', color: 'border-emerald-500/30 text-emerald-500', badgeVariant: 'success' },
]

type TaskWithRelations = Task & { project?: Project; assignee?: Profile }

// Sortable Task Item Component
function SortableTaskItem({
  task,
  onEdit,
  onDelete,
  onMoveStatus,
}: {
  task: TaskWithRelations
  onEdit: (task: TaskWithRelations) => void
  onDelete: (taskId: string, title: string) => void
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none pb-2 group">
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 overflow-hidden rounded-xl">
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-1">
                  <FolderKanban className="h-3 w-3 inline" />
                  {task.project?.title || 'Generale / Team'}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(task)
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Modifica Compito"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(task.id, task.title)
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Elimina Compito"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <CardTitle className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                {task.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 pt-0 space-y-2.5">
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {task.priority === 'urgent' && (
              <Badge variant="destructive" className="text-[9px] px-1.5 py-0">🚨 Urgente</Badge>
            )}
            {task.priority === 'high' && (
              <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-medium">⚡ Alta</Badge>
            )}
            {task.priority === 'medium' && (
              <Badge variant="purple" className="text-[9px] px-1.5 py-0 font-medium">Media</Badge>
            )}
            {task.priority === 'low' && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-400">Bassa</Badge>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('it-IT') : 'Senza data'}</span>
            </div>

            {/* Quick Move Buttons */}
            <div className="flex items-center gap-1">
              {task.status !== 'todo' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveStatus(task.id, 'todo')
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 text-[9px]"
                  title="Sposta in Da Fare"
                >
                  ← Da Fare
                </button>
              )}
              {task.status !== 'in_progress' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveStatus(task.id, 'in_progress')
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-700 text-[9px]"
                  title="Sposta in In Corso"
                >
                  In Corso
                </button>
              )}
              {task.status !== 'done' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveStatus(task.id, 'done')
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 text-[9px]"
                  title="Sposta in Completato"
                >
                  Fatto ✓
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskProjectId, setTaskProjectId] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingNewProject, setIsAddingNewProject] = useState(false)
  const [newProjectTitleInput, setNewProjectTitleInput] = useState('')

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchData()

    // Realtime listener
    const channel = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const res = await getTasksAction()
    if (res.success && res.tasks) {
      setTasks(res.tasks)
      setProjects(res.projects || [])
      setProfiles(res.profiles || [])
    }
    setLoading(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveTask(active.data.current?.task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'

    if (!isActiveTask) return

    // Dragging over another task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const overIndex = tasks.findIndex((t) => t.id === overId)

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex].status = tasks[overIndex].status
        }

        return [...tasks]
      })
    }

    // Dragging over a column
    const isOverColumn = over.data.current?.type === 'Column'
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        tasks[activeIndex].status = overId as TaskStatus
        return [...tasks]
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const currentTask = tasks.find((t) => t.id === activeId)
    if (!currentTask) return

    // Update in Supabase
    await updateTaskStatusAction(activeId, currentTask.status)
  }

  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    playNotificationSound('chat')
    await updateTaskStatusAction(taskId, newStatus)
  }

  const handleOpenCreateModal = (colStatus: TaskStatus = 'todo') => {
    setEditingTask(null)
    setTaskTitle('')
    setTaskDesc('')
    setTaskProjectId('')
    setTaskStatus(colStatus)
    setTaskPriority('medium')
    setTaskDueDate(new Date().toISOString().split('T')[0])
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (task: TaskWithRelations) => {
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDesc(task.description || '')
    setTaskProjectId(task.project_id || '')
    setTaskStatus(task.status)
    setTaskPriority(task.priority || 'medium')
    setTaskDueDate(task.due_date ? task.due_date.split('T')[0] : '')
    setIsModalOpen(true)
  }

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      if (editingTask) {
        // Edit existing task
        const res = await updateTaskDetailsAction(editingTask.id, {
          title: taskTitle,
          description: taskDesc,
          status: taskStatus,
          priority: taskPriority,
          projectId: taskProjectId || null,
          dueDate: taskDueDate || null,
        })

        if (res.success && res.task) {
          setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.task : t)))
          playNotificationSound('chat')
        } else {
          alert(`Errore aggiornamento: ${res.error}`)
        }
      } else {
        // Create new task
        const res = await createTaskAction({
          title: taskTitle,
          description: taskDesc,
          status: taskStatus,
          priority: taskPriority,
          projectId: taskProjectId || null,
          dueDate: taskDueDate || null,
        })

        if (res.success && res.task) {
          setTasks((prev) => [res.task, ...prev])
          playNotificationSound('chat')
        } else {
          alert(`Errore creazione compito: ${res.error}`)
        }
      }

      setIsModalOpen(false)
      setTaskTitle('')
      setTaskDesc('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il compito "${title}"?`)) return

    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await deleteTaskAction(taskId)
    playNotificationSound('chat')
  }

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bacheca Lavori & Compiti
            </h1>
            <Badge variant="purple" className="text-[10px] font-mono">
              Realtime Supabase
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pianifica, organizza e sposta le attività del team tra le colonne Da Fare, In Corso e Completato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            className="h-10 text-xs px-3 rounded-xl border-slate-200 dark:border-slate-700 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Aggiorna</span>
          </Button>

          <Button
            onClick={() => handleOpenCreateModal('todo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-xs text-xs h-10 px-5 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            <span>Aggiungi Compito</span>
          </Button>
        </div>
      </div>

      {/* KPI Riassuntivi */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Da Fare</span>
            <p className="text-2xl font-bold text-amber-500 font-mono mt-1">
              {tasks.filter((t) => t.status === 'todo').length}
            </p>
          </div>
          <Clock className="h-6 w-6 text-amber-500/40" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">In Corso</span>
            <p className="text-2xl font-bold text-indigo-500 font-mono mt-1">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-indigo-500/40" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Completati</span>
            <p className="text-2xl font-bold text-emerald-500 font-mono mt-1">
              {tasks.filter((t) => t.status === 'done').length}
            </p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-500/40" />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        /* Kanban Board Area */
        <div className="flex-1 overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[750px] items-start">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id)

                return (
                  <div
                    key={col.id}
                    className="flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
                  >
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            col.id === 'todo'
                              ? 'bg-amber-500'
                              : col.id === 'in_progress'
                              ? 'bg-indigo-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          {col.title}
                        </h2>
                      </div>
                      <Badge variant={col.badgeVariant} className="font-mono text-[10px] px-2 py-0.5">
                        {columnTasks.length}
                      </Badge>
                    </div>

                    {/* Droppable Column Area */}
                    <SortableColumn
                      colId={col.id}
                      tasks={columnTasks}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTask}
                      onMoveStatus={handleMoveStatus}
                    />

                    {/* Add Task Button at bottom of column */}
                    <div className="p-3 pt-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleOpenCreateModal(col.id)}
                        className="w-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center gap-2 h-9 text-xs rounded-xl border border-dashed border-slate-300 dark:border-slate-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Aggiungi compito in {col.title}</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <DragOverlay>
              {activeTask ? (
                <SortableTaskItem
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onMoveStatus={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Modal Creazione / Modifica Compito */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingTask ? 'Modifica Compito' : 'Nuovo Compito'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo del Compito *</label>
                <Input
                  autoFocus
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Es. Preparare slide per il modulo 1 di AI Pro"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Descrizione & Note (Opzionale)</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Dettagli operativi, link a documenti, checklist..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Stato Iniziale</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="todo">🟡 Da Fare</option>
                    <option value="in_progress">🔵 In Corso</option>
                    <option value="done">🟢 Completato</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Priorità</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">⚡ Alta</option>
                    <option value="urgent">🚨 Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ambito / Progetto Collegato</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewProject(!isAddingNewProject)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    {isAddingNewProject ? 'Annulla' : '+ Nuovo Ambito/Progetto'}
                  </button>
                </div>

                {isAddingNewProject ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Input
                      autoFocus
                      value={newProjectTitleInput}
                      onChange={(e) => setNewProjectTitleInput(e.target.value)}
                      placeholder="Nome nuovo ambito (es. 📈 Trading Bot DEX)"
                      className="text-xs dark:bg-slate-800 dark:border-slate-700 h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        if (!newProjectTitleInput.trim()) return
                        const res = await createProjectAction(newProjectTitleInput.trim())
                        if (res.success && res.project) {
                          setProjects([...projects, res.project])
                          setTaskProjectId(res.project.id)
                          setIsAddingNewProject(false)
                          setNewProjectTitleInput('')
                        } else {
                          alert(`Errore: ${res.error}`)
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-3"
                    >
                      Aggiungi
                    </Button>
                  </div>
                ) : (
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="">Generale / Team</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Data di Scadenza</label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="text-xs dark:bg-slate-800 dark:border-slate-700 h-9"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingTask ? 'Salva Modifiche' : 'Crea Compito'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper for the droppable column
function SortableColumn({
  colId,
  tasks,
  onEdit,
  onDelete,
  onMoveStatus,
}: {
  colId: TaskStatus
  tasks: TaskWithRelations[]
  onEdit: (task: TaskWithRelations) => void
  onDelete: (taskId: string, title: string) => void
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void
}) {
  const { setNodeRef } = useDroppable({
    id: colId,
    data: { type: 'Column' },
  })

  return (
    <div ref={setNodeRef} className="p-3 overflow-y-auto flex flex-col gap-1 min-h-[300px] max-h-[60vh]">
      {tasks.length === 0 ? (
        <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px]">Nessun compito in questa colonna</span>
        </div>
      ) : (
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveStatus={onMoveStatus}
            />
          ))}
        </SortableContext>
      )}
    </div>
  )
}
