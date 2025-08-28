# Creator Score vs Market Cap Mini App

A Farcaster mini-app built with MiniKit that analyzes the relationship between creator influence and token market performance.

## 🎯 What it does

This app calculates a ratio between a creator's Market Cap and Creator Score to determine if they are:
- **🚀 Undervalued** - High potential, low market recognition
- **⚖️ Balanced** - Fair market valuation  
- **🧃 Overvalued** - Market hype exceeds creator value

## ✨ Features

- **Profile Analysis**: View your creator score and market cap data
- **Ratio Meter**: Visual representation of your valuation status
- **What If Slider**: Simulate different creator scores and see the impact
- **Farcaster Integration**: Seamlessly works within Base App
- **Talent Protocol API**: Real creator scores from Talent Protocol

## 🛠️ Tech Stack

- **Framework**: MiniKit (OnchainKit)
- **Platform**: Next.js 15 + React 18
- **Styling**: Tailwind CSS
- **APIs**: Talent Protocol API (Creator Score) + Mock Data (Market Cap)
- **Deployment**: Vercel

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Talent Protocol API**:
   - Get your API key from [Talent Protocol](https://talentprotocol.com/developers)
   - Copy `env.example` to `.env.local`
   - Add your API key: `NEXT_PUBLIC_TALENT_API_KEY=your_key_here`

3. **Run locally**:
   ```bash
   npm run dev
   ```

4. **Deploy to Vercel**:
   ```bash
   npm run build
   vercel
   ```

## 🔑 API Configuration

### Talent Protocol API
- **Endpoint**: `https://api.talentprotocol.com/score`
- **Required**: Farcaster ID (FID) and API key
- **Fallback**: Mock data when API is unavailable
- **Rate Limits**: Check [Talent Protocol docs](https://docs.talentprotocol.com/)

### Environment Variables
```bash
NEXT_PUBLIC_TALENT_API_KEY=your_talent_api_key_here
```

## 📱 Development

The app is structured with:
- `app/components/creator-score/` - Core app components
- `app/lib/` - Utility functions and API services
- `app/types/` - TypeScript type definitions
- `app/lib/talent-api.ts` - Talent Protocol API integration

## 🔄 API Fallback Strategy

1. **Primary**: Real Talent Protocol API for creator scores
2. **Secondary**: Mock data for market cap (placeholder for future API)
3. **Fallback**: Mock data for both if Talent API fails

## 🔗 Links

- [MiniKit Documentation](https://docs.base.org/mini-apps/overview)
- [Talent Protocol API](https://docs.talentprotocol.com/)
- [Base App](https://base.org)
- [Farcaster](https://farcaster.xyz)

---

Built with ❤️ using MiniKit for the Farcaster ecosystem
