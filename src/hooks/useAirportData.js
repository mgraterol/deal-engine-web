// src/hooks/useAirportData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useAirportData = () => {
  const [countries, setCountries] = useState([]);
  const [airports, setAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:3000/api/v1/countries');
        setCountries(res.data);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Could not load country data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const fetchAirports = async (countryCode) => {
    if (!countryCode) {
      setAirports([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/airports?country=${countryCode}`);
      setAirports(res.data);
    } catch (err) {
      console.error('Error fetching airports:', err);
      setError('Could not load airport data for this country.');
      setAirports([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { countries, airports, fetchAirports, isLoading, error };
};

export default useAirportData;
