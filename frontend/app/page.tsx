import Link from 'next/link'
import { API_BASE_URL } from '@/lib/constants'

async function getCatCount(): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cats`, { cache: 'no-store' })
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (typeof data.total === 'number') {
      return data.total
    }
    return Array.isArray(data.cats) ? data.cats.length : null
  } catch {
    return null
  }
}

const features = [
  {
    emoji: '🐱',
    title: 'Browse the directory',
    text: 'Meet the neighbourhood cats — coat colours, vibes, and last seen spots.',
    href: '/cats',
    cta: 'See the cats',
  },
  {
    emoji: '📸',
    title: 'Report a sighting',
    text: 'Snap a photo, pick the hood, and help build the local cat map.',
    href: '/sightings',
    cta: 'Share a sighting',
  },
  {
    emoji: '🆘',
    title: 'Lost cat board',
    text: 'Post a missing cat or check if someone spotted yours.',
    href: '/lost-cats',
    cta: 'Lost cats',
  },
  {
    emoji: '📚',
    title: 'Local resources',
    text: 'Shelters, TNR programs, and what to do if you find a cat.',
    href: '/resources',
    cta: 'Get help',
  },
]

export default async function HomePage() {
  const catCount = await getCatCount()
  const countLabel =
    catCount === null
      ? 'Cats logging in soon…'
      : catCount === 1
        ? '1 cat in the directory so far'
        : `${catCount} cats in the directory so far`

  return (
    <div className="stack">
      <section className="hero hero--fun">
        <p className="hero-eyebrow">Edmonton&apos;s unofficial cat hall of fame</p>
        <h1>Your Neighbourhood&apos;s Cats Deserve Fame</h1>
        <p>
          Spot a cat? Tell us about it! Help build a community directory of the
          wonderful cats roaming your streets. Every whisker counts — and yes,
          we help reunite lost cats too.
        </p>

        <div className="hero-stat">
          <span className="hero-stat__icon" aria-hidden="true">
            🏆
          </span>
          <span>{countLabel}</span>
        </div>

        <div className="actions actions--row">
          <Link className="button" href="/sightings">
            📸 Report a Sighting
          </Link>
          <Link className="button" href="/cats">
            🐱 Browse Cats
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature, index) => (
          <Link
            className="feature-card"
            href={feature.href}
            key={feature.href}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="feature-card__emoji" aria-hidden="true">
              {feature.emoji}
            </span>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
            <span className="feature-card__cta">{feature.cta} →</span>
          </Link>
        ))}
      </section>

      <section className="card card--quote">
        <p className="quote-mark" aria-hidden="true">
          &ldquo;
        </p>
        <p className="quote-text">
          A cat is only invisible until someone in the neighbourhood writes
          them into the story.
        </p>
        <p className="quote-attribution">— probably a very wise tabby</p>
      </section>
    </div>
  )
}
