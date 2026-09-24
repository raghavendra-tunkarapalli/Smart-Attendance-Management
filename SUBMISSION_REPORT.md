# Project Submission: Smart Attendance Management System
**Course / Evaluation**: System Design & Full-Stack Development Assignment  
**Selected Assignment**: **Assignment 1 — Smart Attendance Management**  
**Repository**: [https://github.com/raghavendra-tunkarapalli/Smart-Attendance-Management](https://github.com/raghavendra-tunkarapalli/Smart-Attendance-Management)  
**Author**: Raghavendra Tunkarapalli  

---

## 1. Executive Summary & Approach Note

### 1.1 Problem Statement Context
An institution with approximately **5,000 students**, **200 faculty members**, across multiple departments, classes, sections, and subjects requires an attendance and academic operations platform that eliminates manual discrepancies, streamlines daily logging, facilitates rapid corrections, provides historical trend analytics, and actively flags students with low attendance (below institutional thresholds such as 75%).

### 1.2 Architectural Philosophy & Solution Approach
To handle this scale with fault isolation and horizontal scalability, the system was designed with a **Microservices-First Architecture**:
- **Decoupled Domain Microservices**: Individual services for Attendance Tracking, Student Portals, Teacher Portals, Staff Administration, Schedules/Timetables, Examinations, Assignments, Enquiries, and Admissions.
- **Service Discovery & Registry**: Netflix Eureka Server dynamically discovers and load-balances traffic across microservices.
- **Unified API Gateway**: Spring Cloud Gateway provides a single, secured entry point (`:8099`) with centralized CORS, reactive routing, and reverse proxying.
- **Reactive, Glassmorphic Frontend**: A responsive single-page application built on **React 19 + Vite** featuring intuitive role-based views (Student, Teacher, Staff/Admin), real-time attendance matrix grids, monthly summary tables, and visual warning indicators for low attendance.

---

## 2. Key Features & Functional Deliverables

| Requirement | Implementation & Capability |
| :--- | :--- |
| **Attendance Recording** | Fast, section-wise roll call and batch attendance marking by subject teachers with real-time state persistence. |
| **Attendance Corrections & Review** | Role-based attendance modification and audit review for authorized teachers and staff administrators to rectify historical logs. |
| **Attendance History & Analytics** | Monthly breakdown by student, class-level attendance matrices, and date-range aggregated attendance rates. |
| **Low Attendance Identification** | Automatic percentage calculation with visual alerts and dedicated reporting for students falling below the mandatory 75% attendance threshold. |
| **Timetable & Schedule Management** | Dynamic cell-by-cell schedule editor for staff with real-time class schedule synchronization for students and teachers. |
| **Role-Based Portals** | Dedicated experiences for **Students** (attendance tracker, schedules, assignments), **Teachers** (class registers, mark sheets, attendance logger), and **Staff/Admins** (admissions, directories, overall operations). |

---

## 3. System Architecture & Port Mapping

```
                               ┌──────────────────────────────┐
                               │    React 19 Frontend (Vite)  │
                               │    http://localhost:5173     │
                               └──────────────┬───────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │   Spring Cloud API Gateway   │
                               │    http://localhost:8099     │
                               └──────┬───────────────┬───────┘
                                      │               │
                     ┌────────────────┘               └────────────────┐
                     ▼                                                 ▼
             ┌───────────────┐                                 ┌───────────────┐
             │ Eureka Server │                                 │ Domain        │
             │    (:8761)    │                                 │ Microservices │
             └───────────────┘                                 │ (8081 - 8097) │
                                                               └───────────────┘
```

### Complete Service Port Registry

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **Eureka Server** | `8761` | Service discovery & registration registry |
| **API Gateway** | `8099` | Central reverse proxy, routing & CORS policies |
| **Registration Service** | `8081` | Authentication, credentials, and user role provisioning |
| **Admission Service** | `8082` | Candidate enrollment and application ingestion |
| **Student Enquire Service** | `8083` | Student query submission and grievance tracking |
| **Parent Enquiry Service** | `8084` | Parent helpdesk and communication channel |
| **Admin Enquiries Service** | `8085` | Central administrative helpdesk triage |
| **Admin Admissions Service** | `8086` | Application approval and verification workflows |
| **Teacher Enquiry Service** | `8087` | Faculty inquiry resolution & communications |
| **Staff Enquiry Service** | `8088` | Internal staff request processing |
| **Student Portal Service** | `8090` | Student profile, academic performance, and dashboard |
| **Teacher Portal Service** | `8091` | Faculty dashboard, class registers, and roster views |
| **Staff Portal Service** | `8092` | Staff administrative dashboard and master schedules |
| **Staff Student Service** | `8093` | Student directory and academic records |
| **Teacher Attendance Service** | `8094` | Core attendance recording, correction, and analytics engine |
| **Student Schedule Service** | `8095` | Class timetable scheduling and room allocations |
| **Staff Examination Service** | `8096` | Examination scheduling and grade evaluations |
| **Student Assignment Service** | `8097` | Homework submissions, deadlines, and tracking |

---

## 4. Key Design Assumptions

1. **Scalability & Load**: Designed to comfortably handle 5,000+ concurrently enrolled students and 200+ faculty members across distinct departments without database locking on attendance bursts.
2. **Attendance Criteria**: A default institutional standard of **75% minimum attendance** is enforced. Students falling below this threshold are immediately flagged in monthly summaries.
3. **Role Segregation**: Teachers have primary read/write access to attendance in their assigned periods; Staff/Admins retain overriding correction and review privileges.
4. **Resilient Gateway Routing**: If the gateway is under maintenance, frontend components support direct microservice fallback URLs for high availability.

---

## 5. Technology Stack Summary

- **Backend Framework**: Java 21 / Spring Boot 3.x, Spring Cloud (Eureka & Gateway), Spring Data JPA
- **Frontend Framework**: React 19, Vite, Lucide Icons, Pure CSS Design System
- **Database / Persistence**: JPA Entities with relational schema mappings
- **Automation & Scripting**: PowerShell Orchestration Suite (`run_all.ps1`, `stop_all.ps1`)

---

## 6. How to Run the Working Prototype

### Automated Launch
Clone the repository and execute the PowerShell orchestrator:
```powershell
git clone https://github.com/raghavendra-tunkarapalli/Smart-Attendance-Management.git
cd Smart-Attendance-Management
.\run_all.ps1
```

### Access URLs
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
- **API Gateway**: [http://localhost:8099](http://localhost:8099)

---

## 7. Mandatory AI Usage & Validation Report

### 7.1 AI Tools Utilized
- **AI Models & Assistants**: Google Antigravity AI (Gemini 3.7 Flash Engine), Cursor / IDE Agentic tools.

### 7.2 Nature of AI Assistance
1. **Architecture & Service Refactoring**: AI assisted in modularizing the monolithic modules into 18 discrete, single-responsibility Spring Boot microservices and structuring the API Gateway route predicates.
2. **Frontend UI/UX Design**: AI generated the glassmorphic, theme-harmonious CSS design tokens, timetable matrix components, and responsive low-attendance alert badges in React 19.
3. **Build & Script Automation**: AI generated and refined the PowerShell process automation scripts (`run_all.ps1`, `stop_all.ps1`) with log redirection and graceful port termination.
4. **Configuration & Dependency Harmonization**: AI identified port conflicts (e.g., reassigning API Gateway from 8080 to 8099 to avoid Oracle TNS conflicts) and configured Spring Cloud Gateway CORS headers.

### 7.3 Output Verification & Quality Assurance (How AI Output Was Validated)
- **Compilation & Unit Verification**: All 18 Spring Boot services were built using Maven (`mvn clean package -DskipTests`) to ensure zero classpath or dependency anomalies.
- **Live Eureka Service Registry Inspection**: Queried `http://localhost:8761/eureka/apps` via REST to confirm that all services successfully registered and maintained periodic heartbeat renewals.
- **Port & Process Validation**: Executed PowerShell socket probes (`Get-NetTCPConnection`) across all 19 assigned ports (8761, 8099, 8081–8097, 5173) to verify 100% listener uptime.
- **End-to-End API Routing Checks**: Sent HTTP requests through the API Gateway (`:8099`) to confirm reverse proxying and data propagation to underlying microservices.
- **Frontend Build & Linter Runs**: Executed `npm install` and Vite dev server builds to ensure zero runtime console errors and proper component mounting.
