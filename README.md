# Barbershop Booking Application

A modern, responsive barbershop booking web application built with Next.js, React, and Tailwind CSS. This application provides a seamless booking experience for customers to schedule appointments, select services, and manage their barbershop visits.

## Features

- 🎨 Modern, responsive UI with smooth animations
- 📅 Multi-step booking wizard:
  - Service selection
  - Add-on services
  - Date & time selection
  - Payment confirmation with smart receipt
- 💇 Barber showcase section
- 📍 Location and contact information
- 💬 WhatsApp integration for quick contact
- 📱 Mobile-first design
- ⭐ Customer testimonials
- ❓ FAQ section

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Database:** Supabase (configured)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/Barbershop.git
cd Barbershop/booking-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
booking-app/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── booking/      # Booking wizard components
│   │   ├── layout/       # Layout components
│   │   ├── sections/     # Page sections
│   │   └── ui/           # UI components
│   ├── data/             # Mock data and configs
│   ├── store/            # State management
│   └── utils/            # Utility functions
├── public/               # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
