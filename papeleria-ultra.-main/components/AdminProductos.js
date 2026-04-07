"use client"
import { useState, useRef } from 'react'
import { useProductos } from '../hooks/useProductos'
import { supabase } from '../lib/supabase'

const PAPER_TYPES_DEFAULT = [
  { nombre: 'Mate', activo: true, precio_adicional: 0 },
  { nombre: 'Brillante', activo: true, precio_adicional: 0 },
  { nombre: 'Ilustracion', activo: false, precio_adicional: 0 },
]

const parsePaperTypes = (raw) => {
  if (!raw) return [...PAPER_TYPES_DEFAULT]

  const list = Array.isArray(raw) ? raw : (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  })()

  const normalized = list
    .map((item) => ({
      nombre: item?.nombre || '',
      activo: Boolean(item?.activo),
      precio_adicional: Number(item?.precio_adicional || 0),
    }))
    .filter((item) => item.nombre.trim() !== '')

  if (normalized.length === 0) return [...PAPER_TYPES_DEFAULT]

  const defaultsByName = new Map(PAPER_TYPES_DEFAULT.map((p) => [p.nombre.toLowerCase(), p]))
  const merged = [...normalized]

  PAPER_TYPES_DEFAULT.forEach((base) => {
    if (!normalized.some((item) => item.nombre.toLowerCase() === base.nombre.toLowerCase())) {
      merged.push({ ...base })
    }
  })

  return merged.map((item) => ({
    ...item,
    activo: item.activo ?? defaultsByName.get(item.nombre.toLowerCase())?.activo ?? false,
  }))
}

