import { useHomepageSections } from '../hooks/useHomepageSections'
import { HOMEPAGE_SECTION_KEYS } from '../lib/homepageContent'

type TopPedidoItem = {
  icon: string
  titulo: string
  descripcion: string
  detalle: string
}

type TopPedidosSection = {
  title: string
  subtitle: string
  items: TopPedidoItem[]
}

export default function TopPedidos() {
  const { sections } = useHomepageSections()
  const topPedidosSection = (
    sections as Record<string, TopPedidosSection>
  )[HOMEPAGE_SECTION_KEYS.topPedidos]

  if (!topPedidosSection) return null

  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600">
            Favoritos del catalogo
          </span>
          <h2 className="mt-4 text-4xl font-bold text-gradient md:text-5xl">
            {topPedidosSection.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {topPedidosSection.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {topPedidosSection.items.map((item) => (
            <article
              key={item.titulo}
              className="card-modern relative overflow-hidden p-6"
            >
              <div className="absolute right-4 top-4 text-3xl opacity-20">{item.icon}</div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-pink-100 to-purple-100 text-2xl shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{item.titulo}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.descripcion}</p>
              <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-purple-700 ring-1 ring-purple-100">
                {item.detalle}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}