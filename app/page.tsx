import Footer from "@/components/footer";
import Header from "@/components/header";
import Image from "next/image";
import { auth } from "auth"
import { SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Index() {
  const session = await auth();
  if (session?.user) {
    // filter out sensitive data before passing to client.
    session.user = {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
  }

  return (
    <SessionProvider session={session}>
      <div className="flex flex-col justify-between w-full h-full min-h-screen bg-background">
      <Header />
      <main className="flex-auto w-full  max-w-7xl m-auto gap-8 ">
        <h1 className="text-3xl font-bold text-center animate-pulse">Welcome to Playground</h1>
        <p className="text-center m-4 text-white/75">You must carry one of thse nfts to access this site.</p>
        <div className="flex gap-24 justify-center  mt-8">
          
          <div className="flex flex-col gap-4 border-4 border-blue-200 shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2">
            <Image src="/baldjessy.gif" alt={""} width={200} height={200} unoptimized      
            />
            <h3 className="text-black text-center typewriter">OnChain Summer</h3>
            <Link href={"https://opensea.io/collection/supabald-jesse"}>
              <Button variant={'secondary'}>Check it out</Button>
            </Link>
          </div>
          <div className="flex flex-col gap-4 border-4 border-[#4FFF14] shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2">
            <Image src="/playtonium.gif" alt={""} width={200} height={200} unoptimized  
            />
            <h3 className="text-black text-center typewriter">Playgotchi</h3>
            <Link href={"https://opensea.io/collection/playtonium"}>
              <Button variant={'secondary'}>Check it out</Button>
            </Link>
          </div>
          <div className="flex flex-col gap-4 border-4 border-yellow-200 shadow-lg p-4 bg-white rounded-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2">
            <Image src="/summer/frame-yellow.png" alt={""} width={200} height={200}       
            />
            <h3 className="text-black text-center typewriter">Yellow Collective</h3>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
    </SessionProvider>
  );
};