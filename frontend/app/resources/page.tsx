export default function ResourcesPage() {
  return (
    <div className="stack">
      <section className="card">
        <h1>Resources</h1>
        <p>
          Local help for lost, found, and community cats in Edmonton and the
          surrounding area.
        </p>
      </section>

      <section className="card">
        <h2>Lost &amp; Found</h2>
        <ul className="resource-list">
          <li>
            <strong>
              <a
                href="https://edmontonacccpets.shelterbuddy.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edmonton Lost &amp; Found Pets Search
              </a>
            </strong>
            <span className="resource-meta">
              Public database of lost and found cats, dogs, and small pets within
              Edmonton. Updated every 20 minutes. Post a listing or create a
              printable lost-pet poster.
            </span>
          </li>
          <li>
            <strong>
              <a
                href="https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/reporting-recovering-lost-pets"
                target="_blank"
                rel="noopener noreferrer"
              >
                City of Edmonton — Reporting &amp; Recovering Lost Pets
              </a>
            </strong>
            <span className="resource-meta">
              Official guidance on what to do if you lose or find a pet, pet
              licensing, and microchipping.
            </span>
          </li>
          <li>
            <strong>Edmonton Humane Society — Lost &amp; Found</strong>
            <span className="resource-meta">
              <a href="tel:7804913522">780-491-3522</a>
              {' · '}
              <a
                href="https://www.edmontonhumanesociety.com/services/lost-and-found-pets/"
                target="_blank"
                rel="noopener noreferrer"
              >
                edmontonhumanesociety.com
              </a>
              {' · '}Accepts lost/stray intakes from outside Edmonton by
              appointment. Strays found inside Edmonton go to ACCC (call 311).
            </span>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Local Shelters &amp; Animal Services</h2>
        <ul className="resource-list">
          <li>
            <strong>Animal Care &amp; Control Centre (ACCC)</strong>
            <span className="resource-meta">
              13550 163 Street NW · In Edmonton:{' '}
              <a href="tel:311">311</a>
              {' · Outside Edmonton: '}
              <a href="tel:7804425311">780-442-5311</a>
              {' · '}
              <a
                href="https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/cats"
                target="_blank"
                rel="noopener noreferrer"
              >
                edmonton.ca
              </a>
              {' · '}City facility for strays found within Edmonton city limits.
              Appointment-based intake.
            </span>
          </li>
          <li>
            <strong>Edmonton Humane Society (EHS)</strong>
            <span className="resource-meta">
              13620 163 Street NW ·{' '}
              <a href="tel:7804913522">780-491-3522</a>
              {' · '}
              <a
                href="https://www.edmontonhumanesociety.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                edmontonhumanesociety.com
              </a>
            </span>
          </li>
          <li>
            <strong>Greater Edmonton Animal Rescue Society (GEARS)</strong>
            <span className="resource-meta">
              <a
                href="https://edmontonanimalrescue.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                edmontonanimalrescue.org
              </a>
              {' · '}Foster-based rescue for injured, abandoned, and homeless
              animals. Cats found within city limits must go through ACCC first.
            </span>
          </li>
          <li>
            <strong>After-hours emergency (injured animals)</strong>
            <span className="resource-meta">
              <a href="tel:7804365880">780-436-5880</a>
              {' · '}24-hour emergency clinic that receives injured lost pets on
              the City&apos;s behalf when ACCC is closed.
            </span>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Spay / Neuter &amp; TNR Services</h2>
        <ul className="resource-list">
          <li>
            <strong>
              <a
                href="https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/public-trap-neuter-return-program"
                target="_blank"
                rel="noopener noreferrer"
              >
                City of Edmonton — Public Trap-Neuter-Return (PTNR)
              </a>
            </strong>
            <span className="resource-meta">
              Call <a href="tel:311">311</a> to ask about the ACCC program for
              feral cats within Edmonton. Cats are spayed/neutered, vaccinated,
              microchipped, and returned to where they were found.
            </span>
          </li>
          <li>
            <strong>
              <a
                href="https://www.edmontonhumanesociety.com/services/trap-neuter-return-program/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edmonton Humane Society — TNR Program
              </a>
            </strong>
            <span className="resource-meta">
              For community cat colonies outside Edmonton (up to 200 km). Seasonal
              high-volume clinics, typically May–September. Colonies inside
              Edmonton should contact 311 instead.
            </span>
          </li>
          <li>
            <strong>
              <a
                href="https://www.edmontonhumanesociety.com/services/pals-spay-and-neuter-program/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PALS — Prevent Another Litter Subsidy
              </a>
            </strong>
            <span className="resource-meta">
              Low-income spay/neuter for cats and dogs in Edmonton and surrounding
              communities. $40 administration fee per animal.{' '}
              <a href="mailto:pals@edmontonhumanesociety.com">
                pals@edmontonhumanesociety.com
              </a>
              {' · '}
              <a href="tel:7802292945">780-229-2945</a>
            </span>
          </li>
          <li>
            <strong>The Original Spay Clinic</strong>
            <span className="resource-meta">
              <a
                href="https://originalspayclinic.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                originalspayclinic.ca
              </a>
              {' · '}Affordable spay/neuter for cats and dogs serving Edmonton
              and surrounding communities.
            </span>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>What to Do If You Find a Cat</h2>
        <div className="text-block">
          <p>
            If the cat looks healthy, Edmonton&apos;s Animal Care &amp; Control
            Centre generally recommends leaving it where you found it or taking
            it to a vet to scan for a microchip. Lost cats are far more likely
            to reunite with their owner when left in their neighbourhood than
            when brought to a shelter.
          </p>
          <p>
            Search the{' '}
            <a
              href="https://edmontonacccpets.shelterbuddy.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Edmonton Lost &amp; Found Pets database
            </a>
            , talk to neighbours, and check community social media groups. You
            can also post a found-cat listing there if the owner hasn&apos;t
            reported the cat yet.
          </p>
          <p>
            Bring a cat to ACCC only if it is injured, in distress, unhealthy, or
            meets priority intake criteria (for example, very young kittens
            without a mother). Call <a href="tel:311">311</a> for advice or to
            schedule an appointment. For after-hours emergencies involving
            bleeding, fractures, or difficulty breathing, call{' '}
            <a href="tel:7804365880">780-436-5880</a>.
          </p>
          <p>
            Feral cats should be managed through Trap-Neuter-Return rather than
            shelter intake. Feeding stray cats is not recommended, as it can
            attract more cats and wildlife to the area. For full guidance, see
            the City&apos;s{' '}
            <a
              href="https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/i-found-a-cat"
              target="_blank"
              rel="noopener noreferrer"
            >
              I Found a Cat
            </a>{' '}
            page.
          </p>
        </div>
      </section>
    </div>
  )
}
