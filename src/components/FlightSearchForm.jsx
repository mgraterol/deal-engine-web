import { useState, useEffect } from 'react';
import axios from 'axios';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import SubmitButton from './SubmitButton';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
const CURRENCY_OPTIONS = CURRENCIES.map(currency => ({
  value: currency,
  label: currency,
}));

const FlightSearchForm = ({ onSearchStart }) => {
  const [countries, setCountries] = useState([]);
  const [originAirports, setOriginAirports] = useState([]);
  const [destinationAirports, setDestinationAirports] = useState([]);

  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: '1',
    currency: 'USD',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/v1/countries');
        setCountries(res.data);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Could not load country data.');
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchOriginAirports = async () => {
      if (!originCountry) {
        setOriginAirports([]);
        setFormData(prev => ({ ...prev, origin: '' }));
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/airports?country=${originCountry}`);
        setOriginAirports(res.data);
      } catch (err) {
        console.error('Error fetching origin airports:', err);
        setError('Could not load origin airport data.');
        setOriginAirports([]);
      }
    };
    fetchOriginAirports();
  }, [originCountry]);

  useEffect(() => {
    const fetchDestinationAirports = async () => {
      if (!destinationCountry) {
        setDestinationAirports([]);
        setFormData(prev => ({ ...prev, destination: '' }));
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/airports?country=${destinationCountry}`);
        setDestinationAirports(res.data);
      } catch (err) {
        console.error('Error fetching destination airports:', err);
        setError('Could not load destination airport data.');
        setDestinationAirports([]);
      }
    };
    fetchDestinationAirports();
  }, [destinationCountry]);

  const handleOriginCountryChange = (e) => {
    setOriginCountry(e.target.value);
  };

  const handleDestinationCountryChange = (e) => {
    setDestinationCountry(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        flight: {
          ...formData,
          adults: parseInt(formData.adults, 10) || 1,
        },
      };

      const apiEndpoint = 'http://localhost:3000/api/v1/flights';
      const res = await axios.post(apiEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.job_id) {
        onSearchStart(formData, res.data.job_id);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('Flight search error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl w-full border border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">
          ✈️ Flight Booking
        </h1>
        <p className="text-center text-gray-300 mb-8 max-w-md mx-auto">
          Find the best flight deals for your next trip
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Origin Country"
              id="origin-country"
              name="origin-country"
              value={originCountry}
              onChange={handleOriginCountryChange}
              options={countries.map(c => ({ value: c.code, label: c.name }))}
              placeholder="Select origin country"
            />
            <FormSelect
              label="Destination Country"
              id="destination-country"
              name="destination-country"
              value={destinationCountry}
              onChange={handleDestinationCountryChange}
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
              disabled={!originCountry}
              placeholder="Select origin airport"
            />
            <FormSelect
              label="Destination Airport"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              options={destinationAirports.map(a => ({ value: a.code, label: `${a.code} - ${a.city}` }))}
              disabled={!destinationCountry}
              placeholder="Select destination airport"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Departure Date"
              id="departure_date"
              name="departure_date"
              type="date"
              value={formData.departure_date}
              onChange={handleChange}
            />
            <FormInput
              label="Return Date"
              id="return_date"
              name="return_date"
              type="date"
              value={formData.return_date}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Passengers"
              id="adults"
              name="adults"
              type="number"
              value={formData.adults}
              onChange={handleChange}
              min="1"
              max="10"
              placeholder="Number of adults"
            />
            <FormSelect
              label="Currency"
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              options={CURRENCY_OPTIONS}
            />
          </div>

          <div className="pt-4">
            <SubmitButton isLoading={isLoading} />
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-900 bg-opacity-70 border border-red-700">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Error:</h3>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchForm;
