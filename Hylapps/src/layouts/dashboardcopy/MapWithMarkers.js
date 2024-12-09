import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const createCustomIcon = (heading, width, height, iconType) => {
  let iconUrl;

  switch (iconType) {
    case 'small':
      iconUrl = '/ship-popup.png';
      break;
    case 'medium':
      iconUrl = '/ship-popup.png';
      break;
    case 'large':
      iconUrl = '/ship-popup.png';
      break;
    case 'extra-large':
      iconUrl = '/BERTH-ICON.PNG';
      break;
    default:
      iconUrl = '/ship-popup.png';
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg); width: ${width}px; height: ${height}px;">
             <img src="${iconUrl}" style="width: 100%; height: 100%;" />
           </div>`,
    iconSize: [width, height],
  });
};

const createPointIcon = (width, height) => {
  return L.divIcon({
    className: 'point-icon',
    html: `<div style="width: ${width}px; height: ${height}px; background-color: red; border-radius: 50%;"></div>`,
    iconSize: [width, height],
  });
};

const getIconForZoom = (zoom) => {
  if (zoom > 23) return { width: 50, height: 120, type: 'extra-large' };
  if (zoom > 20) return { width: 60, height: 80, type: 'extra-large' };
  if (zoom > 17.75) return { width: 60, height: 120, type: 'large' };
  if (zoom > 16.75) return { width: 45, height: 120, type: 'large' };
  if (zoom > 16) return { width: 35, height: 120, type: 'large' };
  if (zoom > 15.75) return { width: 25, height: 70, type: 'large' };
  if (zoom > 14.75) return { width: 15, height: 40, type: 'large' };
  if (zoom > 13.75) return { width: 10, height: 35, type: 'large' };
  if (zoom > 12.75) return { width: 10, height: 35, type: 'large' };
  if (zoom > 11.5) return { width: 9, height: 25, type: 'large' };
  if (zoom > 10.75) return { width: 8, height: 15, type: 'large' };
  if (zoom > 9.75) return { width: 8, height: 15, type: 'large' };
  if (zoom > 8.75) return { width: 8, height: 14, type: 'large' };
  if (zoom > 7) return { width: 8, height: 8, type: 'large' };
  if (zoom > 6) return { width: 8, height: 8, type: 'large' };
  if (zoom > 4) return { width: 8, height: 8, type: 'point' };
  if (zoom > 2) return { width: 7, height: 7, type: 'point' };
  return { width: 6, height: 6, type: 'point' };
};

const MapWithMarkers = ({ vessels, selectedVessel }) => {
    const map = useMap();
    const markerClusterGroupRef = useRef(null);
    const prevSelectedVesselRef = useRef(null); // Track the previous selected vessel
  
    useEffect(() => {
      if (map) {
        const updateMarkers = () => {
          const currentZoom = map.getZoom();
          const { width, height, type } = getIconForZoom(currentZoom);
    
          if (markerClusterGroupRef.current) {
            markerClusterGroupRef.current.clearLayers();
          } else {
            markerClusterGroupRef.current = L.markerClusterGroup({
              maxClusterRadius: 30,
            });
            map.addLayer(markerClusterGroupRef.current);
          }
    
          vessels.forEach((vessel) => {
            if (vessel.lat !== undefined && vessel.lng !== undefined) {
              const marker = L.marker([vessel.lat, vessel.lng], {
                icon:
                  type === 'point'
                    ? createPointIcon(width, height)
                    : createCustomIcon(vessel.heading, width, height, type),
              });
    
              // Bind popup to marker
              marker.bindPopup(
                `<div class="popup-container">
                  <div class="popup-header">
                    <h3 class="popup-title">${vessel.name || 'No name'} <span class="popup-imo">${vessel.imo ? vessel.imo : 'N/A'}</span></h3>
                  </div>
                  <div class="popup-details">
                    <div class="popup-detail"><strong>TYPE :</strong><span class="popup-value time">${vessel.SpireTransportType || '-'}</span></div>
                    <div class="popup-detail"><span class="popup-value">${vessel.heading ? vessel.heading + '°' : '-'} | ${vessel.speed ? vessel.speed + ' kn' : '-'}</span></div>
                    <div class="popup-detail"><strong>DESTN :</strong><span class="popup-value time">${vessel.destination || '-'}</span></div>
                    <div class="popup-detail"><strong>ETA :</strong><span class="popup-value time">${vessel.eta || '-'}</span></div>
                  </div>
                  <div class="popup-footer">
                    <a href="/dashboard/${vessel.name}" class="view-more-link">++View More</a>
                  </div>
                </div>`
              );
    
              // Add click event for flyTo functionality
              marker.on('click', () => {
                
    
                // Ensure the popup stays open
                marker.openPopup();
              });

              
    
              markerClusterGroupRef.current.addLayer(marker);
            } else {
              console.error(`Invalid coordinates for vessel: ${JSON.stringify(vessel)}`);
            }
          });
        };
    
        const flyToVessel = () => {
          if (selectedVessel && selectedVessel !== prevSelectedVesselRef.current) {
            const { width, height, type } = getIconForZoom(map.getZoom());
    
            const customIcon = createCustomIcon(
              selectedVessel.heading,
              width,
              height,
              type
            );
    
            const tempMarker = L.marker(
              [selectedVessel.lat, selectedVessel.lng],
              { icon: customIcon }
            )
              .addTo(map)
              .bindPopup(
                `<div class="popup-container">
                  <div class="popup-header">
                    <h3 class="popup-title">${selectedVessel.name || 'No name'} <span class="popup-imo">${selectedVessel.imo ? selectedVessel.imo : 'N/A'}</span></h3>
                  </div>
                  <div class="popup-details">
                    <div class="popup-detail"><strong>TYPE :</strong><span class="popup-value time">${selectedVessel.SpireTransportType || '-'}</span></div>
                    <div class="popup-detail"><span class="popup-value">${selectedVessel.heading ? selectedVessel.heading + '°' : '-'} | ${selectedVessel.speed ? selectedVessel.speed + ' kn' : '-'}</span></div>
                    <div class="popup-detail"><strong>DESTN :</strong><span class="popup-value time">${selectedVessel.destination || '-'}</span></div>
                    <div class="popup-detail"><strong>ETA :</strong><span class="popup-value time">${selectedVessel.eta || '-'}</span></div>
                  </div>
                  <div class="popup-footer">
                    <a href="/dashboard/${selectedVessel.name}" class="view-more-link">++View More</a>
                  </div>
                </div>`
              )
              .openPopup();
    
            map.flyTo([selectedVessel.lat, selectedVessel.lng], 8, {
              animate: true,
              duration: 1,
            });
            
    
            // Ensure the popup stays open
            tempMarker.on('popupclose', () => {
              tempMarker.openPopup();
            });
    
            prevSelectedVesselRef.current = selectedVessel;
          }
        };
    
        updateMarkers();
        flyToVessel();
      }
    }, [map, vessels, selectedVessel]);
    
    return null;
    }  

MapWithMarkers.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      caseid: PropTypes.number,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      speed: PropTypes.number,
      heading: PropTypes.number,
      SpireTransportType: PropTypes.string,
      eta: PropTypes.string,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  selectedVessel: PropTypes.shape({
    SpireTransportType: PropTypes.string,
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    speed: PropTypes.number,
    caseid: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
    speed: PropTypes.number,
    eta: PropTypes.string,
    destination: PropTypes.string,
  }),
  
};

export default MapWithMarkers;
