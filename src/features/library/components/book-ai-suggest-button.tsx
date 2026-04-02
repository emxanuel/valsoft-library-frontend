import { useMutation } from "@tanstack/react-query"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/components/ui/dialog"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { cn } from "@/features/shared/lib/utils"
import * as libraryRequests from "@/features/library/services/requests"
import type {
  BookAiEnrichRequest,
  BookAiEnrichResponse,
  BookAiEnrichSuggestions,
} from "@/features/library/services/types"

type BookAiSuggestButtonProps = {
  /** Current title/author from the form (e.g. `watch("title")`). */
  title: string
  author: string
  /** When set, AI suggest is allowed with ISBN alone (no title/author). */
  isbn?: string
  /** Place beside ISBN input instead of full-width right-aligned. */
  compact?: boolean
  buildRequest: () => BookAiEnrichRequest
  onApply: (suggestions: BookAiEnrichSuggestions) => void
}

export function BookAiSuggestButton({
  title,
  author,
  isbn = "",
  compact = false,
  buildRequest,
  onApply,
}: BookAiSuggestButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<BookAiEnrichResponse | null>(null)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)

  const hasTitleAuthor =
    title.trim().length > 0 && author.trim().length > 0
  const hasIsbn = isbn.trim().length > 0
  const canSuggest = hasTitleAuthor || hasIsbn

  const enrich = useMutation({
    mutationFn: (req: BookAiEnrichRequest) => {
      setProgressLabel(null)
      return libraryRequests.enrichBookWithProgress(req, (p) => {
        setProgressLabel(p.message ?? p.step)
      })
    },
    onSuccess: (data) => {
      if (data.requires_confirmation && data.duplicate_candidates.length > 0) {
        setPending(data)
        setConfirmOpen(true)
      } else {
        onApply(data.suggestions)
      }
    },
    onSettled: () => {
      setProgressLabel(null)
    },
  })

  function handleSuggest() {
    enrich.mutate(buildRequest())
  }

  function applyAfterConfirm() {
    if (pending) {
      onApply(pending.suggestions)
      setPending(null)
    }
    setConfirmOpen(false)
  }

  function closeConfirm() {
    setConfirmOpen(false)
    setPending(null)
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          !compact && "justify-end",
        )}
      >
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          disabled={!canSuggest || enrich.isPending}
          onClick={handleSuggest}
        >
          <Sparkles className="size-4" />
          {enrich.isPending ? "Working…" : "AI suggest"}
        </Button>
      </div>

      {enrich.isPending && progressLabel ? (
        <p className="text-muted-foreground text-sm">{progressLabel}</p>
      ) : null}

      {enrich.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(enrich.error, "AI suggestion failed")}
          </AlertDescription>
        </Alert>
      ) : null}

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeConfirm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Possible duplicates</DialogTitle>
            <DialogDescription>
              These catalog entries look similar. Review before applying
              AI-suggested fields.
            </DialogDescription>
          </DialogHeader>
          {pending && pending.duplicate_candidates.length > 0 ? (
            <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
              {pending.duplicate_candidates.map((d) => (
                <li key={d.book_id}>
                  <span className="text-foreground font-medium">
                    {d.title}
                  </span>{" "}
                  — {d.author}
                  {d.isbn ? ` (${d.isbn})` : ""}
                  <span className="block text-xs">{d.reason}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button type="button" onClick={applyAfterConfirm}>
              Apply suggestions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
