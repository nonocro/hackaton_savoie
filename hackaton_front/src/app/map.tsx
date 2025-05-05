import type React from "react";

import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Download,
  Filter,
  Layers,
  MapPin,
  Minus,
  Plus,
  Search,
  Settings,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] = useState("density");
  const [showStatistics, setShowStatistics] = useState(true);
  const [mapZoom, setMapZoom] = useState(10);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recherche d'adresse:", searchQuery);
    // Ici, vous intégreriez un service de géocodage pour trouver l'adresse
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    // Charger les données pour la zone sélectionnée
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
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une adresse ou une zone..."
                className="pl-8 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
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

      {/* Contenu principal avec carte et panneau latéral */}
      <div className="flex flex-1 overflow-hidden">
        {/* Carte principale */}
        <div className="relative flex-1 overflow-hidden">
          <MapComponent />

          {/* Contrôles de carte en haut à gauche */}
          <div className="absolute left-4 top-4 z-10">
            <Card className="w-auto">
              <CardContent className="p-2">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMapZoom(mapZoom + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMapZoom(mapZoom - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Separator className="my-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Layers className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>
                        Couches cartographiques
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm border border-gray-300 bg-teal-100"></div>
                            <span>Densité de médecins</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm border border-gray-300 bg-blue-100"></div>
                            <span>Données démographiques</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm border border-gray-300 bg-orange-100"></div>
                            <span>Zones d'impact</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Légende en bas à gauche */}
          <div className="absolute bottom-4 left-4 z-10">
            <Card className="w-auto">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Densité de médecins généralistes
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">
                      Très faible (&lt; 1 pour 2000 hab.)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs">
                      Faible (1 pour 1500-2000 hab.)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">
                      Moyenne (1 pour 1000-1500 hab.)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">
                      Bonne (1 pour 700-1000 hab.)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                    <span className="text-xs">
                      Très bonne (&gt; 1 pour 700 hab.)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panneau latéral droit */}
        <div className="w-80 border-l bg-white overflow-auto">
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

              {/* Filtres */}
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

              {/* Sélection de zone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Zone sélectionnée</label>
                <Select
                  value={selectedArea || ""}
                  onValueChange={handleAreaSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Régions</SelectLabel>
                      <SelectItem value="ile-de-france">
                        Île-de-France
                      </SelectItem>
                      <SelectItem value="auvergne-rhone-alpes">
                        Auvergne-Rhône-Alpes
                      </SelectItem>
                      <SelectItem value="nouvelle-aquitaine">
                        Nouvelle-Aquitaine
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Départements</SelectLabel>
                      <SelectItem value="75">Paris (75)</SelectItem>
                      <SelectItem value="69">Rhône (69)</SelectItem>
                      <SelectItem value="33">Gironde (33)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Statistiques */}
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
