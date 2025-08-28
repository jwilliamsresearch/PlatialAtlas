CREATE TABLE IF NOT EXISTS region_mask (
  id serial primary key,
  name text,
  geom geometry(MultiPolygon,4326)
);
CREATE INDEX IF NOT EXISTS region_mask_gix ON region_mask USING gist(geom);

