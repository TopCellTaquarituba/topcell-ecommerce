-- CreateTable: IntegrationToken
CREATE TABLE IF NOT EXISTS "IntegrationToken" (
    "id" TEXT PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP,
    "scope" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique index on provider
CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationToken_provider_key" ON "IntegrationToken" ("provider");
