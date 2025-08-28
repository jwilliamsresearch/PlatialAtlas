"use client";
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar position="fixed" sx={{ 
      background: 'rgba(30, 58, 95, 0.3)',
      backdropFilter: 'blur(25px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      zIndex: 1300,
      height: '56px',
      minHeight: '56px',
      justifyContent: 'center',
    }}>
      <Toolbar sx={{ minHeight: '48px !important', padding: '0 1.5rem !important' }}>
        <Link href="/map" className="navbar-brand">
          <img src="/logo-white.png" alt="Platial Atlas Logo" style={{ height: 28, marginRight: 8 }} />
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box>
          <Button 
            component={Link} 
            href="/map" 
            color="inherit"
            sx={{
              backgroundColor: pathname === '/map' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              fontSize: '1rem',
              px: 1.5,
              py: 0.5,
              minWidth: 0,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Map
          </Button>
          <Button 
            component={Link} 
            href="/datasets" 
            color="inherit"
            sx={{
              backgroundColor: pathname === '/datasets' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              fontSize: '1rem',
              px: 1.5,
              py: 0.5,
              minWidth: 0,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Data
          </Button>
          <Button 
            component={Link} 
            href="/about" 
            color="inherit"
            sx={{
              backgroundColor: pathname === '/about' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              fontSize: '1rem',
              px: 1.5,
              py: 0.5,
              minWidth: 0,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            About
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
