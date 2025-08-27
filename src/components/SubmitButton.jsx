// Reusable submit button component with loading state.

import SpinnerIcon from './icons/SpinnerIcon';

const SubmitButton = ({ isLoading }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <span className="flex items-center justify-center">
        <SpinnerIcon />
        Searching for flights...
      </span>
    ) : (
      <span>Search Flights</span>
    )}
  </button>
);
export default SubmitButton;
