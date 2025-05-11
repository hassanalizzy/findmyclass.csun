/* ===== constants outside the component so they NEVER change ===== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import parse from 'html-react-parser';
import SatelliteIcon from '@mui/icons-material/Satellite';
import MapIcon from '@mui/icons-material/Map';
import BuildingLayout from './BuildingLayout';
const GOOGLE_MAP_LIBS = ['places', 'geometry'];   // keeps LoadScript happy

function NavigationPage() {
  const { classId } = useParams();

  /* ────────── STATE ────────── */
  const [classInfo,      setClassInfo]      = useState(null);
  const [userLocation,   setUserLocation]   = useState(null);
  const [destination,    setDestination]    = useState(null);
  const [directions,     setDirections]     = useState(null);
  const [steps,          setSteps]          = useState([]);
  const [turnMarkers,    setTurnMarkers]    = useState([]);
  const [hasArrived,     setHasArrived]     = useState(false);
  const [mapType,        setMapType]        = useState('satellite');
  const [heading,        setHeading]        = useState(0);

  const watchIdRef = useRef(null);
  const mapRef     = useRef(null);

  /* ────────── GOOGLE MAPS LOAD ────────── */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBS,          // <-- stable reference
  });

  /* ────────── HELPERS ────────── */
  const metersBetween = (lat1, lon1, lat2, lon2) => {
    const R = 6371000, toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /* ────────── FETCH CLASS INFO ────────── */
  const fetchClass = useCallback(() => {
    axios.get(`https://findmyclass.info/api/schedules/${classId}/`, {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    })
    .then(res => setClassInfo(res.data))
    .catch(err => console.error('Class fetch failed', err));
  }, [classId]);

  useEffect(fetchClass, [fetchClass]);

  /* ────────── GEOLOCATION WATCH ────────── */
  const startWatch = useCallback(() => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    watchIdRef.current = navigator.geolocation.watchPosition(
      p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      err => console.error('Location error', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, []);

  /* ────────── DEVICE ORIENTATION ────────── */
  useEffect(() => {
    const handle = e => {
      const a = (typeof e.webkitCompassHeading === 'number')
        ? e.webkitCompassHeading
        : e.alpha;
      if (a != null) setHeading(a);
    };

    if (DeviceOrientationEvent?.requestPermission) {
      DeviceOrientationEvent.requestPermission()
        .then(p => p === 'granted' && window.addEventListener('deviceorientation', handle, true))
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientationabsolute', handle, true);
    }
    return () => window.removeEventListener('deviceorientation', handle);
  }, []);

  /* ────────── INITIALISE DEST + WATCH ────────── */
  useEffect(() => {
    if (!isLoaded || !classInfo) return;
    setDestination({
      lat: classInfo.classroom.latitude,
      lng: classInfo.classroom.longitude,
    });
    startWatch();
    return () => watchIdRef.current && navigator.geolocation.clearWatch(watchIdRef.current);
  }, [isLoaded, classInfo, startWatch]);

  /* ────────── ROUTE CALCULATION ────────── */
  const buildRoute = useCallback((origin, dest) => {
    const svc = new window.google.maps.DirectionsService();
    svc.route({
      origin,
      destination: dest,
      travelMode: window.google.maps.TravelMode.WALKING,
    }, (res, status) => {
      if (status !== 'OK') return console.error('Route error', res);
      setDirections(res);
      setSteps(res.routes[0].legs[0].steps);

      const turnMs = res.routes[0].legs[0].steps
        .filter(s => s.maneuver?.includes('turn'))
        .map(s => ({
          position: s.start_location,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: window.google.maps.geometry.spherical.computeHeading(
              s.start_location, s.end_location),
            scale: 5, fillColor: '#F00', fillOpacity: 1,
            strokeColor: '#FFF', strokeWeight: 2,
          }
        }));
      setTurnMarkers(turnMs);
    });
  }, []);

  /* ────────── ARRIVAL + DEVIATION ────────── */
  const handleLocationUpdate = useCallback(() => {
    if (!userLocation || !destination) return;

    /* —— arrival —— */
    if (metersBetween(userLocation.lat, userLocation.lng, destination.lat, destination.lng) <= 20) {
      setHasArrived(true);
      watchIdRef.current && navigator.geolocation.clearWatch(watchIdRef.current);
      return;
    }

    /* —— deviation —— */
    if (directions) {
      const loc = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
      const pathCoords = directions.routes[0].overview_path;
      const polyline   = new window.google.maps.Polyline({ path: pathCoords }); // ← FIX
      const onPath = window.google.maps.geometry.poly.isLocationOnEdge(
        loc, polyline, 0.0005);
      if (!onPath) buildRoute(userLocation, destination);
    }
  }, [userLocation, destination, directions, buildRoute]);

  /* ────────── ON LOCATION CHANGE ────────── */
  useEffect(() => {
    if (userLocation && destination && !directions)
      buildRoute(userLocation, destination);
    handleLocationUpdate();
  }, [userLocation, destination, directions, buildRoute, handleLocationUpdate]);

  /* ────────── MAP BEHAVIOUR ────────── */
  const onLoadMap = m => { mapRef.current = m; m.setTilt(45); };
  useEffect(() => { mapRef.current?.panTo(userLocation); }, [userLocation]);

  /* ────────── RENDER ────────── */
  if (loadError) return <div>Error loading Maps</div>;
  if (!isLoaded)   return <div>Loading Maps…</div>;

  if (hasArrived)  return <BuildingLayout classroom={classInfo?.classroom} />;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Map-type toggle */}
      <Box sx={{ position:'absolute', top:10, left:10, zIndex:1, bgcolor:'white', borderRadius:1, p:1 }}>
        <ToggleButtonGroup value={mapType} exclusive onChange={(_,v)=>v&&setMapType(v)}>
          <ToggleButton value="roadmap"><MapIcon/></ToggleButton>
          <ToggleButton value="satellite"><SatelliteIcon/></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Directions panel */}
      <Box sx={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:1,
        bgcolor:'white', borderRadius:'12px 12px 0 0',
        p:2, boxShadow:'0 -2px 10px rgba(0,0,0,0.1)',
        maxHeight:'30vh', overflowY:'auto'
      }}>
        <Typography variant="h6" sx={{ color:'red', fontWeight:'bold', mb:1 }}>Directions</Typography>
        <List>
          {steps.map((s,i)=>(
            <ListItem key={i} sx={{ p:0, mb:1 }}>
              <Box sx={{ display:'flex', alignItems:'center', width:'100%' }}>
                <Box sx={{ mr:2, color:'red' }}>
                  {s.maneuver?.includes('turn')
                    ? <i className="material-icons">directions</i>
                    : <i className="material-icons">arrow_forward</i>}
                </Box>
                <ListItemText
                  primary={parse(s.instructions)}
                  primaryTypographyProps={{ fontWeight:'bold', color:'black' }}
                  secondary={`Distance: ${s.distance.text} • Time: ${s.duration.text}`}
                  secondaryTypographyProps={{ color:'gray' }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Google Map */}
      <GoogleMap
        onLoad={onLoadMap}
        mapContainerStyle={{ width:'100%', height:'90vh' }}
        center={userLocation || {lat:34.0522, lng:-118.2437}}
        zoom={18}
        mapTypeId={mapType}
        options={{
          tilt:45, mapTypeControl:false, streetViewControl:false,
          fullscreenControl:false, rotateControl:false,
          gestureHandling:'greedy', disableDoubleClickZoom:true,
          minZoom:16, maxZoom:20,
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers:true, preserveViewport:true,
              polylineOptions:{ strokeColor:'#FF0000', strokeWeight:6 },
            }}
          />
        )}
        {turnMarkers.map((m,i)=><Marker key={i} {...m} />)}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              rotation: heading,
              scale:6, fillColor:'#00BFFF', fillOpacity:1,
              strokeColor:'white', strokeWeight:2,
            }}
          />
        )}
      </GoogleMap>
    </Box>
  );
}

export default NavigationPage;
