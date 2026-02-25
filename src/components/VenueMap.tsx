"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import Link from "next/link"

interface VenueMarker {
  slug: string
  name: string
  suburb: string | null
  lat: number
  lng: number
}

export default function VenueMap({ venues }: { venues: VenueMarker[] }) {
  const brisbane: [number, number] = [-27.4698, 153.0251]

  return (
    <MapContainer
      center={brisbane}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {venues.map(venue => (
        <CircleMarker
          key={venue.slug}
          center={[venue.lat, venue.lng]}
          radius={9}
          pathOptions={{
            color: "#5b21b6",
            fillColor: "#7c3aed",
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <Link
              href={`/venues/${venue.slug}`}
              className="font-semibold text-violet-700 hover:underline"
            >
              {venue.name}
            </Link>
            {venue.suburb && (
              <p className="text-xs text-zinc-500 mt-0.5">{venue.suburb}</p>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
