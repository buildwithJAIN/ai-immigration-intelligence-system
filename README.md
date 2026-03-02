# 🌍 AI-Driven Immigration Intelligence System

An AI-powered full-stack immigration advisory platform that dynamically generates, classifies, and translates visa information using cloud-based AI agents.

Built with React Native, Firebase, and Google Gemini AI.

---

## 🚀 Overview

The AI-Driven Immigration Intelligence System is designed to:

- Generate visa information dynamically using AI
- Classify visas into Immigrant and Non-Immigrant categories
- Translate visa data into multiple languages
- Provide AI-based visa advisory insights
- Support scalable automation using AI agents
- Maintain secure cloud-based architecture

This system demonstrates production-level AI integration with secure backend architecture.

---

## 🏗️ Tech Stack

### Frontend
- React Native (Expo)
- Modern UI/UX
- Responsive design

### Backend
- Firebase Cloud Functions
- Firestore Database
- Google Gemini API (via secure Secret Manager)
- Scheduled AI agent workflows

### AI & Automation
- AI-powered country generation
- Automated visa generation
- Category classification engine
- Multi-language translation system
- Agent-based task orchestration

---

## 🔐 Security Architecture

- No API keys exposed in frontend
- Gemini API key stored securely in Firebase Secret Manager
- All AI requests routed through secure Cloud Functions
- Firestore security rules enforced
- Environment variables used for frontend configuration

---

## ⚙️ System Architecture

Frontend (React Native)  
↓  
Cloud Functions (Firebase)  
↓  
Gemini AI (Secure API Key)  
↓  
Firestore Database  

---

## 🤖 Core Features

### 🌍 Country Generation
AI dynamically generates real countries using ISO standards.

### 📚 Category Engine
Classifies visas into structured Immigrant and Non-Immigrant groups.

### 🛂 Visa Generation
AI-generated visa descriptions including:
- Duration
- Work rights
- Requirements
- Structured formatting

### 🌐 Multi-Language Support
Visa data can be translated dynamically into supported languages.

### 🎤 AI Interview Simulator *(In Progress)*
Simulated visa interview experience powered by conversational AI.

---

## 📸 Screenshots

Project screenshots are available inside the `/Screenshots` folder.

---

## 🧠 AI Agent Workflow

The system runs automated tasks in cycles:

1. batchCountries  
2. batchLanguages  
3. batchCategory  
4. batchLanguageTranslations  
5. batchVisas  

Each task is queued and processed securely through Cloud Functions.

---

## 📦 Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git  
cd YOUR_REPO  

Install dependencies:

npm install  

Create a `.env` file in the root:

EXPO_PUBLIC_FIREBASE_API_KEY=your_key  
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...  
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...  
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...  
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...  
EXPO_PUBLIC_FIREBASE_APP_ID=...  

Start the app:

npx expo start  

---

## ☁️ Deploy Cloud Functions

firebase deploy --only functions  

---

## 🎯 Future Enhancements

- Real-time visa eligibility scoring
- AI document checklist generator
- Country comparison analytics
- Advanced AI advisory engine
- Admin analytics dashboard

---

## 👨‍💻 Author

Jain Eapen Abraham  
Graduate Computer Science Student  
AI | Full-Stack | Cloud | Automation  

---

## 📄 License

Developed for academic and research demonstration purposes.