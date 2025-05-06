import { ArrowRight, BarChart3, MapPin, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="flex h-16 items-center border-b px-4 lg:px-6">
				<a className="flex items-center justify-center" href="#">
					<MapPin className="h-6 w-6 text-teal-600" />
					<span className="ml-2 text-xl font-bold">MédicoMap</span>
				</a>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
						Fonctionnalités
					</a>
					<a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
						Comment ça marche
					</a>
					<a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
						À propos
					</a>
					<a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
						Contact
					</a>
				</nav>
			</header>
			<main className="flex-1">
				<section className="w-full bg-gradient-to-b from-white to-teal-50 py-12 md:py-24 lg:py-32">
					<div className="container mx-auto px-4 md:px-6">
						<div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
										Optimisez l'implantation de centres médicaux
									</h1>
									<p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
										Visualisez les zones de besoins en médecins généralistes et prenez des décisions éclairées grâce à
										notre outil d'analyse démographique et statistique.
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row">
									<a href="/carte">
										<Button className="bg-teal-600 hover:bg-teal-700">
											Explorer la carte
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</a>
								</div>
							</div>
							<div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
								<div className="aspect-video overflow-hidden rounded-xl border bg-white shadow-xl">
									<div className="flex items-center gap-2 border-b bg-white p-2">
										<div className="flex gap-1">
											<div className="h-3 w-3 rounded-full bg-red-500" />
											<div className="h-3 w-3 rounded-full bg-yellow-500" />
											<div className="h-3 w-3 rounded-full bg-green-500" />
										</div>
										<div className="flex flex-1 justify-center">
											<div className="rounded-full bg-gray-100 px-3 py-1 text-xs">médicomap.fr</div>
										</div>
									</div>
									<div className="relative h-full bg-gray-50">
										<div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] bg-cover bg-center opacity-50" />
										<div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
										<div className="absolute top-4 right-4 left-4 flex items-center rounded-lg bg-white p-3 shadow-lg">
											<Search className="mr-2 h-4 w-4 text-gray-500" />
											<span className="text-sm text-gray-400">Rechercher une zone géographique...</span>
										</div>
										<div className="absolute right-4 bottom-4 rounded-lg bg-white p-3 shadow-lg">
											<div className="flex items-center gap-2 text-sm font-medium">
												<div className="h-3 w-3 rounded-full bg-red-500" />
												<span>Zone prioritaire</span>
											</div>
											<div className="flex items-center gap-2 text-sm font-medium">
												<div className="h-3 w-3 rounded-full bg-yellow-500" />
												<span>Zone intermédiaire</span>
											</div>
											<div className="flex items-center gap-2 text-sm font-medium">
												<div className="h-3 w-3 rounded-full bg-green-500" />
												<span>Zone bien couverte</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
									Fonctionnalités principales
								</h2>
								<p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Notre outil vous offre une analyse complète pour optimiser l'implantation de centres médicaux
								</p>
							</div>
						</div>
						<div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							<div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
								<div className="rounded-full bg-teal-100 p-3">
									<MapPin className="h-6 w-6 text-teal-600" />
								</div>
								<h3 className="text-xl font-bold">Cartographie interactive</h3>
								<p className="text-center text-gray-500">
									Visualisez les zones géographiques selon la densité de médecins généralistes et les besoins de la
									population.
								</p>
							</div>
							<div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
								<div className="rounded-full bg-teal-100 p-3">
									<Users className="h-6 w-6 text-teal-600" />
								</div>
								<h3 className="text-xl font-bold">Analyse démographique</h3>
								<p className="text-center text-gray-500">
									Accédez aux données démographiques détaillées pour comprendre la composition de la population locale.
								</p>
							</div>
							<div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
								<div className="rounded-full bg-teal-100 p-3">
									<BarChart3 className="h-6 w-6 text-teal-600" />
								</div>
								<h3 className="text-xl font-bold">Statistiques avancées</h3>
								<p className="text-center text-gray-500">
									Explorez des indicateurs clés pour évaluer la pertinence d'implantation d'un centre médical.
								</p>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full bg-teal-50 py-12 md:py-24 lg:py-32">
					<div className="container mx-auto px-4 md:px-6">
						<div className="grid items-center gap-10 lg:grid-cols-2">
							<div className="space-y-4">
								<h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Comment ça marche ?</h2>
								<p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Notre application vous guide à travers un processus simple pour analyser les zones d'implantation
									potentielles.
								</p>
								<div className="space-y-4">
									<div className="flex items-start gap-4">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
											1
										</div>
										<div className="space-y-1">
											<h3 className="font-bold">Sélectionnez une zone géographique</h3>
											<p className="text-gray-500">
												Utilisez notre carte interactive pour sélectionner la région qui vous intéresse.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
											2
										</div>
										<div className="space-y-1">
											<h3 className="font-bold">Analysez les données démographiques</h3>
											<p className="text-gray-500">
												Consultez les statistiques démographiques et la répartition des médecins généralistes.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
											3
										</div>
										<div className="space-y-1">
											<h3 className="font-bold">Évaluez la pertinence d'implantation</h3>
											<p className="text-gray-500">
												Utilisez nos indicateurs pour déterminer si la zone est propice à l'implantation d'un centre
												médical.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="mx-auto w-full max-w-[500px] lg:max-w-none">
								<div className="aspect-square overflow-hidden rounded-xl border bg-white shadow-xl">
									<div className="flex h-full items-center justify-center bg-gray-50">
										<div className="relative h-full w-full">
											<div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=600')] bg-cover bg-center" />
											<div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10" />
											<div className="absolute inset-0 flex flex-col items-center justify-center p-6">
												<div className="max-w-md rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur-sm">
													<h3 className="mb-2 text-xl font-bold">Analyse de zone</h3>
													<div className="space-y-2">
														<div className="flex justify-between">
															<span className="text-gray-500">Population</span>
															<span className="font-medium">24,567 habitants</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-500">Médecins généralistes</span>
															<span className="font-medium">8 praticiens</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-500">Ratio médecin/habitants</span>
															<span className="font-medium text-red-500">1:3,071</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-500">Indice de priorité</span>
															<span className="font-medium">Élevé</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
									Prêt à optimiser l'implantation de votre centre médical ?
								</h2>
								<p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Commencez dès maintenant à explorer les zones de besoins en médecins généralistes.
								</p>
							</div>
							<div className="flex flex-col gap-2 min-[400px]:flex-row">
								<a href="/contact">
									<Button variant="outline">Nous contacter</Button>
								</a>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex w-full flex-col gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
				<p className="text-xs text-gray-500">© 2023 MédicoMap. Tous droits réservés.</p>
				<nav className="flex gap-4 sm:ml-auto sm:gap-6">
					<a className="text-xs underline-offset-4 hover:underline" href="#">
						Mentions légales
					</a>
					<a className="text-xs underline-offset-4 hover:underline" href="#">
						Politique de confidentialité
					</a>
					<a className="text-xs underline-offset-4 hover:underline" href="#">
						Conditions d'utilisation
					</a>
				</nav>
			</footer>
		</div>
	);
}
