'use client'
import dynamic from 'next/dynamic'
import Link from "next/link"

// Lazy loading de componentes pesados
const Promos = dynamic(() => import("../components/Promos"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded-2xl"></div>
})
const TopPedidos = dynamic(() => import("../components/TopPedidos"), {
  loading: () => <div className="animate-pulse h-72 bg-gray-200 rounded-2xl"></div>
})
const CatalogoScroll = dynamic(() => import("../components/CatalogoScroll"), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded-2xl"></div>
})
const ReviewsSection = dynamic(() => import("../components/ReviewsSection"), {
  loading: () => <div className="animate-pulse h-72 bg-gray-200 rounded-2xl"></div>
})

export default function Home(){
  return(
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="container text-center animate-fade-in relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 leading-tight">
              <span className="block">Stickers</span>
              <span className="block">Papelería Creativa</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Diseños personalizados para tus momentos especiales.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button
                className="btn-primary text-lg px-8 py-4"
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🛒 Comprar
              </button>
              <Link href="/personalizar">
                <button className="btn-secondary text-lg px-8 py-4">
                  🎨 Personalizar Sticker
                </button>
              </Link>
            </div>
          </div>

          {/* Floating elements */}
          <div className="pointer-events-none absolute top-6 left-4 md:top-16 md:left-8 animate-sticker-peel opacity-80 z-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-200 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg">
              ⭐
            </div>
          </div>
          <div className="pointer-events-none absolute top-8 right-4 md:top-16 md:right-8 animate-sticker-peel opacity-80 z-0" style={{animationDelay: '0.5s'}}>
            <div className="w-14 h-14 md:w-20 md:h-20 bg-pink-200 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-lg">
              🎈
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-8 right-8 md:bottom-12 md:right-16 animate-sticker-peel opacity-80 z-0" style={{animationDelay: '1s'}}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-200 rounded-full flex items-center justify-center text-lg md:text-xl shadow-lg">
              💖
            </div>
          </div>
        </div>
      </section>

      {/* Promociones */}
      <Promos/>

      {/* Mas pedidos */}
      <TopPedidos/>

      {/* Productos */}
      <section id="productos" className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-gradient mb-12">
            Nuestros Productos
          </h2>
          <CatalogoScroll/>
        </div>
      </section>

      {/* Reseñas */}
      <ReviewsSection/>
    </div>
  )
}