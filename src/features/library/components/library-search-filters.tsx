import { Search } from "lucide-react"
import { useState } from "react"
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

export function LibrarySearchFilters({
  initialQ,
  initialGenre,
}: {
  initialQ: string
  initialGenre: string
}) {
  const [, setSearchParams] = useSearchParams()
  const [localQ, setLocalQ] = useState(initialQ)
  const [localGenre, setLocalGenre] = useState(initialGenre)

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (localQ.trim()) next.set("q", localQ.trim())
    if (localGenre.trim()) next.set("genre", localGenre.trim())
    setSearchParams(next)
  }

  function clearFilters() {
    setLocalQ("")
    setLocalGenre("")
    setSearchParams({})
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
          onSubmit={applyFilters}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                <Input
                  id="q"
                  className="pl-8"
                  placeholder="Title, author, ISBN…"
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                placeholder="e.g. fiction"
                value={localGenre}
                onChange={(e) => setLocalGenre(e.target.value)}
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
