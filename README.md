# Cafeteria Management Portal (Frontend)
 
This is the frontend repository for the Cafeteria Management Portal, a responsive web application designed to streamline cafeteria operations. It features a "Student Hub" themed interface for students to view information and lodge complaints, along with comprehensive dashboards for administrators.
 
## 🛠️ Tech Stack
 
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & DaisyUI
* **State Management:** React Context API (Authentication)
* **Authentication:** Custom JWT-based Auth
 
## ✨ Features
 
### User Module (Student Hub)
* **Dynamic Homepage:** Real-time display of cafeteria updates and information.
* **Authentication:** Secure Login and Signup functionality using JWT.
* **Feedback & Complaints:** Dedicated forms for students to submit feedback or raise issues regarding food quality, hygiene, or service.
 
### Admin Module
* **Canteen Management:** Dashboard to manage canteen details and menus.
* **Complaint Handling:** Interface to view, track, and resolve student complaints.
* **Feedback Review:** Analytics and view for student feedback.
* **Committee Management:** Tools to manage committee member profiles and permissions.
 
## 🚀 Getting Started
 
### Prerequisites
Ensure you have the following installed:
* Node.js (v18.0.0 or higher)
* npm or yarn
 
### Installation
 
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/D-Godhani/cafeteria-portal-frontend.git](https://github.com/D-Godhani/cafeteria-portal-frontend.git)
    cd cafeteria-portal-frontend
    ```
 
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
 
3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your backend API URL:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000/api
    ```
 
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
 
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
