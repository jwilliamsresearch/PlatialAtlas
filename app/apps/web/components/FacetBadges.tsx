"use client";
import { Box, Chip, Stack, Tooltip, Typography, Button } from '@mui/material';
import { FACETS, FacetKey } from '@/lib/facets';

type Props = {
  selected: FacetKey[];
  onChange: (next: FacetKey[]) => void;
};

export default function FacetBadges({ selected, onChange }: Props) {
  const toggle = (key: FacetKey) => {
    const exists = selected.includes(key);
    const next = exists ? selected.filter((k) => k !== key) : [...selected, key];
    onChange(next);
  };
  const clear = () => onChange([]);
  const osm = FACETS.filter((f) => f.key !== 'n' && f.group === 'osm');
  const overture = FACETS.filter((f) => f.group === 'overture');
  
  const toggleAllOSM = () => {
    const osmKeys = osm.map(f => f.key);
    const allOSMSelected = osmKeys.every(key => selected.includes(key));
    if (allOSMSelected) {
      // Remove all OSM facets
      onChange(selected.filter(key => !osmKeys.includes(key)));
    } else {
      // Add all OSM facets
      const newSelected = [...new Set([...selected, ...osmKeys])];
      onChange(newSelected);
    }
  };
  
  const toggleAllOverture = () => {
    const overtureKeys = overture.map(f => f.key);
    const allOvertureSelected = overtureKeys.every(key => selected.includes(key));
    if (allOvertureSelected) {
      // Remove all Overture facets
      onChange(selected.filter(key => !overtureKeys.includes(key)));
    } else {
      // Add all Overture facets
      const newSelected = [...new Set([...selected, ...overtureKeys])];
      onChange(newSelected);
    }
  };
  
  const osmKeys = osm.map(f => f.key);
  const overtureKeys = overture.map(f => f.key);
  const allOSMSelected = osmKeys.every(key => selected.includes(key));
  const allOvertureSelected = overtureKeys.every(key => selected.includes(key));

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Select one or more facets</Typography>
      
      {/* OSM Facets */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">OSM Facets</Typography>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={toggleAllOSM}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            {allOSMSelected ? 'Clear All' : 'Select All'}
          </Button>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {osm.map((f) => (
            <Tooltip key={f.key} title={f.tooltip || ''} placement="top">
              <Chip
                label={f.label}
                clickable
                color={selected.includes(f.key) ? 'primary' : 'default'}
                variant={selected.includes(f.key) ? 'filled' : 'outlined'}
                onClick={() => toggle(f.key)}
                size="small"
                sx={{ mb: 1 }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Box>

      {/* Overture Facets */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">Overture Facets</Typography>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={toggleAllOverture}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            {allOvertureSelected ? 'Clear All' : 'Select All'}
          </Button>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {overture.map((f) => (
            <Tooltip key={f.key} title={f.tooltip || ''} placement="top">
              <Chip
                label={f.label}
                clickable
                color={selected.includes(f.key) ? 'primary' : 'default'}
                variant={selected.includes(f.key) ? 'filled' : 'outlined'}
                onClick={() => toggle(f.key)}
                size="small"
                sx={{ mb: 1 }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Box>

      {selected.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" size="small" onClick={clear} fullWidth>
            Clear All Facets
          </Button>
        </Box>
      )}
    </Box>
  );
}
