import Link from 'next/link'
import { Button } from "@/components/ui/button"
import ContactForm from './contact-form'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu } from 'lucide-react'

export const metadata = {
  title: 'Contact MyMaps',
  description: 'Get in touch with MyMaps. We\'d love to hear from you!',
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex flex-col items-center justify-center p-4">
            <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
                <Link href="/" aria-label="MyMaps Home">
                    <h1 className="text-2xl font-bold text-white">MyMaps</h1>
                </Link>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" asChild className="bg-white text-red-600 hover:bg-red-100">
                      <Link href="/">Home</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href="/about">About</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/contact">Contact</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/login">Login</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            </header>

            <main className="w-full max-w-md">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 text-center">Contact Us</h2>
                <p className="text-xl text-red-100 mb-8 text-center">We'd love to hear from you</p>
                <ContactForm />
            </main>

            <footer className="absolute bottom-0 left-0 right-0 text-center p-4 text-white text-sm">
                © {new Date().getFullYear()} MyMaps. All rights reserved.
            </footer>
        </div>
    )
}

