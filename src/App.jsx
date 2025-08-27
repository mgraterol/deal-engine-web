import { useState } from 'react';
import axios from 'axios';

// Custom hook for API call
const useFlightApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const searchFlights = async (payload) => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const apiEndpoint = 'http://localhost:3000/api/v1/flights';
      const res = await axios.post(apiEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setResponse(res.data);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, response, error, searchFlights };
};

// Custom hook for form management
const useFlightForm = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: '',
    currency: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPayload = () => ({
    // CORRECTED: Wrap parameters in flight object
    flight: {
      origin: formData.origin,
      destination: formData.destination,
      departure_date: formData.departure_date,
      return_date: formData.return_date,
      adults: parseInt(formData.adults, 10) || 1,
      currency: formData.currency,
    },
  });

  return { formData, handleChange, getPayload };
};

// Reusable form components (unchanged)
const FormSelect = ({ label, id, name, value, options, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
    >
      <option value="" disabled>Select {label.toLowerCase()}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const FormInput = ({ label, id, name, type = 'text', value, onChange, required = true, min, max, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
    />
  </div>
);

const SubmitButton = ({ isLoading }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Searching for flights...
      </span>
    ) : (
      <span>Search Flights</span>
    )}
  </button>
);

const ResponseDisplay = ({ response, error }) => {
  if (response) {
    return (
      <div className="mt-6 p-4 rounded-lg bg-green-900 bg-opacity-70 border border-green-700">
        <h3 className="text-lg font-semibold text-green-300 mb-2">Flight Options:</h3>
        <div className="text-sm bg-green-800 bg-opacity-50 p-3 rounded-md overflow-x-auto text-green-200">
          {JSON.stringify(response, null, 2)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 rounded-lg bg-red-900 bg-opacity-70 border border-red-700">
        <h3 className="text-lg font-semibold text-red-300 mb-2">Error:</h3>
        <p className="text-sm text-red-200">{error}</p>
      </div>
    );
  }

  return null;
};

// Constants
const AIRPORTS = ['JFK', 'LAX', 'SFO', 'ORD', 'LHR', 'CDG'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

// Main component
export default function FlightBooking() {
  const { formData, handleChange, getPayload } = useFlightForm();
  const { isLoading, response, error, searchFlights } = useFlightApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await searchFlights(getPayload());
    } catch (err) {
      console.error('Flight search error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">
          ✈️ Flight Booking
        </h1>
        <p className="text-center text-gray-300 mb-8 max-w-md mx-auto">
          Find the best flight deals for your next trip
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Origin Airport"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              options={AIRPORTS}
            />
            
            <FormSelect
              label="Destination Airport"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              options={AIRPORTS}
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
              options={CURRENCIES}
            />
          </div>
          
          <div className="pt-4">
            <SubmitButton isLoading={isLoading} />
          </div>
        </form>

        <ResponseDisplay response={response} error={error} />
      </div>
    </div>
  );
}
