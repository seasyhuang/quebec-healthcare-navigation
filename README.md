# Québec Healthcare Navigation Prototype

A prototype exploring solutions to help Montrealers navigate Québec's fragmented healthcare system.

## The Problem

Montrealers struggle to understand where to go for care and what to expect next, because Québec's healthcare pathways are fragmented and often provide unclear or incomplete next steps.

## Design Constraints

- ✅ Safe (no diagnosis)
- ✅ Focused on navigation and education
- ✅ Clear next steps
- ✅ Québec-specific (GAP, Clic Santé, RAMQ, CLSC)

## Solution Concepts

This prototype presents 7 different solution directions:

1. **Care Pathway Navigator** - Interactive decision tree guiding users through the healthcare system
2. **Healthcare Journey Timeline** - Visual timeline showing what to expect at each stage
3. **Care Option Comparison Tool** - Side-by-side comparison of different care options
4. **Virtual Healthcare Assistant** - Conversational AI for guidance and questions
5. **Smart Appointment Scheduler** - Intelligent scheduling across multiple platforms
6. **Healthcare Education Hub** - Comprehensive resource center
7. **Community Care Network** - Peer support and community knowledge sharing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is deployed on Vercel. Push to the main branch to trigger automatic deployments.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Google Gemini AI (for personalized recommendations)
- Vercel Analytics & Speed Insights

## AI Integration (Gemini)

This prototype uses Google Gemini AI to analyze user symptoms and generate personalized care recommendations with custom "why" explanations.

### Setup Instructions

1. **Get a Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in and create an API key
   - Copy the key

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variable:**
   Create a `.env.local` file in the project root:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

4. **How It Works:**
   - When users describe symptoms and click "Continue", the app calls `/api/recommend`
   - Gemini analyzes the input and generates personalized recommendations
   - Each care option gets a custom "why" explanation based on the user's specific needs
   - If the API fails or no key is set, the app falls back to static recommendations

See `GEMINI_SETUP.md` for detailed instructions.

## Project Structure

```
quebec-healthcare-navigation/
├── app/
│   ├── layout.tsx          # Root layout with fonts and analytics
│   ├── page.tsx            # Main prototype page
│   ├── page.module.css     # Styles for the prototype
│   └── styles/
│       └── globals.css     # Global styles
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Notes

This is a portfolio prototype exploring UX solutions for healthcare navigation. It focuses on navigation, education, and clear next steps—never diagnosis or medical advice.

