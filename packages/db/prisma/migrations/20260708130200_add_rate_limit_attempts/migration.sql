-- CreateTable
CREATE TABLE "RateLimitAttempt" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimitAttempt_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateIndex
-- Needed separately from the composite PK above (which leads with "key")
-- because opportunistic cleanup in lib/rate-limit.ts filters on windowStart
-- alone across all keys.
CREATE INDEX "RateLimitAttempt_windowStart_idx" ON "RateLimitAttempt"("windowStart");
