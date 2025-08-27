import { useState, useEffect } from 'react';
import axios from 'axios';

// Main Flight Booking Component
export default function FlightBooking() {
  const [currentView, setCurrentView] = useState('form'); // 'form', 'loading', 'results'
  const [jobId, setJobId] = useState(null);
  const [flightSearchData, setFlightSearchData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      {currentView === 'form' && (
        <FlightSearchForm 
          onSearchStart={(data) => {
            setFlightSearchData(data);
            setCurrentView('loading');
          }}
          onJobIdReceived={(id) => {
            setJobId(id);
          }}
        />
      )}
      
      {currentView === 'loading' && (
        <FlightLoadingScreen 
          jobId={jobId}
          searchData={flightSearchData}
          onResultsReady={(results) => {
            setSearchResults(results);
            setCurrentView('results');
          }}
          onBackToForm={() => setCurrentView('form')}
        />
      )}
      
      {currentView === 'results' && (
        <FlightResults 
          searchData={flightSearchData}
          results={searchResults}
          onNewSearch={() => {
            setCurrentView('form');
            setJobId(null);
            setSearchResults(null);
          }}
        />
      )}
    </div>
  );
}

// Flight Search Form Component
const FlightSearchForm = ({ onSearchStart, onJobIdReceived }) => {
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

  const AIRPORTS = ['JFK', 'LAX', 'SFO', 'ORD', 'LHR', 'CDG'];
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      onSearchStart(formData);
      
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
        onJobIdReceived(res.data.job_id);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('Flight search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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

// Flight Loading Screen Component with Correct WebSocket Connection
const FlightLoadingScreen = ({ jobId, searchData, onResultsReady, onBackToForm }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing flight search...');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    let ws;
    let reconnectTimeout;
    let progressInterval;

    const connectWebSocket = () => {
      // Clear any existing reconnect timeout
      if (reconnectTimeout) clearTimeout(reconnectTimeout);

      try {
        ws = new WebSocket(`ws://localhost:3000/cable`);
        setConnectionStatus('connecting');

        ws.onopen = () => {
          setConnectionStatus('connected');
          setStatusMessage('Connected to search service. Subscribing...');
          
          const subscribeMsg = {
            command: "subscribe",
            identifier: JSON.stringify({
              channel: "FlightsChannel",
              job_id: jobId
            })
          };
          ws.send(JSON.stringify(subscribeMsg));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle different message types
            if (data.type === "ping" || data.type === "welcome") {
              return; // Ignore ping and welcome messages
            }
            
            if (data.type === "confirm_subscription") {
              setStatusMessage('Search in progress...');
              
              // Start progress simulation (remove this when your backend sends real progress)
              progressInterval = setInterval(() => {
                setProgress(prev => {
                  if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                  }
                  return prev + 10;
                });
              }, 2000);
              
              return;
            }

            // *** THE FIX IS HERE: Check for `data.message` and use it if it exists ***
            // Otherwise, assume the entire `data` object is the payload.
            const messagePayload = data.message || data;

            // Handle search results or progress updates
            if (messagePayload.data || messagePayload.flights || messagePayload.offers) {
              clearInterval(progressInterval);
              setSearchResults(messagePayload);
              setProgress(100);
              setStatusMessage('Search complete!');
              setTimeout(() => onResultsReady(messagePayload), 1000);
            }
            
            // Handle errors
            else if (messagePayload.errors) {
              clearInterval(progressInterval);
              setStatusMessage(`Error: ${messagePayload.errors}`);
              setConnectionStatus('error');
            }
            
            // Handle progress updates (if your backend sends them)
            else if (messagePayload.progress) {
              setProgress(messagePayload.progress);
              setStatusMessage(`Searching... ${messagePayload.progress}% complete`);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          setStatusMessage('Connection error. Retrying...');
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onclose = (event) => {
          if (!event.wasClean) {
            console.log('Connection lost unexpectedly. Retrying...');
            setStatusMessage('Connection lost. Trying to reconnect...');
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnectionStatus('error');
        setStatusMessage('Failed to connect to search service');
      }
    };

    if (jobId) {
      connectWebSocket();
    }
    
    // Cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [jobId, onResultsReady]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-6">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Searching for Flights</h2>
          <p className="text-gray-300 mb-6">We're finding the best options for your trip</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">0%</span>
            <span className="text-sm font-medium text-blue-400">{progress.toFixed(0)}%</span>
            <span className="text-sm text-gray-400">100%</span>
          </div>
          
          <div className="flex items-center justify-center mt-4 mb-6">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-300">{statusMessage}</span>
          </div>
          
          <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Search Details</h3>
            <div className="text-sm text-gray-300 text-left">
              <p><span className="font-medium">From:</span> {searchData.origin}</p>
              <p><span className="font-medium">To:</span> {searchData.destination}</p>
              <p><span className="font-medium">Dates:</span> {searchData.departure_date} to {searchData.return_date}</p>
              <p><span className="font-medium">Travelers:</span> {searchData.adults}</p>
              <p><span className="font-medium">Job ID:</span> {jobId}</p>
            </div>
          </div>
          
          <button
            onClick={onBackToForm}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

// Flight Results Component
// Enhanced Flight Results Component
const FlightResults = ({ searchData, results, onNewSearch }) => {
  const renderFlightResults = () => {
    if (!results) return <p className="text-gray-300">No results available</p>;
    
    if (results.errors) {
      return (
        <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg">
          <p className="text-red-200">Error: {results.errors}</p>
        </div>
      );
    }
    
    // Handle different response formats
    const flights = results.flights || results.data?.flights || results.data || [];
    
    if (flights.length > 0) {
      return (
        <div className="space-y-4">
          {flights.map((flight, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-lg">
                    {flight.airline || 'Flight'} {flight.flight_number || ''}
                  </h4>
                  <div className="flex items-center mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold">{flight.departure?.time?.split('T')[1]?.substring(0, 5) || '--:--'}</p>
                      <p className="text-sm text-gray-400">{flight.departure?.airport || 'N/A'}</p>
                    </div>
                    <div className="mx-4 flex flex-col items-center">
                      <div className="w-16 h-1 bg-gray-500"></div>
                      <p className="text-xs text-gray-400 mt-1">{flight.duration || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{flight.arrival?.time?.split('T')[1]?.substring(0, 5) || '--:--'}</p>
                      <p className="text-sm text-gray-400">{flight.arrival?.airport || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-green-400">
                    ${flight.price || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">{flight.currency || searchData.currency}</p>
                  <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                    Select
                  </button>
                </div>
              </div>
              {flight.departure?.terminal && (
                <p className="text-sm text-gray-400">Terminal: {flight.departure.terminal}</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback: show raw JSON data for debugging
    return (
      <div className="bg-gray-700 p-6 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Raw Response Data:</h4>
        <pre className="text-gray-200 text-sm overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Flight Search Complete!</h2>
          <p className="text-gray-300">We found the best options for your trip</p>
        </div>
        
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Your Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p><span className="font-medium">From:</span> {searchData.origin}</p>
              <p><span className="font-medium">To:</span> {searchData.destination}</p>
            </div>
            <div>
              <p><span className="font-medium">Dates:</span> {searchData.departure_date} to {searchData.return_date}</p>
              <p><span className="font-medium">Travelers:</span> {searchData.adults}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
          {renderFlightResults()}
        </div>
        
        <div className="text-center">
          <button
            onClick={onNewSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            New Search
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Form Components
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
