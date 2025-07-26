"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Star, Clock, DollarSign, Sparkles, TrendingUp, Heart, Zap } from "lucide-react"
import { matchingAlgorithm, type MatchingCriteria } from "@/lib/matching-algorithm"
import { recommendationSystem } from "@/lib/recommendation-system"

export interface AdvancedSearchFilters {
  query: string
  categories: string[]
  minRating: number
  maxPrice: number
  availability: "online" | "offline" | "all"
  languages: string[]
  experience: number[]
  responseTime: number
  consultationType: "chat" | "call" | "email" | "all"
  sortBy: "relevance" | "rating" | "price" | "experience" | "response_time"
  sortOrder: "asc" | "desc"
  location?: string
  timeSlot?: string
}

interface AdvancedSearchSystemProps {
  onFiltersChange: (filters: AdvancedSearchFilters) => void
  onOperatorsFound: (operators: any[]) => void
  clientId?: string
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
  "Tarocchi",
  "Sibille",
  "Oracoli",
  "Tema Natale",
]

const languages = [
  { code: "it", name: "Italiano" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
]

const timeSlots = ["morning", "afternoon", "evening", "night", "weekend"]

export function AdvancedSearchSystem({
  onFiltersChange,
  onOperatorsFound,
  clientId = "user1",
}: AdvancedSearchSystemProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: "",
    categories: [],
    minRating: 0,
    maxPrice: 100,
    availability: "all",
    languages: [],
    experience: [0, 20],
    responseTime: 30,
    consultationType: "all",
    sortBy: "relevance",
    sortOrder: "desc",
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Carica raccomandazioni
  useEffect(() => {
    const loadRecommendations = async () => {
      const recs = recommendationSystem.generateRecommendations(clientId)
      setRecommendations(recs)
    }
    loadRecommendations()
  }, [clientId])

  // Genera suggerimenti di ricerca
  useEffect(() => {
    if (filters.query.length > 2) {
      const suggestions = [
        `${filters.query} amore`,
        `${filters.query} futuro`,
        `${filters.query} lavoro`,
        `${filters.query} famiglia`,
      ].filter((s) => s !== filters.query)
      setSearchSuggestions(suggestions.slice(0, 3))
    } else {
      setSearchSuggestions([])
    }
  }, [filters.query])

  // Esegui ricerca con algoritmo di matching
  const performSearch = useMemo(() => {
    return async () => {
      if (!filters.query && filters.categories.length === 0) return

      setIsSearching(true)

      const matchingCriteria: MatchingCriteria = {
        clientId,
        preferredCategories: filters.categories,
        maxPricePerMinute: filters.maxPrice < 100 ? filters.maxPrice : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        preferredLanguages: filters.languages,
        urgency: "medium",
        consultationType: filters.consultationType === "all" ? "chat" : (filters.consultationType as any),
      }

      // Aggiungi query di ricerca alla cronologia
      if (filters.query) {
        recommendationSystem.addSearchQuery(clientId, filters.query)
      }

      const matches = matchingAlgorithm.findBestMatches(matchingCriteria)

      // Simula operatori trovati (in produzione verrebbero dal database)
      const operators = matches
        .map((match) => ({
          id: match.operatorId,
          matchScore: match.score,
          estimatedWaitTime: match.estimatedWaitTime,
          reasons: match.reasons,
          ...matchingAlgorithm.getOperatorProfile(match.operatorId),
        }))
        .filter((op) => op.name) // Filtra operatori validi

      onOperatorsFound(operators)
      setIsSearching(false)
    }
  }, [filters, clientId, onOperatorsFound])

  useEffect(() => {
    performSearch()
    onFiltersChange(filters)
  }, [filters, performSearch, onFiltersChange])

  const updateFilters = (updates: Partial<AdvancedSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const toggleLanguage = (langCode: string) => {
    const newLanguages = filters.languages.includes(langCode)
      ? filters.languages.filter((l) => l !== langCode)
      : [...filters.languages, langCode]
    updateFilters({ languages: newLanguages })
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      categories: [],
      minRating: 0,
      maxPrice: 100,
      availability: "all",
      languages: [],
      experience: [0, 20],
      responseTime: 30,
      consultationType: "all",
      sortBy: "relevance",
      sortOrder: "desc",
    })
  }

  const activeFiltersCount =
    (filters.query ? 1 : 0) +
    filters.categories.length +
    filters.languages.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice < 100 ? 1 : 0) +
    (filters.availability !== "all" ? 1 : 0) +
    (filters.consultationType !== "all" ? 1 : 0)

  const applyRecommendation = (rec: any) => {
    if (rec.type === "category" && rec.category) {
      toggleCategory(rec.category)
    } else if (rec.type === "operator" && rec.operatorId) {
      updateFilters({ query: rec.title })
    }
  }

  return (
    <div className="space-y-6">
      {/* Raccomandazioni */}
      {recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Raccomandazioni per te
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendations.slice(0, 4).map((rec, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applyRecommendation(rec)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  {rec.type === "operator" && <Heart className="h-3 w-3 mr-1" />}
                  {rec.type === "category" && <Star className="h-3 w-3 mr-1" />}
                  {rec.type === "promotion" && <Zap className="h-3 w-3 mr-1" />}
                  {rec.title}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {rec.confidence}%
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ricerca Principale */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Ricerca Intelligente
              {isSearching && (
                <div className="ml-2 w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
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
                {isExpanded ? "Nascondi" : "Filtri Avanzati"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Barra di Ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cerca per nome, specializzazione o descrizione..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
            />

            {/* Suggerimenti di ricerca */}
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-sky-500/30 rounded-md shadow-lg z-10">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => updateFilters({ query: suggestion })}
                    className="w-full text-left px-3 py-2 hover:bg-sky-500/20 text-slate-300 hover:text-white transition-colors"
                  >
                    <TrendingUp className="h-3 w-3 inline mr-2" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtri Rapidi */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.availability === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ availability: filters.availability === "online" ? "all" : "online" })}
              className={
                filters.availability === "online"
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-green-500/30 text-green-300 hover:bg-green-500/10"
              }
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Online Ora
            </Button>

            <Button
              variant={filters.minRating >= 4.5 ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ minRating: filters.minRating >= 4.5 ? 0 : 4.5 })}
              className={
                filters.minRating >= 4.5
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
              }
            >
              <Star className="h-3 w-3 mr-1" />
              Top Rated
            </Button>

            <Button
              variant={filters.maxPrice <= 3 ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ maxPrice: filters.maxPrice <= 3 ? 100 : 3 })}
              className={
                filters.maxPrice <= 3
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              }
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Economico
            </Button>
          </div>

          {isExpanded && (
            <>
              {/* Categorie */}
              <div>
                <Label className="text-slate-300 mb-3 block">Specializzazioni</Label>
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

              {/* Valutazione e Prezzo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

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
                </div>
              </div>

              {/* Lingue */}
              <div>
                <Label className="text-slate-300 mb-3 block">Lingue</Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={filters.languages.includes(lang.code) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLanguage(lang.code)}
                      className={
                        filters.languages.includes(lang.code)
                          ? "bg-sky-500 hover:bg-sky-600"
                          : "border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
                      }
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Esperienza e Tempo di Risposta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-300 mb-3 block">
                    Esperienza: {filters.experience[0]}-{filters.experience[1]} anni
                  </Label>
                  <Slider
                    value={filters.experience}
                    onValueChange={(value) => updateFilters({ experience: value })}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-3 block flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-cyan-400" />
                    Tempo di risposta max: {filters.responseTime} min
                  </Label>
                  <Slider
                    value={[filters.responseTime]}
                    onValueChange={([value]) => updateFilters({ responseTime: value })}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Tipo di Consulenza e Ordinamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Tipo di Consulenza</Label>
                  <Select
                    value={filters.consultationType}
                    onValueChange={(value) => updateFilters({ consultationType: value as any })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-sky-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i tipi</SelectItem>
                      <SelectItem value="chat">💬 Chat</SelectItem>
                      <SelectItem value="call">📞 Chiamata</SelectItem>
                      <SelectItem value="email">📧 Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Ordina per</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
                    <SelectTrigger className="bg-slate-800/50 border-sky-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Rilevanza</SelectItem>
                      <SelectItem value="rating">Valutazione</SelectItem>
                      <SelectItem value="price">Prezzo</SelectItem>
                      <SelectItem value="experience">Esperienza</SelectItem>
                      <SelectItem value="response_time">Tempo di risposta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Ordine</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) => updateFilters({ sortOrder: value as any })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-sky-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cancella Filtri */}
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
    </div>
  )
}
