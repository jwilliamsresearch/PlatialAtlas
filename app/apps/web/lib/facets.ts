export type FacetKey =
  | 'n'
  | 'amenity'
  | 'shop'
  | 'tourism'
  | 'leisure'
  | 'landuse'
  | 'natural'
  | 'historic'
  | 'heritage'
  | 'office'
  | 'craft'
  | 'aeroway'
  | 'aerialway'
  | 'railway'
  | 'public_transport'
  | 'man_made'
  | 'healthcare'
  | 'emergency'
  | 'club'
  | 'building'
  | 'sport'
  | 'education'
  | 'place'
  | 'waterway'
  | 'highway'
  | 'power'
  | 'barrier'
  | 'boundary'
  | 'route';

export type FacetGroup = 'osm' | 'overture';
export type FacetDef = { key: FacetKey; label: string; tooltip?: string; group: FacetGroup };

export const FACETS: FacetDef[] = [
  { key: 'n', label: 'Total', tooltip: 'All POIs matching filters', group: 'osm' },
  { key: 'amenity', label: 'Amenity', tooltip: 'General amenities: schools, libraries, cafes, etc.', group: 'osm' },
  { key: 'shop', label: 'Shop', tooltip: 'Retail shops and outlets', group: 'osm' },
  { key: 'tourism', label: 'Tourism', tooltip: 'Attractions, viewpoints, information', group: 'osm' },
  { key: 'leisure', label: 'Leisure', tooltip: 'Parks, recreation, sports centres', group: 'osm' },
  { key: 'landuse', label: 'Landuse', tooltip: 'Tagged land uses (parks, industrial, etc.)', group: 'osm' },
  { key: 'natural', label: 'Natural', tooltip: 'Natural features like woods, peaks', group: 'osm' },
  { key: 'historic', label: 'Historic', tooltip: 'Heritage and historic tags', group: 'osm' },
  { key: 'heritage', label: 'Heritage', tooltip: 'Heritage designation tags', group: 'osm' },
  { key: 'office', label: 'Office', tooltip: 'Office buildings/locations', group: 'osm' },
  { key: 'craft', label: 'Craft', tooltip: 'Craft-related locations', group: 'osm' },
  { key: 'aeroway', label: 'Aeroway', tooltip: 'Airports, runways, aviation facilities', group: 'osm' },
  { key: 'aerialway', label: 'Aerialway', tooltip: 'Cable cars, gondolas', group: 'osm' },
  { key: 'railway', label: 'Railway', tooltip: 'Stations, stops, rail features', group: 'osm' },
  { key: 'public_transport', label: 'Public Transport', tooltip: 'Stops, platforms, interchanges', group: 'osm' },
  { key: 'man_made', label: 'Man-made', tooltip: 'Man-made structures', group: 'osm' },
  { key: 'healthcare', label: 'Healthcare', tooltip: 'Clinics, hospitals, doctors', group: 'osm' },
  { key: 'emergency', label: 'Emergency', tooltip: 'Fire stations, police, emergency access', group: 'osm' },
  { key: 'club', label: 'Club', tooltip: 'Social & sports clubs', group: 'osm' },
  { key: 'sport', label: 'Sport', tooltip: 'Sports pitches, facilities', group: 'osm' },
  { key: 'education', label: 'Education', tooltip: 'Schools, colleges, universities', group: 'osm' },
  { key: 'place', label: 'Place', tooltip: 'Settlements and named places', group: 'osm' },
  { key: 'waterway', label: 'Waterway', tooltip: 'Rivers, canals, locks', group: 'osm' },
  { key: 'highway', label: 'Highway', tooltip: 'Road-related features', group: 'osm' },
  { key: 'power', label: 'Power', tooltip: 'Power lines, substations', group: 'osm' },
  { key: 'barrier', label: 'Barrier', tooltip: 'Fences, walls, gates', group: 'osm' },
  { key: 'boundary', label: 'Boundary', tooltip: 'Administrative boundaries', group: 'osm' },
  { key: 'route', label: 'Route', tooltip: 'Hiking, cycling, public transport routes', group: 'osm' },
  // Overture facets (expand as we add Overture-specific categories)
  { key: 'building', label: 'Buildings', tooltip: 'Overture buildings, OSM building tags', group: 'overture' },
];
