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
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Calendar, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Task, Project, Profile } from '@/types/index'
import { TaskStatus, TaskPriority } from '@/types/database.types'

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'Da Fare' },
  { id: 'in_progress', title: 'In Corso' },
  { id: 'done', title: 'Completato' },
]

type TaskWithRelations = Task & { project?: Project; assignee?: Profile }

// Sortable Task Item Component
function SortableTaskItem({ task }: { task: TaskWithRelations }) {
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
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none pb-2">
      <Card className="border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing bg-white group">
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block truncate">
                {task.project?.title || 'Nessun Progetto'}
              </span>
              <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                {task.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-0 space-y-3">
          {task.description && (
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {task.priority === 'urgent' && <Badge variant="destructive">Urgente</Badge>}
            {task.priority === 'high' && <Badge variant="warning">Alta</Badge>}
            {task.priority === 'medium' && <Badge variant="secondary">Media</Badge>}
            {task.priority === 'low' && <Badge variant="outline">Bassa</Badge>}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('it-IT') : '-'}</span>
            </div>
            {task.assignee && (
              <div className="flex items-center gap-1.5" title={task.assignee.full_name}>
                <Avatar
                  fallback={task.assignee.full_name || '?'}
                  src={task.assignee.avatar_url}
                  className="h-6 w-6 text-[10px]"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskProjectId, setNewTaskProjectId] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo')

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: projectsData } = await supabase.from('projects').select('*')
    const { data: tasksData } = await supabase.from('tasks').select('*, project:projects(*), assignee:profiles(*)')
    
    if (projectsData) setProjects(projectsData)
    if (tasksData) {
      // Filter out tasks with statuses not in our 3 columns just in case
      const validTasks = (tasksData as TaskWithRelations[]).filter(t => COLUMNS.some(c => c.id === t.status))
      // Sort by position
      setTasks(validTasks.sort((a, b) => (a.position || 0) - (b.position || 0)))
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

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      
      // Dropping over another task
      if (isOverTask) {
        const overIndex = tasks.findIndex((t) => t.id === overId)
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks]
          newTasks[activeIndex].status = tasks[overIndex].status
          return arrayMove(newTasks, activeIndex, overIndex)
        }
        return arrayMove(tasks, activeIndex, overIndex)
      }

      // Dropping over an empty column area
      if (isOverColumn) {
        const overStatus = over.id as TaskStatus
        if (tasks[activeIndex].status !== overStatus) {
          const newTasks = [...tasks]
          newTasks[activeIndex].status = overStatus
          return arrayMove(newTasks, activeIndex, activeIndex) // Keep at same index relative to array, UI will filter
        }
      }

      return tasks
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the current status of the dragged task from state
    const currentTask = tasks.find(t => t.id === activeId)
    if (!currentTask) return

    const newStatus = currentTask.status

    // Calculate new positions (simplified for now: just update status and let DB default position)
    // In a real app, you'd calculate the precise integer position based on neighbors
    
    // Optimistic UI is already handled by state. Now save to DB.
    await (supabase as any).from('tasks').update({ status: newStatus }).eq('id', activeId)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await (supabase as any).from('tasks').insert({
      title: newTaskTitle,
      status: newTaskStatus,
      project_id: newTaskProjectId || null,
      priority: 'medium',
      created_by: userData.user?.id
    }).select('*, project:projects(*), assignee:profiles(*)').single()

    if (data) {
      setTasks([...tasks, data])
    }
    
    setIsModalOpen(false)
    setNewTaskTitle('')
  }

  return (
    <div className="space-y-6 relative h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kanban Lavori
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestisci i task trascinandoli tra le colonne. Collegato a Supabase in tempo reale.
          </p>
        </div>
        <Button 
          onClick={() => {
            setNewTaskStatus('todo')
            setIsModalOpen(true)
          }} 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm text-sm h-10 px-6 rounded-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Aggiungi Compito</span>
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <div className="flex gap-6 h-full min-w-max items-start">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id)
                
                return (
                  <div key={col.id} className="w-80 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 max-h-full">
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-200/50 flex-shrink-0">
                      <h2 className="font-semibold text-sm text-slate-800">{col.title}</h2>
                      <Badge variant="secondary" className="bg-white">{columnTasks.length}</Badge>
                    </div>

                    {/* Droppable Column Area */}
                    <SortableColumn colId={col.id} tasks={columnTasks} />
                    
                    {/* Add Task Button at bottom of column */}
                    <div className="p-3 pt-0 flex-shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setNewTaskStatus(col.id)
                          setIsModalOpen(true)
                        }}
                        className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 flex items-center justify-start gap-2 h-10"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Aggiungi in {col.title}</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <DragOverlay>
              {activeTask ? <SortableTaskItem task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Simple Custom Modal for adding tasks */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Nuovo Compito</h3>
              <p className="text-xs text-slate-500">Crea un nuovo task nella colonna "{COLUMNS.find(c => c.id === newTaskStatus)?.title}"</p>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Titolo</label>
                <Input 
                  autoFocus
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Es. Preparare slide per il modulo 1" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Progetto Collegato (Opzionale)</label>
                <select 
                  value={newTaskProjectId}
                  onChange={e => setNewTaskProjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Nessun progetto</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annulla</Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Crea Compito</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper for the droppable column

function SortableColumn({ colId, tasks }: { colId: TaskStatus, tasks: TaskWithRelations[] }) {
  const { setNodeRef } = useDroppable({
    id: colId,
    data: { type: 'Column' }
  })

  return (
    <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 min-h-[150px]">
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <SortableTaskItem key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  )
}
