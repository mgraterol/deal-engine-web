// This component displays the final flight search results.

import CheckIcon from './icons/CheckIcon';

const FlightResults = ({ searchData, results, onNewSearch }) => {
  const renderFlightResults = () => {
    if (!results) {
      return <p className="text-gray-300">No results available.</p>;
    }

    if (results.errors) {
      return (
        <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg">
          <p className="text-red-200">Error: {results.errors}</p>
        </div>
      );
    }
    const flights = results.flights || results.data?.flights || results.data || [];
    if (flights.length === 0) {
      return <p className="text-gray-300">No flights found for your search criteria. Please try a different search.</p>;
    }
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
                  ${typeof flight.price === 'object' ? flight.price.total : flight.price || 'N/A'}
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
  };

  return (
    <div className="p-4 w-full max-w-4xl">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full border border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900 rounded-full mb-4">
            <CheckIcon />
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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            New Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightResults;
