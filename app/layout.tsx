import './globals.css'

export const metadata = {
  title: 'Wikifeedia - AI-Curated Wikipedia Social Feed',
  description: 'Discover fascinating Wikipedia content curated by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-gray-100 min-h-screen">{children}</body>
    </html>
  )
}

