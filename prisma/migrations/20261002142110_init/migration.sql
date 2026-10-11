-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "resetToken" TEXT,
    "resetExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameEncrypted" TEXT NOT NULL,
    "contactEncrypted" TEXT,
    "employeeIdEncrypted" TEXT,
    "department" TEXT,
    "experience" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "productModel" TEXT NOT NULL,
    "workstation" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'BEFORE',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "operatorId" TEXT,
    CONSTRAINT "Study_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Study_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Element" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "order" INTEGER NOT NULL,
    "startPoint" TEXT,
    "endPoint" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Element_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "observedTime" REAL NOT NULL,
    "isOutlier" BOOLEAN NOT NULL DEFAULT false,
    "outlierReason" TEXT,
    "notes" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Observation_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Observation_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "system" TEXT NOT NULL DEFAULT 'WESTINGHOUSE',
    "skillRating" REAL,
    "effortRating" REAL,
    "conditionRating" REAL,
    "consistencyRating" REAL,
    "ratingPercent" REAL NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rating_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Allowance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "personal" REAL NOT NULL DEFAULT 5,
    "fatigue" REAL NOT NULL DEFAULT 4,
    "delay" REAL NOT NULL DEFAULT 1,
    "special" REAL NOT NULL DEFAULT 0,
    "totalPercent" REAL NOT NULL DEFAULT 10,
    "formula" TEXT NOT NULL DEFAULT 'ADDITIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Allowance_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "elementId" TEXT,
    "avgObservedTime" REAL NOT NULL,
    "normalTime" REAL NOT NULL,
    "standardTime" REAL NOT NULL,
    "stdDeviation" REAL NOT NULL,
    "variance" REAL NOT NULL,
    "coefficientOfVariation" REAL NOT NULL,
    "confidenceIntervalLow" REAL NOT NULL,
    "confidenceIntervalHigh" REAL NOT NULL,
    "observationsRequired" INTEGER NOT NULL,
    "observationsActual" INTEGER NOT NULL,
    "isSufficient" BOOLEAN NOT NULL,
    "outputPerHour" REAL NOT NULL,
    "outputPerDay" REAL NOT NULL,
    "efficiency" REAL NOT NULL,
    "improvementPercent" REAL,
    "timeSavedSeconds" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Result_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShareLink_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "before" TEXT,
    "after" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AllowancePreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "personal" REAL NOT NULL,
    "fatigue" REAL NOT NULL,
    "delay" REAL NOT NULL,
    "special" REAL NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ElementTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "startPoint" TEXT,
    "endPoint" TEXT,
    "category" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Study_userId_idx" ON "Study"("userId");

-- CreateIndex
CREATE INDEX "Study_method_idx" ON "Study"("method");

-- CreateIndex
CREATE INDEX "Study_date_idx" ON "Study"("date");

-- CreateIndex
CREATE INDEX "Element_studyId_idx" ON "Element"("studyId");

-- CreateIndex
CREATE INDEX "Element_order_idx" ON "Element"("order");

-- CreateIndex
CREATE INDEX "Observation_studyId_idx" ON "Observation"("studyId");

-- CreateIndex
CREATE INDEX "Observation_elementId_idx" ON "Observation"("elementId");

-- CreateIndex
CREATE UNIQUE INDEX "Observation_studyId_elementId_cycleNumber_key" ON "Observation"("studyId", "elementId", "cycleNumber");

-- CreateIndex
CREATE INDEX "Rating_studyId_idx" ON "Rating"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_studyId_elementId_key" ON "Rating"("studyId", "elementId");

-- CreateIndex
CREATE UNIQUE INDEX "Allowance_studyId_key" ON "Allowance"("studyId");

-- CreateIndex
CREATE INDEX "Result_studyId_idx" ON "Result"("studyId");

-- CreateIndex
CREATE INDEX "Report_studyId_idx" ON "Report"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_token_idx" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AllowancePreset_name_key" ON "AllowancePreset"("name");
