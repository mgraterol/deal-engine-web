import FlightSearchForm from './components/FlightSearchForm';
import FlightLoadingScreen from './components/FlightLoadingScreen';
import FlightResults from './components/FlightResults';
import { useFlightSearch } from './hooks/useFlightSearch';

const App = () => {
  const {
    currentView,
    setCurrentView,
    jobId,
    setJobId,
    flightSearchData,
    setFlightSearchData,
    searchResults,
    setSearchResults,
    handleNewSearch
  } = useFlightSearch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white font-sans antialiased flex flex-col justify-center items-center">
      {currentView === 'form' && (
        <FlightSearchForm
          onSearchStart={(data, id) => {
            setFlightSearchData(data);
            setJobId(id);
            setCurrentView('loading');
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
          onBackToForm={handleNewSearch}
        />
      )}

      {currentView === 'results' && (
        <FlightResults
          searchData={flightSearchData}
          results={searchResults}
          onNewSearch={handleNewSearch}
        />
      )}
    </div>
  );
}

export default App;
