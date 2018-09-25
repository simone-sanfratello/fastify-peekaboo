CREATE TABLE "users" (
  "id" serial NOT NULL PRIMARY KEY,
  "name" varchar NOT NULL,
  "email" varchar NOT NULL,
  "password" varchar NOT NULL
);
ALTER TABLE "users" OWNER TO developer;