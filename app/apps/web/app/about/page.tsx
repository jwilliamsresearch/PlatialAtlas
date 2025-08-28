import { Container, Typography, Link, List, ListItem, ListItemText, Box, Card, CardContent, Grid } from '@mui/material';

export default function AboutPage() {
  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            About Platial Atlas
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            A web-first MVP for place-based analytics, exploring how people experience and give meaning to places through data-driven insights.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)' }}>
                  Our Mission
                </Typography>
                <Typography paragraph>
                  Platial Atlas focuses on understanding places as lived experiences rather than just geographical coordinates. 
                  We combine multiple data sources to create comprehensive insights about how communities interact with their environment.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)' }}>
                  Current Focus
                </Typography>
                <Typography paragraph>
                  This MVP demonstrates place-based analytics capabilities over Nottinghamshire, showcasing how open data can be 
                  transformed into meaningful insights about places and communities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)' }}>
              Data Sources & Technologies
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Spatial Data</Typography>
                <List dense>
                  <ListItem><ListItemText primary="H3 Hexagonal Grid System for spatial indexing" /></ListItem>
                  <ListItem><ListItemText primary="OpenStreetMap for Points of Interest" /></ListItem>
                  <ListItem><ListItemText primary="Overture Maps for building footprints" /></ListItem>
                  <ListItem><ListItemText primary="ESA WorldCover for land use classification" /></ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Additional Data</Typography>
                <List dense>
                  <ListItem><ListItemText primary="VIIRS nighttime lights data" /></ListItem>
                  <ListItem><ListItemText primary="WorldPop population estimates" /></ListItem>
                  <ListItem><ListItemText primary="Flickr photo data for cultural insights" /></ListItem>
                  <ListItem><ListItemText primary="PostgreSQL with PostGIS for spatial analysis" /></ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'var(--primary-color)' }}>
              Licensing & Attribution
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Code License" 
                  secondary="MIT License - Open source and freely available"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Content License" 
                  secondary="CC BY 4.0 - Creative Commons Attribution"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Dataset Licenses" 
                  secondary={
                    <span>
                      <Link href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
                        OSM (ODbL)
                      </Link>
                      , ESA WorldCover, Overture (CDLA), Flickr (API ToS), VIIRS, WorldPop
                    </span>
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

