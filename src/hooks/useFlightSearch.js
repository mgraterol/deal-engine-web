// Custom hook to encapsulate the state and logic for the flight search app.

import { useState } from 'react';

export const useFlightSearch = () => {
  const [currentView, setCurrentView] = useState('form');
  const [jobId, setJobId] = useState(null);
  const [flightSearchData, setFlightSearchData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const handleNewSearch = () => {
    setCurrentView('form');
    setJobId(null);
    setSearchResults(null);
  };

  return {
    currentView,
    setCurrentView,
    jobId,
    setJobId,
    flightSearchData,
    setFlightSearchData,
    searchResults,
    setSearchResults,
    handleNewSearch
  };
};
