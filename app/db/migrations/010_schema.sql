CREATE TABLE IF NOT EXISTS poi (
  id bigserial PRIMARY KEY,
  source text NOT NULL,
  source_id text,
  name text,
  category text,
  geom geometry(Point,4326) NOT NULL,
  h3_r10 text,
  props jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS poi_gix ON poi USING gist(geom);
CREATE INDEX IF NOT EXISTS poi_cat_idx ON poi(category);
CREATE INDEX IF NOT EXISTS poi_h3_r10_idx ON poi(h3_r10);

CREATE TABLE IF NOT EXISTS cluster (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  method text NOT NULL,
  h3_res int NOT NULL,
  label text,
  geom geometry(MultiPolygon,4326),
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cluster_member (
  cluster_id uuid REFERENCES cluster(id) ON DELETE CASCADE,
  poi_id bigint REFERENCES poi(id) ON DELETE CASCADE,
  h3_index text,
  PRIMARY KEY(cluster_id, poi_id)
);

CREATE TABLE IF NOT EXISTS cluster_metric (
  cluster_id uuid PRIMARY KEY REFERENCES cluster(id) ON DELETE CASCADE,
  silhouette numeric,
  morans_i numeric,
  nni numeric,
  metrics jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS narrative (
  id bigserial PRIMARY KEY,
  cluster_id uuid REFERENCES cluster(id) ON DELETE SET NULL,
  author_name text,
  title text,
  body text,
  locale text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

