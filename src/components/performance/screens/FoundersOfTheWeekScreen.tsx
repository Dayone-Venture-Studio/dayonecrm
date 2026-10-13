// import { getFoundersOfTheWeek } from '@/lib/performance/getPerformanceDisplayData'
import Image from 'next/image'

export async function FoundersOfTheWeekScreen() {
  // Hardcoded data for testing
  const data = {
    founder1: {
      name: 'Hashim',
      imageUrl: '/founder_1.png',
    },
    founder2: {
      name: 'Rashi',
      imageUrl: '/founder_2.png',
    },
    description: 'is a modern healthy beverage brand focused on bringing real fruit and natural ingredients into convenient, great-tasting drinks. The brand aims to offer clean, refreshing beverages with a strong emphasis on real ingredients, minimal processing, and no unnecessary additives—making everyday healthy choices simpler and more enjoyable.',
    startupName: 'Plain',
  }

  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden">
      {/* Main Content - Full height container */}
      <div className="relative flex-1 flex items-stretch">
        {/* Left Founder Section */}
        <div className="relative flex-1 flex items-end justify-start">
          {/* Red circle background - positioned absolutely */}
          <div
            className="absolute left-[-10rem] bottom-[-10rem] w-[45vw] h-[45vw] rounded-full"
            style={{ backgroundColor: '#ca2f2b' }}
          />
          
          {/* Founder image container */}
          <div className="relative z-10 w-[95%] h-[100%] mb-[-10vh]">
            <div className="relative h-full">
              <Image
                src={data.founder1.imageUrl}
                alt={data.founder1.name}
                fill
                className="object-cover object-top grayscale"
                sizes="50vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* Center Description */}
        <div className="flex-shrink-0 flex items-center justify-center px-[2vw] w-[30vw] z-20">
          <p className="text-black text-[1.1vw] leading-relaxed text-center">
            <span className="font-semibold">{data.startupName}</span> {data.description.replace('OATZA ', '')}
          </p>
        </div>

        {/* Right Founder Section */}
        <div className="relative flex-1 flex items-end justify-end">
          {/* Red circle background - positioned absolutely */}
          <div
            className="absolute right-0 bottom-0 w-[42vw] h-[42vw] mb-[-10vh] mr-[-10vw] rounded-full"
            style={{ backgroundColor: '#ca2f2b' }}
          />
          
          {/* Founder image container */}
          <div className="relative z-10 w-[55%] h-[100%] mb-[-2vh]">
            <div className="relative h-full">
              <Image
                src={data.founder2.imageUrl}
                alt={data.founder2.name}
                fill
                className="object-cover object-top grayscale"
                sizes="50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Founder Names - Positioned at bottom corners with highest z-index */}
      <div className="absolute bottom-0 left-0 z-50 px-6 py-4">
        <h2 className="text-white text-[4.2vw] font-medium">
          {data.founder1.name}
        </h2>
      </div>

      <div className="absolute bottom-0 right-0 z-50 px-6 py-4">
        <h2 className="text-white text-[4.2vw] font-medium">
          {data.founder2.name}
        </h2>
      </div>
    </div>
  )
}
