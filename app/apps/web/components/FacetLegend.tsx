"use client";
import { Box, Typography } from '@mui/material';
import { getPalette, PaletteName } from '@/lib/palettes';

type Props = {
  facetLabel: string;
  palette: PaletteName;
  classes: number;
};

export default function FacetLegend({ facetLabel, palette, classes }: Props) {
  const colors = getPalette(palette, classes);
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="text.secondary">{facetLabel} (low → high)</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
        {colors.map((c, i) => (
          <Box key={i} sx={{ width: 18, height: 10, backgroundColor: c, border: '1px solid rgba(0,0,0,0.15)' }} />
        ))}
      </Box>
    </Box>
  );
}

