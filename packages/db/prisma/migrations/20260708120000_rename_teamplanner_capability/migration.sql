-- Rename enum value to match the new /teamindeling slug (see apps/main/src/middleware.ts).
ALTER TYPE "Capability" RENAME VALUE 'teamplanner' TO 'teamindeling';
