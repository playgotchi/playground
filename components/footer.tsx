import { Copyright } from "lucide-react"
import SocialsLinks from "./socials"
import PolicyModal from "./policy"

export default function Footer() {
  return (
    <footer className="text-white/75 flex w-full max-w-7xl mx-auto p-8 gap-8 text-sm items-center">
      <div className="flex items-center flex-col gap-2 sm:flex-row flex-1">
        <Copyright width={16}/>{new Date().getFullYear()} Playgotchi, All Rights Reserved
      </div>
      <PolicyModal />
      <span>|</span>
      <SocialsLinks />
    </footer>
  )
}
