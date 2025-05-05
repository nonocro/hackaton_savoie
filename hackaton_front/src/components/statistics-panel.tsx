import { BarChart, LineChart, PieChart } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StatisticsPanelProps {
  type: "summary" | "demographics" | "medical"
}

export function StatisticsPanel({ type }: StatisticsPanelProps) {
  // Dans une implémentation réelle, ces données viendraient d'une API
  const summaryData = {
    population: 24567,
    doctors: 8,
    ratio: "1:3071",
    priority: "Élevé",
    averageAge: 47,
  }

  const demographicsData = {
    ageGroups: [
      { group: "0-14 ans", percentage: 18 },
      { group: "15-29 ans", percentage: 20 },
      { group: "30-44 ans", percentage: 22 },
      { group: "45-59 ans", percentage: 19 },
      { group: "60-74 ans", percentage: 14 },
      { group: "75+ ans", percentage: 7 },
    ],
    populationGrowth: "+1.2%",
    density: "342 hab/km²",
  }

  const medicalData = {
    specialties: [
      { name: "Généralistes", count: 8 },
      { name: "Pédiatres", count: 2 },
      { name: "Cardiologues", count: 1 },
      { name: "Dermatologues", count: 0 },
      { name: "Gynécologues", count: 1 },
    ],
    averageConsultations: 28,
    averageWaitTime: "6 jours",
  }

  if (type === "summary") {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Population</p>
              <p className="text-sm font-medium">{summaryData.population.toLocaleString()} hab.</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Médecins généralistes</p>
              <p className="text-sm font-medium">{summaryData.doctors} praticiens</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <p className="text-xs text-gray-500">Ratio médecin/habitants</p>
              <p className="text-xs font-medium text-red-500">{summaryData.ratio}</p>
            </div>
            <Progress value={32} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <p className="text-xs text-gray-500">Indice de priorité</p>
              <p className="text-xs font-medium">{summaryData.priority}</p>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <BarChart className="h-4 w-4 text-teal-600 mr-1" />
              <span className="text-xs font-medium">Voir rapport complet</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "demographics") {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium">Répartition par âge</p>
            <div className="space-y-2">
              {demographicsData.ageGroups.map((group) => (
                <div key={group.group} className="space-y-1">
                  <div className="flex justify-between">
                    <p className="text-xs">{group.group}</p>
                    <p className="text-xs">{group.percentage}%</p>
                  </div>
                  <Progress value={group.percentage} className="h-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Croissance</p>
              <p className="text-sm font-medium">{demographicsData.populationGrowth}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Densité</p>
              <p className="text-sm font-medium">{demographicsData.density}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <LineChart className="h-4 w-4 text-teal-600 mr-1" />
              <span className="text-xs font-medium">Tendances démographiques</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "medical") {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium">Praticiens par spécialité</p>
            <div className="space-y-2">
              {medicalData.specialties.map((specialty) => (
                <div key={specialty.name} className="flex justify-between items-center">
                  <p className="text-xs">{specialty.name}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: specialty.count }).map((_, i) => (
                      <div key={i} className="h-3 w-3 rounded-full bg-teal-500"></div>
                    ))}
                    {Array.from({ length: 5 - specialty.count }).map((_, i) => (
                      <div key={i} className="h-3 w-3 rounded-full bg-gray-200"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Consultations/semaine</p>
              <p className="text-sm font-medium">{medicalData.averageConsultations}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Délai moyen</p>
              <p className="text-sm font-medium">{medicalData.averageWaitTime}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <PieChart className="h-4 w-4 text-teal-600 mr-1" />
              <span className="text-xs font-medium">Analyse détaillée</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
