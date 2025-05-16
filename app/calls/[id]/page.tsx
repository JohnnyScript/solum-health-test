import { CallDetails } from "@/components/call-details"
import { CallEvaluation } from "@/components/call-evaluation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para una llamada específica
const callData = {
  id: "CALL-001",
  date: "2024-05-10",
  time: "09:15",
  assistant: "Asistente 1",
  clinic: "Clínica San José",
  duration: 185,
  outcome: "Cita agendada",
  outcome_score: 0.92,
  audioUrl: "/sample-audio.mp3",
  summary:
    "El paciente llamó para agendar una cita con el Dr. García. Se verificó la disponibilidad y se agendó para el día 15 de mayo a las 10:00 am. Se le recordó al paciente que debe llegar 15 minutos antes y traer su identificación y tarjeta de seguro.",
  humanEvaluation: {
    protocol: {
      score: 0.9,
      explanation: "El asistente siguió correctamente el protocolo de saludo, verificación de identidad y despedida.",
    },
    sentiment: {
      label: "Positivo",
      explanation: "El tono fue amable y profesional durante toda la llamada.",
    },
    comments: "Excelente manejo de la llamada. El asistente fue claro y conciso.",
  },
  llmEvaluation: {
    protocol: {
      score: 0.85,
      explanation:
        "El protocolo se siguió correctamente, aunque hubo una pequeña demora en la verificación de identidad.",
    },
    sentiment: {
      label: "Positivo",
      explanation: "Tono amable y servicial durante toda la interacción.",
    },
    comments: "Buena interacción, con oportunidades de mejora en la eficiencia de la verificación.",
  },
}

export default function CallPage({ params }: { params: { id: string } }) {
  // En una implementación real, aquí se buscaría la llamada por ID
  const call = callData

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/calls">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detalles de llamada: {params.id}</h1>
        </div>
        <Button>Guardar evaluación</Button>
      </div>

      <CallDetails call={call} />

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de la llamada</h2>
          <p className="text-gray-700">{call.summary}</p>
        </CardContent>
      </Card>

      <CallEvaluation humanEvaluation={call.humanEvaluation} llmEvaluation={call.llmEvaluation} />
    </div>
  )
}
