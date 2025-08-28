"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Chip } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  data: { h3: string; n: number; cats?: Record<string, number> } | null;
};

export default function H3CellModal({ open, onClose, data }: Props) {
  if (!data) return null;
  const cats = data.cats || {};
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>H3 Cell Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">H3 Index: {data.h3}</Typography>
          <Typography variant="body2">Total POIs: {data.n}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.keys(cats).length === 0 && <Typography variant="body2">No category breakdown</Typography>}
            {Object.entries(cats).map(([k, v]) => (
              <Chip key={k} label={`${k}: ${v}`} size="small" />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

