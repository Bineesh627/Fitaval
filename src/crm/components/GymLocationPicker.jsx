import React, { useState } from "react";
import {
  Navigation,
  Search,
  Check,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PRESET_LOCATIONS } from "@/data";

export { PRESET_LOCATIONS };

export function GymLocationPicker({
  address = "",
  city = "",
  latitude = 28.4815,
  longitude = 77.0818,
  onChange,
}) {
  const [currentAddress, setCurrentAddress] = useState(address || "Sector 18, Commercial Plaza, 3rd Floor");
  const [currentCity, setCurrentCity] = useState(city || "Gurugram, Haryana");
  const [lat, setLat] = useState(latitude || 28.4815);
  const [lng, setLng] = useState(longitude || 77.0818);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    const found = PRESET_LOCATIONS.find(
      (loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setTimeout(() => {
      if (found) {
        setLat(found.lat);
        setLng(found.lng);
        setCurrentAddress(found.name);
        setCurrentCity(found.city);
      } else {
        const pseudoLat = 28.45 + Math.random() * 0.1;
        const pseudoLng = 77.05 + Math.random() * 0.1;
        setLat(Number(pseudoLat.toFixed(5)));
        setLng(Number(pseudoLng.toFixed(5)));
        setCurrentAddress(searchQuery);
      }
      setSearching(false);
    }, 350);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(5));
        const userLng = Number(pos.coords.longitude.toFixed(5));
        setLat(userLat);
        setLng(userLng);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setLat(28.4815);
        setLng(77.0818);
      },
      { timeout: 8000 }
    );
  };

  const handleConfirmLocation = () => {
    setConfirmed(true);
    onChange?.({
      address: currentAddress,
      city: currentCity,
      latitude: Number(lat),
      longitude: Number(lng),
    });
    setTimeout(() => setConfirmed(false), 2000);
  };

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(Number(lng) - 0.008).toFixed(4)}%2C${(Number(lat) - 0.005).toFixed(4)}%2C${(Number(lng) + 0.008).toFixed(4)}%2C${(Number(lat) + 0.005).toFixed(4)}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="space-y-4">
      {/* Search Bar - Full Width on Mobile */}
      <div>
        <Label htmlFor="gym-location-picker-search-location" className="text-xs font-semibold text-foreground">Search Location</Label>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input id="gym-location-picker-search-location" name="searchQuery"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, landmark, commercial plaza..."
              className="pl-9 text-xs sm:text-sm rounded-xl h-11"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={searching}
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl border-border px-4 text-xs font-semibold h-11"
            >
              {searching ? "Searching..." : "Search"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="flex-1 sm:flex-none rounded-xl border-border px-3 text-xs font-semibold gap-1 text-primary hover:bg-primary/10 h-11"
              title="Use device GPS"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Current GPS</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Suggested Quick Locations */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] text-muted-foreground shrink-0 font-medium">Presets:</span>
        {PRESET_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            type="button"
            onClick={() => {
              setLat(loc.lat);
              setLng(loc.lng);
              setCurrentAddress(loc.name);
              setCurrentCity(loc.city);
            }}
            className="text-[11px] bg-secondary hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border border-border/60 shrink-0 font-medium"
          >
            {loc.name.split(",")[0]}
          </button>
        ))}
      </div>

      {/* Interactive OpenStreetMap Preview with Pin Marker */}
      <div className="relative w-full h-60 rounded-2xl overflow-hidden border border-border shadow-inner bg-slate-100 touch-manipulation">
        <iframe
          key={`${lat}-${lng}`}
          title="OpenStreetMap Picker"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={osmEmbedUrl}
          className="w-full h-full border-0 rounded-2xl"
        />

        {/* Top Badges: OpenStreetMap label and Open external link */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-card/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border text-[10px] text-foreground font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OpenStreetMap</span>
        </div>

        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-card/95 hover:bg-card text-[11px] font-semibold text-primary px-2.5 py-1 rounded-lg border border-border shadow-xs transition-colors"
        >
          <span>Open in OSM</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Bottom Coordinates badge */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-card/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border text-[10px] text-foreground font-mono shadow-xs">
          <span className="text-primary font-bold">●</span>
          <span>Lat: {lat}</span>
          <span>|</span>
          <span>Lng: {lng}</span>
        </div>
      </div>

      {/* Editable Address Details */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="gym-location-picker-selected-address" className="text-xs text-muted-foreground font-medium">Selected Address</Label>
          <Input id="gym-location-picker-selected-address" name="currentAddress"
            autoComplete="street-address"
            value={currentAddress}
            onChange={(e) => setCurrentAddress(e.target.value)}
            placeholder="Commercial Plaza, Floor 3"
            className="mt-1 text-xs sm:text-sm rounded-xl h-11"
          />
        </div>
        <div>
          <Label htmlFor="gym-location-picker-city-state" className="text-xs text-muted-foreground font-medium">City & State</Label>
          <Input id="gym-location-picker-city-state" name="currentCity"
            autoComplete="off"
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            placeholder="Gurugram, Haryana"
            className="mt-1 text-xs sm:text-sm rounded-xl h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="gym-location-picker-latitude" className="text-xs text-muted-foreground font-medium">Latitude</Label>
          <Input id="gym-location-picker-latitude" name="lat"
            autoComplete="off"
            type="number"
            step="0.00001"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            className="mt-1 text-xs font-mono rounded-xl h-10"
          />
        </div>
        <div>
          <Label htmlFor="gym-location-picker-longitude" className="text-xs text-muted-foreground font-medium">Longitude</Label>
          <Input id="gym-location-picker-longitude" name="lng"
            autoComplete="off"
            type="number"
            step="0.00001"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            className="mt-1 text-xs font-mono rounded-xl h-10"
          />
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        type="button"
        onClick={handleConfirmLocation}
        className={`w-full rounded-xl h-12 text-sm font-bold transition-all ${
          confirmed
            ? "bg-green-600 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {confirmed ? (
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Location Confirmed & Linked
          </span>
        ) : (
          "Confirm Location"
        )}
      </Button>
    </div>
  );
}

export default GymLocationPicker;
