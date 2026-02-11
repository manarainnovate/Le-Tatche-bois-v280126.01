-- Add MessageType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "MessageType" AS ENUM ('RECEIVED', 'SENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add type column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Message" ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'RECEIVED';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add starred column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Message" ADD COLUMN "starred" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add attachments column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Message" ADD COLUMN "attachments" JSONB;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add inReplyToId column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Message" ADD COLUMN "inReplyToId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add updatedAt column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Message" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS "Message_starred_idx" ON "Message"("starred");
CREATE INDEX IF NOT EXISTS "Message_type_idx" ON "Message"("type");

-- Add foreign key constraint for self-referential relation
DO $$ BEGIN
    ALTER TABLE "Message"
    ADD CONSTRAINT "Message_inReplyToId_fkey"
    FOREIGN KEY ("inReplyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
