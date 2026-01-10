-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planPrice" DECIMAL(10,2) NOT NULL,
    "billingPeriod" TEXT NOT NULL DEFAULT 'year',
    "cashfreeSubscriptionId" TEXT,
    "cashfreeSubscriptionToken" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "startsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "subscriptionEndsAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancellationReason" TEXT,
    "lastPaymentId" TEXT,
    "lastPaymentAt" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "paymentFailureCount" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentFailureAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_clinicId_key" ON "subscriptions"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_cashfreeSubscriptionId_key" ON "subscriptions"("cashfreeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_clinicId_idx" ON "subscriptions"("clinicId");

-- CreateIndex
CREATE INDEX "subscriptions_cashfreeSubscriptionId_idx" ON "subscriptions"("cashfreeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscriptions_nextBillingDate_idx" ON "subscriptions"("nextBillingDate");

-- CreateIndex
CREATE INDEX "clinics_subscriptionStatus_idx" ON "clinics"("subscriptionStatus");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
