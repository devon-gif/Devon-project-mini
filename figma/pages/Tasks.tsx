"use client";

import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { tasks } from '../data/mockData';
import type { Task } from '../data/mockData';
import {
  Plus, LayoutList, Columns3, Mail, Phone, Building2, UserPlus,
  Calendar, Flag, CheckCircle, Circle, Clock, Bot, Sparkles,
  GripVertical, ChevronRight,
} from 'lucide-react';

const typeIcon: Record<string, typeof Mail> = {
  follow_up: Mail,
  call: Phone,
  research: Building2,
  intro_request: UserPlus,
};

const priorityColor: Record<string, string> = {
  high: 'text-amber-500',
  medium: 'text-[#FFD600]',
  low: 'text-gray-300',
};

export function Tasks() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [taskList, setTaskList] = useState(tasks);

  const columns = [
    { id: 'todo', label: 'To Do', tasks: taskList.filter(t => t.status === 'todo') },
    { id: 'in_progress', label: 'In Progress', tasks: taskList.filter(t => t.status === 'in_progress') },
    { id: 'done', label: 'Done', tasks: taskList.filter(t => t.status === 'done') },
  ];

  const toggleTaskStatus = (taskId: string) => {
    setTaskList(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextStatus = t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo';
      return { ...t, status: nextStatus };
    }));
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h1 className="text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{taskList.filter(t => t.status !== 'done').length} active tasks</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${view === 'kanban' ? 'bg-[#FFD600] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Columns3 className="h-3.5 w-3.5" />Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${view === 'list' ? 'bg-[#FFD600] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutList className="h-3.5 w-3.5" />List
            </button>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* AI Nudge */}
      <div className="mx-6 mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600" style={{ fontWeight: 500 }}>AI Nudge</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">David Zhang at Databricks responded enthusiastically — prioritize sending the proposal today. Sarah Chen suggested Tuesday 2pm for the demo call.</p>
          </div>
          <button className="shrink-0 rounded-lg bg-blue-100 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-200 transition-colors">
            Got it
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        {view === 'kanban' ? (
          <div className="flex gap-4 h-full overflow-x-auto">
            {columns.map(col => (
              <div key={col.id} className="w-[320px] shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm text-gray-600">{col.label}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-500">{col.tasks.length}</span>
                  </div>
                  <Plus className="h-4 w-4 text-gray-300 cursor-pointer hover:text-gray-500 transition-colors" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2.5">
                  {col.tasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto space-y-2">
            {taskList.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTaskStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const Icon = typeIcon[task.type];
  return (
    <GlassCard className="p-3.5">
      <div className="flex items-start gap-2.5">
        <button onClick={() => onToggle(task.id)} className="mt-0.5 shrink-0">
          {task.status === 'done' ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300 hover:text-[#2563EB] transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 rounded-lg bg-gray-50 px-1.5 py-0.5">
              <Icon className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] text-gray-400">{task.type.replace('_', ' ')}</span>
            </div>
            {task.linkedAccount && (
              <span className="text-[10px] text-gray-400">{task.linkedAccount}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="h-3 w-3" />{task.dueDate}
            </span>
            <Flag className={`h-3 w-3 ${priorityColor[task.priority]}`} />
          </div>
        </div>
      </div>
      {task.notes && (
        <p className="text-[11px] text-gray-400 mt-2 pl-6 truncate">{task.notes}</p>
      )}
    </GlassCard>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const Icon = typeIcon[task.type];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 transition-colors">
      <GripVertical className="h-4 w-4 text-gray-200 cursor-grab" />
      <button onClick={() => onToggle(task.id)}>
        {task.status === 'done' ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : (
          <Circle className="h-4 w-4 text-gray-300 hover:text-[#2563EB] transition-colors" />
        )}
      </button>
      <Flag className={`h-3.5 w-3.5 shrink-0 ${priorityColor[task.priority]}`} />
      <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.title}</span>
      <StatusChip label={task.type.replace('_', ' ')} variant="default" />
      {task.linkedAccount && <span className="text-xs text-gray-400">{task.linkedAccount}</span>}
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="h-3 w-3" />{task.dueDate}
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </div>
  );
}