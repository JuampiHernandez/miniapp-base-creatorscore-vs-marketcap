function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://miniapp-base-creatorscore-vs-market.vercel.app";

  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjY3MzAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhCRTE1NjIyNzQ1NkVGY0I1NkZEMDEwMzdGMjNiNWNBNGIxM0QzNkMxIn0",
      payload: "eyJkb21haW4iOiJtaW5pYXBwLWJhc2UtY3JlYXRvcnNjb3JlLXZzLW1hcmtldC52ZXJjZWwuYXBwIn0",
      signature: "MHgzMDM0ODIwMGQ1NWRjYjQ0NDljZDY0ZjJlOGFiMWYxNDlmNzk0ZTQ3ZmNlZWJhYTJkNTZhZDdkZTdmMGM2OGQ3MGJjOGI0ZDgzZTM1NGU5NGVmY2Q4NjVjYjgwNmY4ZjQ3ZDNmMDhkZWJiMjhkYjNiMTg0NTVlNjgyMDU0Yzk3YTFj"
    },
    baseBuilder: {
      allowedAddresses: ["0x..."] // You'll need to add your Base Builder address
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Creator Score vs Market Cap",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "Analyze your creator value",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Compare your Creator Score against your coin's Market Cap to see if you're undervalued, balanced, or overvalued. Interactive simulator included!",
      screenshotUrls: [
        `${URL}/screenshot.png`
      ],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/icon.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#1F2937",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "finance",
      tags: ["creator-score", "market-cap", "valuation", "finance", "analytics"],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/hero.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Know your worth",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "Creator Score vs Market Cap",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "Analyze if your creator coin is undervalued, balanced, or overvalued",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || `${URL}/hero.png`,
      noindex: "false", // Set to "true" for development, "false" for production
    }),
  });
}
