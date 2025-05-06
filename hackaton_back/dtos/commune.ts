export interface CommuneReponse {
	nom: string;
	code: string;
	codeDepartement: string;
	siren: string;
	codeEpci: string;
	codeRegion: string;
	codesPostaux: string[];
	population: number;
	populationHiver: number;
	populationEte: number;
}
