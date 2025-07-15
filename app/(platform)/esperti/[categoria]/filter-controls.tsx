"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCallback } from "react"

export function FilterControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams],
  )

  const handleSearch = (term: string) => {
    router.push(pathname + "?" + createQueryString("q", term))
  }

  const handleOnlineToggle = (checked: boolean) => {
    router.push(pathname + "?" + createQueryString("online", checked ? "true" : ""))
  }

  const handleSortChange = (value: string) => {
    router.push(pathname + "?" + createQueryString("sort", value))
  }

  return (
    <div
      className="mb-12 p-4 md:p-6 bg-blue-900/50 backdrop-blur-sm rounded-2xl border border-yellow-600/20 shadow-lg flex flex-col md:flex-row gap-4 items-center animate-fadeInUp"
      style={{ animationDelay: "200ms" }}
    >
      <div className="relative flex-grow w-full md:w-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        <Input
          type="text"
          placeholder="Cerca per nome o specializzazione..."
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-blue-800/60 border-yellow-600/30 rounded-full pl-12 pr-4 py-3 text-white placeholder:text-white/50 focus:ring-yellow-500 focus:border-yellow-500 h-12"
        />
      </div>
      <div className="flex gap-4 w-full md:w-auto items-center justify-between md:justify-start">
        <div className="flex items-center space-x-2">
          <Switch
            id="online-only"
            checked={searchParams.get("online") === "true"}
            onCheckedChange={handleOnlineToggle}
          />
          <Label htmlFor="online-only" className="text-white">
            Solo Online
          </Label>
        </div>
        <Select defaultValue={searchParams.get("sort") || "rating_desc"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-[180px] bg-blue-800/60 border-yellow-600/30 rounded-full h-12 text-white">
            <SelectValue placeholder="Ordina per" />
          </SelectTrigger>
          <SelectContent className="bg-blue-900 text-white border-yellow-600/30">
            <SelectItem value="rating_desc">Più votati</SelectItem>
            <SelectItem value="price_asc">Prezzo: crescente</SelectItem>
            <SelectItem value="price_desc">Prezzo: decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
