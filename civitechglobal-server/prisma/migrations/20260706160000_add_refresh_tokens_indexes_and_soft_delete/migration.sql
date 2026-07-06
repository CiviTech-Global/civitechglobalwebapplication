-- Add columns to users table
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create refresh_tokens table
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on token
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- Add foreign key from refresh_tokens to users
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes on refresh_tokens
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- Indexes on users
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- Indexes on products
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- Indexes on services
CREATE INDEX "services_category_idx" ON "services"("category");
CREATE INDEX "services_isActive_idx" ON "services"("isActive");
CREATE INDEX "services_createdAt_idx" ON "services"("createdAt");

-- Indexes on opportunities
CREATE INDEX "opportunities_isOpen_idx" ON "opportunities"("isOpen");
CREATE INDEX "opportunities_opportunityType_idx" ON "opportunities"("opportunityType");
CREATE INDEX "opportunities_createdAt_idx" ON "opportunities"("createdAt");

-- Indexes on opportunity_applications
CREATE INDEX "opportunity_applications_status_idx" ON "opportunity_applications"("status");
CREATE INDEX "opportunity_applications_createdAt_idx" ON "opportunity_applications"("createdAt");

-- Indexes on orders
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- Indexes on order_items
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- Indexes on tickets
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");

-- Indexes on ticket_messages
CREATE INDEX "ticket_messages_ticketId_idx" ON "ticket_messages"("ticketId");
CREATE INDEX "ticket_messages_createdAt_idx" ON "ticket_messages"("createdAt");

-- Indexes on insurance_subcategories
CREATE INDEX "insurance_subcategories_categoryId_idx" ON "insurance_subcategories"("categoryId");

-- Indexes on leads
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");
