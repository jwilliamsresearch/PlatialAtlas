-- Materialized views for r6..r10 using helper mapping tables

-- r6
DROP MATERIALIZED VIEW IF EXISTS mv_poi_counts_r6;
CREATE MATERIALIZED VIEW mv_poi_counts_r6 AS
SELECT p_parent.h3 AS h3,
       COUNT(*) AS n,
       jsonb_build_object(
         'amenity', COUNT(*) FILTER (WHERE p.category='amenity'),
         'shop', COUNT(*) FILTER (WHERE p.category='shop'),
         'tourism', COUNT(*) FILTER (WHERE p.category='tourism'),
         'leisure', COUNT(*) FILTER (WHERE p.category='leisure'),
         'landuse', COUNT(*) FILTER (WHERE p.category='landuse'),
         'natural', COUNT(*) FILTER (WHERE p.category='natural'),
         'historic', COUNT(*) FILTER (WHERE p.category='historic'),
         'heritage', COUNT(*) FILTER (WHERE p.category='heritage'),
         'office', COUNT(*) FILTER (WHERE p.category='office'),
         'craft', COUNT(*) FILTER (WHERE p.category='craft'),
         'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway'),
         'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway'),
         'railway', COUNT(*) FILTER (WHERE p.category='railway'),
         'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport'),
         'man_made', COUNT(*) FILTER (WHERE p.category='man_made'),
         'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare'),
         'emergency', COUNT(*) FILTER (WHERE p.category='emergency'),
         'club', COUNT(*) FILTER (WHERE p.category='club'),
         'building', COUNT(*) FILTER (WHERE p.category='building'),
         'sport', COUNT(*) FILTER (WHERE p.category='sport'),
         'education', COUNT(*) FILTER (WHERE p.category='education'),
         'place', COUNT(*) FILTER (WHERE p.category='place'),
         'waterway', COUNT(*) FILTER (WHERE p.category='waterway'),
         'highway', COUNT(*) FILTER (WHERE p.category='highway'),
         'power', COUNT(*) FILTER (WHERE p.category='power'),
         'barrier', COUNT(*) FILTER (WHERE p.category='barrier'),
         'boundary', COUNT(*) FILTER (WHERE p.category='boundary'),
         'route', COUNT(*) FILTER (WHERE p.category='route')
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
         'amenity', COUNT(*) FILTER (WHERE p.category='amenity'),
         'shop', COUNT(*) FILTER (WHERE p.category='shop'),
         'tourism', COUNT(*) FILTER (WHERE p.category='tourism'),
         'leisure', COUNT(*) FILTER (WHERE p.category='leisure'),
         'landuse', COUNT(*) FILTER (WHERE p.category='landuse'),
         'natural', COUNT(*) FILTER (WHERE p.category='natural'),
         'historic', COUNT(*) FILTER (WHERE p.category='historic'),
         'heritage', COUNT(*) FILTER (WHERE p.category='heritage'),
         'office', COUNT(*) FILTER (WHERE p.category='office'),
         'craft', COUNT(*) FILTER (WHERE p.category='craft'),
         'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway'),
         'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway'),
         'railway', COUNT(*) FILTER (WHERE p.category='railway'),
         'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport'),
         'man_made', COUNT(*) FILTER (WHERE p.category='man_made'),
         'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare'),
         'emergency', COUNT(*) FILTER (WHERE p.category='emergency'),
         'club', COUNT(*) FILTER (WHERE p.category='club'),
         'building', COUNT(*) FILTER (WHERE p.category='building'),
         'sport', COUNT(*) FILTER (WHERE p.category='sport'),
         'education', COUNT(*) FILTER (WHERE p.category='education'),
         'place', COUNT(*) FILTER (WHERE p.category='place'),
         'waterway', COUNT(*) FILTER (WHERE p.category='waterway'),
         'highway', COUNT(*) FILTER (WHERE p.category='highway'),
         'power', COUNT(*) FILTER (WHERE p.category='power'),
         'barrier', COUNT(*) FILTER (WHERE p.category='barrier'),
         'boundary', COUNT(*) FILTER (WHERE p.category='boundary'),
         'route', COUNT(*) FILTER (WHERE p.category='route')
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
         'amenity', COUNT(*) FILTER (WHERE p.category='amenity'),
         'shop', COUNT(*) FILTER (WHERE p.category='shop'),
         'tourism', COUNT(*) FILTER (WHERE p.category='tourism'),
         'leisure', COUNT(*) FILTER (WHERE p.category='leisure'),
         'landuse', COUNT(*) FILTER (WHERE p.category='landuse'),
         'natural', COUNT(*) FILTER (WHERE p.category='natural'),
         'historic', COUNT(*) FILTER (WHERE p.category='historic'),
         'heritage', COUNT(*) FILTER (WHERE p.category='heritage'),
         'office', COUNT(*) FILTER (WHERE p.category='office'),
         'craft', COUNT(*) FILTER (WHERE p.category='craft'),
         'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway'),
         'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway'),
         'railway', COUNT(*) FILTER (WHERE p.category='railway'),
         'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport'),
         'man_made', COUNT(*) FILTER (WHERE p.category='man_made'),
         'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare'),
         'emergency', COUNT(*) FILTER (WHERE p.category='emergency'),
         'club', COUNT(*) FILTER (WHERE p.category='club'),
         'building', COUNT(*) FILTER (WHERE p.category='building'),
         'sport', COUNT(*) FILTER (WHERE p.category='sport'),
         'education', COUNT(*) FILTER (WHERE p.category='education'),
         'place', COUNT(*) FILTER (WHERE p.category='place'),
         'waterway', COUNT(*) FILTER (WHERE p.category='waterway'),
         'highway', COUNT(*) FILTER (WHERE p.category='highway'),
         'power', COUNT(*) FILTER (WHERE p.category='power'),
         'barrier', COUNT(*) FILTER (WHERE p.category='barrier'),
         'boundary', COUNT(*) FILTER (WHERE p.category='boundary'),
         'route', COUNT(*) FILTER (WHERE p.category='route')
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
         'amenity', COUNT(*) FILTER (WHERE p.category='amenity'),
         'shop', COUNT(*) FILTER (WHERE p.category='shop'),
         'tourism', COUNT(*) FILTER (WHERE p.category='tourism'),
         'leisure', COUNT(*) FILTER (WHERE p.category='leisure'),
         'landuse', COUNT(*) FILTER (WHERE p.category='landuse'),
         'natural', COUNT(*) FILTER (WHERE p.category='natural'),
         'historic', COUNT(*) FILTER (WHERE p.category='historic'),
         'heritage', COUNT(*) FILTER (WHERE p.category='heritage'),
         'office', COUNT(*) FILTER (WHERE p.category='office'),
         'craft', COUNT(*) FILTER (WHERE p.category='craft'),
         'aeroway', COUNT(*) FILTER (WHERE p.category='aeroway'),
         'aerialway', COUNT(*) FILTER (WHERE p.category='aerialway'),
         'railway', COUNT(*) FILTER (WHERE p.category='railway'),
         'public_transport', COUNT(*) FILTER (WHERE p.category='public_transport'),
         'man_made', COUNT(*) FILTER (WHERE p.category='man_made'),
         'healthcare', COUNT(*) FILTER (WHERE p.category='healthcare'),
         'emergency', COUNT(*) FILTER (WHERE p.category='emergency'),
         'club', COUNT(*) FILTER (WHERE p.category='club'),
         'building', COUNT(*) FILTER (WHERE p.category='building'),
         'sport', COUNT(*) FILTER (WHERE p.category='sport'),
         'education', COUNT(*) FILTER (WHERE p.category='education'),
         'place', COUNT(*) FILTER (WHERE p.category='place'),
         'waterway', COUNT(*) FILTER (WHERE p.category='waterway'),
         'highway', COUNT(*) FILTER (WHERE p.category='highway'),
         'power', COUNT(*) FILTER (WHERE p.category='power'),
         'barrier', COUNT(*) FILTER (WHERE p.category='barrier'),
         'boundary', COUNT(*) FILTER (WHERE p.category='boundary'),
         'route', COUNT(*) FILTER (WHERE p.category='route')
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
         'amenity', COUNT(*) FILTER (WHERE category='amenity'),
         'shop', COUNT(*) FILTER (WHERE category='shop'),
         'tourism', COUNT(*) FILTER (WHERE category='tourism'),
         'leisure', COUNT(*) FILTER (WHERE category='leisure'),
         'landuse', COUNT(*) FILTER (WHERE category='landuse'),
         'natural', COUNT(*) FILTER (WHERE category='natural'),
         'historic', COUNT(*) FILTER (WHERE category='historic'),
         'heritage', COUNT(*) FILTER (WHERE category='heritage'),
         'office', COUNT(*) FILTER (WHERE category='office'),
         'craft', COUNT(*) FILTER (WHERE category='craft'),
         'aeroway', COUNT(*) FILTER (WHERE category='aeroway'),
         'aerialway', COUNT(*) FILTER (WHERE category='aerialway'),
         'railway', COUNT(*) FILTER (WHERE category='railway'),
         'public_transport', COUNT(*) FILTER (WHERE category='public_transport'),
         'man_made', COUNT(*) FILTER (WHERE category='man_made'),
         'healthcare', COUNT(*) FILTER (WHERE category='healthcare'),
         'emergency', COUNT(*) FILTER (WHERE category='emergency'),
         'club', COUNT(*) FILTER (WHERE category='club'),
         'building', COUNT(*) FILTER (WHERE category='building'),
         'sport', COUNT(*) FILTER (WHERE category='sport'),
         'education', COUNT(*) FILTER (WHERE category='education'),
         'place', COUNT(*) FILTER (WHERE category='place'),
         'waterway', COUNT(*) FILTER (WHERE category='waterway'),
         'highway', COUNT(*) FILTER (WHERE category='highway'),
         'power', COUNT(*) FILTER (WHERE category='power'),
         'barrier', COUNT(*) FILTER (WHERE category='barrier'),
         'boundary', COUNT(*) FILTER (WHERE category='boundary'),
         'route', COUNT(*) FILTER (WHERE category='route')
       ) AS cats
FROM poi
WHERE h3_r10 IS NOT NULL
GROUP BY h3_r10;
CREATE UNIQUE INDEX IF NOT EXISTS mv_poi_counts_r10_idx ON mv_poi_counts_r10(h3);

