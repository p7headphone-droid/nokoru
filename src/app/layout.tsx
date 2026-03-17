import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nokoru - 学習ノートSNS',
  description: '学んだことをシェアして、みんなと一緒に学ぼう',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ja">
      <body className={`${geist.className} bg-gray-50 antialiased`}>
        <Header user={user} />
        <main className="mx-auto max-w-4xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
