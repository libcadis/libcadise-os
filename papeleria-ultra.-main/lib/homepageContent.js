export const HOMEPAGE_SECTION_KEYS = {
  promos: 'promos',
  topPedidos: 'top_pedidos',
  reviews: 'reviews',
}

export const DEFAULT_HOMEPAGE_SECTIONS = {
  [HOMEPAGE_SECTION_KEYS.promos]: {
    section_key: HOMEPAGE_SECTION_KEYS.promos,
    title: '¡Promociones Especiales!',
    subtitle: 'Aprovecha estas ofertas limitadas',
    items: [
      {
        icon: '🔥',
        title: '2x1 en Stickers',
        description: 'Personalizados unicos',
        highlight: '$200',
        button_text: '¡Aprovechar Ahora!',
        button_action: 'none',
        button_variant: 'primary',
      },
      {
        icon: '🎨',
        title: 'Envio Gratis',
        description: 'En compras mayores a $1000',
        highlight: '🚚',
        button_text: 'Ver Condiciones',
        button_action: 'modal',
        button_variant: 'secondary',
      },
      {
        icon: '✨',
        title: 'Pack Creativo',
        description: 'Stickers + Agenda + Marcadores',
        highlight: '$1500',
        button_text: 'Ver Pack',
        button_action: 'scroll_productos',
        button_variant: 'primary',
      },
    ],
  },
  [HOMEPAGE_SECTION_KEYS.topPedidos]: {
    section_key: HOMEPAGE_SECTION_KEYS.topPedidos,
    title: 'Los mas pedidos por nuestros clientes',
    subtitle: 'Una seleccion con los productos que mas salen y que mejor funcionan para regalar, emprender o personalizar eventos.',
    items: [
      {
        icon: '🔥',
        titulo: 'Stickers personalizados',
        descripcion: 'La opcion mas elegida para souvenirs, packaging y regalos con identidad propia.',
        detalle: '4cm y 7cm con impresion mate o brillante.',
      },
      {
        icon: '🎁',
        titulo: 'Souvenirs para eventos',
        descripcion: 'Kits listos para cumpleaños, bautismos y celebraciones con estilo artesanal.',
        detalle: 'Disenos coordinados y produccion por pedido.',
      },
      {
        icon: '✨',
        titulo: 'Papeleria creativa',
        descripcion: 'Etiquetas, tags y piezas impresas para marcas, emprendimientos y fechas especiales.',
        detalle: 'Ideal para sumar presencia visual a tu producto.',
      },
    ],
  },
  [HOMEPAGE_SECTION_KEYS.reviews]: {
    section_key: HOMEPAGE_SECTION_KEYS.reviews,
    title: 'Reseñas de nuestros clientes',
    subtitle: 'Lo que mas valoran quienes ya compraron: calidad de impresion, tiempos de entrega y atencion personalizada.',
    items: [
      {
        nombre: 'Camila R.',
        texto: 'Los stickers quedaron hermosos. La impresion salio super prolija y llegaron rapidisimo.',
        contexto: 'Pedido para packaging de emprendimiento',
      },
      {
        nombre: 'Florencia G.',
        texto: 'Encargue souvenirs para un cumple y todo vino tal como lo imagine. Muy buena atencion.',
        contexto: 'Souvenirs personalizados',
      },
      {
        nombre: 'Mariana T.',
        texto: 'Me encanto la calidad de la papeleria. Los colores impresos se ven divinos y el acabado es excelente.',
        contexto: 'Papeleria creativa para evento',
      },
    ],
  },
}

const clone = (value) => JSON.parse(JSON.stringify(value))

export function getDefaultHomepageSection(sectionKey) {
  return clone(DEFAULT_HOMEPAGE_SECTIONS[sectionKey])
}

function normalizeItems(sectionKey, items) {
  const defaults = getDefaultHomepageSection(sectionKey).items
  const source = Array.isArray(items) && items.length > 0 ? items : defaults

  if (sectionKey === HOMEPAGE_SECTION_KEYS.promos) {
    return source.map((item, index) => ({
      icon: item?.icon || defaults[index]?.icon || '✨',
      title: item?.title || defaults[index]?.title || '',
      description: item?.description || defaults[index]?.description || '',
      highlight: item?.highlight || defaults[index]?.highlight || '',
      button_text: item?.button_text || defaults[index]?.button_text || 'Ver mas',
      button_action: item?.button_action || defaults[index]?.button_action || 'none',
      button_variant: item?.button_variant || defaults[index]?.button_variant || 'primary',
    }))
  }

  if (sectionKey === HOMEPAGE_SECTION_KEYS.topPedidos) {
    return source.map((item, index) => ({
      icon: item?.icon || defaults[index]?.icon || '✨',
      titulo: item?.titulo || defaults[index]?.titulo || '',
      descripcion: item?.descripcion || defaults[index]?.descripcion || '',
      detalle: item?.detalle || defaults[index]?.detalle || '',
    }))
  }

  return source.map((item, index) => ({
    nombre: item?.nombre || defaults[index]?.nombre || '',
    texto: item?.texto || defaults[index]?.texto || '',
    contexto: item?.contexto || defaults[index]?.contexto || '',
  }))
}

export function normalizeHomepageSection(sectionKey, row) {
  const defaults = getDefaultHomepageSection(sectionKey)
  return {
    section_key: sectionKey,
    title: row?.title || defaults.title,
    subtitle: row?.subtitle || defaults.subtitle,
    items: normalizeItems(sectionKey, row?.items),
  }
}

export function mergeHomepageSections(rows = []) {
  return Object.values(HOMEPAGE_SECTION_KEYS).reduce((acc, sectionKey) => {
    const row = rows.find((item) => item.section_key === sectionKey)
    acc[sectionKey] = normalizeHomepageSection(sectionKey, row)
    return acc
  }, {})
}