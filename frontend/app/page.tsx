import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <h1>Your Neighbourhood&apos;s Cats Deserve Fame</h1>
        <p>
          Spot a cat? Tell us about it! Help build a community directory of all
          the wonderful cats roaming your streets. Every whisker counts.

          We help finding lost cats and have cat friendly resources to help you keep your neighborhood cats safe!
        </p>
        <div className="actions">
          <Link className="button" href="/sightings">
            🐾 Report a Sighting
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>What you can do</h2>
        <ul>
          <li>Submit a sighting with a photo</li>
          <li>Browse cats in your area <em>(coming soon!)</em></li>
          <li>Report lost cats <em>(coming soon!)</em></li>
        </ul>
      </section>
    </div>
  )
}
