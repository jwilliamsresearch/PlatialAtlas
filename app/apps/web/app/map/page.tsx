"use client";
import { useMemo, useState, useCallback } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  SelectChangeEvent, 
  Stack, 
  Typography, 
  Checkbox, 
  FormControlLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import dynamic from 'next/dynamic';
import Tooltip from '@mui/material/Tooltip';
import { FACETS, FacetKey } from '@/lib/facets';

const MapShell = dynamic(() => import('@/components/MapShell'), { ssr: false });
const FacetLegend = dynamic(() => import('@/components/FacetLegend'), { ssr: false });
const FacetBadges = dynamic(() => import('@/components/FacetBadges'), { ssr: false });
const AreaStatistics = dynamic(() => import('@/components/AreaStatistics'), { ssr: false });

export default function MapPage() {
  const [res, setRes] = useState<number>(Number(process.env.NEXT_PUBLIC_DEFAULT_H3_RES || 8));
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedFacets, setSelectedFacets] = useState<FacetKey[]>([]);
  const [palette, setPalette] = useState<'Blues' | 'Greens' | 'OrRd' | 'PuBu' | 'YlGnBu' | 'Colorgorical1'>('YlGnBu');
  const [classes, setClasses] = useState<number>(5);
  const [selectedCell, setSelectedCell] = useState<{ h3: string; n: number; cats?: Record<string, number> } | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  const handleRes = (e: SelectChangeEvent<number>) => setRes(Number(e.target.value));
  
  const handleCellSelect = useCallback((cellData: { h3: string; n: number; cats?: Record<string, number> } | null) => {
    setSelectedCell(cellData);
  }, []);

  return (
    <Box className="map-container" sx={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Sidebar overlay, can be toggled */}
      {sidebarOpen && (
        <Box className="map-sidebar" sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '350px',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          padding: 0,
          paddingTop: '56px', // ensure controls are below navbar
          overflowY: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1200,
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 1 }}>
            <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              Map Controls
            </Typography>
            <button
              aria-label="Close sidebar"
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#1e3a5f' }}
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </Box>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="map control tabs">
              <Tab label="Place Facets" />
              <Tab label="Options" />
              <Tab label="Hexagon Stats" />
            </Tabs>
          </Box>
          
          {/* Tab Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {/* Tab 0: Place Facets */}
            {tabValue === 0 && (
              <Stack spacing={2}>
                {/* Grid Size Control */}
                <Card elevation={1}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem', fontWeight: 500 }}>
                      Grid Size
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel id="res-label">Resolution Level</InputLabel>
                      <Select<number> labelId="res-label" value={res} label="Resolution Level" onChange={handleRes}>
                        {[6,7,8,9,10].map(r => (
                          <MenuItem key={r} value={r}>Level {r}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Higher values show more detailed hexagonal grids
                    </Typography>
                  </CardContent>
                </Card>

                {/* Place Facets */}
                <Card elevation={1}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem', fontWeight: 500 }}>
                      Layers
                    </Typography>
                    <FacetBadges selected={selectedFacets} onChange={setSelectedFacets} />
                  </CardContent>
                </Card>
              </Stack>
            )}

            {/* Tab 1: Options */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {/* Display Options */}
                <Card elevation={1}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem', fontWeight: 500 }}>
                      Display Options
                    </Typography>
                    <FormControlLabel 
                      control={<Checkbox checked={showGrid} onChange={(_,v)=>setShowGrid(v)} />} 
                      label="Show H3 Choropleth"
                      sx={{ width: '100%' }}
                    />
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel id="palette-label">Color Scheme</InputLabel>
                      <Select<string>
                        labelId="palette-label"
                        value={palette}
                        label="Color Scheme"
                        onChange={(e: SelectChangeEvent<string>) => setPalette((e.target.value as any) ?? 'YlGnBu')}
                      >
                        <MenuItem value="YlGnBu">ColorBrewer YlGnBu</MenuItem>
                        <MenuItem value="Blues">ColorBrewer Blues</MenuItem>
                        <MenuItem value="Greens">ColorBrewer Greens</MenuItem>
                        <MenuItem value="OrRd">ColorBrewer OrRd</MenuItem>
                        <MenuItem value="PuBu">ColorBrewer PuBu</MenuItem>
                        <MenuItem value="Colorgorical1">Colorgorical (balanced)</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel id="classes-label">Classes</InputLabel>
                      <Select<number>
                        labelId="classes-label"
                        value={classes}
                        label="Classes"
                        onChange={(e: SelectChangeEvent<number>) => setClasses(Number(e.target.value))}
                      >
                        {[3,4,5,6,7,8,9].map((n) => (
                          <MenuItem key={n} value={n}>{n} classes</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FacetLegend
                      facetLabel={
                        selectedFacets.length === 0
                          ? 'Total'
                          : selectedFacets.length === 1
                          ? (FACETS.find(f => f.key === selectedFacets[0])?.label || selectedFacets[0])
                          : `Multiple (${selectedFacets.length})`
                      }
                      palette={palette}
                      classes={classes}
                    />
                  </CardContent>
                </Card>
              </Stack>
            )}

            {/* Tab 2: Hexagon Stats */}
            {tabValue === 2 && (
              <Stack spacing={2}>
                <AreaStatistics data={selectedCell} />
              </Stack>
            )}
          </Box>
        </Box>
      )}

      {/* Toggle button for sidebar */}
      {!sidebarOpen && (
        <Box sx={{ position: 'absolute', top: 72, left: 16, zIndex: 1100 }}>
          <button
            aria-label="Open sidebar"
            style={{ background: 'rgba(30,58,95,0.8)', border: 'none', color: '#fff', fontSize: 22, borderRadius: 6, padding: '4px 12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        </Box>
      )}

      {/* Map area fills all space */}
      <Box className="map-main" sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <MapShell 
          res={res} 
          showGrid={showGrid} 
          facets={selectedFacets} 
          palette={palette} 
          classes={classes} 
          onCellSelect={handleCellSelect}
        />
      </Box>
    </Box>
  );
}
