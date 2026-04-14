# VectraSlot - Smart Parking Management System

<div align="center">

**A type-safe, role-based backend architecture for real-time parking slot management and reservation systems.**

---
</div>

## Project Overview

VectraSlot is a backend-driven parking platform designed for automated slot tracking and secure user reservations. The system implements a robust Role-Based Access Control (RBAC) model to differentiate administrative oversight from standard user interaction, ensuring system integrity and data security.

---

## Table of Contents
- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Implemented Modules](#implemented-modules)
- [Testing Specifications](#testing-specifications--workflow)

---

## System Architecture

The application follows a layered modular architecture, ensuring decoupled logic across authentication, management, and core business services.

![System Architecture](./diagrams/Project_Architecture/Vectraslot_Project_architecure.png)

*Figure 1: High-level architectural design showcasing module interactions and data flow.*

---

## Database Design

The following represents the current relational structure of the VectraSlot database:

![Crow's Foot Notation](./diagrams/ER_Diagrams/Crow_Foot.png)

*Figure 2: Relational mapping of Users, Parking Slots, and Reservation Bookings.*

---

## Implemented Modules

### 1. Core Architecture & Design Patterns
*   **Layered Architecture**: Decoupled N-Tier structure separating Routes, Controllers (Request Handling), Services (Business Logic), and Data Validation (Zod schemas).
*   **Single Responsibility Principle (SOLID)**: Strict adherence to SRP where functional responsibilities are granularly separated into dedicated files (e.g., `.routes.ts`, `.controller.ts`, `.service.ts`, and `.validation.ts`).
*   **Dependency Injection (DI)**: Employed class-based constructor injection (e.g., in the Slots module) to loosely couple Controllers from Services, enhancing testability and scalability.
*   **Strategy Pattern**: Encapsulated authentication logic built flexibly for distinct `USER` and `ADMIN` flows.
*   **Singleton & Modular Encapsulation**: Centralized class-based `App` initialization separating server configuration, middleware, and route mounting.

### 2. Auth & Middleware
*   **Security**: JWT-based session handling with specific Role-based guards.

### 3. Slot & Booking Modules
*   **Conflict-Safe Reservations**: Implemented using **Prisma Transactions** to ensure atomic operations and prevent double-bookings.
*   **Dynamic Availability Engine**: Determines slot availability in real-time by cross-referencing requested time ranges (`startTime`, `endTime`) against active overlapping bookings, isolating unbooked slots without maintaining stateful arrays.
*   **Slot Visibility**: Real-time tracking of slot statuses (`AVAILABLE`, `RESERVED`, `OCCUPIED`).
*   **Booking Management**: Comprehensive lifecycle handling, including creation, modification, cancellation, and completion.

## API Endpoints

### Authentication Module
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | User Registration (Locked to USER role) | No |
| POST | `/api/auth/login` | Secure Role-Based Login | No |

### User Booking Module (Protected)
| Method | Endpoint | Description | Functionality |
| :--- | :--- | :--- | :--- |
| POST | `/api/bookings` | Create Reservation | Atomic slot booking with conflict check |
| GET | `/api/bookings/my` | My Bookings | Retrieve personal reservation history |
| GET | `/api/bookings/:id` | Get by ID | Inspect specific reservation details |
| PATCH | `/api/bookings/:id` | Update Time | Modify start/end times with re-validation |
| PATCH | `/api/bookings/:id/complete` | Complete Booking | Mark a reservation as fulfilled |
| DELETE | `/api/bookings/:id` | Cancel Booking | Standard reservation cancellation |

### Slot Management Module
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/api/slots` | View All Slots | No |
| POST | `/api/slots` | Create new parking slot | Pending Middleware |
| PATCH | `/api/slots/:id` | Modify slot (status, slotNumber) | Pending Middleware |

### Admin Panel (Protected)
| Module | Method | Endpoint | Functionality |
| :--- | :--- | :--- | :--- |
| **Users** | GET | `/api/admin/users` | List all system users |
| | GET | `/api/admin/users/:id` | View detailed user profile |
| | PATCH | `/api/admin/users/:id/role` | Update user role permissions |
| | DELETE | `/api/admin/users/:id` | Remove user account |
| **Bookings**| GET | `/api/admin/bookings` | View all system-wide bookings |
| | GET | `/api/admin/bookings/:id` | Inspect specific booking details |
| | PATCH | `/api/admin/bookings/:id` | Adjust or moderate active booking |
| | DELETE | `/api/admin/bookings/:id` | Expunge booking record |
| **Analytics**| GET | `/api/admin/stats` | Real-time Dashboard statistics |

---

## Testing Specifications & Workflow

### Request Parameters & Naming Conventions

| Module | Action | Parameter Name | Expected Type |
| :--- | :--- | :--- | :--- |
| **Auth** | Login | `email`, `password`, `role` | `String` |
| **Auth** | Admin Secret | `adminSecret` | `String` (Required for Admins) |
| **Slots** | Create Slot | `slotNumber` | `String` (e.g., `A-101`) |
| **Slots** | Update Slot | `status`, `slotNumber` | `String` (`AVAILABLE`, `RESERVED`, `OCCUPIED`) |
| **Availability** | Check Time Slots | `startTime`, `endTime` (Query) | `ISO-Date`, `ISO-Date` |
| **Booking** | Create Booking | `slotId`, `startTime`, `endTime` | `Number`, `ISO-Date`, `ISO-Date` |
| **Booking** | Update Time | `startTime`, `endTime` | `ISO-Date`, `ISO-Date` |
| **Admin** | Role Update | `role` | `String` (`ADMIN` \| `USER`) |

### End-to-End Testing Flow

1.  **SysAdmin Login**:
    *   Execute `POST /api/auth/login` using Admin credentials and `adminSecret`.
    *   Retrieve the JWT `<ADMIN_TOKEN>`.
2.  **Infrastructure Setup**:
    *   Set Header: `Authorization: Bearer <ADMIN_TOKEN>`.
    *   Execute `POST /api/slots` to create parking slots (e.g., `V-101`).
3.  **User Authentication**:
    *   Execute `POST /api/auth/login` using the `test@example.com` credentials.
    *   Retrieve the JWT `<USER_TOKEN>`.
4.  **Slot Discovery**:
    *   Set Header: `Authorization: Bearer <USER_TOKEN>`.
    *   Execute `GET /api/slots` to identify an available `slotId`.
5.  **User Booking (Transaction Check)**:
    *   Execute `POST /api/bookings` providing the `slotId`, `startTime`, and `endTime`.
    *   *Security Test:* Attempt to book the exact same `slotId` for an overlapping time range to verify the `400/409 Conflict` safety mechanism.
6.  **Admin Verification**:
    *   Switch back to the `<ADMIN_TOKEN>`.
    *   Execute `GET /api/admin/stats` to verify the Live Occupancy Analytics have updated properly.

### Default Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **User** | `test@example.com` | `testPassword123` |

---

## Current Status

*Project core foundation, role-based authentication, administrative panel, and transaction-safe booking flows are established. Advanced availability algorithms and automated vacancy tracking are in development.*

*still building processing*
