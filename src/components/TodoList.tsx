'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
    CheckCircle2,
    CalendarDays,
    ListTodo,
    GripVertical,
    Trash2,
    AlertCircle,
    Clock,
    ChevronDown
} from 'lucide-react';
import {
    toggleTodoComplete,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos
} from '@/lib/actions/todos';
import { useGetTodosQuery } from '@/store/api';
import { useAuth } from '@/contexts/AuthContext';

export default function TodoList() {
    const { user } = useAuth();
    const [todos, setTodos] = useState<any[]>([]);
    const [showAddTodo, setShowAddTodo] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [newTodo, setNewTodo] = useState({
        title: '',
        priority: 'NORMAL',
        dueDate: ''
    });
    const [addingTodo, setAddingTodo] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const { data: fetchedTodos = [], isLoading: loading, refetch } = useGetTodosQuery();

    // We keep local state for instant optimistic drag & drop / toggles
    useEffect(() => {
        if (fetchedTodos) {
            setTodos(fetchedTodos);
        }
    }, [fetchedTodos]);

    const handleToggleTodo = async (id: string, isCompleted: boolean) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !isCompleted } : t));
        const result = await toggleTodoComplete(id, !isCompleted);
        if (!result.success) {
            setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
        } else {
            refetch();
        }
    };

    const handleAddTodo = async () => {
        if (!newTodo.title.trim() || !user) return;
        setAddingTodo(true);

        const result = await createTodo({
            title: newTodo.title.trim(),
            priority: newTodo.priority,
            dueDate: newTodo.dueDate ? new Date(newTodo.dueDate) : undefined,
            createdById: user.id
        });

        if (result.success && result.data) {
            setNewTodo({ title: '', priority: 'NORMAL', dueDate: '' });
            setShowAddTodo(false);
            setShowOptions(false);
            refetch();
        }
        setAddingTodo(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this task?')) return;

        const prev = [...todos];
        setTodos(prev.filter(t => t.id !== id));
        const result = await deleteTodo(id);
        if (!result.success) {
            setTodos(prev);
        } else {
            refetch();
        }
    };

    const startEdit = (e: React.MouseEvent, todo: any) => {
        e.stopPropagation();
        setEditingId(todo.id);
        setEditTitle(todo.title);
    };

    const saveEdit = async (id: string) => {
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }

        const prevTitle = todos.find(t => t.id === id)?.title;
        setTodos(prev => prev.map(t => t.id === id ? { ...t, title: editTitle.trim() } : t));
        setEditingId(null);

        const result = await updateTodo(id, { title: editTitle.trim() });
        if (!result.success) {
            setTodos(prev => prev.map(t => t.id === id ? { ...t, title: prevTitle } : t));
        } else {
            refetch();
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const items = Array.from(todos);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update orderIndex for all items based on new position
        const updatedItems = items.map((item, index) => ({
            ...item,
            orderIndex: index
        }));

        setTodos(updatedItems);

        // Save to backend
        const updates = updatedItems.map((item: any) => ({ id: item.id, orderIndex: item.orderIndex }));
        await reorderTodos(updates);
        refetch();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <ListTodo className="w-4 h-4" />
                    </div>
                    Tasks
                </h3>
                <button
                    onClick={() => setShowAddTodo(v => !v)}
                    className="text-sm font-medium px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-1"
                >
                    <span>+</span> New Task
                </button>
            </div>

            {showAddTodo && (
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex flex-col gap-3">
                        <input
                            autoFocus
                            type="text"
                            value={newTodo.title}
                            onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTodo();
                                if (e.key === 'Escape') setShowAddTodo(false);
                            }}
                            placeholder="What needs to be done?"
                            className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white shadow-sm"
                        />

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                            >
                                {showOptions ? 'Hide Options' : 'Options (Date, Priority)'}
                                <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddTodo(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTodo}
                                    disabled={addingTodo || !newTodo.title.trim()}
                                    className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    {addingTodo ? 'Saving...' : 'Save Task'}
                                </button>
                            </div>
                        </div>

                        {showOptions && (
                            <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-200 mt-1">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Due Date (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <CalendarDays className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={newTodo.dueDate}
                                            onChange={e => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                                            className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                                    <select
                                        value={newTodo.priority}
                                        onChange={e => setNewTodo({ ...newTodo, priority: e.target.value })}
                                        className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white shadow-sm"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">Loading tasks...</div>
                ) : todos.length === 0 && !showAddTodo ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-8">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">You are all caught up!</p>
                        <p className="text-xs text-center max-w-xs">No pending tasks. Click 'New Task' to add something to your list.</p>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="todos">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {todos.map((todo, index) => (
                                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`group flex items-center gap-3 p-3 bg-white border rounded-lg transition-all ${snapshot.isDragging
                                                        ? 'border-blue-300 shadow-md ring-1 ring-blue-100'
                                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                                        } ${todo.isCompleted ? 'opacity-60 bg-slate-50' : ''}`}
                                                >
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 -ml-1"
                                                    >
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>

                                                    <button
                                                        onClick={() => handleToggleTodo(todo.id, todo.isCompleted)}
                                                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${todo.isCompleted
                                                            ? 'bg-emerald-500 border-emerald-500'
                                                            : 'border-slate-300 hover:border-emerald-500'
                                                            }`}
                                                    >
                                                        {todo.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                    </button>

                                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                                        {editingId === todo.id ? (
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                className="w-full text-sm font-medium border-b-2 border-slate-900 focus:outline-none bg-transparent"
                                                                value={editTitle}
                                                                onChange={e => setEditTitle(e.target.value)}
                                                                onBlur={() => saveEdit(todo.id)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') saveEdit(todo.id);
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={(e) => startEdit(e, todo)}
                                                                className={`text-sm font-medium truncate cursor-text ${todo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'
                                                                    }`}>
                                                                {todo.title}
                                                            </span>
                                                        )}

                                                        <div className="flex items-center gap-2 ml-auto shrink-0">
                                                            {todo.priority && todo.priority !== 'NORMAL' && (
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${todo.priority === 'HIGH'
                                                                    ? 'bg-red-50 text-red-600'
                                                                    : 'bg-emerald-50 text-emerald-600'
                                                                    }`}>
                                                                    {todo.priority}
                                                                </span>
                                                            )}
                                                            {todo.dueDate && (
                                                                <span className={`text-[10px] font-semibold flex items-center gap-1 ${new Date(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) && !todo.isCompleted
                                                                    ? 'text-red-500'
                                                                    : 'text-slate-400'
                                                                    }`}>
                                                                    <CalendarDays className="w-3 h-3" />
                                                                    {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleDelete(e, todo.id)}
                                                        className="shrink-0 p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all rounded-md mt-0.5"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        </div>
    );
}
