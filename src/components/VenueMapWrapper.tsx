"use client"

import dynamic from "next/dynamic"

const VenueMap = dynamic(() => import("@/components/VenueMap"), { ssr: false })

interface VenueMarker {
  slug: string
  name: string
  suburb: string | null
  lat: number
  lng: number
}

export default function VenueMapWrapper({ venues }: { venues: VenueMarker[] }) {
  return <VenueMap venues={venues} />
}
