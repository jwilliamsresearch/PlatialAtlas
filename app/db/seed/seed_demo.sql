-- Optional demo seed: inserts a single mask row if not present
INSERT INTO region_mask(name, geom)
SELECT 'Nottinghamshire', ST_Multi(ST_GeomFromText('POLYGON((-1.4 52.8,-1.4 53.5,-0.5 53.5,-0.5 52.8,-1.4 52.8))',4326))
WHERE NOT EXISTS (
  SELECT 1 FROM region_mask WHERE name = 'Nottinghamshire'
);

-- A tiny POI for smoke testing
INSERT INTO poi(source, source_id, name, category, geom, h3_r10)
VALUES ('osm','demo-1','Demo Library','community', ST_SetSRID(ST_Point(-1.15,52.95),4326), NULL)
ON CONFLICT DO NOTHING;

