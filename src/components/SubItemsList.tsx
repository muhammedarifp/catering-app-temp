'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Search, Check, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { api, useGetIngredientsQuery } from '@/store/api'
import { addIngredient, updateIngredient, deleteIngredient } from '@/lib/actions/ingredients'

export default function SubItemsList() {
    const dispatch = useDispatch()
    const { data: ingredients = [], isLoading, refetch } = useGetIngredientsQuery({})
    const [searchQuery, setSearchQuery] = useState('')

    const [isAddMode, setIsAddMode] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)

    // Form states
    const [name, setName] = useState('')
    const [pricePerUnit, setPricePerUnit] = useState<number | ''>('')
    const [unit, setUnit] = useState('kg')

    const resetForm = () => {
        setIsAddMode(false)
        setEditId(null)
        setName('')
        setPricePerUnit('')
        setUnit('kg')
    }

    const handleSave = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault()
        if (!name || pricePerUnit === '' || isNaN(Number(pricePerUnit))) return

        try {
            if (isAddMode) {
                await addIngredient({
                    name,
                    pricePerUnit: Number(pricePerUnit),
                    unit,
                })
            } else if (editId) {
                await updateIngredient(editId, {
                    name,
                    pricePerUnit: Number(pricePerUnit),
                    unit,
                })
            }
        } catch (error) {
            console.error('Failed to save ingredient:', error)
        }

        resetForm()
        refetch()
        dispatch(api.util.invalidateTags(['Dish']))
    }

    const startEdit = (ingredient: any) => {
        setIsAddMode(false)
        setEditId(ingredient.id)
        setName(ingredient.name)
        setPricePerUnit(ingredient.pricePerUnit)
        setUnit(ingredient.unit)
    }

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This may break references in existing dishes.`)) {
            await deleteIngredient(id)
            refetch()
            dispatch(api.util.invalidateTags(['Dish']))
        }
    }

    const filtered = ingredients.filter((ing: any) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading sub items...</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 focus:ring-zinc-900 rounded-lg"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                {!isAddMode && !editId && (
                    <button
                        onClick={() => setIsAddMode(true)}
                        className="flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Add Sub Item
                    </button>
                )}
            </div>

            <div className="bg-white border border-zinc-200 overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3 font-medium text-zinc-500">Ingredient Name</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Unit Price</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-center">Unit</th>
                            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isAddMode && (
                            <tr className="bg-blue-50/50">
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Onion"
                                        className="w-full px-2 py-1 text-sm border border-zinc-300 rounded"
                                        autoFocus
                                    />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-zinc-500">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={pricePerUnit}
                                            onChange={(e) => setPricePerUnit(e.target.value ? Number(e.target.value) : 0)}
                                            className="w-24 px-2 py-1 text-sm border border-zinc-300 rounded text-right"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="px-2 py-1 text-sm border border-zinc-300 rounded"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="l">l</option>
                                        <option value="ml">ml</option>
                                        <option value="piece">piece</option>
                                        <option value="packet">packet</option>
                                        <option value="dozen">dozen</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Save">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button onClick={resetForm} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded" title="Cancel">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {filtered.map((ing: any) => (
                            <tr key={ing.id} className="hover:bg-zinc-50 group">
                                <td className="px-4 py-3 font-medium text-zinc-900">
                                    {editId === ing.id ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-zinc-300 rounded"
                                        />
                                    ) : ing.name}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editId === ing.id ? (
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="text-zinc-500">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={pricePerUnit}
                                                onChange={(e) => setPricePerUnit(e.target.value ? Number(e.target.value) : 0)}
                                                className="w-24 px-2 py-1 text-sm border border-zinc-300 rounded text-right"
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-medium text-zinc-900">₹{ing.pricePerUnit}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center text-zinc-500">
                                    {editId === ing.id ? (
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="px-2 py-1 text-sm border border-zinc-300 rounded"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="l">l</option>
                                            <option value="ml">ml</option>
                                            <option value="piece">piece</option>
                                            <option value="packet">packet</option>
                                            <option value="dozen">dozen</option>
                                        </select>
                                    ) : ing.unit}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editId === ing.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Save">
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button onClick={resetForm} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded" title="Cancel">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(ing)}
                                                className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ing.id, ing.name)}
                                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isAddMode && filtered.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                        {searchQuery ? 'No sub items match your search.' : 'No sub items available. Click "Add Sub Item" to create one.'}
                    </div>
                )}
            </div>
        </div>
    )
}
