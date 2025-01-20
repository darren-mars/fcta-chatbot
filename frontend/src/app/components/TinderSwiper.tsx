import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { PillButton, SelectablePillButton } from './PillButton';



interface TinderSwiperProps {
  cards: string[];
  onSwipe: (card: string, direction: 'left' | 'right') => void;
  onFinish: () => void;
}

const TinderSwiper: React.FC<TinderSwiperProps> = ({ cards, onSwipe, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    setCurrentIndex(0);
  }, [cards]);

  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(cards[currentIndex], direction);
    animateSwipe(direction);
  };

  const animateSwipe = (direction: 'left' | 'right') => {
    controls.start({
      x: direction === 'left' ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.3 },
    }).then(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        controls.set({ x: 0, opacity: 1 });
      } else {
        onFinish();
      }
    });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    } else {
      controls.start({ x: 0 });
    }
  };

  const getImageUrl = (keyword: string) => {
    const imageName = keywordImageMap[keyword];
    return imageName ? `/images/${imageName}` : '';
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex-1 relative w-full h-full">
        {cards.length > 0 ? (
          <motion.div
            key={cards[currentIndex]}
            animate={controls}
            initial={{ x: 0, opacity: 1 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-xl cursor-grab"
            style={{ touchAction: 'none' }}
            whileTap={{ cursor: 'grabbing' }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${getImageUrl(cards[currentIndex])})`,
                backgroundSize: '100%',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent" />
            <div className="absolute bottom-5 left-6 text-white z-10">
              <h2 className="text-4xl font-merriweather mb-2">{cards[currentIndex]}</h2>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-gray-500">No more cards!</div>
        )}
      </div>
      <div className="w-full flex mt-4">
        <PillButton
          onClick={() => handleSwipe('left')}
          className="bg-white text-gray-700 border w-1/2 text-lg flex mr-4 items-center justify-center"
        >
          Dislike
        </PillButton>
        <PillButton
          onClick={() => handleSwipe('right')}
          className="bg-[#39104a] text-white w-1/2 text-lg flex items-center justify-center"
        >
          Like
        </PillButton>
      </div>
      
    </div>
  );
};

export default TinderSwiper;

const keywordImageMap: { [key: string]: string } = {
  // Vibe keywords
  "Beach Retreat": "beach_retreat.png",
  "Spa Day": "spa_day.png",
  "Mountain Getaway": "mountain_getaway.png",
  "Yoga Retreat": "yoga_retreat.png",
  "Safari Adventure": "safari.png",
  "Jungle Trekking": "jungle_trekking.png",
  "Skydiving": "sky_diving.png",
  "Mountain Climbing": "mountain_climbing.png",
  "Historical Tours": "historical_tours.png",
  "Local Festivals": "local_festivals.png",
  "Art Galleries": "art_galleries.png",
  "Food Tours": "food_tours.png",
  "Sunset Cruises": "sunset_cruises.png",
  "Candlelit Dinners": "candlelit_dinners.png",
  "Couples Spa": "couples_spa.png",
  "Scenic Walks": "scenic_walks.png",
  "National Parks": "national_parks.png",
  "Wildlife Watching": "wildlife_watching.png",
  "Camping": "camping.png",
  "Eco-Lodges": "eco-lodges.png",

  // Season keywords
  "Cherry Blossoms": "cherry_blossoms.png",
  "Hiking Trails": "hiking_trails.png",
  "Flower Festivals": "local_festivals.png",
  "Mild Weather": "hiking_trails.png",
  "Beach Days": "beach_days.png",
  "Outdoor Festivals": "outdoor_festivals.png",
  "Water Sports": "beach_days.png",
  "Sunny Weather": "beach_days.png",
  "Leaf Peeping": "leaf_peeping.png",
  "Pumpkin Patches": "pumpkin_patches.png",
  "Harvest Festivals": "local_festivals.png",
  "Cool Breezes": "hiking_trails.png",
  "Snowboarding": "snowboarding.png",
  "Hot Springs": "hot_springs.png",
  "Holiday Markets": "local_markets.png",
  "Cozy Cabins": "mountain_getaway.png",

  // Activity keywords
  "Landmarks": "landmarks.png",
  "City Tours": "city_tours.png",
  "Museums": "art_galleries.png",
  "Scenic Spots": "scenic_walks.png",
  "Hiking": "hiking.png",
  "Kayaking": "kayaking.png",
  "Ziplining": "jungle_trekking.png",
  "Rock Climbing": "mountain_climbing.png",
  "Theatre": "theatre.png",
  "Local Markets": "local_markets.png",
  "Workshops": "theatre.png",
  "Festivals": "local_festivals.png",
  "Wine Tasting": "wine_tasting.png",
  "Street Food": "street_food.png",
  "Fine Dining": "candlelit_dinners.png",
  "Breweries": "street_food.png",
  "Beach Lounging": "beach_lounging.png",
  "Yoga Retreats": "yoga_retreat.png",
  "Nature Walks": "hiking_trails.png",

  // Accommodation keywords
  "Luxury Hotel": "luxury_hotel.png",
  "Business Hotel": "business_hotel.png",
  "Budget Hotel": "business_hotel.png",
  "All-Inclusive": "luxury_hotel.png",
  "Beach Resort": "beach_resort.png",
  "Mountain Resort": "mountain_resort.png",
  "Eco-Resort": "eco-lodges.png",
  "Wellness Resort": "spa_day.png",
  "Apartments": "apartments.png",
  "Villas": "villas.png",
  "Cabins": "mountain_getaway.png",
  "Condos": "apartments.png",
  "Artistic": "artistic.png",
  "Historic": "historic.png",
  "Modern": "business_hotel.png",
  "Quirky": "artistic.png",
  "Glamping": "glamping.png",
  "Tent Camping": "tent_camping.png",
  "RV Camping": "camping.png",
  "Backcountry": "camping.png",
};
