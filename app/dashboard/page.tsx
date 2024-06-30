import CardBase from "@/components/card-base"
import CardNoun from "@/components/card-noun"
import Footer from "@/components/footer"
import Header from "@/components/header"
import CardPlaygotchi from "@/components/card-playgotchi"
import { Plus } from "lucide-react"
import LogInWrapper from "@/components/isLoggedIn-wrapper"

export default async function DashboardPage() {

  return (
    <LogInWrapper>
      <div className="flex flex-col justify-between w-full h-full min-h-screen bg-background cursor-py-cursor-normal">
        <Header />
        <main className="flex flex-row items-center gap-12 w-full max-w-7xl px-4 py-4 mx-auto sm:px-6 md:py-6">
          <button disabled className="bg-white/5 border border-slate-900 p-8 flex flex-col align-middle items-center text-white/40">
            <Plus size={24} />
            Create Playground
          </button>
          <CardBase />
          <CardPlaygotchi />
          <CardNoun />
        </main>
        <Footer/>
      </div>
    </LogInWrapper>
  )
}