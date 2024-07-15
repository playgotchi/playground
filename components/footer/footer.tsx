import { Copyright } from "lucide-react"
import SocialsLinks from "../Socials"
import PolicyModal from "../policy"
import { ModeToggle } from "../mode-toggle"

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 gap-2 text-sm items-center">
      <div className="flex flex-col flex-col-reverse md:flex-row w-full justify-between items-center gap-4">
      <div className="flex items-center gap-2 sm:flex-row flex-1">
        <Copyright width={16}/>{new Date().getFullYear()} Playgotchi, All Rights Reserved
      </div>
        <PolicyModal />
        <div className="flex gap-2 items-center">
          <SocialsLinks />
          <span>|</span>
          <ModeToggle />
        </div>
      </div>
    </footer>
  )
}
