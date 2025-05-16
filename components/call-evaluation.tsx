"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getScoreColor, isDifferenceSignificant } from "@/lib/utils"
import { useState } from "react"

interface EvaluationData {
  protocol: {
    score: number
    explanation: string
  }
  sentiment: {
    label: string
    explanation: string
  }
  comments: string
}

interface CallEvaluationProps {
  humanEvaluation: EvaluationData
  llmEvaluation: EvaluationData
}

export function CallEvaluation({ humanEvaluation, llmEvaluation }: CallEvaluationProps) {
  const [comments, setComments] = useState(humanEvaluation.comments)

  const formatScore = (score: number) => {
    return (score * 100).toFixed(0) + "%"
  }

  const hasSignificantDifference = isDifferenceSignificant(humanEvaluation.protocol.score, llmEvaluation.protocol.score)

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Evaluación de la llamada</h2>

        <Tabs defaultValue="comparison">
          <TabsList className="mb-4">
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
            <TabsTrigger value="human">Evaluación Humana</TabsTrigger>
            <TabsTrigger value="llm">Evaluación LLM</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Evaluación Humana</h3>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Protocolo</p>
                    <p className={`text-sm font-bold ${getScoreColor(humanEvaluation.protocol.score)}`}>
                      {formatScore(humanEvaluation.protocol.score)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{humanEvaluation.protocol.explanation}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Sentimiento</p>
                    <p className="text-sm font-medium">{humanEvaluation.sentiment.label}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{humanEvaluation.sentiment.explanation}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Comentarios</p>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Añadir comentarios..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Evaluación LLM</h3>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Protocolo</p>
                    <p className={`text-sm font-bold ${getScoreColor(llmEvaluation.protocol.score)}`}>
                      {formatScore(llmEvaluation.protocol.score)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{llmEvaluation.protocol.explanation}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Sentimiento</p>
                    <p className="text-sm font-medium">{llmEvaluation.sentiment.label}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{llmEvaluation.sentiment.explanation}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Comentarios</p>
                  <p className="text-sm text-muted-foreground">{llmEvaluation.comments}</p>
                </div>
              </div>
            </div>

            {hasSignificantDifference && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Hay una diferencia significativa entre la evaluación humana y la del LLM.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="human">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">Protocolo</p>
                  <p className={`font-bold ${getScoreColor(humanEvaluation.protocol.score)}`}>
                    {formatScore(humanEvaluation.protocol.score)}
                  </p>
                </div>
                <p className="text-muted-foreground">{humanEvaluation.protocol.explanation}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">Sentimiento</p>
                  <p className="font-medium">{humanEvaluation.sentiment.label}</p>
                </div>
                <p className="text-muted-foreground">{humanEvaluation.sentiment.explanation}</p>
              </div>

              <div>
                <p className="font-medium mb-1">Comentarios</p>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Añadir comentarios..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="llm">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">Protocolo</p>
                  <p className={`font-bold ${getScoreColor(llmEvaluation.protocol.score)}`}>
                    {formatScore(llmEvaluation.protocol.score)}
                  </p>
                </div>
                <p className="text-muted-foreground">{llmEvaluation.protocol.explanation}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">Sentimiento</p>
                  <p className="font-medium">{llmEvaluation.sentiment.label}</p>
                </div>
                <p className="text-muted-foreground">{llmEvaluation.sentiment.explanation}</p>
              </div>

              <div>
                <p className="font-medium mb-1">Comentarios</p>
                <p className="text-muted-foreground whitespace-pre-line">{llmEvaluation.comments}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
