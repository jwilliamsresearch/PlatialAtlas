"use client";
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container>
        <Typography variant="caption">© Platial Atlas — Code MIT, Content CC BY 4.0</Typography>
      </Container>
    </Box>
  );
}
