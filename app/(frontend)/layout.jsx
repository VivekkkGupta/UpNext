import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "UpNext",
  description: "Let your audience vote for the next song to play on your stream",
}

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body className={inter.className + "bg-gradient-to-b from-gray-900 to-black "}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Header />
            {children}
            <Toaster richColors  />
          </ThemeProvider>
        </body>
      </html>
  )
}
