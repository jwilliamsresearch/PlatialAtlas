-- Ensure helper tables exist; mapping populated by 70_h3_assign.js
CREATE TABLE IF NOT EXISTS h3_parent_map_r6 (child_h3_r10 text PRIMARY KEY, parent_r6 text);
CREATE TABLE IF NOT EXISTS h3_parent_map_r7 (child_h3_r10 text PRIMARY KEY, parent_r7 text);
CREATE TABLE IF NOT EXISTS h3_parent_map_r8 (child_h3_r10 text PRIMARY KEY, parent_r8 text);
CREATE TABLE IF NOT EXISTS h3_parent_map_r9 (child_h3_r10 text PRIMARY KEY, parent_r9 text);

CREATE UNIQUE INDEX IF NOT EXISTS h3_parent_map_r6_idx ON h3_parent_map_r6(child_h3_r10);
CREATE UNIQUE INDEX IF NOT EXISTS h3_parent_map_r7_idx ON h3_parent_map_r7(child_h3_r10);
CREATE UNIQUE INDEX IF NOT EXISTS h3_parent_map_r8_idx ON h3_parent_map_r8(child_h3_r10);
CREATE UNIQUE INDEX IF NOT EXISTS h3_parent_map_r9_idx ON h3_parent_map_r9(child_h3_r10);

