import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export const revalidate = 0

function AboutSection() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10 rounded-2xl border border-gray-100 bg-white px-7 py-6 shadow-sm text-left">
      <h2 className="text-sm font-bold text-gray-700 mb-4 tracking-wide">Nokoruについて</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-3">
        <p>Nokoruは、学びと気持ちを残すための静かな個人スペースです。</p>
        <p>
          学習モードでは、今日学んだことや気になったことを書き残せます。
          知的好奇心の軌跡が、ここに積み重なっていきます。
        </p>
        <hr className="border-gray-100" />
        <p>
          日記モードには、moodという機能があります。今の気持ちを選ぶと、
          同じ気持ちで書かれた人の日記がフィードに流れてきます。
        </p>
        <p>
          本当の意味での共感なんてできないかもしれない。でも、同じ気持ちで今日を生きている人がいると知るだけで、少し楽になれることがある。
        </p>
        <p>あなたは一人じゃないと気づける場所。それがNokoruであってほしいと思っています。</p>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-8">
          <BookOpen className="h-14 w-14 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nokoru</h1>
          <p className="text-gray-500">学習と日記を記録・シェアするSNS</p>
        </div>

        <AboutSection />

        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-indigo-300 px-6 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            新規登録
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">今日は何をしますか？</h1>
        <p className="text-gray-500 mt-1 text-sm">学習や日記を記録してみましょう</p>
      </div>

      <AboutSection />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
        <Link href="/study" className="group">
          <div className="rounded-2xl border-2 border-indigo-100 bg-white p-10 text-center hover:border-indigo-400 hover:shadow-lg transition-all group-hover:scale-[1.02] cursor-pointer">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">学習</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              学んだことをまとめて<br />みんなとシェアしよう
            </p>
          </div>
        </Link>
        <Link href="/diary" className="group">
          <div className="rounded-2xl border-2 border-amber-100 bg-white p-10 text-center hover:border-amber-400 hover:shadow-lg transition-all group-hover:scale-[1.02] cursor-pointer">
            <div className="text-6xl mb-4">📔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">日記</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              今日の出来事や気持ちを<br />記録しておこう
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
