# Gemini AI Setup Guide

This guide will help you set up Google Gemini to provide personalized care recommendations.

## Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Step 2: Install Dependencies

```bash
npm install @google/generative-ai
```

## Step 3: Set Environment Variable

Create a `.env.local` file in the root of your project:

```bash
GEMINI_API_KEY=your_api_key_here
```

**Important:** Add `.env.local` to your `.gitignore` to keep your API key secure.

## Step 4: How It Works

When a user describes their symptoms and clicks "Continue":
1. The frontend sends the symptom text and selected tags to `/api/recommend`
2. The API route uses Gemini to analyze the input
3. Gemini generates personalized "why" explanations for each care option
4. The recommendations are returned and displayed to the user

## API Route

The API route is located at: `app/api/recommend/route.ts`

It:
- Takes user input (symptom text, tags, language)
- Sends a prompt to Gemini asking for personalized recommendations
- Returns JSON with 3 care options (GAP, CLSC, Pharmacy) with custom explanations

## Fallback Behavior

If the API fails or no API key is set, the app will fall back to showing default recommendations.


