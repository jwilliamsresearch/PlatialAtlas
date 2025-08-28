"use client";
import '../styles/globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';
import Providers from './providers';
import { Box } from '@mui/material';


export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <Box
            component="main"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100dvh',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {children}
            </Box>
            {/* Only show Footer if not on /map */}
            {pathname !== '/map' && <Footer />}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
