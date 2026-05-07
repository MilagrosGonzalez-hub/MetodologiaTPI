'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Images } from '@phosphor-icons/react'

interface Imagen {
  id: number
  url: string
  descripcion: string | null
  categoria: string | null
}

const categorias = ['TODOS', 'INSTALACIONES', 'EVENTOS'] as const

export function GaleriaClient({ imagenes }: { imagenes: Imagen[] }) {
  const [filtro, setFiltro] = useState<string>('TODOS')
  const [modalImg, setModalImg] = useState<Imagen | null>(null)

  const filtradas = filtro === 'TODOS'
    ? imagenes
    : imagenes.filter((i) => i.categoria === filtro)

  return (
    <>
      {/* Header */}
      <section className="pt-24 pb-12 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Imágenes</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Galería fotográfica
            </h1>
            {/* Filtros */}
            <div className="flex gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltro(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                    filtro === cat
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-400'
                  }`}
                >
                  {cat === 'TODOS' ? 'Todas' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid masonry-like */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtradas.length === 0 ? (
          <div className="py-24 text-center">
            <Images size={48} className="text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No hay imágenes en esta categoría</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtradas.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setModalImg(img)}
                className="block w-full break-inside-avoid group rounded-xl overflow-hidden relative"
                aria-label={`Ver imagen: ${img.descripcion ?? 'Sin descripción'}`}
              >
                <img
                  src={img.url}
                  alt={img.descripcion ?? 'Imagen de galería'}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={i < 4 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/40 transition-colors duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
                    {img.descripcion}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal lightbox */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setModalImg(null)}
          role="dialog"
          aria-label="Ver imagen ampliada"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setModalImg(null)}
            aria-label="Cerrar imagen"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-4xl w-full max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImg.url}
              alt={modalImg.descripcion ?? 'Imagen ampliada'}
              className="w-full h-full object-contain rounded-2xl"
            />
            {modalImg.descripcion && (
              <p className="mt-4 text-center text-white/70 text-sm">{modalImg.descripcion}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
