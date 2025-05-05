'use client';

import {useRef, useState} from "react";
import SearchBar from "@/app/components/panel/ui-components/SearchBar";
import FilterPanel from "@/app/components/panel/FilterPanel";
import {motion, AnimatePresence} from "framer-motion";

const phrases = [
  "Top study spots coming right up 📚✨",
  "Found your perfect place to focus 🎯📖",
  "Study-ready spots picked just for you 🧠💡",
  "Here’s where your brain will bloom 🌸📘",
  "Quiet corners and good vibes ahead 😌☕",
  "Your cozy study spot awaits you 🛋️📓",
  "Books out! Here’s your study haven 📝🌈",
  "Ace your exams from these spots 🧃🔥"
];

const SearchPanel = () => {
  const [message, setMessage] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleSearch = () => {
    const random = phrases[Math.floor(Math.random() * phrases.length)];
    setMessage(random);
  };

  const filterSearch = () => {
    setShowFilterPanel(true);
  }

  return (
      <div className="h-full w-full relative overflow-hidden">
        <AnimatePresence mode="sync">
          {!showFilterPanel ? (
              <motion.div
                  key="search-view"
                  initial={{x: '-100%'}}
                  animate={{x: 0}}
                  exit={{x: '-100%'}}
                  transition={{duration: 0.2}}
                  className="absolute top-0 left-0 w-full h-full flex flex-col gap-3 bg-default"
              >
                <SearchBar onSearch={handleSearch} onFilter={filterSearch}/>

                {message && (
                    <div className="text-lg font-semibold text-black px-4">
                      {message}
                    </div>
                )}
              </motion.div>
          ) : (
              <motion.div
                  key="filter-panel"
                  initial={{x: '100%'}}
                  animate={{x: 0}}
                  exit={{x: '100%'}}
                  transition={{duration: 0.2}}
                  className="absolute top-0 right-0 w-full h-full shadow-lg bg-default"
              >
                <FilterPanel setShowFilterPanel={setShowFilterPanel}/>
              </motion.div>
          )}
        </AnimatePresence>
      </div>

  );
};

export default SearchPanel;
