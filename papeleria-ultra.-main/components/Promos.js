"use client"
import { useState } from 'react'
import ModalCondiciones from './ModalCondiciones'
import { useHomepageSections } from '../hooks/useHomepageSections'
import { HOMEPAGE_SECTION_KEYS } from '../lib/homepageContent'

export default function Promos() {
  const [showCondiciones, setShowCondiciones] = useState(false)
  const { sections } = useHomepageSections()
  const promoSection = sections[HOMEPAGE_SECTION_KEYS.promos]

  const scrollToProductos = () => {
    const productosSection = document.getElementById('productos')
    if (productosSection) {
      productosSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handlePromoAction = (action) => {
    if (action === 'modal') {
      setShowCondiciones(true)
      return
    }

    if (action === 'scroll_productos') {
      scrollToProductos()
    }
  }

  return (
    <>
      <ModalCondiciones
        isOpen={showCondiciones}
        onClose={() => setShowCondiciones(false)}
      />

      <section className="py-20 bg-linear-to-r from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gradient mb-4">
              {promoSection.title}
            </h2>
            <p className="text-gray-600 text-lg">
              {promoSection.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {promoSection.items.map((promo, index) => (
              <div key={`${promo.title}-${index}`} className="card-modern text-center group">
                <div className="text-6xl mb-4 group-hover:animate-sticker-peel">{promo.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{promo.title}</h3>
                <p className="text-gray-600 mb-4">{promo.description}</p>
                <div className="text-3xl font-bold text-gradient mb-4">{promo.highlight}</div>
                <button
                  className={`${promo.button_variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} w-full`}
                  onClick={() => handlePromoAction(promo.button_action)}
                >
                  {promo.button_text}
                </button>
              </div>
            ))}

          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-sticker-peel"></div>
        <div
          className="absolute bottom-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-sticker-peel"
          style={{ animationDelay: '1s' }}
        ></div>
      </section>
    </>
  )
}