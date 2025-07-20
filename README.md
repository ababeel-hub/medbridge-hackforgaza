# 🏥 ShifaLink 🚀

## Project Goal

To build a foundational progressive web application that serves as a "mailbox + code review" system, enabling medical personnel in gaza to asynchronously seek expert medical opinions and guidance from external doctors.

## The Problem

In regions affected by conflict, access to experienced medical professionals is severely limited. Minimally trained staff (e.g., medical students, nurses) are often forced to treat complex trauma cases under immense pressure and with unreliable internet connectivity, leading to suboptimal patient care.

## Our Solution (hack for gaza MVP)

For this hackathon, we will develop a web-based Progressive Web Application (PWA) prototype focusing on the core asynchronous communication loop. This MVP will allow:

- **Internal Doctors (on the ground)**: To submit detailed case descriptions and questions. They can manage their submitted cases and view feedback.

- **External Doctors (remote experts)**: To view a list of all submitted cases, filter them, assign cases to themselves, and provide feedback/answers. They can also "upvote" helpful answers from other external doctors.

## Key MVP Features

- **Role-Based Access**: Separate dashboards and functionalities for Internal and External Doctors, managed via user authentication.

- **Case Submission**: A structured form for Internal Doctors to detail patient cases (title, description, symptoms, tags, research consent).

- **Case Management**: Internal Doctors can view their submitted cases and manage drafts.

- **Case Review & Feedback**: External Doctors can browse all submitted cases, assign them, and provide text-based answers.

- **Basic Interaction**: Simple upvoting on answers to indicate helpfulness.

- **Search & Filtering**: Basic keyword search and tag-based filtering for cases.

- **Responsive UI**: A clean, intuitive, and mobile-friendly interface, built as a PWA for reliability.

- **Offline Capability (PWA)**: The app shell will be cached for instant loading even without network, and Firestore's offline persistence will allow viewing previously fetched data.

## Technology Stack

### Frontend
- HTML, CSS (using Tailwind CSS via CDN), Vanilla JavaScript

### Backend
Google Firebase for:

- **Firestore**: A NoSQL cloud database for storing all case data, answers, user profiles, and votes.
- **Authentication**: For secure user sign-up and login, managing internal and external doctor roles.
- **Hosting**: For deploying the web application as a PWA.

## Future Vision (Beyond the Hackathon)

This MVP will lay the groundwork for a more robust system, including:

- A full offline-first mobile application with robust offline data submission ("outbox").
- Advanced intelligent semantic search for medical queries.
- Comprehensive feedback threading and "accepted answers" akin to Stack Overflow.
- Visual aid integration (images/videos) in case submissions.
- A curated "best practice" protocol library.
- **Real-time Collaboration**: The ability to initiate video calls or live chat sessions between internal and external doctors when stable internet connectivity is available, offering users a flexible choice of communication flow.

## Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/ababeel-hub/medbridge-hackforgaza
cd virtual-clinic
```

### 2. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable Firestore Database and Firebase Authentication (Email/Password provider).
4. Get your Firebase Config.


### 3. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 4. Login to Firebase CLI

```bash
firebase login
```

### 5. Initialize Firebase Hosting

```bash
firebase init hosting
```

### 6. Run Locally

```bash
firebase emulators:start
```

## Deployment (Firebase Hosting)

To deploy your PWA to Firebase Hosting:

```bash
firebase deploy --only hosting
```

Your app will be live at a Firebase-provided URL.