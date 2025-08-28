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

## 🛠️ Tech Stack

- **Framework**: MiniKit (OnchainKit)
- **Platform**: Next.js 15 + React 18
- **Styling**: Tailwind CSS
- **APIs**: Talent API (Creator Score & Market Cap)
- **Deployment**: Vercel

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally**:
   ```bash
   npm run dev
   ```

3. **Deploy to Vercel**:
   ```bash
   npm run build
   vercel
   ```

## 📱 Development

The app is structured with:
- `app/components/creator-score/` - Core app components
- `app/lib/` - Utility functions and API services
- `app/types/` - TypeScript type definitions

## 🔗 Links

- [MiniKit Documentation](https://docs.base.org/mini-apps/overview)
- [Base App](https://base.org)
- [Farcaster](https://farcaster.xyz)

---

Built with ❤️ using MiniKit for the Farcaster ecosystem
