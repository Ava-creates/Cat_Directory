export default function ResourcesPage() {
  return (
    <div className="stack">
      <section className="card">
        <h1>Resources</h1>
        <p>Quick local help and guidance for cats in need.</p>
      </section>

      <section className="card">
        <h2>Local Shelters</h2>
        <ul className="resource-list">
          <li>
            <strong>City Animal Shelter</strong>
            <span className="resource-meta">(555) 555-0134 · cityshelter.example</span>
          </li>
          <li>
            <strong>Riverdale Rescue</strong>
            <span className="resource-meta">(555) 555-0182 · riverdalerescue.example</span>
          </li>
          <li>
            <strong>Northside Cat Care</strong>
            <span className="resource-meta">(555) 555-0147 · northsidecats.example</span>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Spay / Neuter &amp; TNR Services</h2>
        <ul className="resource-list">
          <li>
            <strong>Community TNR Clinic</strong>
            <span className="resource-meta">(555) 555-0193 · tnrclinic.example</span>
          </li>
          <li>
            <strong>Feral Friends Program</strong>
            <span className="resource-meta">(555) 555-0166 · feralfriends.example</span>
          </li>
          <li>
            <strong>Low-Cost Spay Hub</strong>
            <span className="resource-meta">(555) 555-0120 · spayhub.example</span>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>What to Do If You Find a Cat</h2>
        <div className="text-block">
          <p>
            First, observe from a safe distance. A friendly cat with a collar
            may be someone’s pet, while a wary, unsocialized cat could be feral.
          </p>
          <p>
            Do not bring a cat inside immediately. Check the directory, ask
            neighbors, and look for a microchip with a local vet or shelter.
          </p>
          <p>
            Offer water and a small amount of food if the cat appears hungry, but
            avoid making sudden movements. If the cat looks injured or in
            distress, contact animal control or a rescue for advice.
          </p>
        </div>
      </section>
    </div>
  )
}
