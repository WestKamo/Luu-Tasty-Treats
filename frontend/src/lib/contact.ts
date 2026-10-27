/** Public contact destinations. Keep private numbers and passwords out of client config. */
export const contactLinks = {
  whatsapp: "https://wa.me/27631713034?text=Hello%20Luu%20Tasty%20Treats%2C%20I%20would%20love%20to%20enquire%20about%20a%20cake.",
  // Set the real bakery page URL in Vercel when it is available. Until then
  // clearly link to Facebook search rather than inventing a business profile.
  facebook: process.env.NEXT_PUBLIC_BAKERY_FACEBOOK_URL ||
    "https://www.facebook.com/search/top?q=Luu%20Tasty%20Treats",
  github: "https://github.com/WestKamo/Luu-Tasty-Treats",
} as const;
