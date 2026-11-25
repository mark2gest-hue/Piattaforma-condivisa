'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Trash2,
  Edit2,
  User,
  Sparkles,
  RefreshCw,
  X,
  Save,
  Layers,
  LayoutGrid,
  List,
  Bot,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { Task, Project, Profile, TaskAgentRun } from '@/types/index'
import { TaskStatus, TaskPriority } from '@/types/database.types'
import {
  getTasksAction,
  createTaskAction,
  updateTaskStatusAction,
  updateTaskDetailsAction,
  deleteTaskAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from '@/app/actions/tasks'
import {
  executeAgentTaskAction,
  approveAgentTaskRunAction,
  rejectAgentTaskRunAction,
  getTaskAgentRunsAction,
} from '@/app/actions/agent-tasks'

const COLUMNS: {
  id: TaskStatus
  title: string
  shortTitle: string
  dotClass: string
}[] = [
  { id: 'todo', title: 'Da Fare', shortTitle: 'Da fare', dotClass: 'bg-amber-500' },
  { id: 'in_progress', title: 'In Corso', shortTitle: 'In corso', dotClass: 'bg-[#6366f1]' },
  { id: 'review', title: 'In Revisione', shortTitle: 'Revisione', dotClass: 'bg-purple-500' },
  { id: 'done', title: 'Completato', shortTitle: 'Fatto', dotClass: 'bg-[#10b981]' },
]

const PRIORITY_META: Record<TaskPriority, { label: string; badgeClass: string }> = {
  urgent: {
    label: 'Urgente',
    badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25',
  },
  high: {
    label: 'Alta',
    badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  },
  medium: {
    label: 'Media',
    badgeClass: 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/25',
  },
  low: {
    label: 'Bassa',
    badgeClass: 'text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  },
}

type TaskWithRelations = Task & {
  project?: Project | null
  assignee?: Profile | null
  agent_runs?: TaskAgentRun[]
}

type AgentRunWithProfile = TaskAgentRun & {
  agent?: { full_name?: string | null } | null
}

function stripLeadingEmoji(text: string): string {
  const cleaned = text.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/gu, '').trim()
  return cleaned || text.trim()
}

// Sortable Task Row / Flat Block Component
function SortableTaskItem({
  task,
  isSelected,
  showProjectLabel,
  onSelect,
  onExecuteAgent,
  isExecutingAgent,
}: {
  task: TaskWithRelations
  isSelected: boolean
  showProjectLabel: boolean
  onSelect: (taskId: string) => void
  onExecuteAgent?: (task: TaskWithRelations) => void
  isExecutingAgent?: boolean
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
    opacity: isDragging ? 0.35 : 1,
  }

  const isAgent = task.assignee?.is_agent
  const priorityInfo = PRIORITY_META[task.priority || 'medium'] || PRIORITY_META.medium
  const latestRun =
    Array.isArray(task.agent_runs) && task.agent_runs.length > 0
      ? task.agent_runs[task.agent_runs.length - 1]
      : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(task.id)}
      className={`touch-none group border-b border-[#e5e3dc] dark:border-white/[0.06] px-4 py-3.5 cursor-pointer transition-colors select-none ${
        isSelected
          ? 'bg-[#f7f6f3] dark:bg-[#18181f] border-l-2 border-l-[#6366f1]'
          : 'bg-white dark:bg-[#111114] hover:bg-[#fafaf8] dark:hover:bg-[#16161b] border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {showProjectLabel && (
            <div
              className="text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-400 dark:text-zinc-500 truncate"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {task.project?.title ? stripLeadingEmoji(task.project.title) : 'Generale'}
            </div>
          )}

          <h3 className="text-[13px] font-semibold text-[#111113] dark:text-[#f4f4f5] group-hover:text-[#6366f1] transition-colors line-clamp-2 leading-snug">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta Line */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-sm border text-[10px] font-medium ${priorityInfo.badgeClass}`}
          >
            {priorityInfo.label}
          </span>

          {task.assignee && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border text-[10px] font-medium ${
                isAgent
                  ? 'border-[#6366f1]/35 bg-[#6366f1]/10 text-[#6366f1]'
                  : 'border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#18181c] text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {isAgent ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
              <span className="truncate max-w-[110px]">{task.assignee.full_name || 'Agente'}</span>
            </span>
          )}
        </div>

        <span
          className="inline-flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <Calendar className="h-2.5 w-2.5" />
          {task.due_date ? new Date(task.due_date).toLocaleDateString('it-IT') : '—'}
        </span>
      </div>

      {/* Single Quick Action Pill for Agent Execution / Review */}
      {isAgent && (task.status === 'todo' || task.status === 'in_progress') && onExecuteAgent && (
        <div className="mt-2.5 pt-2 border-t border-[#e5e3dc] dark:border-white/[0.06]">
          <button
            type="button"
            disabled={isExecutingAgent}
            onClick={(e) => {
              e.stopPropagation()
              onExecuteAgent(task)
            }}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-[#6366f1]/30 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[10px] font-semibold text-[#6366f1] transition-colors cursor-pointer disabled:opacity-60"
          >
            {isExecutingAgent ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>In elaborazione...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>Esegui con Agente AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {task.status === 'review' && (
        <div className="mt-2.5 pt-2 border-t border-[#e5e3dc] dark:border-white/[0.06] flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#6366f1] text-white text-[10px] font-semibold">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Revisiona nell&apos;Inspector</span>
          </span>
          {latestRun && latestRun.tokens_used > 0 && (
            <span
              className="text-[10px] text-zinc-400 dark:text-zinc-500"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {latestRun.tokens_used.toLocaleString()} tok
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)

  // Main View: 'kanban' | 'list' | 'projects'
  const [mainView, setMainView] = useState<'kanban' | 'list' | 'projects'>('kanban')
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all')
  const [statusQuickFilter, setStatusQuickFilter] = useState<'all' | 'urgent' | TaskStatus>('all')
  const [isAdmin, setIsAdmin] = useState(false)

  // Right Inspector Pane State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [inspectorTitle, setInspectorTitle] = useState('')
  const [inspectorDesc, setInspectorDesc] = useState('')
  const [inspectorPriority, setInspectorPriority] = useState<TaskPriority>('medium')
  const [inspectorProjectId, setInspectorProjectId] = useState('')
  const [inspectorAssignedTo, setInspectorAssignedTo] = useState('')
  const [inspectorDueDate, setInspectorDueDate] = useState('')
  const [isSavingInspector, setIsSavingInspector] = useState(false)
  const [inspectorRuns, setInspectorRuns] = useState<AgentRunWithProfile[]>([])
  const [isInspectorRunsLoading, setIsInspectorRunsLoading] = useState(false)
  const [inspectorReviewFeedback, setInspectorReviewFeedback] = useState('')
  const [isActionSubmitting, setIsActionSubmitting] = useState(false)

  // Task Modal State (+ Nuovo)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskProjectId, setTaskProjectId] = useState('')
  const [taskAssignedTo, setTaskAssignedTo] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)

  // Agent Execution State
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null)

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectStatus, setProjectStatus] = useState<'active' | 'archived' | 'completed'>('active')
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)

  const [isAddingNewProjectInline, setIsAddingNewProjectInline] = useState(false)
  const [newProjectTitleInput, setNewProjectTitleInput] = useState('')

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const res = await getTasksAction()
    if (res.success && res.tasks) {
      setTasks(res.tasks)
      setProjects(res.projects || [])
      setProfiles(res.profiles || [])
    }
    setLoading(false)
  }, [])

  const fetchUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await (supabase.from('profiles') as any)
        .select('*')
        .eq('id', user.id)
        .single()

      const resolvedRole = (profile as any)?.role || user.user_metadata?.role
      setIsAdmin(resolvedRole === 'admin' || resolvedRole === 'dev')
    } catch (e) {
      console.error('Errore recupero utente corrente in Lavori:', e)
    }
  }

  useEffect(() => {
    fetchData()
    fetchUser()

    // Realtime listener
    const channel = supabase
      .channel('public:tasks_and_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  // Escape closes Right Inspector Pane
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTaskId) {
        setSelectedTaskId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedTaskId])

  const loadInspectorRuns = useCallback(async (taskId: string) => {
    setIsInspectorRunsLoading(true)
    try {
      const res = await getTaskAgentRunsAction(taskId)
      if (res.success) {
        setInspectorRuns((res.runs || []) as AgentRunWithProfile[])
      } else {
        setInspectorRuns([])
      }
    } finally {
      setIsInspectorRunsLoading(false)
    }
  }, [])

  // Sync Inspector local fields when selectedTask changes
  useEffect(() => {
    if (!selectedTask) {
      setInspectorRuns([])
      setInspectorReviewFeedback('')
      return
    }
    setInspectorTitle(selectedTask.title)
    setInspectorDesc(selectedTask.description || '')
    setInspectorPriority(selectedTask.priority || 'medium')
    setInspectorProjectId(selectedTask.project_id || '')
    setInspectorAssignedTo(selectedTask.assigned_to || '')
    setInspectorDueDate(selectedTask.due_date ? selectedTask.due_date.split('T')[0] : '')
    setInspectorReviewFeedback('')
    loadInspectorRuns(selectedTask.id)
  }, [selectedTask?.id, loadInspectorRuns])

  const handleExecuteAgent = async (task: TaskWithRelations) => {
    setExecutingTaskId(task.id)
    try {
      const res = await executeAgentTaskAction(task.id)
      if (res.success) {
        playNotificationSound('chat')
        await fetchData(false)
        setSelectedTaskId(task.id)
        await loadInspectorRuns(task.id)
      } else {
        alert(`Errore esecuzione Agente AI: ${res.error}`)
      }
    } catch (err: any) {
      alert(`Errore imprevisto: ${err?.message}`)
    } finally {
      setExecutingTaskId(null)
    }
  }

  const handleApproveRun = async () => {
    if (!selectedTask || isActionSubmitting) return
    setIsActionSubmitting(true)
    try {
      const latestRun = inspectorRuns[0]
      const res = await approveAgentTaskRunAction(selectedTask.id, latestRun?.id)
      if (res.success) {
        playNotificationSound('chat')
        await fetchData(false)
        await loadInspectorRuns(selectedTask.id)
      } else {
        alert(`Errore approvazione: ${res.error}`)
      }
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleRejectRun = async () => {
    if (!selectedTask || isActionSubmitting) return
    setIsActionSubmitting(true)
    try {
      const latestRun = inspectorRuns[0]
      const res = await rejectAgentTaskRunAction(
        selectedTask.id,
        latestRun?.id,
        inspectorReviewFeedback
      )
      if (res.success) {
        playNotificationSound('chat')
        setInspectorReviewFeedback('')
        await fetchData(false)
        await loadInspectorRuns(selectedTask.id)
      } else {
        alert(`Errore rifiuto: ${res.error}`)
      }
    } finally {
      setIsActionSubmitting(false)
    }
  }

  const handleSaveInspector = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !inspectorTitle.trim() || isSavingInspector) return

    setIsSavingInspector(true)
    try {
      const res = await updateTaskDetailsAction(selectedTask.id, {
        title: inspectorTitle.trim(),
        description: inspectorDesc,
        status: selectedTask.status,
        priority: inspectorPriority,
        projectId: inspectorProjectId || null,
        dueDate: inspectorDueDate || null,
        assignedTo: inspectorAssignedTo || null,
      })

      if (res.success && res.task) {
        setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? res.task : t)))
        playNotificationSound('chat')
      } else {
        alert(`Errore aggiornamento: ${res.error}`)
      }
    } finally {
      setIsSavingInspector(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveTask(active.data.current?.task || null)
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
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const overIndex = prev.findIndex((t) => t.id === overId)
        if (activeIndex === -1 || overIndex === -1) return prev
        if (prev[activeIndex].status === prev[overIndex].status) return prev
        const nextStatus = prev[overIndex].status
        return prev.map((t, idx) => (idx === activeIndex ? { ...t, status: nextStatus } : t))
      })
    }

    // Dragging over a column
    const isOverColumn = over.data.current?.type === 'Column'
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        if (activeIndex === -1) return prev
        const nextStatus = overId as TaskStatus
        if (prev[activeIndex].status === nextStatus) return prev
        return prev.map((t, idx) => (idx === activeIndex ? { ...t, status: nextStatus } : t))
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
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    playNotificationSound('chat')
    await updateTaskStatusAction(taskId, newStatus)
  }

  const handleOpenCreateTaskModal = (colStatus: TaskStatus = 'todo') => {
    setTaskTitle('')
    setTaskDesc('')
    setTaskProjectId(selectedProjectFilter !== 'all' ? selectedProjectFilter : '')
    setTaskAssignedTo('')
    setTaskStatus(colStatus)
    setTaskPriority('medium')
    setTaskDueDate(new Date().toISOString().split('T')[0])
    setIsAddingNewProjectInline(false)
    setIsTaskModalOpen(true)
  }

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || isSubmittingTask) return

    setIsSubmittingTask(true)
    try {
      const res = await createTaskAction({
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        projectId: taskProjectId || null,
        dueDate: taskDueDate || null,
        assignedTo: taskAssignedTo || null,
      })

      if (res.success && res.task) {
        setTasks((prev) => [res.task, ...prev])
        playNotificationSound('chat')
        setIsTaskModalOpen(false)
        setTaskTitle('')
        setTaskDesc('')
        setTaskAssignedTo('')
      } else {
        alert(`Errore creazione compito: ${res.error}`)
      }
    } finally {
      setIsSubmittingTask(false)
    }
  }

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il compito "${title}"?`)) return

    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await deleteTaskAction(taskId)
    playNotificationSound('chat')
  }

  // Project Handlers
  const handleOpenCreateProjectModal = () => {
    setEditingProject(null)
    setProjectTitle('')
    setProjectDesc('')
    setProjectStatus('active')
    setIsProjectModalOpen(true)
  }

  const handleOpenEditProjectModal = (proj: Project) => {
    setEditingProject(proj)
    setProjectTitle(proj.title)
    setProjectDesc(proj.description || '')
    setProjectStatus((proj.status as 'active' | 'archived' | 'completed') || 'active')
    setIsProjectModalOpen(true)
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectTitle.trim() || isSubmittingProject) return

    setIsSubmittingProject(true)

    try {
      if (editingProject) {
        const res = await updateProjectAction(editingProject.id, {
          title: projectTitle,
          description: projectDesc,
          status: projectStatus,
        })

        if (res.success && res.project) {
          setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? res.project : p)))
          playNotificationSound('chat')
        } else {
          alert(`Errore modifica progetto: ${res.error}`)
        }
      } else {
        const res = await createProjectAction(projectTitle, projectDesc)
        if (res.success && res.project) {
          setProjects((prev) => [...prev, res.project])
          playNotificationSound('chat')
        } else {
          alert(`Errore creazione progetto: ${res.error}`)
        }
      }

      setIsProjectModalOpen(false)
      setProjectTitle('')
      setProjectDesc('')
    } finally {
      setIsSubmittingProject(false)
    }
  }

  const handleDeleteProject = async (projectId: string, title: string) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare il progetto "${title}"? I compiti associati rimarranno ma verranno impostati come generali.`
      )
    )
      return

    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    if (selectedProjectFilter === projectId) {
      setSelectedProjectFilter('all')
    }
    await deleteProjectAction(projectId)
    playNotificationSound('chat')
  }

  // Filter tasks by selected project
  const projectFilteredTasks =
    selectedProjectFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.project_id === selectedProjectFilter)

  // Inline counts on current scope
  const urgentCount = projectFilteredTasks.filter(
    (t) => t.priority === 'urgent' && t.status !== 'done'
  ).length
  const todoCount = projectFilteredTasks.filter((t) => t.status === 'todo').length
  const inProgressCount = projectFilteredTasks.filter((t) => t.status === 'in_progress').length
  const reviewCount = projectFilteredTasks.filter((t) => t.status === 'review').length
  const doneCount = projectFilteredTasks.filter((t) => t.status === 'done').length

  const visibleTasks =
    statusQuickFilter === 'all'
      ? projectFilteredTasks
      : statusQuickFilter === 'urgent'
        ? projectFilteredTasks.filter((t) => t.priority === 'urgent' && t.status !== 'done')
        : projectFilteredTasks.filter((t) => t.status === statusQuickFilter)

  const toggleStatusQuickFilter = (target: 'urgent' | TaskStatus) => {
    setStatusQuickFilter((prev) => (prev === target ? 'all' : target))
    if (mainView === 'projects') {
      setMainView('kanban')
    }
  }

  const commandCounters: {
    key: 'urgent' | TaskStatus
    label: string
    count: number
    dotClass: string
  }[] = [
    { key: 'urgent', label: 'Urgenti', count: urgentCount, dotClass: 'bg-rose-500' },
    { key: 'todo', label: 'Da fare', count: todoCount, dotClass: 'bg-amber-500' },
    { key: 'in_progress', label: 'In corso', count: inProgressCount, dotClass: 'bg-[#6366f1]' },
    { key: 'review', label: 'Revisione', count: reviewCount, dotClass: 'bg-purple-500' },
    { key: 'done', label: 'Completati', count: doneCount, dotClass: 'bg-[#10b981]' },
  ]

  const latestInspectorRun = inspectorRuns[0] || null
  const latestRunLatency =
    latestInspectorRun?.completed_at && latestInspectorRun?.created_at
      ? `${Math.max(
          0.1,
          (new Date(latestInspectorRun.completed_at).getTime() -
            new Date(latestInspectorRun.created_at).getTime()) /
            1000
        ).toFixed(1)}s`
      : null

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* A) COMMAND BAR */}
      <div className="min-h-[52px] px-4 sm:px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Title + Live Dot + 5 Inline Clickable Counters */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <h1
              className="text-[15px] font-bold tracking-tight text-[#111113] dark:text-[#f4f4f5]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              Lavori
            </h1>
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#10b981] shrink-0"
              title="Realtime sincronizzato"
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-1 sm:gap-1.5"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {commandCounters.map((item) => {
              const active = statusQuickFilter === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleStatusQuickFilter(item.key)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f] font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-[#18181c]'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.dotClass}`} />
                  <span>{item.label}</span>
                  <span className="tabular-nums font-semibold">{item.count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Segmented Switcher + Refresh + Primary CTA */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="inline-flex items-center bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] p-0.5 rounded-md">
            <button
              type="button"
              onClick={() => setMainView('kanban')}
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer ${
                mainView === 'kanban'
                  ? 'bg-white dark:bg-[#222228] text-[#111113] dark:text-[#f4f4f5] shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => setMainView('list')}
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer ${
                mainView === 'list'
                  ? 'bg-white dark:bg-[#222228] text-[#111113] dark:text-[#f4f4f5] shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setMainView('projects')}
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer ${
                mainView === 'projects'
                  ? 'bg-white dark:bg-[#222228] text-[#111113] dark:text-[#f4f4f5] shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Ambiti ({projects.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            title="Ricarica dal Database"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-[#1c1c21] transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {mainView === 'projects' ? (
            <button
              type="button"
              onClick={handleOpenCreateProjectModal}
              className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ambito</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCreateTaskModal('todo')}
              className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuovo</span>
            </button>
          )}
        </div>
      </div>

      {/* B) TAB STRIP AMBITI */}
      {mainView !== 'projects' && (
        <div className="px-4 sm:px-5 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white/80 dark:bg-[#0d0d0f] flex items-center gap-5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedProjectFilter('all')}
            className={`h-9 inline-flex items-center gap-1.5 text-xs border-b-2 transition-colors shrink-0 cursor-pointer ${
              selectedProjectFilter === 'all'
                ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
            }`}
          >
            <span>Tutti</span>
            <span
              className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {tasks.length}
            </span>
          </button>

          {projects.map((p) => {
            const count = tasks.filter((t) => t.project_id === p.id).length
            const active = selectedProjectFilter === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectFilter(p.id)}
                className={`h-9 inline-flex items-center gap-1.5 text-xs border-b-2 transition-colors shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                <span className="truncate max-w-[180px]">{stripLeadingEmoji(p.title)}</span>
                <span
                  className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* C) CORPO SPLIT (MAIN PANE + RIGHT INSPECTOR PANE) */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* MAIN WORKSPACE PANE */}
        <div className="flex-1 min-w-0 h-full overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" />
            </div>
          ) : mainView === 'kanban' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 min-h-full divide-y md:divide-y-0 md:divide-x divide-[#e5e3dc] dark:divide-white/[0.08]">
                {COLUMNS.map((col) => {
                  const columnTasks = visibleTasks.filter((t) => t.status === col.id)

                  return (
                    <div key={col.id} className="flex flex-col min-w-0">
                      {/* Sticky Hairline Column Header */}
                      <div className="h-10 px-4 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3]/95 dark:bg-[#0d0d0f]/95 backdrop-blur-xs sticky top-0 z-10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${col.dotClass}`} />
                          <h2
                            className="text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#f4f4f5] truncate"
                            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                          >
                            {col.title}
                          </h2>
                          <span
                            className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0"
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                          >
                            {columnTasks.length}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenCreateTaskModal(col.id)}
                          title={`Nuovo compito in ${col.title}`}
                          className="h-6 w-6 inline-flex items-center justify-center rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-[#e5e3dc]/60 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Droppable Column Body */}
                      <SortableColumn
                        colId={col.id}
                        tasks={columnTasks}
                        selectedTaskId={selectedTaskId}
                        showProjectLabel={selectedProjectFilter === 'all'}
                        onSelect={(taskId) => setSelectedTaskId(taskId)}
                        onExecuteAgent={handleExecuteAgent}
                        executingTaskId={executingTaskId}
                      />
                    </div>
                  )
                })}
              </div>

              <DragOverlay>
                {activeTask ? (
                  <div className="w-[300px] border border-[#6366f1]/40 bg-white dark:bg-[#18181f] shadow-xl rounded-md overflow-hidden">
                    <SortableTaskItem
                      task={activeTask}
                      isSelected={false}
                      showProjectLabel={selectedProjectFilter === 'all'}
                      onSelect={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : mainView === 'list' ? (
            /* VIEW: LINEAR-STYLE DENSE TABLE / LIST */
            <div className="min-w-[760px] bg-white dark:bg-[#0d0d0f] min-h-full">
              <div
                className="h-9 px-4 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#111114] sticky top-0 z-10 grid grid-cols-[minmax(220px,1fr)_140px_130px_100px_150px_100px] gap-3 items-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                <span>Compito</span>
                <span>Ambito</span>
                <span>Stato</span>
                <span>Priorità</span>
                <span>Assegnatario</span>
                <span className="text-right">Scadenza</span>
              </div>

              {visibleTasks.length === 0 ? (
                <div className="py-16 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  Nessun compito corrisponde ai filtri attuali.
                </div>
              ) : (
                <div className="divide-y divide-[#e5e3dc] dark:divide-white/[0.07]">
                  {visibleTasks.map((task) => {
                    const colMeta = COLUMNS.find((c) => c.id === task.status) || COLUMNS[0]
                    const priorityInfo =
                      PRIORITY_META[task.priority || 'medium'] || PRIORITY_META.medium
                    const isSelected = selectedTaskId === task.id

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`px-4 py-2.5 grid grid-cols-[minmax(220px,1fr)_140px_130px_100px_150px_100px] gap-3 items-center text-xs cursor-pointer transition-colors border-l-2 ${
                          isSelected
                            ? 'bg-[#f7f6f3] dark:bg-[#18181f] border-l-[#6366f1]'
                            : 'hover:bg-[#fafaf8] dark:hover:bg-[#141418] border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${colMeta.dotClass}`} />
                          <span className="font-medium text-[#111113] dark:text-[#f4f4f5] truncate">
                            {task.title}
                          </span>
                        </div>

                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {task.project?.title ? stripLeadingEmoji(task.project.title) : 'Generale'}
                        </span>

                        <span className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                          {colMeta.title}
                        </span>

                        <div>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-sm border text-[10px] font-medium ${priorityInfo.badgeClass}`}
                          >
                            {priorityInfo.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0 text-[11px] text-zinc-600 dark:text-zinc-300">
                          {task.assignee ? (
                            <>
                              {task.assignee.is_agent ? (
                                <Bot className="h-3 w-3 text-[#6366f1] shrink-0" />
                              ) : (
                                <User className="h-3 w-3 text-zinc-400 shrink-0" />
                              )}
                              <span className="truncate">{task.assignee.full_name || 'Agente'}</span>
                            </>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-600">—</span>
                          )}
                        </div>

                        <span
                          className="text-right text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('it-IT') : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* VIEW: AMBITI & PROGETTI HAIRLINE GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 bg-[#e5e3dc] dark:bg-white/[0.08] gap-px border-b border-[#e5e3dc] dark:border-white/[0.08]">
              {projects.map((proj) => {
                const projTasks = tasks.filter((t) => t.project_id === proj.id)
                const completedCount = projTasks.filter((t) => t.status === 'done').length
                const progressPct =
                  projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0

                return (
                  <div
                    key={proj.id}
                    className="bg-white dark:bg-[#111114] p-5 flex flex-col justify-between gap-4 hover:bg-[#fafaf8] dark:hover:bg-[#15151a] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#18181c] text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {proj.status === 'active'
                            ? 'Attivo'
                            : proj.status === 'completed'
                              ? 'Completato'
                              : 'Archiviato'}
                        </span>
                        <span
                          className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {completedCount}/{projTasks.length} compiti
                        </span>
                      </div>

                      <h3
                        className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                      >
                        {stripLeadingEmoji(proj.title)}
                      </h3>

                      {proj.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#e5e3dc] dark:border-white/[0.06]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 dark:text-zinc-400">Avanzamento</span>
                          <span
                            className="font-semibold text-[#111113] dark:text-[#f4f4f5] tabular-nums"
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                          >
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full bg-[#f7f6f3] dark:bg-[#1c1c21] h-1.5 rounded-xs overflow-hidden">
                          <div
                            className="bg-[#6366f1] h-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectFilter(proj.id)
                            setMainView('kanban')
                          }}
                          className="text-xs font-semibold text-[#6366f1] hover:underline cursor-pointer"
                        >
                          Vedi compiti
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProjectModal(proj)}
                            className="p-1.5 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.06] cursor-pointer"
                            title="Modifica Ambito"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className="p-1.5 rounded-sm text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              title="Elimina Ambito"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* D) RIGHT SLIDE-OVER INSPECTOR PANE */}
        {selectedTask && (
          <>
            {/* Mobile backdrop */}
            <div
              onClick={() => setSelectedTaskId(null)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-[420px] shadow-2xl lg:static lg:shadow-none lg:w-[400px] xl:w-[430px] shrink-0 border-l border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#111114] h-full flex flex-col overflow-hidden">
              {/* Inspector Header: Ambito + 1-click Status Switcher + Close */}
              <div className="px-4 py-3 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] space-y-2.5 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#1c1c21] text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 truncate"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {selectedTask.project?.title
                      ? stripLeadingEmoji(selectedTask.project.title)
                      : 'Generale / Team'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(null)}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/[0.08] cursor-pointer"
                    title="Chiudi Inspector (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* 4 Status 1-Click Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {COLUMNS.map((col) => {
                    const active = selectedTask.status === col.id
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleMoveStatus(selectedTask.id, col.id)}
                        className={`h-7 px-1.5 rounded-sm text-[11px] font-semibold inline-flex items-center justify-center gap-1 border transition-colors cursor-pointer truncate ${
                          active
                            ? 'bg-[#111113] text-white border-[#111113] dark:bg-[#f4f4f5] dark:text-[#0d0d0f] dark:border-[#f4f4f5]'
                            : 'bg-white dark:bg-[#18181c] text-zinc-600 dark:text-zinc-400 border-[#e5e3dc] dark:border-white/[0.08] hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${col.dotClass}`} />
                        <span className="truncate">{col.shortTitle}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Inspector Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <form onSubmit={handleSaveInspector} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Titolo
                    </label>
                    <Input
                      required
                      value={inspectorTitle}
                      onChange={(e) => setInspectorTitle(e.target.value)}
                      className="text-sm font-semibold bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Descrizione &amp; Note Operative
                    </label>
                    <textarea
                      rows={4}
                      value={inspectorDesc}
                      onChange={(e) => setInspectorDesc(e.target.value)}
                      placeholder="Dettagli operativi, link o istruzioni..."
                      className="w-full rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] p-2.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    />
                  </div>

                  {/* 2-Column Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Priorità
                      </label>
                      <select
                        value={inspectorPriority}
                        onChange={(e) => setInspectorPriority(e.target.value as TaskPriority)}
                        className="w-full h-8 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-2 text-xs text-[#111113] dark:text-[#f4f4f5]"
                      >
                        <option value="low">Bassa</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Scadenza
                      </label>
                      <Input
                        type="date"
                        value={inspectorDueDate}
                        onChange={(e) => setInspectorDueDate(e.target.value)}
                        className="h-8 text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Assegnatario
                      </label>
                      <select
                        value={inspectorAssignedTo}
                        onChange={(e) => setInspectorAssignedTo(e.target.value)}
                        className="w-full h-8 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-2 text-xs text-[#111113] dark:text-[#f4f4f5]"
                      >
                        <option value="">Non assegnato</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.is_agent
                              ? `${p.full_name || 'AI Agent'} (Agente AI)`
                              : p.full_name || p.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Ambito
                      </label>
                      <select
                        value={inspectorProjectId}
                        onChange={(e) => setInspectorProjectId(e.target.value)}
                        className="w-full h-8 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-2 text-xs text-[#111113] dark:text-[#f4f4f5]"
                      >
                        <option value="">Generale / Team</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {stripLeadingEmoji(p.title)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingInspector}
                    className="w-full h-8 rounded-md bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSavingInspector ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>Salva modifiche</span>
                  </button>
                </form>

                {/* Integrated AI Agent Block */}
                <div className="pt-4 border-t border-[#e5e3dc] dark:border-white/[0.08] space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-[#6366f1]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#111113] dark:text-[#f4f4f5]">
                        Agente AI
                      </span>
                    </div>

                    {(selectedTask.assignee?.is_agent || inspectorRuns.length > 0) && (
                      <button
                        type="button"
                        disabled={executingTaskId === selectedTask.id}
                        onClick={() => handleExecuteAgent(selectedTask)}
                        className="h-7 px-2.5 rounded-sm border border-[#6366f1]/35 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[#6366f1] text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {executingTaskId === selectedTask.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Elaborazione...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            <span>Esegui con Agente AI</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isInspectorRunsLoading ? (
                    <div className="py-4 flex items-center gap-2 text-[11px] text-zinc-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366f1]" />
                      <span>Caricamento esecuzioni...</span>
                    </div>
                  ) : latestInspectorRun ? (
                    <div className="space-y-2.5 p-3 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f]">
                      <div
                        className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        <span className="font-semibold text-[#6366f1]">
                          {latestInspectorRun.agent?.full_name || 'AI Agent'}
                        </span>
                        <span>
                          {latestInspectorRun.tokens_used > 0
                            ? `${latestInspectorRun.tokens_used.toLocaleString()} tok`
                            : '0 tok'}
                          {latestRunLatency ? ` • ${latestRunLatency}` : ''}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-sm bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.06] text-xs text-[#111113] dark:text-[#f4f4f5] whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                        {latestInspectorRun.output_response || 'Nessun output generato'}
                      </div>

                      {latestInspectorRun.user_feedback && (
                        <div className="p-2 rounded-sm bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px]">
                          <strong>Nota revisione:</strong> {latestInspectorRun.user_feedback}
                        </div>
                      )}

                      {selectedTask.status === 'review' && (
                        <div className="pt-2 space-y-2 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                          <textarea
                            rows={2}
                            value={inspectorReviewFeedback}
                            onChange={(e) => setInspectorReviewFeedback(e.target.value)}
                            placeholder="Feedback per l'agente (richiesto solo in caso di revisione)..."
                            className="w-full rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] p-2 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isActionSubmitting}
                              onClick={handleRejectRun}
                              className="flex-1 h-8 px-2.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.1] bg-white dark:bg-[#18181c] hover:bg-zinc-50 dark:hover:bg-[#222228] text-amber-600 dark:text-amber-400 text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Richiedi Revisione</span>
                            </button>
                            <button
                              type="button"
                              disabled={isActionSubmitting}
                              onClick={handleApproveRun}
                              className="flex-1 h-8 px-2.5 rounded-sm bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                            >
                              <Check className="h-3 w-3" />
                              <span>Approva e Completa</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {selectedTask.assignee?.is_agent
                        ? 'Nessuna esecuzione registrata. Avvia l’Agente AI per generare una bozza.'
                        : 'Assegna questo compito a un Agente AI per eseguirlo automaticamente.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Inspector Footer */}
              <div className="px-4 py-3 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0">
                <span style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  Creato il{' '}
                  {selectedTask.created_at
                    ? new Date(selectedTask.created_at).toLocaleDateString('it-IT')
                    : '—'}
                </span>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id, selectedTask.title)}
                    className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Elimina</span>
                  </button>
                )}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* MODAL 1: Creazione Compito (+ Nuovo) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.1] overflow-hidden">
            <div className="p-4 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Nuovo Compito
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Titolo del Compito *
                </label>
                <Input
                  autoFocus
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Es. Preparare slide per il modulo 1 di AI Pro"
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Descrizione &amp; Note Operative
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Dettagli operativi, link a documenti, checklist o istruzioni per l'Agente AI..."
                  className="w-full rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] p-2.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>

              {/* Assegnatario */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#6366f1]" />
                  <span>Assegna a (Membro Team o Agente AI)</span>
                </label>
                <select
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                >
                  <option value="">Nessun assegnatario (Non assegnato)</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.is_agent
                        ? `${p.full_name || 'AI Agent'} (Agente Autonomo)`
                        : p.full_name || p.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Stato</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                  >
                    <option value="todo">Da Fare</option>
                    <option value="in_progress">In Corso</option>
                    <option value="review">In Revisione (AI / Team)</option>
                    <option value="done">Completato</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Priorità</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Ambito / Progetto Collegato
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewProjectInline(!isAddingNewProjectInline)}
                    className="text-[10px] text-[#6366f1] hover:underline font-bold cursor-pointer"
                  >
                    {isAddingNewProjectInline ? 'Annulla' : '+ Nuovo Ambito/Progetto'}
                  </button>
                </div>

                {isAddingNewProjectInline ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Input
                      autoFocus
                      value={newProjectTitleInput}
                      onChange={(e) => setNewProjectTitleInput(e.target.value)}
                      placeholder="Nome nuovo ambito"
                      className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] h-9"
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
                          setIsAddingNewProjectInline(false)
                          setNewProjectTitleInput('')
                        } else {
                          alert(`Errore: ${res.error}`)
                        }
                      }}
                      className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] text-xs h-9 px-3"
                    >
                      Aggiungi
                    </Button>
                  </div>
                ) : (
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                  >
                    <option value="">Generale / Team</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {stripLeadingEmoji(p.title)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Data di Scadenza
                </label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] h-9"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="border-[#e5e3dc] dark:border-white/[0.1]"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold gap-1.5"
                >
                  {isSubmittingTask ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Crea Compito</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Creazione / Modifica Ambito */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.1] overflow-hidden">
            <div className="p-4 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  {editingProject ? 'Modifica Ambito / Progetto' : 'Nuovo Ambito / Progetto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Titolo Progetto / Ambito *
                </label>
                <Input
                  autoFocus
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Es. Sviluppo Piattaforma AI"
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Descrizione &amp; Obiettivi
                </label>
                <textarea
                  rows={3}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Finalità, stack tecnologico, deliverable e dettagli..."
                  className="w-full rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] p-2.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Stato Progetto
                </label>
                <select
                  value={projectStatus}
                  onChange={(e) =>
                    setProjectStatus(e.target.value as 'active' | 'archived' | 'completed')
                  }
                  className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                >
                  <option value="active">Attivo / In corso</option>
                  <option value="completed">Completato</option>
                  <option value="archived">Archiviato</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="border-[#e5e3dc] dark:border-white/[0.1]"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold gap-1.5"
                >
                  {isSubmittingProject ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{editingProject ? 'Salva Progetto' : 'Crea Progetto'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper for the droppable open lane
function SortableColumn({
  colId,
  tasks,
  selectedTaskId,
  showProjectLabel,
  onSelect,
  onExecuteAgent,
  executingTaskId,
}: {
  colId: TaskStatus
  tasks: TaskWithRelations[]
  selectedTaskId: string | null
  showProjectLabel: boolean
  onSelect: (taskId: string) => void
  onExecuteAgent?: (task: TaskWithRelations) => void
  executingTaskId?: string | null
}) {
  const { setNodeRef } = useDroppable({
    id: colId,
    data: { type: 'Column' },
  })

  return (
    <div ref={setNodeRef} className="flex-1 min-h-[240px] flex flex-col">
      {tasks.length === 0 ? (
        <div className="py-12 px-4 text-center text-[11px] text-zinc-400 dark:text-zinc-600">
          Nessun compito
        </div>
      ) : (
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              showProjectLabel={showProjectLabel}
              onSelect={onSelect}
              onExecuteAgent={onExecuteAgent}
              isExecutingAgent={executingTaskId === task.id}
            />
          ))}
        </SortableContext>
      )}
    </div>
  )
}
