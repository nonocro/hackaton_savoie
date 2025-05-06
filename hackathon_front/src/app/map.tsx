import { useState } from 'react';

import { ArrowLeft, Download, MapPin, Settings, Share2 } from 'lucide-react';

import { AddressInput, type LocationInfo } from '@/components/adress-input';
import { MapComponent } from '@/components/map-component';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DEFAULT_TIME_SECONDS = 300;

export default function MapPage() {
	const [location, setLocation] = useState<LocationInfo>();
	const [isochroneTime, setIsochroneTime] = useState(DEFAULT_TIME_SECONDS);
	const [saison, setSaisonTime] = useState('');

	const handleLocationChange = (location: LocationInfo | undefined) => {
		setLocation(location);
	};

	return (
		<div className="flex h-screen flex-col">
			{/* Header avec barre de recherche */}
			<header className="z-10 border-b bg-white p-4 shadow-sm">
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
					<div className="mx-4 max-w-xl flex-1">
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
				<MapComponent location={location} isochroneTime={isochroneTime} saisonTime={saison} />

				<div className="w-1/5 overflow-auto border-l bg-white">
					<div className="p-4">
						<h2 className="mb-4 text-lg font-bold">Paramètres de visualisation</h2>

						<div className="space-y-6">
							<div>
								<label>
									Temps de trajet (minutes) :
									<select value={isochroneTime} onChange={(e) => setIsochroneTime(Number(e.target.value))}>
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
									<select value={saison} onChange={(e) => setSaisonTime(e.target.value)}>
										<option value="">Aucun</option>
										<option value="ETE">Ete</option>
										<option value="HIVER">Hiver</option>
									</select>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
