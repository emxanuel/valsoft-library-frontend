import type { FormEvent } from "react"
import { Search } from "lucide-react"
import { useSearchParams } from "react-router"

import { Button } from "@/features/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/shared/components/ui/card"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"

/**
 * Uncontrolled inputs + FormData on submit so the URL always reflects what is
 * actually in the fields (avoids RHF state getting out of sync with the DOM).
 */
export function LibrarySearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultQ = searchParams.get("q") ?? ""
  const defaultGenre = searchParams.get("genre") ?? ""
  const formKey = `${defaultQ}|${defaultGenre}`

  function applyFilters(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = String(fd.get("q") ?? "").trim()
    const genre = String(fd.get("genre") ?? "").trim()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (q) next.set("q", q)
      else next.delete("q")
      if (genre) next.set("genre", genre)
      else next.delete("genre")
      next.set("page", "1")
      return next
    })
  }

  function clearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("q")
      next.delete("genre")
      next.delete("page")
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & filters</CardTitle>
        <CardDescription>
          Matches title, author, or ISBN. Genre is an exact match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          key={formKey}
          onSubmit={applyFilters}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="library-filter-q">Search</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                <Input
                  id="library-filter-q"
                  name="q"
                  className="pl-8"
                  placeholder="Title, author, ISBN…"
                  defaultValue={defaultQ}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-filter-genre">Genre</Label>
              <Input
                id="library-filter-genre"
                name="genre"
                placeholder="e.g. fiction"
                defaultValue={defaultGenre}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Apply</Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
