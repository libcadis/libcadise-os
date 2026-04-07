"use client"
import "../app/globals.css"
import { useState, useRef } from "react"
import { useCart } from "../components/CartContext"

export default function StickerEditor() {

  const [uploadedImage, setUploadedImage] = useState(null)
  const [tamano, setTamano] = useState("7cm")
  const [impresion, setImpresion] = useState("Mate")
  const [cantidad, setCantidad] = useState(1)

  const { addToCart } = useCart()
  const fileInputRef = useRef()

  // SUBIR IMAGEN
  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setUploadedImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  // AGREGAR AL CARRITO
  function agregarAlCarrito() {
    if (!uploadedImage) {
      alert("Por favor subí una imagen antes de agregar al carrito.")
      return
    }
    const precioUnit = tamano === "7cm" ? 350 : 200
    const producto = {
      nombre: `Sticker Personalizado ${tamano} - ${impresion}`,
      precio: precioUnit,
      cantidad,
      imagenes: [uploadedImage],
      descripcion: `Tamaño: ${tamano} | Impresión: ${impresion} | Cantidad: ${cantidad}`,
      categoria: "stickers",
      personalizado: true,
    }
    addToCart(producto)
    alert("¡Sticker agregado al carrito! 🛒")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="container max-w-2xl mx-auto">

        {/* TÍTULO */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gradient mb-3">
            Personaliza tu Sticker ✨
          </h1>
          <p className="text-lg text-gray-600">
            Subí tu imagen y elegí las opciones
          </p>
        </div>

        <div className="space-y-6">

          {/* SUBIR IMAGEN */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-purple-100">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              📸 Subir imagen
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {uploadedImage ? "📷 Cambiar imagen" : "📷 Seleccionar imagen"}
            </button>

            {uploadedImage && (
              <div className="mt-5 flex justify-center">
                <img
                  src={uploadedImage}
                  alt="Vista previa"
                  className="rounded-2xl shadow-lg border-4 border-purple-200"
                  style={{ maxHeight: "220px", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          {/* TAMAÑO */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-purple-100">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              📏 Tamaño
            </label>
            <div className="flex gap-4">
              {["7cm", "4cm"].map((op) => (
                <button
                  key={op}
                  onClick={() => setTamano(op)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 ${
                    tamano === op
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* TIPO DE IMPRESIÓN */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-purple-100">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              🖨️ Tipo de impresión
            </label>
            <div className="flex gap-4">
              {["Mate", "Brillante"].map((op) => (
                <button
                  key={op}
                  onClick={() => setImpresion(op)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 ${
                    impresion === op
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* CANTIDAD */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-purple-100">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              🔢 Cantidad
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-700 transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="text-3xl font-bold text-gray-800 w-12 text-center">{cantidad}</span>
              <button
                onClick={() => setCantidad(c => c + 1)}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-700 transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* BOTÓN AGREGAR AL CARRITO */}
          <button
            className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white py-5 rounded-2xl font-bold text-xl hover:from-orange-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={agregarAlCarrito}
          >
            🛒 Agregar al carrito
          </button>

        </div>
      </div>
    </div>
  )
}