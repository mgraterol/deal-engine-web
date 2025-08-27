// src/components/LocationSelects.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import FormSelect from './FormSelect';

const LocationSelects = ({ formData, handleChange }) => {
  const [countries, setCountries] = useState([]);
  const [originAirports, setOriginAirports] = useState([]);
  const [destinationAirports, setDestinationAirports] = useState([]);
  
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to fetch the list of all countries
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

  // Effect to fetch origin airports based on origin country
  useEffect(() => {
    const fetchOriginAirports = async () => {
      if (!originCountry) {
        setOriginAirports([]);
        // Reset origin in parent formData when country is unselected
        handleChange({ target: { name: 'origin', value: '' } });
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/airports?country=${originCountry}`);
        setOriginAirports(res.data);
      } catch (err) {
        console.error('Error fetching origin airports:', err);
        setError('Could not load origin airport data.');
        setOriginAirports([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOriginAirports();
  }, [originCountry, handleChange]);

  // Effect to fetch destination airports based on destination country
  useEffect(() => {
    const fetchDestinationAirports = async () => {
      if (!destinationCountry) {
        setDestinationAirports([]);
        // Reset destination in parent formData when country is unselected
        handleChange({ target: { name: 'destination', value: '' } });
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/airports?country=${destinationCountry}`);
        setDestinationAirports(res.data);
      } catch (err) {
        console.error('Error fetching destination airports:', err);
        setError('Could not load destination airport data.');
        setDestinationAirports([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDestinationAirports();
  }, [destinationCountry, handleChange]);

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Origin Country"
          id="origin-country"
          name="origin-country"
          value={originCountry}
          onChange={(e) => setOriginCountry(e.target.value)}
          options={countries.map(c => ({ value: c.code, label: c.name }))}
          placeholder="Select origin country"
        />
        <FormSelect
          label="Destination Country"
          id="destination-country"
          name="destination-country"
          value={destinationCountry}
          onChange={(e) => setDestinationCountry(e.target.value)}
          options={countries.map(c => ({ value: c.code, label: c.name }))}
          placeholder="Select destination country"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Origin Airport"
          id="origin"
          name="origin"
          value={formData.origin}
          onChange={handleChange}
          options={originAirports.map(a => ({ value: a.code, label: `${a.code} - ${a.city}` }))}
          disabled={!originCountry || isLoading}
          placeholder="Select origin airport"
        />
        <FormSelect
          label="Destination Airport"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          options={destinationAirports.map(a => ({ value: a.code, label: `${a.code} - ${a.city}` }))}
          disabled={!destinationCountry || isLoading}
          placeholder="Select destination airport"
        />
      </div>
    </>
  );
};

export default LocationSelects;
