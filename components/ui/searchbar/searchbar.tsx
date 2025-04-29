"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@/app/env"
import { loadGoogleMapsApi } from "@/lib/google-maps-loader"

declare global {
  interface Window {
    google: any
  }
}

type PlaceResult = {
  id: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
}

export function SearchBar({ onSelectLocation }: { onSelectLocation?: (loc: PlaceResult) => void }) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const googleRef = useRef<typeof google | null>(null)

  const { toast } = useToast()

  // Load Google Maps API
  useEffect(() => {
    if (!NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      toast({
        title: "API Key Missing",
        description: "Google Maps API key is not configured",
        variant: "destructive",
      })
      return
    }

    const loadGoogle = async () => {
      try {
        const googleInstance = await loadGoogleMapsApi()
        googleRef.current = googleInstance
        const dummyDiv = document.createElement("div")
        placesService.current = new googleInstance.maps.places.PlacesService(dummyDiv)
        autocompleteService.current = new googleInstance.maps.places.AutocompleteService()
      } catch (error) {
        toast({
          title: "Google Maps Load Error",
          description: "Failed to load Google Maps API",
          variant: "destructive",
        })
      }
    }

    loadGoogle()
  }, [toast])

  // Debounced autocomplete
  useEffect(() => {
    if (!query.trim() || !autocompleteService.current || !googleRef.current) {
      setPredictions([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      setIsSearching(true)
      autocompleteService.current?.getPlacePredictions(
        { input: query, types: ["geocode", "establishment"] },
        (preds, status) => {
          if (status === googleRef.current?.maps.places.PlacesServiceStatus.OK && preds) {
            setPredictions(preds)
            setShowResults(true)
          } else {
            setPredictions([])
          }
          setIsSearching(false)
        },
      )
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Close results on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const getPlaceDetails = useCallback(
    (placeId: string) => {
      if (!placesService.current || !googleRef.current) return

      placesService.current.getDetails(
        { placeId, fields: ["name", "geometry", "formatted_address"] },
        (place, status) => {
          if (status === googleRef.current.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const loc: PlaceResult = {
              id: place.place_id || crypto.randomUUID(),
              name: place.name || "Unnamed Place",
              address: place.formatted_address || "",
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            }

            if (onSelectLocation) {
              onSelectLocation(loc)
            } else {
              window.location.href = `/?lat=${loc.location.lat}&lng=${loc.location.lng}`
            }

            setQuery(loc.name)
            setShowResults(false)
          } else {
            toast({
              title: "Details Error",
              description: "Unable to retrieve place details",
              variant: "destructive",
            })
          }
        },
      )
    },
    [onSelectLocation, toast],
  )

  const clearSearch = () => {
    setQuery("")
    setPredictions([])
    setShowResults(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {isSearching ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : query ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {showResults && predictions.length > 0 && (
        <Card className="absolute top-full mt-2 left-0 right-0 z-10 max-h-64 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {predictions.map(prediction => (
              <li
                key={prediction.place_id}
                className="flex items-start gap-2 cursor-pointer px-2 py-2 hover:bg-muted rounded-md"
                onClick={() => getPlaceDetails(prediction.place_id)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                  <div className="text-sm text-muted-foreground">{prediction.structured_formatting.secondary_text}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
