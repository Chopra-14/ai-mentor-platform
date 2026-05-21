import "./globals.css";

export const metadata = {
  title: "AI Mentor Platform",
  description: "AI Learning Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}