export default function AdminProductos() {
  const { productos, loading, agregarProducto, actualizarProducto, eliminarProducto } = useProductos()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingIndex, setUploadingIndex] = useState(null)
  const fileInputRefs = useRef({})
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoria: '',
    imagenes: [''],
    descuento: 0,
    tamaños: [{ nombre: '', precio_adicional: 0 }],
    tipos_papel: [...PAPER_TYPES_DEFAULT]
  })

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: '',
      descripcion: '',
      categoria: '',
      imagenes: [''],
      descuento: 0,
      tamaños: [{ nombre: '', precio_adicional: 0 }],
      tipos_papel: [...PAPER_TYPES_DEFAULT]
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const uploadImageFile = async (file, index) => {
    setUploadingIndex(index)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `producto_${Date.now()}_${index}.${ext}`
      const { error } = await supabase.storage
        .from('productos')
        .upload(fileName, file, { upsert: true, contentType: file.type })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName)

      updateImage(index, urlData.publicUrl)
    } catch (err) {
      alert(
        'Error al subir imagen: ' + err.message +
        '\n\nSi aparece "row-level security policy", ejecutá el archivo supabase-schema.sql en Supabase SQL Editor para crear el bucket "productos" y sus políticas de Storage.'
      )
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleFileChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif)/)) {
      alert('Formato no permitido. Usá JPG, PNG, WEBP o GIF.')
      return
    }
    uploadImageFile(file, index)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        descuento: parseFloat(formData.descuento),
        tamaños: formData.tamaños.filter(t => t.nombre.trim() !== ''),
        tipos_papel: formData.tipos_papel
          .filter((p) => p.nombre.trim() !== '')
          .map((p) => ({
            nombre: p.nombre.trim(),
            activo: Boolean(p.activo),
            precio_adicional: Number(p.precio_adicional || 0),
          }))
      }

      if (editingProduct) {
        await actualizarProducto(editingProduct.id, productData)
        alert('Producto actualizado exitosamente!')
      } else {
        await agregarProducto(productData)
        alert('Producto agregado exitosamente!')
      }
      resetForm()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      imagenes: producto.imagenes || [''],
      descuento: producto.descuento || 0,
      tamaños: producto.tamaños || [{ nombre: '', precio_adicional: 0 }],
      tipos_papel: parsePaperTypes(producto.tipos_papel)
    })
    setEditingProduct(producto)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await eliminarProducto(id)
        alert('Producto eliminado exitosamente!')
      } catch (error) {
        alert('Error: ' + error.message)
      }
    }
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, '']
    }))
  }

  const updateImage = (index, value) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.map((img, i) => i === index ? value : img)
    }))
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }))
  }

  const addTamaño = () => {
    setFormData(prev => ({
      ...prev,
      tamaños: [...prev.tamaños, { nombre: '', precio_adicional: 0 }]
    }))
  }

  const updateTamaño = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tamaños: prev.tamaños.map((tamaño, i) =>
        i === index ? { ...tamaño, [field]: field === 'precio_adicional' ? parseFloat(value) || 0 : value } : tamaño
      )
    }))
  }

  const removeTamaño = (index) => {
    setFormData(prev => ({
      ...prev,
      tamaños: prev.tamaños.filter((_, i) => i !== index)
    }))
  }

  const addTipoPapel = () => {
    setFormData(prev => ({
      ...prev,
      tipos_papel: [...prev.tipos_papel, { nombre: '', activo: true, precio_adicional: 0 }]
    }))
  }

  const updateTipoPapel = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tipos_papel: prev.tipos_papel.map((papel, i) =>
        i === index
          ? {
              ...papel,
              [field]: field === 'precio_adicional'
                ? parseFloat(value) || 0
                : field === 'activo'
                  ? Boolean(value)
                  : value,
            }
          : papel
      )
    }))
  }

  const removeTipoPapel = (index) => {
    setFormData(prev => ({
      ...prev,
      tipos_papel: prev.tipos_papel.filter((_, i) => i !== index)
    }))
  }

  const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('/'))

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            🛠️ Administración de Productos
          </h1>
          <p className="text-xl text-gray-600">
            Gestiona tu catálogo de productos desde Supabase
          </p>
        </div>

        <div className="mb-8 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-linear-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {showForm ? '❌ Cancelar' : '➕ Agregar Producto'}
          </button>
        </div>

        {showForm && (
          <div className="glass p-8 rounded-3xl shadow-2xl mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    📦 Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    💰 Precio Base
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  📝 Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  rows="3"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    🏷️ Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="stickers">Stickers</option>
                    <option value="agendas">Agendas</option>
                    <option value="3d">Figuras 3D</option>
                    <option value="tarjetas">Tarjetas</option>
                    <option value="cuadernos">Cuadernos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    🎯 Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, descuento: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  📸 Imágenes del Producto
                </label>
                <div className="space-y-3">
                  {formData.imagenes.map((imagen, index) => (
                    <div key={index} className="border-2 border-dashed border-purple-200 rounded-xl p-4 bg-white/50">
                      <div className="flex gap-3 items-start">
                        <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                          {isUrl(imagen) ? (
                            <img src={imagen} alt="preview" className="w-full h-full object-cover" />
                          ) : imagen ? (
                            <span className="text-3xl">{imagen}</span>
                          ) : (
                            <span className="text-gray-300 text-3xl">🖼️</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            ref={el => fileInputRefs.current[index] = el}
                            onChange={(e) => handleFileChange(e, index)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[index]?.click()}
                            disabled={uploadingIndex === index}
                            className="w-full px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 text-sm"
                          >
                            {uploadingIndex === index ? '⏳ Subiendo...' : '📁 Subir JPG / PNG'}
                          </button>

                          <input
                            type="text"
                            value={imagen}
                            onChange={(e) => updateImage(index, e.target.value)}
                            placeholder="O pegá una URL de imagen"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm bg-white"
                          />
                        </div>

                        {formData.imagenes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="px-3 py-2 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-colors text-sm shrink-0"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm"
                >
                  ➕ Agregar otra imagen
                </button>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  📏 Opciones de Tamaño
                </label>
                {formData.tamaños.map((tamaño, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tamaño.nombre}
                      onChange={(e) => updateTamaño(index, 'nombre', e.target.value)}
                      placeholder="Nombre del tamaño"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={tamaño.precio_adicional}
                      onChange={(e) => updateTamaño(index, 'precio_adicional', e.target.value)}
                      placeholder="Precio adicional"
                      className="w-32 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                    {formData.tamaños.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTamaño(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTamaño}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  ➕ Agregar Tamaño
                </button>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  📄 Tipo de Papel (activar/desactivar y precio)
                </label>
                {formData.tipos_papel.map((papel, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={papel.nombre}
                      onChange={(e) => updateTipoPapel(index, 'nombre', e.target.value)}
                      placeholder="Tipo de papel"
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />

                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white/50">
                      <input
                        type="checkbox"
                        checked={Boolean(papel.activo)}
                        onChange={(e) => updateTipoPapel(index, 'activo', e.target.checked)}
                      />
                      <span className="text-sm font-semibold text-gray-700">Activo</span>
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      value={papel.precio_adicional}
                      onChange={(e) => updateTipoPapel(index, 'precio_adicional', e.target.value)}
                      placeholder="Precio adicional"
                      className="w-full md:w-40 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />

                    {formData.tipos_papel.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTipoPapel(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTipoPapel}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  ➕ Agregar Tipo de Papel
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-green-400 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {editingProduct ? '💾 Guardar Cambios' : '✅ Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 bg-gray-500 text-white rounded-2xl font-bold text-lg hover:bg-gray-600 transition-all duration-300"
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="glass p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{producto.nombre}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(producto)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {producto.imagenes && producto.imagenes[0] && isUrl(producto.imagenes[0]) && (
                <div className="mb-3 rounded-xl overflow-hidden h-40 bg-gray-100">
                  <img
                    src={producto.imagenes[0]}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-gray-600 mb-2 text-sm">{producto.descripcion}</p>
              <p className="text-lg font-bold text-gradient mb-2">${producto.precio}</p>
              <p className="text-sm text-purple-600 mb-2">🏷️ {producto.categoria}</p>

              {producto.descuento > 0 && (
                <p className="text-sm text-red-600 mb-2">🎯 -{producto.descuento}% OFF</p>
              )}

              {producto.tamaños && producto.tamaños.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-700">📏 Tamaños:</p>
                  {producto.tamaños.map((tamaño, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      {tamaño.nombre} {tamaño.precio_adicional > 0 ? `(+$${tamaño.precio_adicional})` : ''}
                    </p>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500">
                🖼️ {producto.imagenes ? producto.imagenes.length : 0} imágenes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}