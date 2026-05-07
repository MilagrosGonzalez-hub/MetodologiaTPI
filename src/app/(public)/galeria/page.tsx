/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { obtenerGaleria } from '@/services/noticias.service'
import { GaleriaClient } from './GaleriaClient'

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Galería de fotos del Centro Educativo Educar para Transformar. Instalaciones, eventos y momentos especiales.',
}

export default async function GaleriaPage() {
  let imagenes: any[] = []
  try {
    imagenes = await obtenerGaleria() ?? []
  } catch {
    imagenes = []
  }
  return <GaleriaClient imagenes={imagenes} />
}
