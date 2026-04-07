"use client"

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { HOMEPAGE_SECTION_KEYS, mergeHomepageSections, getDefaultHomepageSection } from '../lib/homepageContent'

const homepageSectionsCache = {
  timestamp: 0,
  data: null,
}

const CACHE_DURATION = 5 * 60 * 1000

export function useHomepageSections() {
  const [sections, setSections] = useState(() => mergeHomepageSections())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarSecciones = useCallback(async (force = false) => {
    const cacheVigente = homepageSectionsCache.data && (Date.now() - homepageSectionsCache.timestamp) < CACHE_DURATION

    if (!force && cacheVigente) {
      setSections(homepageSectionsCache.data)
      setLoading(false)
      setError(null)
      return homepageSectionsCache.data
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('homepage_sections')
        .select('*')
        .in('section_key', Object.values(HOMEPAGE_SECTION_KEYS))

      if (fetchError) throw fetchError

      const merged = mergeHomepageSections(data || [])
      homepageSectionsCache.data = merged
      homepageSectionsCache.timestamp = Date.now()
      setSections(merged)
      setError(null)
      return merged
    } catch (err) {
      const fallback = mergeHomepageSections()
      setSections(fallback)
      setError(err.message)
      return fallback
    } finally {
      setLoading(false)
    }
  }, [])

  const guardarSeccion = useCallback(async (sectionKey, payload) => {
    const fallback = getDefaultHomepageSection(sectionKey)
    const record = {
      section_key: sectionKey,
      title: payload?.title ?? fallback.title,
      subtitle: payload?.subtitle ?? fallback.subtitle,
      items: payload?.items ?? fallback.items,
    }

    const { data, error: saveError } = await supabase
      .from('homepage_sections')
      .upsert(record, { onConflict: 'section_key' })
      .select()
      .single()

    if (saveError) throw saveError

    const merged = {
      ...(homepageSectionsCache.data || mergeHomepageSections()),
      [sectionKey]: mergeHomepageSections([data])[sectionKey],
    }

    homepageSectionsCache.data = merged
    homepageSectionsCache.timestamp = Date.now()
    setSections(merged)
    setError(null)

    return merged[sectionKey]
  }, [])

  useEffect(() => {
    cargarSecciones()
  }, [cargarSecciones])

  return {
    sections,
    loading,
    error,
    cargarSecciones,
    guardarSeccion,
  }
}