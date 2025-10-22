"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wand2, Copy, Check } from "lucide-react"
import { generateFixSuggestion } from "@/lib/ai/fix-suggestions"
import { useToast } from "@/hooks/use-toast"

interface FixSuggestionDialogProps {
  issue: {
    id: string
    title: string
    description: string
    category: string
    severity: string
    file_path?: string
    line_number?: number
  }
  codeContext: string
}

export function FixSuggestionDialog({ issue, codeContext }: FixSuggestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerateFix = async () => {
    setIsLoading(true)
    try {
      const fix = await generateFixSuggestion(issue, codeContext)
      setSuggestion(fix)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la sugerencia de corrección",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (suggestion?.fixedCode) {
      navigator.clipboard.writeText(suggestion.fixedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copiado",
        description: "El código corregido se ha copiado al portapapeles",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsOpen(true)
            if (!suggestion) {
              handleGenerateFix()
            }
          }}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Sugerir corrección
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sugerencia de corrección con IA</DialogTitle>
          <DialogDescription>Corrección automática generada por IA para: {issue.title}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Generando sugerencia...</span>
          </div>
        )}

        {suggestion && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Confianza: {suggestion.confidence}%</Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Explicación:</h4>
              <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Pasos para implementar:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {suggestion.steps.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Código original:</h4>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{suggestion.originalCode}</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Código corregido:</h4>
                <Button variant="ghost" size="sm" onClick={handleCopyCode} className="h-8">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{suggestion.fixedCode}</code>
              </pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
