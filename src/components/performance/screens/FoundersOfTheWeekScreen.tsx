// import { getFoundersOfTheWeek } from '@/lib/performance/getPerformanceDisplayData'
import Image from 'next/image'

export async function FoundersOfTheWeekScreen() {
  // Hardcoded data for testing
  const data = {
    founders: [
      {
        name: 'Hashim',
        imageUrl: '/founder_1.png',
      },
      {
        name: 'Rashi',
        imageUrl: '/founder_2.png',
      },
      {
        name: 'Shebin',
        imageUrl: '/founder_3.png',
      },
    ],
    description: 'is a modern healthy beverage brand focused on bringing real fruit and natural ingredients into convenient, great-tasting drinks. The brand aims to offer clean, refreshing beverages with a strong emphasis on real ingredients, minimal processing, and no unnecessary additives—making everyday healthy choices simpler and more enjoyable.',
    startupName: 'Plain',
  }

  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden bg-[#f2ede3]">
      {/* Top Section - Description */}
      <div className="px-[4vw] pt-[4vh]">
        <div className="max-w-[70vw]">
          <p className="text-[1vw] text-black/80 leading-relaxed">
            <span className="font-semibold text-black">{data.startupName}</span> {data.description}
          </p>
        </div>
      </div>

      {/* Founders Grid - 3 Columns */}
      <div className="flex-1 flex items-start justify-center gap-[4vw] px-[4vw] min-h-0">
        {data.founders.map((founder, index) => (
          <div key={index} className="relative flex-1 h-full max-h-full">
            {/* Red shape and image container */}
            <div className="relative w-full h-full min-h-0 flex items-end">
              {/* Red circle/shape behind */}
              <div className="absolute inset-0 flex items-end justify-center">
                <div
                  className="w-[100%] h-[150%] rounded-full mb-[-23rem]"
                  style={{ backgroundColor: '#ca2f2b' }}
                />
              </div>
              
              {/* Founder image */}
              <div className="relative z-10 w-full h-full">
                <Image
                  src={founder.imageUrl}
                  alt={founder.name}
                  fill
                  className="object-cover object-top grayscale"
                  sizes="33vw"
                  priority
                />
                
                {/* Founder Name - Overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-20 pb-6">
                  <h2 className="text-[3.5vw] font-medium text-white text-center drop-shadow-lg">
                    {founder.name}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
