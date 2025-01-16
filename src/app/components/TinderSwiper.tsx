import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import PillButton from './PillButton';

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
  <div className="relative w-full aspect-[4/4]">
      {cards.length > 0 ? (
      <motion.div
        key={cards[currentIndex]}
        animate={controls}
        initial={{ x: 0, opacity: 1 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl cursor-grab"
        style={{ 
          touchAction: 'none',
        }}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getImageUrl(cards[currentIndex])})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-5 left-6 text-white z-10">
          <h2 className="text-4xl font-merriweather mb-2">{cards[currentIndex]}</h2>
        </div>
        <div className="absolute bottom-6 right-6 flex space-x-4 z-10">
      <PillButton
        onClick={() => handleSwipe('left')}
        className="bg-white text-gray-700 font-semibold w-14 h-14 text-lg flex items-center justify-center"
      >
        👎
      </PillButton>
      <PillButton
        onClick={() => handleSwipe('right')}
        className="bg-purple-600 text-white font-semibold w-14 h-14 text-lg flex items-center justify-center"
      >
        👍
      </PillButton>
    </div>

      </motion.div>
    ) : (
      <div className="text-center text-gray-500">No more cards!</div>
    )}
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
  "Skydiving": "skydiving.png",
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
  "Eco-Lodges": "eco_lodges.png",

  // Season keywords
  "Cherry Blossoms": "cherry_blossoms.png",
  "Hiking Trails": "hiking_trails.png",
  "Flower Festivals": "flower_festivals.png",
  "Mild Weather": "mild_weather.png",
  "Beach Days": "beach_days.png",
  "Outdoor Festivals": "outdoor_festivals.png",
  "Water Sports": "water_sports.png",
  "Sunny Weather": "sunny_weather.png",
  "Leaf Peeping": "leaf_peeping.png",
  "Pumpkin Patches": "pumpkin_patches.png",
  "Harvest Festivals": "harvest_festivals.png",
  "Cool Breezes": "cool_breezes.png",
  "Snowboarding": "snowboarding.png",
  "Hot Springs": "hot_springs.png",
  "Holiday Markets": "holiday_markets.png",
  "Cozy Cabins": "cozy_cabins.png",

  // Activity keywords
  "Landmarks": "landmarks.png",
  "City Tours": "city_tours.png",
  "Museums": "museums.png",
  "Scenic Spots": "scenic_spots.png",
  "Hiking": "hiking.png",
  "Kayaking": "kayaking.png",
  "Ziplining": "ziplining.png",
  "Rock Climbing": "rock_climbing.png",
  "Theatre": "theatre.png",
  "Local Markets": "local_markets.png",
  "Workshops": "workshops.png",
  "Festivals": "festivals.png",
  "Wine Tasting": "wine_tasting.png",
  "Street Food": "street_food.png",
  "Fine Dining": "fine_dining.png",
  "Breweries": "breweries.png",
  "Beach Lounging": "beach_lounging.png",
  "Yoga Retreats": "yoga_retreats.png",
  "Nature Walks": "nature_walks.png",

  // Accommodation keywords
  "Luxury Hotel": "luxury_hotel.png",
  "Business Hotel": "business_hotel.png",
  "Budget Hotel": "budget_hotel.png",
  "All-Inclusive": "all_inclusive.png",
  "Beach Resort": "beach_resort.png",
  "Mountain Resort": "mountain_resort.png",
  "Eco-Resort": "eco_resort.png",
  "Wellness Resort": "wellness_resort.png",
  "Apartments": "apartments.png",
  "Villas": "villas.png",
  "Cabins": "cabins.png",
  "Condos": "condos.png",
  "Artistic": "artistic_hotel.png",
  "Historic": "historic_hotel.png",
  "Modern": "modern_hotel.png",
  "Quirky": "quirky_hotel.png",
  "Glamping": "glamping.png",
  "Tent Camping": "tent_camping.png",
  "RV Camping": "rv_camping.png",
  "Backcountry": "backcountry_camping.png",
};
