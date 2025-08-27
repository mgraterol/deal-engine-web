import CheckIcon from './icons/CheckIcon';

// Helper function to format ISO 8601 duration
const formatDuration = (isoDuration) => {
  if (!isoDuration) return 'N/A';
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!matches) return 'N/A';
  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  let formatted = '';
  if (hours > 0) formatted += `${hours}h `;
  if (minutes > 0) formatted += `${minutes}m`;
  return formatted.trim();
};

// Helper function to get city and airport names from IATA codes
const getAirportInfo = (iataCode, locations) => {
  const location = locations[iataCode];
  if (location) {
    return `${location.cityCode} (${iataCode})`;
  }
  return iataCode;
};

// Helper function to parse and format a timestamp
const formatTime = (isoDateTime) => {
  if (!isoDateTime) return 'N/A';
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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

    const flightOffers = results.data || [];
    const dictionaries = results.dictionaries || {};

    if (flightOffers.length === 0) {
      return <p className="text-gray-300">No flights found for your search criteria. Please try a different search.</p>;
    }

    return (
      <div className="space-y-6">
        {flightOffers.map((offer, offerIndex) => (
          <div key={offer.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-white text-lg">
                Option {offerIndex + 1}
              </h4>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">
                  ${parseFloat(offer.price?.grandTotal || 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">
                  {offer.price?.currency || 'USD'}
                </p>
              </div>
            </div>

            {offer.itineraries.map((itinerary, itineraryIndex) => (
              <div key={itineraryIndex} className="bg-gray-800 p-4 rounded-lg mb-4 last:mb-0 border border-gray-700">
                <h5 className="text-sm font-bold text-gray-300 mb-3">
                  {itineraryIndex === 0 ? 'Outbound Flight' : 'Return Flight'}
                </h5>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <span className="mr-2">Total Duration:</span>
                  <span className="font-semibold text-white">
                    {formatDuration(itinerary.duration)}
                  </span>
                </div>

                {itinerary.segments.map((segment, segmentIndex) => {
                  const departureCity = getAirportInfo(segment.departure.iataCode, dictionaries.locations);
                  const arrivalCity = getAirportInfo(segment.arrival.iataCode, dictionaries.locations);
                  const airlineName = dictionaries.carriers?.[segment.carrierCode] || segment.carrierCode;
                  const aircraftName = dictionaries.aircraft?.[segment.aircraft.code] || 'Unknown Aircraft';

                  return (
                    <div key={segment.id} className="mb-4 last:mb-0 border-l-2 border-dashed border-gray-500 pl-4 relative">
                       {/* Circle to indicate stop */}
                       <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-800"></div>

                      {/* Flight leg details */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-lg font-bold text-white">
                            {formatTime(segment.departure.at)} - {formatTime(segment.arrival.at)}
                          </p>
                          <p className="text-sm text-gray-300">
                            {departureCity} to {arrivalCity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{airlineName}</p>
                          <p className="text-xs text-gray-500">{aircraftName}</p>
                        </div>
                      </div>

                      {/* Segment duration and info */}
                      <div className="mt-2 text-sm text-gray-400">
                        <p>Flight time: {formatDuration(segment.duration)}</p>
                        {segment.departure.terminal && (
                          <p>Dep. Terminal: {segment.departure.terminal}</p>
                        )}
                        {segment.arrival.terminal && (
                          <p>Arr. Terminal: {segment.arrival.terminal}</p>
                        )}
                      </div>

                      {/* Layover information */}
                      {segmentIndex < itinerary.segments.length - 1 && (
                        <div className="bg-gray-700 bg-opacity-70 text-sm text-gray-300 p-2 rounded-lg mt-2">
                          Layover in {getAirportInfo(segment.arrival.iataCode, dictionaries.locations)}.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors">
              Select this flight
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 w-full max-w-5xl mx-auto">
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
