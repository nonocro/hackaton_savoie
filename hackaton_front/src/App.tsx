import { useEffect, useState } from 'react'
import './App.css'

interface Commune {
  nom: string
  code: string
  codeDepartement: string
  siren: string
  codeEpci: string
  codeRegion: string
  codesPostaux: string[]
  population: number
}

interface Medecin {
  nom: string
  adresse: string
}

function App() {
  const [communes, setCommunes] = useState<Commune[]>([])
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [codePostal, setCodePostal] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch Communes au chargement
    fetch('http://localhost:5000/departements/73/communes')
      .then(res => res.json())
      .then(data => setCommunes(data))
  }, [])

  useEffect(() => {
    // Fetch Médecins au chargement et quand codePostal change
    setLoading(true)
    let url = 'http://localhost:5000/departements/73/medecins'
    if (codePostal.trim() !== '') {
      url += `?codePostal=${encodeURIComponent(codePostal)}`
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMedecins(data)
        setLoading(false)
      })
  }, [codePostal])

  return (
    <>
      <h1>Départements API Demo</h1>

      <div className="card">
        <h2>Communes du département 73</h2>
        <ul>
          {communes.map(commune => (
            <li key={commune.code}>
              {commune.nom} ({commune.codesPostaux.join(', ')}) – Population: {commune.population}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Médecins du département 73</h2>
        <label>
          Filtrer par code postal :&nbsp;
          <input
            type="text"
            value={codePostal}
            onChange={e => setCodePostal(e.target.value)}
            placeholder="ex: 73200"
          />
        </label>
        {loading ? (
          <p>Chargement…</p>
        ) : (
          <ul>
            {medecins.length === 0 ? (
              <li>Aucun médecin trouvé</li>
            ) : (
              medecins.map((med, idx) => (
                <li key={idx}>
                  {med.nom} – {med.adresse}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </>
  )
}

export default App
