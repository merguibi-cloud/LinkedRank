ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" varchar(120);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" varchar(120);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneNumber" varchar(32);
