# MultiTalk Web Application

A comprehensive web application for audio-driven multi-person conversational video generation, built specifically for users in India with free trial and subscription plans.

## Features

- 🎤 **Audio-Driven Video Generation**: Upload audio and generate synchronized conversational videos
- 👥 **Multi-Person Conversations**: Create videos with multiple characters
- 🆓 **Free Trial**: 5 free credits for new users (no credit card required)
- 💳 **Flexible Pricing**: Starter ($6/week), Mid ($12/2 weeks), Pro ($26/month) plans
- 🔐 **Google Authentication**: Secure Gmail-only signup/login
- 🏦 **Paddle Payments**: Integrated payment processing for India
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Real-time Updates**: Live status updates for video generation

## Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Database, authentication, and storage
- **Multer** - File upload handling
- **Node-cron** - Scheduled tasks

### Database & Auth
- **Supabase PostgreSQL** - Primary database
- **Supabase Auth** - Authentication with Google OAuth
- **Supabase Storage** - File storage for uploads and generated videos

### Payments
- **Paddle** - Payment processing (India-friendly)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Paddle account (for payments)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multitalk-web-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/`
   - Set up storage buckets using `supabase/storage.sql`
   - Enable Google OAuth in Supabase Auth settings

4. **Configure environment variables**
   
   **Client (.env in client/ directory):**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Server (.env in server/ directory):**
   ```env
   NODE_ENV=development
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PADDLE_VENDOR_ID=your_paddle_vendor_id
   PADDLE_API_KEY=your_paddle_api_key
   PADDLE_PUBLIC_KEY=your_paddle_public_key
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend on http://localhost:5000

## Project Structure

```
multitalk-web-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configs
│   │   └── main.jsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── index.js            # Server entry point
│   └── package.json
├── supabase/               # Database migrations
│   ├── migrations/         # SQL migration files
│   └── storage.sql         # Storage setup
└── package.json            # Root package.json
```

## Database Schema

### Tables

1. **user_profiles** - User account information and credits
2. **generated_videos** - Video generation records and status
3. **subscriptions** - User subscription information

### Storage Buckets

1. **user-uploads** - Audio and image files uploaded by users
2. **generated-videos** - Generated video files

## API Endpoints

- `POST /api/generate-video` - Generate a new video
- `POST /api/create-subscription` - Create a new subscription
- `POST /api/paddle-webhook` - Handle Paddle webhooks
- `GET /api/health` - Health check

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy the server/ directory

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform.

## Features in Detail

### Authentication
- Google OAuth integration via Supabase
- Automatic user profile creation
- Session management

### Video Generation
- File upload validation
- Credit system integration
- Status tracking
- Error handling

### Subscription Management
- Paddle integration for payments
- Automatic credit renewal
- Webhook handling for subscription events

### Credit System
- Free trial: 5 credits
- Starter: 10 videos/week
- Mid: Unlimited videos/2 weeks
- Pro: Unlimited videos/month

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@yourdomain.com or create an issue in the repository.