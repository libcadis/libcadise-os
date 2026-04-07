import "./globals.css"
import { CartProvider } from "../components/CartContext"
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import Cart from '../components/Cart'
import ScrollToTopButton from '../components/ScrollToTopButton'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-['Poppins'] antialiased">
        <CartProvider>
          <Navbar />
          <Cart />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ScrollToTopButton />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  )
}