"use client";
import React, { useState, useEffect } from "react";
import { FaPlane } from "react-icons/fa";
import { FiMapPin, FiCalendar, FiHome, FiSun, FiCoffee } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import WorldMap from "../components/WorldMap";

interface PlaneTicketProps {
  loading: boolean;
  aiResponse: string | null;
}

interface ItineraryItem {
  dayTitle: string;
  dayDetails: string;
}

const PlaneTicket: React.FC<PlaneTicketProps> = ({ loading, aiResponse }) => {
  const [packageName, setPackageName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

  useEffect(() => {
    if (aiResponse) {
      const lines = aiResponse.split('\n').filter(line => line.trim() !== '');

      // Extract package name and description
      const packageNameLine = lines[0];
      const descriptionLines = [];
      let i = 1;
      while (i < lines.length && !lines[i].startsWith('Day')) {
        descriptionLines.push(lines[i]);
        i++;
      }
      setPackageName(packageNameLine);
      setDescription(descriptionLines.join('\n'));

      // Extract itinerary details
      const itineraryDetails: ItineraryItem[] = [];
      while (i < lines.length) {
        const dayTitle = lines[i];
        i++;
        const dayDetails = [];
        while (i < lines.length && !lines[i].startsWith('Day')) {
          dayDetails.push(lines[i]);
          i++;
        }
        itineraryDetails.push({ dayTitle, dayDetails: dayDetails.join('\n') });
      }
      setItinerary(itineraryDetails);
    }
  }, [aiResponse]);

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border-2 border-#481a5a">
      <div className="p-4 bg-[#481a5a] text-white flex justify-between items-center">
        <h2 className="text-2xl font-merriweather">Travel Associates</h2>
        <FaPlane className="text-3xl" />
      </div>
      <div className="p-6 bg-purple-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm font-merriweather text-gray-600">From</p>
            <p className="text-lg font-merriweather">MELBOURNE</p>
          </div>
          <div className="text-center">
            <FaPlane className="text-3xl text-purple-600 transform rotate-90" />
          </div>
          <div className="text-right">
            <p className="text-sm font-merriweather text-gray-600">To</p>
            <p className="text-lg font-merriweather font-semibold">LUXURY</p>
          </div>
        </div>
        <div className="border-t border-dashed border-purple-300 pt-4 mt-4">
          <WorldMap
            dots={[
              {
                start: { lat: 40.7128, lng: -74.0060 }, // New York
                end: { lat: 48.8566, lng: 2.3522 }, // Paris
              },
              {
                start: { lat: 48.8566, lng: 2.3522 }, // Paris
                end: { lat: 41.9028, lng: 12.4964 }, // Rome
              },
              {
                start: { lat: 41.9028, lng: 12.4964 }, // Rome
                end: { lat: 37.7749, lng: -122.4194 }, // San Francisco
              },
              {
                start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
                end: { lat: 28.6139, lng: 77.2090 }, // New Delhi
              },
              {
                start: { lat: 28.6139, lng: 77.2090 }, // New Delhi
                end: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
              },
              {
                start: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
                end: { lat: 35.6762, lng: 139.6503 }, // Tokyo
              },
            ]}
          />
        </div>
      </div>
      <div className="bg-purple-200 p-4 text-center text-purple-700">
        <p className="text-sm">Scan this ticket to start your journey</p>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-merriweather font-semibold">{packageName}</h3>
        <p className="text-sm font-merriweather">{description}</p>
      </div>
      <VerticalAccordion itinerary={itinerary} />
    </div>
  );
};

interface VerticalAccordionProps {
  itinerary: { dayTitle: string; dayDetails: string }[];
}

const VerticalAccordion: React.FC<VerticalAccordionProps> = ({ itinerary }) => {
  const [open, setOpen] = useState<number>(0);
  const icons = [FiMapPin, FiCalendar, FiHome, FiSun, FiCoffee];

  return (
    <section className="p-4 bg-white">
      <div className="flex flex-col h-fit w-full max-w-6xl mx-auto shadow overflow-hidden">
        {itinerary.map((item, index) => (
          <Panel
            key={index}
            open={open}
            setOpen={setOpen}
            id={index}
            Icon={icons[index % icons.length]}
            title={item.dayTitle}
            description={item.dayDetails}
          />
        ))}
      </div>
    </section>
  );
};

interface PanelProps {
  open: number;
  setOpen: (id: number) => void;
  id: number;
  Icon: React.ElementType;
  title: string;
  description: string;
}

const Panel: React.FC<PanelProps> = ({ open, setOpen, id, Icon, title, description }) => {
  const isOpen = open === id;

  return (
    <div className="border-b border-gray-200">
      <button
        className="bg-white hover:bg-slate-50 transition-colors p-4 w-full flex justify-between items-center relative group"
        onClick={() => setOpen(isOpen ? -1 : id)}
      >
        <div className="flex items-center gap-4">
          <div className="w-6 aspect-square bg-[#481a5a] text-white grid place-items-center">
            <Icon />
          </div>
          <span className="text-xl font-merriweather font-thin">{title}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`panel-${id}`}
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden"
          >
            <motion.div
              variants={descriptionVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="px-4 py-2 bg-indigo-50 text-indigo-900"
            >
              <p>{description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const panelVariants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3 }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const descriptionVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.125,
    },
  },
  closed: { opacity: 0, y: 20 },
};

export default PlaneTicket;
