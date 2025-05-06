import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Download,
  Filter,
  MapPin,
  Settings,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MapComponent } from "@/components/map-component";
import { StatisticsPanel } from "@/components/statistics-panel";
import { AddressInput, type LocationInfo } from "@/components/adress-input";
const DEFAULT_TIME_SECONDS = 300;

export default function MapPage() {
  const [visualizationMode, setVisualizationMode] = useState("density");
  const [showStatistics, setShowStatistics] = useState(true);
  const [location, setLocation] = useState<LocationInfo>();
  const [isochroneTime, setIsochroneTime] = useState(DEFAULT_TIME_SECONDS);
  const [saison, setSaisonTime] = useState("");

  const handleLocationChange = (location: LocationInfo | undefined) => {
    setLocation(location);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header avec barre de recherche */}
      <header className="border-b bg-white p-4 shadow-sm z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <MapPin className="h-5 w-5 text-teal-600" />
              <span className="ml-2 text-lg font-bold">MédicoMap</span>
            </a>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <AddressInput value="" onChange={handleLocationChange} />
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporter les données</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Partager cette vue</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Paramètres</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <MapComponent location={location} isochroneTime={isochroneTime} saisonTime={saison}/>

        <div className="w-1/5 border-l bg-white overflow-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">
              Paramètres de visualisation
            </h2>

            <div className="space-y-6">
              {/* Mode de visualisation */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mode de visualisation
                </label>
                <Select
                  value={visualizationMode}
                  onValueChange={setVisualizationMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Modes de visualisation</SelectLabel>
                      <SelectItem value="density">
                        Densité de médecins
                      </SelectItem>
                      <SelectItem value="ratio">
                        Ratio médecins/habitants
                      </SelectItem>
                      <SelectItem value="impact">Zones d'impact</SelectItem>
                      <SelectItem value="priority">
                        Zones prioritaires
                      </SelectItem>
                      <SelectItem value="demographic">
                        Données démographiques
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label>
                  Temps de trajet (minutes) :
                  <select
                    value={isochroneTime}
                    onChange={(e) => setIsochroneTime(Number(e.target.value))}
                  >
                    <option value={300}>5 min</option>
                    <option value={600}>10 min</option>
                    <option value={900}>15 min</option>
                    <option value={1200}>20 min</option>
                    <option value={1800}>30 min</option>
                    <option value={2700}>45 min</option>
                  </select>
                </label>
              </div>

              <div>
                <label>
                  Saison :
                  <select
                    value={saison}
                    onChange={(e) => setSaisonTime(e.target.value)}
                  >
                    <option value="">Aucun</option>
                    <option value="ETE">Ete</option>
                    <option value="HIVER">Hiver</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Filtres</label>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-3 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Âge minimum des médecins
                      </label>
                      <div className="flex items-center gap-2">
                        <Slider defaultValue={[30]} max={70} step={1} />
                        <span className="text-xs w-6">30</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Distance maximale (km)
                      </label>
                      <div className="flex items-center gap-2">
                        <Slider defaultValue={[10]} max={50} step={1} />
                        <span className="text-xs w-6">10</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Population minimale
                      </label>
                      <div className="flex items-center gap-2">
                        <Slider
                          defaultValue={[5000]}
                          min={1000}
                          max={50000}
                          step={1000}
                        />
                        <span className="text-xs w-12">5000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Statistiques</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStatistics(!showStatistics)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {showStatistics ? "Masquer" : "Afficher"}
                  </Button>
                </div>

                {showStatistics && (
                  <Tabs defaultValue="summary">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">Résumé</TabsTrigger>
                      <TabsTrigger value="demographics">
                        Démographie
                      </TabsTrigger>
                      <TabsTrigger value="medical">Médical</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                      <StatisticsPanel type="summary" />
                    </TabsContent>
                    <TabsContent value="demographics">
                      <StatisticsPanel type="demographics" />
                    </TabsContent>
                    <TabsContent value="medical">
                      <StatisticsPanel type="medical" />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
