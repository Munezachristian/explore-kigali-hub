# ESA Tours - Explore Kigali Hub

A comprehensive tourism platform for Rwanda, built with modern web technologies. Discover Kigali, book tours, find internships, and explore the beauty of Rwanda.

## 🌍 About ESA Tours

ESA Tours is Rwanda's premier tourism platform that connects travelers with authentic experiences, local guides, and unique opportunities. Our platform offers:

- **Tour Packages**: Curated experiences across Rwanda
- **Internship Opportunities**: Connect with local businesses and organizations
- **Information Centers**: Comprehensive guides and resources
- **Gallery**: Showcase of Rwanda's natural beauty and culture
- **Blog**: Travel tips, stories, and insights

## 🚀 Features

- **Multi-role Authentication**: Admin, Tour Manager, Accountant, and Client dashboards
- **Dynamic Content Management**: Blog posts, packages, galleries
- **Booking System**: Seamless tour and internship bookings
- **Admin Panel**: Complete system management and analytics
- **Responsive Design**: Optimized for all devices
- **Multi-language Support**: English and local languages

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context, TanStack Query
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd esa-tours-explore-kigali
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🌐 Deployment

The application is configured for deployment on Vercel, Netlify, or any static hosting service.

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts (Auth, Settings, Language)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── integrations/       # External service integrations
└── assets/             # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

ESA Tours - Explore Kigali Hub
Website: [explore-kigali-hub.vercel.app](https://explore-kigali-hub.vercel.app)

---

Built with ❤️ for Rwanda's tourism industry
