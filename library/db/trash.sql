ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS books_deleted_at_idx
  ON public.books (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'purge-expired-library-trash';

SELECT cron.schedule(
  'purge-expired-library-trash',
  '0 * * * *',
  $purge$
    DELETE FROM public.books
    WHERE deleted_at IS NOT NULL
      AND deleted_at <= now() - INTERVAL '20 days'
  $purge$
);