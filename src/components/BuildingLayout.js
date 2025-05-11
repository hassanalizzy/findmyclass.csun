import React, { useState } from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import PanZoom from 'react-easy-panzoom'; // No CSS import needed

function BuildingLayout({ classroom }) {
  const [mode, setMode] = useState('mediumZoom'); 
  // mode can be 'mediumZoom' or 'panZoom'

  const floorNumber = getFloorNumber(classroom.room_number);
  const imageUrl = getImageUrl(classroom.building.name, floorNumber);

  const toggleMode = () => {
    setMode((prev) => (prev === 'mediumZoom' ? 'panZoom' : 'mediumZoom'));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {classroom.building.name} - Floor {floorNumber}
      </Typography>

      {!imageUrl ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Floor plan not available.
        </Typography>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={toggleMode}
          >
            Switch to {mode === 'mediumZoom' ? 'Pan & Zoom' : 'Medium Zoom'} Mode
          </Button>

          {mode === 'mediumZoom' ? (
            // Medium zoom mode: click to open a zoomed modal
            <Zoom>
              <img
                src={imageUrl}
                alt={`Floor ${floorNumber} Layout`}
                style={{ width: '100%', maxWidth: '600px', cursor: 'zoom-in' }}
              />
            </Zoom>
          ) : (
            // Pan & Zoom mode: pinch/scroll to zoom and drag to pan
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                height: '400px',
                border: '1px solid #ddd',
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              <PanZoom
                boundaryRatioVertical={1}
                boundaryRatioHorizontal={1}
                minZoom={1}
                maxZoom={5}
                zoomSpeed={0.1}
                style={{ width: '100%', height: '100%' }}
              >
                <img
                  src={imageUrl}
                  alt={`Floor ${floorNumber} Layout`}
                  style={{ width: '100%', height: 'auto' }}
                />
              </PanZoom>
            </div>
          )}
        </Box>
      )}
    </Container>
  );
}

const getFloorNumber = (roomNumber) => {
  if (!roomNumber || roomNumber.length === 0) return 'Unknown';
  const firstChar = roomNumber.charAt(0);
  if (isNaN(firstChar)) {
    return 'Unknown';
  }
  return firstChar;
};

const getImageUrl = (buildingName, floorNumber) => {
  const formattedBuildingName = buildingName.replace(/\s+/g, '_').toLowerCase();
  return `/images/${formattedBuildingName}_floor_${floorNumber}.jpg`;
};

export default BuildingLayout;
