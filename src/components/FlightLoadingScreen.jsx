// This component displays the loading state while the flight search is in progress.

import { useState, useEffect } from 'react';
import PlaneIcon from './icons/PlaneIcon';
import SpinnerIcon from './icons/SpinnerIcon';

const FlightLoadingScreen = ({ jobId, searchData, onResultsReady, onBackToForm }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing flight search...');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    let ws;
    let reconnectTimeout;
    let progressInterval;

    const connectWebSocket = () => {
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
            // console.log('WebSocket message received:', data);

            if (data.type === "ping" || data.type === "welcome" || data.type === "confirm_subscription") {
              if (data.type === "confirm_subscription") {
                setStatusMessage('Search in progress...');
                 progressInterval = setInterval(() => {
                    setProgress(prev => Math.min(prev + 1, 99));
                 }, 500);
              }
              return;
            }

            if (data.message) {
              const messagePayload = data.message;
              clearInterval(progressInterval);

              if (messagePayload.errors) {
                setStatusMessage(`Error: ${messagePayload.errors}`);
                setConnectionStatus('error');
              } else {
                setStatusMessage('Search complete!');
                setProgress(100);
                setTimeout(() => onResultsReady(messagePayload), 500);
              }
            } else {
              console.log('Received message without payload:', data);
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
    <div className="p-4 w-full max-w-2xl">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full border border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-6">
            <PlaneIcon />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Searching for Flights</h2>
          <p className="text-gray-300 mb-6">We're finding the best options for your trip</p>

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

export default FlightLoadingScreen;
