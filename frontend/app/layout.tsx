import './globals.css'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Cat Directory',
  description: 'Community cat sightings and lost cat listings',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* SVG filter definitions — crayon hand-drawn edge distortion */}
        <svg
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* Light crayon — subtle edge wobble for cards and inputs */}
            <filter id="crayon-light" x="-4%" y="-8%" width="108%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.065 0.055"
                numOctaves="4"
                stitchTiles="stitch"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            {/* Heavy crayon — more dramatic wobble for buttons and accents */}
            <filter id="crayon-heavy" x="-6%" y="-12%" width="112%" height="128%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.055 0.045"
                numOctaves="5"
                stitchTiles="stitch"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <div className="page">
          <header className="header">
            <div className="container">
              <a className="brand" href="/">🐾 Cat Directory</a>
              <nav className="nav">
                <a href="/sightings">Report a Sighting</a>
                <a href="/lost-cats">Lost Cats</a>
                <a href="/resources">Resources</a>
              </nav>
            </div>
          </header>
          <main className="container main">{children}</main>
          <footer className="footer">
            <div className="container">Built for cats everywhere.</div>
          </footer>
        </div>
      </body>
    </html>
  )
}
