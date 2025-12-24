// Prisma schema for BuildBrainOS - Construction AI Agent Ecosystem
// Using MongoDB as the database

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// User model - Supports GCs, Subs, Superintendents
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  password      String?
  firstName     String
  lastName      String
  phone         String?
  role          UserRole @default(SUBCONTRACTOR)
  companyId     String?  @db.ObjectId
  company       Company? @relation(fields: [companyId], references: [id])
  avatar        String?
  isActive      Boolean  @default(true)
  lastLogin     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  projects      UserProject[]
  bids          Bid[]
  payments      Payment[]
  compliance    ComplianceRecord[]
  notifications Notification[]

  @@map("users")
}

// Company model - GCs, Subcontractors, etc.
model Company {
  id              String        @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  type            CompanyType
  address         String?
  city            String?
  state           String?
  zipCode         String?
  country         String        @default("US")
  phone           String?
  email           String?
  website         String?
  licenseNumber   String?
  insuranceExpiry DateTime?
  bondingCapacity Float?
  unionStatus     Boolean       @default(false)
  isVerified      Boolean       @default(false)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  users           User[]
  projects        Project[]
  bids            Bid[]

  @@map("companies")
}

// Project model - Core construction projects
model Project {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  address     String
  city        String
  state       String
  zipCode     String
  startDate   DateTime?
  endDate     DateTime?
  budget      Float?
  status      ProjectStatus @default(PLANNING)
  companyId   String       @db.ObjectId
  company     Company      @relation(fields: [companyId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  users       UserProject[]
  bids        Bid[]
  documents   Document[]
  rfis        RFI[]
  safetyLogs  SafetyLog[]
  payments    Payment[]

  @@map("projects")
}

// Junction table for project users
model UserProject {
  id        String           @id @default(auto()) @map("_id") @db.ObjectId
  userId    String           @db.ObjectId
  user      User             @relation(fields: [userId], references: [id])
  projectId String           @db.ObjectId
  project   Project          @relation(fields: [projectId], references: [id])
  role      ProjectUserRole
  joinedAt  DateTime         @default(now())

  @@unique([userId, projectId])
  @@map("user_projects")
}

// Bid model - Marketplace bids
model Bid {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String     @db.ObjectId
  project     Project    @relation(fields: [projectId], references: [id])
  companyId   String     @db.ObjectId
  company     Company    @relation(fields: [companyId], references: [id])
  userId      String     @db.ObjectId
  user        User       @relation(fields: [userId], references: [id])
  amount      Float
  description String?
  status      BidStatus  @default(PENDING)
  aiScore     Float?     // AI matching score
  submittedAt DateTime   @default(now())
  awardedAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("bids")
}

// Document model - Blueprints, contracts, etc.
model Document {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  type        DocumentType
  url         String
  projectId   String       @db.ObjectId
  project     Project      @relation(fields: [projectId], references: [id])
  uploadedBy  String       @db.ObjectId
  uploadedByUser User      @relation(fields: [uploadedBy], references: [id])
  extractedText String?    // AI-extracted text
  metadata    Json?        // AI-extracted metadata
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("documents")
}

// RFI model - Requests for Information
model RFI {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String    @db.ObjectId
  project     Project   @relation(fields: [projectId], references: [id])
  title       String
  description String
  status      RFIStatus @default(OPEN)
  priority    Priority  @default(MEDIUM)
  createdBy   String    @db.ObjectId
  createdByUser User    @relation(fields: [createdBy], references: [id])
  assignedTo  String?   @db.ObjectId
  assignedToUser User?  @relation(fields: [assignedTo], references: [id])
  dueDate     DateTime?
  resolvedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("rfis")
}

// Safety Log model
model SafetyLog {
  id          String         @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String         @db.ObjectId
  project     Project        @relation(fields: [projectId], references: [id])
  type        SafetyLogType
  description String
  location    String?
  photos      String[]       // URLs to uploaded photos
  violations  String[]       // Detected violations
  reportedBy  String         @db.ObjectId
  reportedByUser User        @relation(fields: [reportedBy], references: [id])
  aiAnalysis  Json?          // AI safety analysis
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@map("safety_logs")
}

// Compliance Record model
model ComplianceRecord {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  userId        String            @db.ObjectId
  user          User              @relation(fields: [userId], references: [id])
  type          ComplianceType
  documentUrl   String
  expiryDate    DateTime
  status        ComplianceStatus  @default(PENDING)
  verifiedAt    DateTime?
  verifiedBy    String?
  aiValidation  Json?             // AI OCR validation results
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@map("compliance_records")
}

// Payment model - PayBrain functionality
model Payment {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  projectId     String         @db.ObjectId
  project       Project        @relation(fields: [projectId], references: [id])
  fromUserId    String         @db.ObjectId
  fromUser      User           @relation(fields: [fromUserId], references: [id])
  toUserId      String         @db.ObjectId
  toUser        User           @relation(fields: [toUserId], references: [id])
  amount        Float
  description   String
  status        PaymentStatus  @default(PENDING)
  stripeId      String?        // Stripe payment intent ID
  aiVerified    Boolean        @default(false)
  verifiedAt    DateTime?
  paidAt        DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@map("payments")
}

// Notification model
model Notification {
  id        String             @id @default(auto()) @map("_id") @db.ObjectId
  userId    String             @db.ObjectId
  user      User               @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  isRead    Boolean            @default(false)
  data      Json?              // Additional data
  createdAt DateTime           @default(now())

  @@map("notifications")
}

// Subscription model for SaaS billing
model Subscription {
  id                String             @id @default(auto()) @map("_id") @db.ObjectId
  companyId         String             @db.ObjectId
  company           Company            @relation(fields: [companyId], references: [id])
  plan              SubscriptionPlan
  status            SubscriptionStatus @default(ACTIVE)
  stripeCustomerId  String
  stripeSubscriptionId String
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@map("subscriptions")
}

// Enums
enum UserRole {
  ADMIN
  GENERAL_CONTRACTOR
  SUBCONTRACTOR
  SUPERINTENDENT
  PROJECT_MANAGER
}

enum CompanyType {
  GENERAL_CONTRACTOR
  SUBCONTRACTOR
  SUPPLIER
  ARCHITECT
  ENGINEER
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum ProjectUserRole {
  OWNER
  MANAGER
  MEMBER
  VIEWER
}

enum BidStatus {
  PENDING
  SUBMITTED
  AWARDED
  REJECTED
  WITHDRAWN
}

enum DocumentType {
  BLUEPRINT
  CONTRACT
  SPECIFICATION
  PERMIT
  INSURANCE
  OTHER
}

enum RFIStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum SafetyLogType {
  INSPECTION
  INCIDENT
  VIOLATION
  CORRECTION
}

enum ComplianceType {
  INSURANCE
  LICENSE
  CERTIFICATION
  BONDING
}

enum ComplianceStatus {
  PENDING
  VERIFIED
  EXPIRED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

enum NotificationType {
  BID_ALERT
  RFI_ASSIGNED
  SAFETY_ALERT
  PAYMENT_DUE
  COMPLIANCE_EXPIRING
  PROJECT_UPDATE
}

enum SubscriptionPlan {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  UNPAID
}
