# MyPet - Comprehensive Pet Management Application
mypetapplication.netlify.app
![MyPet Logo](src/assets/mypetlogo.png)

## 🐾 Overview

MyPet is a comprehensive web application designed to help pet owners manage their pets' health, schedules, and overall well-being. Built with React and Firebase, it provides a complete solution for pet care management with features ranging from health tracking to location-based services.

## ✨ Features

### 🏠 Pet Profile Management
- **Add Pet Information**: Create detailed profiles for multiple pets
- **Breed Information**: Access comprehensive breed-specific information and care guidelines
- **Medical Records**: Track vaccinations, health assessments, and medical history
- **AI Breed Recognition**: Advanced breed identification using AI technology

### 🩺 Health & Diagnosis
- **Symptom-Based Diagnosis**: Select symptoms to get customized health recommendations
- **Pet Health Assessment**: Comprehensive health evaluation tools
- **Vaccination Tracker**: Monitor vaccination schedules and due dates
- **Medical History**: Maintain detailed health records for each pet

### 📅 Calendar & Scheduling
- **Monthly Planner**: Create and manage pet-related events and appointments
- **Multi-Pet Support**: Schedule events for specific pets
- **Event Notifications**: Receive reminders for upcoming events and appointments
- **Feeding Schedules**: Track feeding times and dietary requirements

### 🗺️ Location Services
- **Pet Establishments Map**: Find nearby veterinary clinics, pet stores, and grooming services
- **User Location**: Real-time location tracking for emergency services
- **Nearest Services**: Locate the closest pet-related establishments
- **Interactive Map**: Visual representation of nearby pet services

### 📱 Additional Features
- **User Authentication**: Secure login and registration system
- **Real-time Notifications**: Push notifications for events and reminders
- **Pet Journal**: Document daily activities and observations
- **Community Forum**: Connect with other pet owners
- **Blog Section**: Access pet care articles and tips
- **Handling Guides**: Breed-specific care instructions

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1**: Modern React with hooks and functional components
- **React Router DOM**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **React Icons**: Icon library
- **Recharts**: Data visualization for health tracking
- **Vite**: Fast build tool and development server

### Backend & Services
- **Firebase Authentication**: User management and security
- **Firestore Database**: NoSQL database for data storage
- **Firebase Storage**: File storage for pet images and documents
- **Firebase Functions**: Serverless backend functions
- **Firebase Messaging**: Push notifications
- **Google APIs**: Integration with Google services

### Development Tools
- **ESLint**: Code linting and formatting
- **GitHub Pages**: Deployment platform
- **Netlify**: Alternative deployment option
- **Vercel**: Additional deployment platform

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account
- Google Cloud Platform account (for additional services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joshwelo/MyPet.git
   cd MyPet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication, Firestore, Storage, and Functions
   - Update `src/firebaseConfig.js` with your Firebase configuration
   - Deploy Firebase Functions:
     ```bash
     cd functions
     npm install
     firebase deploy --only functions
     ```

4. **Configure environment variables**
   - Set up your Firebase project ID and API keys
   - Configure Google APIs for additional features

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
MyPet/
├── src/
│   ├── pages/                 # Main application pages
│   │   ├── HomePage.jsx       # Dashboard
│   │   ├── PetProfile.jsx     # Pet management
│   │   ├── DiagnosePage.jsx   # Health diagnosis
│   │   ├── CalendarEventsPage.jsx # Scheduling
│   │   ├── EstablishmentsPage.jsx # Location services
│   │   └── ...                # Other feature pages
│   ├── assets/                # Images and static files
│   ├── jsons/                 # Data files
│   ├── authProvider.jsx       # Authentication context
│   ├── firebaseConfig.js      # Firebase configuration
│   └── index.jsx              # Main app entry point
├── functions/                 # Firebase Cloud Functions
├── public/                    # Public assets
├── dist/                      # Build output
└── package.json               # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## 🌐 Deployment

The application is configured for multiple deployment platforms:

- **GitHub Pages**: `https://joshwelo.github.io/MyPet`
- **Netlify**: Configured via `netlify.toml`
- **Vercel**: Configured via `.vercel` directory
- **Firebase Hosting**: Configured via `firebase.json`

## 🔐 Security Features

- **Email Verification**: Required for account activation
- **Protected Routes**: Authentication-based access control
- **Firestore Security Rules**: Database-level security
- **Secure API Keys**: Environment-based configuration

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase team for the excellent backend services
- React community for the amazing framework
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**MyPet** - Making pet care easier, one paw at a time! 🐕🐱🐰
