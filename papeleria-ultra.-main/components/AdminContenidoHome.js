"use client"

import { useEffect, useMemo, useState } from 'react'
import { useHomepageSections } from '../hooks/useHomepageSections'
import { HOMEPAGE_SECTION_KEYS, getDefaultHomepageSection } from '../lib/homepageContent'

const SECTION_CONFIG = {
  [HOMEPAGE_SECTION_KEYS.promos]: {
    label: '🎉 Promociones',
    itemLabel: 'Promo',
    fields: [
      { key: 'icon', label: 'Icono' },
      { key: 'title', label: 'Titulo' },
      { key: 'description', label: 'Descripcion' },
      { key: 'highlight', label: 'Destacado' },
      { key: 'button_text', label: 'Texto del boton' },
      {
        key: 'button_action',
        label: 'Accion del boton',
        type: 'select',
        options: [
          { value: 'none', label: 'Sin accion' },
          { value: 'modal', label: 'Abrir condiciones' },
          { value: 'scroll_productos', label: 'Ir a productos' },
        ],
      },
      {
        key: 'button_variant',
        label: 'Estilo del boton',
        type: 'select',
        options: [
          { value: 'primary', label: 'Principal' },
          { value: 'secondary', label: 'Secundario' },
        ],
      },
    ],
  },
  [HOMEPAGE_SECTION_KEYS.topPedidos]: {
    label: '🏆 Los mas pedidos',
    itemLabel: 'Tarjeta',
    fields: [
      { key: 'icon', label: 'Icono' },
      { key: 'titulo', label: 'Titulo' },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { key: 'detalle', label: 'Detalle' },
    ],
  },
  [HOMEPAGE_SECTION_KEYS.reviews]: {
    label: '💬 Reseñas',
    itemLabel: 'Reseña',
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'texto', label: 'Texto', type: 'textarea' },
      { key: 'contexto', label: 'Contexto' },
    ],
  },
}

export default function AdminContenidoHome() {
  const { sections, loading, guardarSeccion } = useHomepageSections()
  const [activeSection, setActiveSection] = useState(HOMEPAGE_SECTION_KEYS.promos)
  const [formState, setFormState] = useState(() => ({
    [HOMEPAGE_SECTION_KEYS.promos]: getDefaultHomepageSection(HOMEPAGE_SECTION_KEYS.promos),
    [HOMEPAGE_SECTION_KEYS.topPedidos]: getDefaultHomepageSection(HOMEPAGE_SECTION_KEYS.topPedidos),
    [HOMEPAGE_SECTION_KEYS.reviews]: getDefaultHomepageSection(HOMEPAGE_SECTION_KEYS.reviews),
  }))
  const [savingSection, setSavingSection] = useState(null)

  useEffect(() => {
    setFormState({
      [HOMEPAGE_SECTION_KEYS.promos]: sections[HOMEPAGE_SECTION_KEYS.promos] || getDefaultHomepageSection(HOMEPAGE_SECTION_KEYS.promos),
      [HOMEPAGE_SECTION_KEYS.topPedidos]: sections[HOMEPAGE_SECTION_KEYS.topPedidos] || getDefaultHomepageSection(HOMEPAGE_SECTION_KEYS.topPedidos),
      [HOMEPAGE_SECTION_KEYS.reviews]: sections[HOMEPAGE_SECTION_KEYS.reviews] || getDefaultHomepageSection(HOMEPAGE_SECTION_KEYS.reviews),
    })
  }, [sections])

  const currentConfig = SECTION_CONFIG[activeSection]
  const currentSection = formState[activeSection]

  const sectionTabs = useMemo(
    () => Object.entries(SECTION_CONFIG).map(([key, value]) => ({ key, label: value.label })),
    []
  )

  const updateSectionField = (sectionKey, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }))
  }

  const updateItemField = (sectionKey, index, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        items: prev[sectionKey].items.map((item, itemIndex) => (
          itemIndex === index ? { ...item, [field]: value } : item
        )),
      },
    }))
  }

  const addItem = (sectionKey) => {
    const defaults = getDefaultHomepageSection(sectionKey)
    const emptyItem = Object.keys(defaults.items[0] || {}).reduce((acc, key) => {
      acc[key] = defaults.items[0][key] || ''
      return acc
    }, {})

    setFormState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        items: [...prev[sectionKey].items, emptyItem],
      },
    }))
  }

  const removeItem = (sectionKey, index) => {
    setFormState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        items: prev[sectionKey].items.filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSavingSection(activeSection)
      await guardarSeccion(activeSection, currentSection)
      alert('Seccion guardada correctamente')
    } catch (error) {
      alert(
        'Error al guardar contenido: ' + error.message +
        '\n\nSi la tabla no existe todavia, ejecuta el supabase-schema.sql en Supabase SQL Editor.'
      )
    } finally {
      setSavingSection(null)
    }
  }

  if (loading && !currentSection) {
    return <div className="p-8 text-center">Cargando contenido...</div>
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50 px-6 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gradient">🪄 Contenido de Home</h1>
          <p className="text-xl text-gray-600">Edita Promociones, Los mas pedidos y Reseñas desde el panel.</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {sectionTabs.map((tab) => {
            const active = activeSection === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSection(tab.key)}
                className={`rounded-2xl px-5 py-3 font-semibold transition-all ${
                  active
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:ring-purple-300'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-lg font-semibold text-gray-800">Titulo de la seccion</label>
              <input
                type="text"
                value={currentSection?.title || ''}
                onChange={(e) => updateSectionField(activeSection, 'title', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-3 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-3 block text-lg font-semibold text-gray-800">Subtitulo</label>
              <textarea
                rows="3"
                value={currentSection?.subtitle || ''}
                onChange={(e) => updateSectionField(activeSection, 'subtitle', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-3 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Elementos de la seccion</h2>
              <button
                type="button"
                onClick={() => addItem(activeSection)}
                className="rounded-xl bg-linear-to-r from-green-400 to-emerald-500 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-500 hover:to-emerald-600"
              >
                ➕ Agregar {currentConfig.itemLabel}
              </button>
            </div>

            {currentSection?.items?.map((item, index) => (
              <div key={`${activeSection}-${index}`} className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{currentConfig.itemLabel} {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeItem(activeSection, index)}
                    className="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-500 transition-all hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {currentConfig.fields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500">
                        {field.label}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows="3"
                          value={item[field.key] || ''}
                          onChange={(e) => updateItemField(activeSection, index, field.key, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-purple-400 focus:outline-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={item[field.key] || field.options?.[0]?.value || ''}
                          onChange={(e) => updateItemField(activeSection, index, field.key, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-purple-400 focus:outline-none"
                        >
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={item[field.key] || ''}
                          onChange={(e) => updateItemField(activeSection, index, field.key, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-purple-400 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={savingSection === activeSection}
              className="rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 px-8 py-4 font-bold text-white shadow-xl transition-all hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingSection === activeSection ? 'Guardando...' : '💾 Guardar seccion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}