-- Materialized views for r6..r10 using helper mapping tables

-- r6
DROP MATERIALIZED VIEW IF EXISTS mv_poi_counts_r6;
CREATE MATERIALIZED VIEW mv_poi_counts_r6 AS
SELECT p_parent.h3 AS h3,
       COUNT(*) AS n,
       jsonb_build_object(
         'community', COUNT(*) FILTER (WHERE p.category='community'),
         'commerce',  COUNT(*) FILTER (WHERE p.category='commerce'),
         'culture',   COUNT(*) FILTER (WHERE p.category='culture'),
         'nature',    COUNT(*) FILTER (WHERE p.category='nature'),
         'heritage',  COUNT(*) FILTER (WHERE p.category='heritage')
       ) AS cats
FROM poi p
JOIN (
  SELECT child_h3_r10 AS h3_r10, parent_r6 AS h3 FROM h3_parent_map_r6
  WHERE parent_r6 IS NOT NULL
 ) p_parent ON p.h3_r10 = p_parent.h3_r10
GROUP BY p_parent.h3;
CREATE UNIQUE INDEX IF NOT EXISTS mv_poi_counts_r6_idx ON mv_poi_counts_r6(h3);

-- r7
DROP MATERIALIZED VIEW IF EXISTS mv_poi_counts_r7;
CREATE MATERIALIZED VIEW mv_poi_counts_r7 AS
SELECT p_parent.h3 AS h3,
       COUNT(*) AS n,
       jsonb_build_object(
         'community', COUNT(*) FILTER (WHERE p.category='community'),
         'commerce',  COUNT(*) FILTER (WHERE p.category='commerce'),
         'culture',   COUNT(*) FILTER (WHERE p.category='culture'),
         'nature',    COUNT(*) FILTER (WHERE p.category='nature'),
         'heritage',  COUNT(*) FILTER (WHERE p.category='heritage')
       ) AS cats
FROM poi p
JOIN (
  SELECT child_h3_r10 AS h3_r10, parent_r7 AS h3 FROM h3_parent_map_r7
  WHERE parent_r7 IS NOT NULL
 ) p_parent ON p.h3_r10 = p_parent.h3_r10
GROUP BY p_parent.h3;
CREATE UNIQUE INDEX IF NOT EXISTS mv_poi_counts_r7_idx ON mv_poi_counts_r7(h3);

-- r8
DROP MATERIALIZED VIEW IF EXISTS mv_poi_counts_r8;
CREATE MATERIALIZED VIEW mv_poi_counts_r8 AS
SELECT p_parent.h3 AS h3,
       COUNT(*) AS n,
       jsonb_build_object(
         'community', COUNT(*) FILTER (WHERE p.category='community'),
         'commerce',  COUNT(*) FILTER (WHERE p.category='commerce'),
         'culture',   COUNT(*) FILTER (WHERE p.category='culture'),
         'nature',    COUNT(*) FILTER (WHERE p.category='nature'),
         'heritage',  COUNT(*) FILTER (WHERE p.category='heritage')
       ) AS cats
FROM poi p
JOIN (
  SELECT child_h3_r10 AS h3_r10, parent_r8 AS h3 FROM h3_parent_map_r8
  WHERE parent_r8 IS NOT NULL
 ) p_parent ON p.h3_r10 = p_parent.h3_r10
GROUP BY p_parent.h3;
CREATE UNIQUE INDEX IF NOT EXISTS mv_poi_counts_r8_idx ON mv_poi_counts_r8(h3);

-- r9
DROP MATERIALIZED VIEW IF EXISTS mv_poi_counts_r9;
CREATE MATERIALIZED VIEW mv_poi_counts_r9 AS
SELECT p_parent.h3 AS h3,
       COUNT(*) AS n,
       jsonb_build_object(
         'community', COUNT(*) FILTER (WHERE p.category='community'),
         'commerce',  COUNT(*) FILTER (WHERE p.category='commerce'),
         'culture',   COUNT(*) FILTER (WHERE p.category='culture'),
         'nature',    COUNT(*) FILTER (WHERE p.category='nature'),
         'heritage',  COUNT(*) FILTER (WHERE p.category='heritage')
       ) AS cats
FROM poi p
JOIN (
  SELECT child_h3_r10 AS h3_r10, parent_r9 AS h3 FROM h3_parent_map_r9
  WHERE parent_r9 IS NOT NULL
 ) p_parent ON p.h3_r10 = p_parent.h3_r10
GROUP BY p_parent.h3;
CREATE UNIQUE INDEX IF NOT EXISTS mv_poi_counts_r9_idx ON mv_poi_counts_r9(h3);

-- r10
DROP MATERIALIZED VIEW IF EXISTS mv_poi_counts_r10;
CREATE MATERIALIZED VIEW mv_poi_counts_r10 AS
SELECT h3_r10 AS h3,
       COUNT(*) AS n,
       jsonb_build_object(
         'community', COUNT(*) FILTER (WHERE category='community'),
         'commerce',  COUNT(*) FILTER (WHERE category='commerce'),
         'culture',   COUNT(*) FILTER (WHERE category='culture'),
         'nature',    COUNT(*) FILTER (WHERE category='nature'),
         'heritage',  COUNT(*) FILTER (WHERE category='heritage')
       ) AS cats
FROM poi
WHERE h3_r10 IS NOT NULL
GROUP BY h3_r10;
CREATE UNIQUE INDEX IF NOT EXISTS mv_poi_counts_r10_idx ON mv_poi_counts_r10(h3);

