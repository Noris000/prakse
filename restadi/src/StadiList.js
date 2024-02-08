import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

const StadiList = () => {
  // State variables
  const [stadi, setStadi] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Refs for intersection observer
  const observer = useRef();
  const lastStadiElementRef = useRef();

  // Intersection observer callback
  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Click handler for suggestion items
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.base_name);
    setPage(1);
    setSuggestionClicked(true);
    saveSuggestionToLocalStorage(suggestion.base_name);
  };

  // Save suggestion to local storage
  const saveSuggestionToLocalStorage = (suggestion) => {
    const updatedSearchHistory = [suggestion, ...searchHistory.slice(0, 4)];
    setSearchHistory(updatedSearchHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedSearchHistory));
  };

  // Click handler for search history items
  const handleSearchHistoryClick = (historyItem) => {
    // Check if the history item is already in the search history
    if (!searchHistory.includes(historyItem)) {
      // If not, add it to the search history
      const updatedSearchHistory = [historyItem, ...searchHistory.slice(0, 4)];
      setSearchHistory(updatedSearchHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedSearchHistory));
    }

    setSearchQuery(historyItem);
    setPage(1);
    setShowSuggestions(false);
  };

  // Input change handler for search bar
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setShowSuggestions(query.trim() !== ''); // Show suggestions only if the search query is not empty
  };

  // Click handler for document to close suggestions
  const handleDocumentClick = (e) => {
    const isClickInsideSearchBar = e.target.closest('.search-bar-container');
    const isClickInsideSuggestions = e.target.closest('.suggestions-list');

    if (!isClickInsideSearchBar && !isClickInsideSuggestions) {
      setShowSuggestions(false);
    }
  };

  // Key press handler for search bar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(e.target.value);
      setPage(1);
      setShowSuggestions(false); // Close suggestions on pressing Enter
    }
  };

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);

    if (!darkMode) {
      document.body.style.backgroundColor = '#333';
      document.body.style.color = '#fff';
    } else {
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = '#333';
    }
  };

  // Delete search history
  const deleteSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Effect for document click event listener
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  // Effect for fetching stadi data
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .get(`http://127.0.0.1:8000/api/stadi?limit=10&offset=${(page - 1) * 10}&search=${searchQuery}`)
      .then((response) => {
        if (response.status === 200) {
          setStadi((prevStadi) => (page === 1 ? response.data.stadi : [...prevStadi, ...response.data.stadi]));
          setSuggestions(response.data.suggestions);
          setLoading(false);
        } else {
          console.error('Error fetching Stadi. Unexpected status code:', response.status);
          setError('Error fetching Stadi. Unexpected status code: ' + response.status);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching Stadi:', error);
        console.error('Error details:', error.response || error.request || error.message);
        setError('Server is down!!!');
        setLoading(false);
      });

    setShowSuggestions(searchQuery.trim() !== '');

  }, [page, searchQuery, searchHistory, suggestionClicked]);

  // Effect for intersection observer
  useEffect(() => {
    if (lastStadiElementRef.current) {
      observer.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      });

      observer.current.observe(lastStadiElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [lastStadiElementRef]);

  // Effect for loading search history from local storage
  useEffect(() => {
    const storedSearchHistory = localStorage.getItem('searchHistory');
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }
  }, []);

  // JSX for rendering the component
  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Stadi Records</h1>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyPress}
          className="search-input"
        />
        {showSuggestions && suggestions && suggestions.length > 0 && (
  <ul className="suggestions-list">
    {suggestions.map((suggestion) => (
      <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
        {suggestion.base_name}
      </li>
    ))}
  </ul>
)}
      </div>
      <div className={`toggle-container`}>
        <button className="history-button" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        <button className={darkMode ? 'dark-mode-toggle' : 'light-mode-toggle'} onClick={handleDarkModeToggle}>
          {darkMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
      {showHistory && (
        <div className="search-history-container">
          <h2>Search History:</h2>
          {searchHistory.length === 0 ? (
            <div className="centered-message">
              <p>No recent searches</p>
              <button className={`delete-history-button ${darkMode ? 'dark-mode' : ''}`} onClick={deleteSearchHistory}>
                Delete History
              </button>
            </div>
          ) : (
            <ul className="search-history-list">
              {searchHistory.map((historyItem, index) => (
                <li key={index} onClick={() => handleSearchHistoryClick(historyItem)}>
                  {historyItem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      <ul className="stadi-list">
        {stadi.length === 0 && !loading ? (
          <p className="no-data">No data found</p>
        ) : (
          stadi.map((item) => (
            <li key={item.id} className="stadi-item">
              <strong>ID:</strong> {item.id}<br />
              <strong>Base Name:</strong> {item.base_name}<br />
              <strong>Date Added:</strong> {item.date_added}<br />
              <strong>Base Description:</strong> {item.base_descr}<br />
            </li>
          ))
        )}
        <li ref={lastStadiElementRef} style={{ height: '1px', visibility: 'hidden' }}></li>
      </ul>
      {loading && <p className="loading-message">Loading...</p>}
    </div>
  );
};

export default StadiList;