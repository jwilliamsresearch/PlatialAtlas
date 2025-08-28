"use client";
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';

async function fetchPOIs() {
  const r = await fetch('/api/poi?limit=500');
  const fc = await r.json();
  return fc.features.map((f: any) => ({ id: f.properties.id, name: f.properties.name, category: f.properties.category, source: f.properties.source }));
}

export default function DatasetsPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['poi-table'], queryFn: fetchPOIs });
  const datasetInfo = [
    {
      name: "Points of Interest",
      description: "Comprehensive POI data from OpenStreetMap covering amenities, shops, services, and attractions",
      source: "OpenStreetMap",
      status: "Active",
      count: data.length,
      license: "ODbL"
    },
    {
      name: "Building Footprints",
      description: "Detailed building geometries and basic attributes from Overture Maps",
      source: "Overture Maps",
      status: "Available",
      count: "~45K",
      license: "CDLA"
    },
    {
      name: "Land Cover",
      description: "ESA WorldCover 2021 land use and land cover classification",
      source: "ESA WorldCover",
      status: "Available",
      count: "Raster",
      license: "CC BY 4.0"
    },
    {
      name: "Population Data",
      description: "High-resolution population estimates and demographic insights",
      source: "WorldPop",
      status: "Available",
      count: "Raster",
      license: "CC BY 4.0"
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Data Resources
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Explore the datasets and APIs available through Platial Atlas
          </Typography>
        </Box>

        {/* Dataset Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {datasetInfo.map((dataset, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'var(--primary-color)' }}>
                      {dataset.name}
                    </Typography>
                    <Chip 
                      label={dataset.status} 
                      color={dataset.status === 'Active' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {dataset.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Source: {dataset.source}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Records: {dataset.count}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  License: {dataset.license}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* POI Data Table */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)' }}>
            Points of Interest Sample
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Preview of POI data available through the API (showing first 500 records)
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load POI data. Please check your API connection.
            </Alert>
          )}
          
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}
          
          <Paper elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--bg-light)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading && data.map((row: any) => (
                  <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{row.id}</TableCell>
                    <TableCell>{row.name || 'Unnamed'}</TableCell>
                    <TableCell>
                      <Chip label={row.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{row.source}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    </Container>
    {/* End main Box wrapper for full height */}
  </Box>
  );
}
