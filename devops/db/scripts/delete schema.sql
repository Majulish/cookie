ALTER TABLE event_jobs
DROP CONSTRAINT event_jobs_event_id_fkey;

ALTER TABLE event_jobs
ADD CONSTRAINT event_jobs_event_id_fkey
FOREIGN KEY (event_id)
REFERENCES events (id)
ON DELETE CASCADE