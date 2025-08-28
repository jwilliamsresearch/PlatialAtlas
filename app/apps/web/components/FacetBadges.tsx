"use client";
import { Box, Chip, Stack, Tooltip, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
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
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Select one or more facets</Typography>
      <Accordion sx={{ mt: 1 }} disableGutters>
        <AccordionSummary>
          <Typography variant="subtitle2">OSM Facets</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
      </Accordion>
      <Accordion disableGutters>
        <AccordionSummary>
          <Typography variant="subtitle2">Overture Facets</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
      </Accordion>
      {selected.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Chip label="Clear All Facets" onClick={clear} size="small" />
        </Box>
      )}
    </Box>
  );
}
