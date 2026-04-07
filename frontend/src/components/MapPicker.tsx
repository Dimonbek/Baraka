import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialPos?: [number, number];
}

function LocationMarker({ onLocationSelect, initialPos }: MapPickerProps) {
    const [position, setPosition] = useState<L.LatLng>(
        initialPos ? L.latLng(initialPos[0], initialPos[1]) : L.latLng(41.2995, 69.2401) // Tashkent default
    );

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
        moveend() {
             const center = map.getCenter();
             setPosition(center);
             onLocationSelect(center.lat, center.lng);
        }
    });

    useEffect(() => {
        if (initialPos) {
            map.setView(initialPos, map.getZoom());
        }
    }, [initialPos, map]);

    return (
        <Marker position={position} />
    );
}

export function MapPicker({ onLocationSelect, initialPos }: MapPickerProps) {
    const defaultCenter: [number, number] = initialPos || [41.2995, 69.2401]; // Tashkent

    return (
        <div className="h-[200px] w-full rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-inner mt-2">
            <MapContainer 
                center={defaultCenter} 
                zoom={13} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} initialPos={initialPos} />
            </MapContainer>
            <p className="text-[9px] text-tg-hint mt-1 text-center font-medium opacity-60">Xaritani suring yoki o'zingizga kerakli nuqtani bosing</p>
        </div>
    );
}
