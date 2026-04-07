import { useHomepageSections } from '../hooks/useHomepageSections'
import { HOMEPAGE_SECTION_KEYS } from '../lib/homepageContent'

export default function ReviewsSection() {
  const { sections } = useHomepageSections()
  const reviewsSection = sections[HOMEPAGE_SECTION_KEYS.reviews]

  return (
    <section className="py-20">
      <div className="container">
        <div className="rounded-4xl bg-linear-to-br from-white/90 via-pink-50 to-purple-50 px-6 py-12 shadow-[0_20px_60px_rgba(155,93,229,0.12)] ring-1 ring-white/60 md:px-10">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-600">
              Opiniones reales
            </span>
            <h2 className="mt-4 text-4xl font-bold text-gradient md:text-5xl">
              {reviewsSection.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {reviewsSection.subtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {reviewsSection.items.map((review) => (
              <article key={review.nombre} className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-purple-100">
                <div className="mb-4 flex items-center gap-1 text-yellow-400">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
                <p className="text-sm leading-6 text-gray-600">“{review.texto}”</p>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-800">{review.nombre}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{review.contexto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}