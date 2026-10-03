import { getAllTvStartups } from '@/lib/tv/telemetry';

export async function FoundersScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 bg-[#f2ede3] relative overflow-hidden">
      <div className="px-12 mb-2 z-10">
        <h1 className="text-[80px] font-medium tracking-tight text-black">Founders of the week</h1>
      </div>

      <div className="flex-1 w-full relative flex justify-center mt-10">
        {/* Left Circle / Founder */}
        <div className="absolute left-[-5%] top-0 h-[85%] max-h-[800px] aspect-square bg-[#da291c] rounded-full z-0 flex items-end justify-center">
          {/* Placeholder for founder image */}
          <div className="w-full h-full rounded-full overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
              alt="Hashim"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-auto object-cover grayscale mix-blend-luminosity opacity-80"
              style={{ clipPath: 'circle(50% at 50% 50%)' }}
            />
          </div>
          <div className="absolute bottom-16 left-24 text-white text-[70px] font-medium tracking-tight z-20">
            Hashim
          </div>
        </div>

        {/* Center Text */}
        <div className="z-30 max-w-md text-center pt-10">
          <p className="text-[26px] font-medium leading-snug tracking-tight px-4">
            OATZA is a modern healthy convenience food brand creating ready-to-eat and easy-to-prepare oatmeal-based meals for busy, health-conscious consumers.
          </p>
        </div>

        {/* Right Circle / Founder */}
        <div className="absolute right-[-5%] top-10 h-[85%] max-h-[800px] aspect-square bg-[#da291c] rounded-full z-0 flex items-end justify-center">
           {/* Placeholder for founder image */}
           <div className="w-full h-full rounded-full overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
              alt="Rashi"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-auto object-cover grayscale mix-blend-luminosity opacity-90"
              style={{ clipPath: 'circle(50% at 50% 50%)' }}
            />
          </div>
          <div className="absolute bottom-20 right-32 text-white text-[70px] font-medium tracking-tight z-20">
            Rashi
          </div>
        </div>
      </div>
    </div>
  );
}
