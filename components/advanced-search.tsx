"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Star, Clock, DollarSign } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export interface SearchFilters {
  query: string
  categories: string[]
  minRating: number
  maxPrice: number
  availability: "online" | "offline" | "all"
  sortBy: "rating" | "price" | "experience" | "reviews"
  sortOrder: "asc" | "desc"
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  operatorCount?: number
}

const categories = [
  "Cartomanzia",
  "Astrologia",
  "Numerologia",
  "Canalizzazione",
  "Guarigione Energetica",
  "Rune",
  "Cristalloterapia",
  "Medianità",
]

export function AdvancedSearch({ onFiltersChange, operatorCount = 0 }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    categories: [],
    minRating: 0,
    maxPrice: 100,
    availability: "all",
    sortBy: "rating",
    sortOrder: "desc",
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      categories: [],
      minRating: 0,
      maxPrice: 100,
      availability: "all",
      sortBy: "rating",
      sortOrder: "desc",
    })
  }

  const activeFiltersCount =
    (filters.query ? 1 : 0) +
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice < 100 ? 1 : 0) +
    (filters.availability !== "all" ? 1 : 0)

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Ricerca Avanzata
            {operatorCount > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">({operatorCount} risultati)</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-sky-500/20 text-sky-300">
                {activeFiltersCount} filtri attivi
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sky-400 hover:text-sky-300"
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? "Nascondi" : "Filtri"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cerca per nome, specializzazione o descrizione..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
          />
        </div>

        {isExpanded && (
          <>
            {/* Categories */}
            <div>
              <Label className="text-slate-300 mb-3 block">Categorie</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="border-sky-500/30 data-[state=checked]:bg-sky-500"
                    />
                    <Label htmlFor={category} className="text-sm text-slate-300 cursor-pointer hover:text-white">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <Label className="text-slate-300 mb-3 block flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                Valutazione minima: {filters.minRating > 0 ? `${filters.minRating} stelle` : "Tutte"}
              </Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => updateFilters({ minRating: value })}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0 stelle</span>
                <span>5 stelle</span>
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <Label className="text-slate-300 mb-3 block flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                Prezzo massimo: {filters.maxPrice < 100 ? `€${filters.maxPrice}/min` : "Tutti i prezzi"}
              </Label>
              <Slider
                value={[filters.maxPrice]}
                onValueChange={([value]) => updateFilters({ maxPrice: value })}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>€5/min</span>
                <span>€100+/min</span>
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-slate-300 mb-3 block flex items-center">
                <Clock className="h-4 w-4 mr-1 text-cyan-400" />
                Disponibilità
              </Label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Tutti", color: "bg-slate-600" },
                  { value: "online", label: "Online ora", color: "bg-green-600" },
                  { value: "offline", label: "Offline", color: "bg-red-600" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.availability === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ availability: option.value as any })}
                    className={
                      filters.availability === option.value
                        ? "bg-sky-500 hover:bg-sky-600"
                        : "border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
                    }
                  >
                    <div className={`w-2 h-2 rounded-full ${option.color} mr-2`}></div>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Ordina per</Label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                  className="w-full p-2 bg-slate-800/50 border border-sky-500/30 rounded-md text-white focus:border-sky-400"
                >
                  <option value="rating">Valutazione</option>
                  <option value="price">Prezzo</option>
                  <option value="experience">Esperienza</option>
                  <option value="reviews">Numero recensioni</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Ordine</Label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                  className="w-full p-2 bg-slate-800/50 border border-sky-500/30 rounded-md text-white focus:border-sky-400"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
              >
                <X className="h-4 w-4 mr-2" />
                Cancella tutti i filtri
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
