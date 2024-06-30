import Image from "next/image";

const Loader = () => (
  <div className='flex h-screen w-screen flex-col items-center justify-center gap-2 bg-slate-950'>
    <Image
      src='/logo.png'
      alt='loader'
      width={300}
      height={200}
      className='object-contain animate-pulse'
      unoptimized
    />
  </div>
);

export default Loader;
