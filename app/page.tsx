import Footer from "@/components/footer/footer";
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
      <div className="flex flex-col justify-between w-full h-full min-h-screen bg-background cursor-py-cursor-normal">
      <Header />
      <main className="flex-auto w-full  max-w-7xl m-auto gap-8 ">
        <h1 className="text-3xl font-bold text-center animate-pulse">Welcome to Playground</h1>
        <p className="text-center m-4">Early access is open to these onchain communities</p>
        <div className="flex flex-col md:flex-row justify-center mt-8">          
          <div className="flex flex-col max-w-[360px] relative m-auto gap-4 border-4 border-b-8 border-blue-500 shadow-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
            <Image src="/baldjessy.gif" alt={"Bald Jesse"} width={200} height={200} unoptimized      
            />
            <div className="w-[200px] bg-blue-500 h-[10px] top-0 mt-[-8px] absolute"/>
            <h3 className=" text-center typewriter font-bold">Supabald Jesse</h3>
            <Link href={"https://letsgetjessebald.com/"} target="_blank" rel="noopener noreferrer">
              <Button variant={'secondary'}>View site</Button>
            </Link>
          </div>
          <div className="flex flex-col max-w-[360px] relative m-auto gap-4 border-4 border-b-8 border-[#4FFF14] shadow-lg p-4  transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
            <Image src="/Playgotchi-cards.gif" alt={""} width={200} height={200} unoptimized  
            />
            <div className="w-[200px] bg-[#4FFF14] h-[10px] top-0 mt-[-8px] absolute"/>
            <h3 className=" text-center typewriter font-bold">Playgotchi</h3>
            <Link href={"https://zora.co/collect/base:0xd569f16053f5b8b26459d5fcf90a385fda84c4da"} target="_blank" rel="noopener noreferrer">
              <Button variant={'secondary'}>Mint on Zora</Button>
            </Link>
          </div>
          <div className="flex flex-col max-w-[360px] relative m-auto overflow-visible gap-4 border-4 border-b-8 border-yellow-500 shadow-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:rotate-2 min-w-56">
            <Image src="/Collective-Nouns.gif" alt={"Yellow Collective"} width={200} height={200}  unoptimized      
            />
            <div className="w-[200px] bg-yellow-500 h-[10px] top-0 mt-[-8px] absolute"/>
            <h3 className=" text-center typewriter font-bold">Collective Nouns</h3>
            <Link href={"https://zora.co/@basedandyellow/"} target="_blank" rel="noopener noreferrer">
              <Button variant={'secondary'}>View on Zora</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
    </SessionProvider>
  );
};