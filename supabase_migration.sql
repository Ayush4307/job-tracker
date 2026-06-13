-- Run this in your Supabase SQL Editor to support the new features:

ALTER TABLE applications ADD COLUMN resume_version text DEFAULT 'Default';

-- If you ever want to check the performance of a specific resume, you can run:
-- SELECT resume_version, COUNT(*) as total, 
-- SUM(CASE WHEN status = 'Interview' THEN 1 ELSE 0 END) as interviews 
-- FROM applications 
-- GROUP BY resume_version;
