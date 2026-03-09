# Selam Parking System

A comprehensive parking management system built with Next.js, featuring zone management, booking system, analytics dashboard, and real-time tracking.

## Features

- 🚗 **Parking Zone Management** - Add, edit, and manage parking zones with availability tracking
- 📱 **Booking System** - Easy-to-use booking interface with vehicle information
- 📊 **Analytics Dashboard** - Revenue tracking, session management, and detailed statistics
- 📜 **History Tracking** - View all parking sessions with filtering and search
- 💰 **Payment Processing** - Automatic calculation with VAT (15%)
- 🎨 **Modern UI** - Clean, responsive design with sidebar navigation

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/types` - TypeScript type definitions
- `/utils` - Utility functions

## Authentication

- **Admin** – Protected. Sign in at `/login` to access Booking, Zones, History, Analytics.
- **Customer** – No auth required. User portal at `/user`, success page at `/success`.

**Setup admin user:** Supabase Dashboard → Authentication → Users → Add user (email + password). Enable Email provider in Auth settings if needed.

## Pages

- **Login** (`/login`) - Admin sign-in (required for dashboard)
- **Booking** (`/`) - Main booking page for selecting zones and vehicles
- **Parking Zones** (`/zones`) - Manage parking zones and availability
- **History** (`/history`) - View all parking sessions
- **Analytics** (`/analytics`) - Dashboard with revenue and statistics
- **Confirm & Pay** (`/confirm`) - Payment confirmation page

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- LocalStorage - Data persistence

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
