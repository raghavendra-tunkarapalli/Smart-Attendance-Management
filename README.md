# Smart Attendance Management System

A robust, enterprise-grade Microservices-based Attendance and School Operations Management Platform built with **Spring Boot 3**, **Spring Cloud (Eureka & API Gateway)**, and a modern **React 19 + Vite** frontend.

---

## 🏛️ Architecture Overview

The system is architected as a distributed microservices ecosystem:

- **Service Registry**: Netflix Eureka Server (`:8761`)
- **API Gateway**: Spring Cloud Gateway with reactive routing & CORS configuration (`:8099`)
- **Frontend**: Modern React + Vite interactive dashboard (`:5173`)
- **Backend Microservices**: Specialized Spring Boot domain services for attendance, admissions, assignments, schedules, examinations, enquiries, and portals.

```
                  ┌──────────────────────────────┐
                  │    React Frontend (Vite)     │
                  │     http://localhost:5173    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   Spring Cloud API Gateway   │
                  │     http://localhost:8099    │
                  └──────┬───────────────┬───────┘
                         │               │
        ┌────────────────┘               └────────────────┐
        ▼                                                 ▼
┌───────────────┐                                 ┌───────────────┐
│ Eureka Server │                                 │ Microservices │
│    (:8761)    │                                 │   (Portals,   │
└───────────────┘                                 │  Attendance,  │
                                                  │  Admissions)  │
                                                  └───────────────┘
```

---

## 🚀 Services & Port Mapping

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **Eureka Server** | `8761` | Service discovery & registration registry |
| **API Gateway** | `8099` | Central routing, load balancing & reverse proxy |
| **Registration Service** | `8081` | User authentication, role assignment & registration |
| **Admission Service** | `8082` | Direct student admissions and enrollment processing |
| **Student Enquire Service** | `8083` | Student support query management |
| **Parent Enquiry Service** | `8084` | Parent communication and inquiry portal |
| **Admin Enquiries Service** | `8085` | Administrative helpdesk and inquiry routing |
| **Admin Admissions Service** | `8086` | Central administrative admission oversight |
| **Teacher Enquiry Service** | `8087` | Faculty inquiry and grievance redressal |
| **Staff Enquiry Service** | `8088` | Staff helpdesk and internal requests |
| **Student Portal Service** | `8090` | Student dashboard, profile, and academic tracking |
| **Teacher Portal Service** | `8091` | Teacher dashboard and class management |
| **Staff Portal Service** | `8092` | Administrative & staff operational workflows |
| **Staff Student Service** | `8093` | Student records and staff administrative directory |
| **Teacher Attendance Service** | `8094` | Attendance logging, tracking, and analytics |
| **Student Schedule Service** | `8095` | Class timetables, routine, and exam schedules |
| **Staff Examination Service** | `8096` | Exam schedule publication and grade management |
| **Student Assignment Service** | `8097` | Homework and assignment submissions |

---

## 🛠️ Technology Stack

- **Backend**:
  - Java 21 / 17
  - Spring Boot 3.x
  - Spring Cloud (Eureka Server & Spring Cloud Gateway)
  - Spring Data JPA / REST APIs
  - Maven
- **Frontend**:
  - React 19
  - Vite
  - Lucide React Icons
  - Pure Modern CSS (Glassmorphism & Responsive layout)
- **Tooling & Automation**:
  - PowerShell Orchestration Scripts (`run_all.ps1`, `stop_all.ps1`)

---

## ⚡ Quick Start

### 1. Prerequisites
- **JDK 17+** (Java 21 recommended)
- **Node.js 18+** & `npm`
- **Maven 3.8+** (or bundled Maven wrapper)

### 2. Automated Launch (PowerShell)
Launch all backend microservices, the API gateway, Eureka server, and frontend in one command:

```powershell
.\run_all.ps1
```

To gracefully stop all running services:
```powershell
.\stop_all.ps1
```

### 3. Manual Step-by-Step Launch

1. **Start Eureka Server**:
   ```bash
   cd backend/eureka-server
   mvn spring-boot:run
   ```

2. **Start API Gateway**:
   ```bash
   cd backend/api-gateway
   mvn spring-boot:run
   ```

3. **Start Microservices**:
   Navigate to individual directories under `backend/` and run `mvn spring-boot:run`.

4. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 Web Endpoints

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **API Gateway**: [http://localhost:8099](http://localhost:8099)
- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)

---

## 📄 License
This project is licensed under the MIT License.
