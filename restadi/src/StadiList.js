import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

const StadiList = () => {
  // State variables
  const [stadi, setStadi] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]); // Define searchHistory state variable
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction ascending
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showNames, setShowNames] = useState(Array(10).fill(false)); // State variable to control showing names for each item

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
  setSearchQuery(suggestion.base_name); // Set the search query to the base name of the suggestion
  setPage(1); // Reset page to 1
  setSuggestionClicked(true); // Indicate that a suggestion was clicked
  setShowSuggestions(false); // Hide the suggestions list
};

  // Save suggestion to local storage
  const saveSuggestionToLocalStorage = (suggestion) => {
    // Check if the suggestion already exists in the search history
    const index = searchHistory.indexOf(suggestion);
    if (index !== -1) {
      // Remove the existing entry
      const updatedSearchHistory = [...searchHistory.slice(0, index), ...searchHistory.slice(index + 1)];
      setSearchHistory([suggestion, ...updatedSearchHistory.slice(0, 4)]);
      localStorage.setItem('searchHistory', JSON.stringify([suggestion, ...updatedSearchHistory.slice(0, 4)]));
    } else {
      // Add the new suggestion to the top of the history
      const updatedSearchHistory = [suggestion, ...searchHistory.slice(0, 4)];
      setSearchHistory(updatedSearchHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedSearchHistory));
    }
  };

  // Debounced function for handling search history clicks
  const debouncedHandleSearchHistoryClick = useRef(
    debounce((historyItem) => {
      setSearchQuery(historyItem);
      setPage(1);
      setShowSuggestions(false);
    }, 300)
  ).current;

  // Click handler for search history items
  const handleSearchHistoryClick = (historyItem) => {
    debouncedHandleSearchHistoryClick(historyItem);
  };

  // Input change handler for search bar
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setShowSuggestions(query.trim() !== '');
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
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery !== '') {
        // Save search query to search history
        saveSuggestionToLocalStorage(trimmedQuery);
      }
      setPage(1);
      setShowSuggestions(false);
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
    const confirmed = window.confirm("Are you sure you want to delete the search history?");
    if (confirmed) {
      setSearchHistory([]);
      localStorage.removeItem('searchHistory');
    }
  };

  // Effect for document click event listener
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  // Effect for fetching data from the server
  useEffect(() => {
    if (!isInitialMount) {
      setLoading(true);
      setError(null);

      const trimmedSearchQuery = searchQuery ? searchQuery.trim() : '';

      axios
        .get(`http://127.0.0.1:8000/api/stadi`, {
          params: {
            limit: 10,
            offset: (page - 1) * 10,
            search: trimmedSearchQuery,
            sortBy: sortBy,
            sortDirection: sortDirection,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setStadi(response.data.stadi);
            // Concatenate base name with synonyms (if available)
            const suggestionsWithSynonyms = response.data.suggestions.map((suggestion) => {
              let suggestionText = suggestion.base_name;
              if (suggestion.synonyms && Array.isArray(suggestion.synonyms) && suggestion.synonyms.length > 0) {
                suggestionText += ` (${suggestion.synonyms.map((synonym) => synonym.name).join(', ')})`;
              }
              return {
                ...suggestion,
                text: suggestionText,
              };
            });
            setSuggestions(suggestionsWithSynonyms);
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

      setShowSuggestions(trimmedSearchQuery !== '');
    }
    setIsInitialMount(false);
  }, [isInitialMount, page, searchQuery, suggestionClicked, sortBy, sortDirection]);

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

  // Function to handle sorting by name
  const handleSortByName = () => {
    setSortBy('name');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); // Toggle sort direction
    setPage(1); // Reset page when sorting
  };

  // Function to handle sorting by date added
  const handleSortByDateAdded = () => {
    setSortBy('dateAdded');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); // Toggle sort direction
    setPage(1); // Reset page when sorting
  };

  // Function to toggle the display of sort options and close history if open
  const handleToggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
    setShowHistory(false); // Close history if open
  };

  // Function to toggle the display of search history and close sort options if open
  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    setShowSortOptions(false); // Close sort options if open
  };

  // Function to toggle showing type and name
  const toggleShowTypeAndName = (index) => {
    setShowNames((prevShowNames) => {
      const newShowNames = [...prevShowNames];
      newShowNames[index] = !newShowNames[index];
      return newShowNames;
    });
  };

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
            {suggestions
              .filter((suggestion) => suggestion.base_name.trim() !== '')
              .map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion.base_name}
                  {suggestion.synonyms && suggestion.synonyms.length > 0 && (
                    <ul>
                      {suggestion.synonyms.map((synonym, idx) => (
                        <li key={idx}>{synonym.name}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
      <div className={`toggle-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <button className="history-button" onClick={handleToggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        <button className={darkMode ? 'dark-mode-toggle' : 'light-mode-toggle'} onClick={handleDarkModeToggle}>
          {darkMode ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button className="sort-button" onClick={handleToggleSortOptions}>
          {showSortOptions ? 'Hide Sort Options' : 'Show Sort Options'}
        </button>
      </div>
      {showSortOptions && (
        <div className="sort-options-container">
          <ul className="sort-options-list">
            <li onClick={handleSortByName}>Sort by Name {sortBy === 'name' && `(${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`}</li>
            <li onClick={handleSortByDateAdded}>Sort by Date Added {sortBy === 'dateAdded' && `(${sortDirection === 'asc' ? 'Oldest-Newest' : 'Newest-Oldest'})`}</li>
          </ul>
        </div>
      )}
      {showHistory && (
        <div className="search-history-container">
          <h2>Search History:</h2>
          {searchHistory.length === 0 ? (
            <div className="centered-message">
              <p>No recent searches</p>
            </div>
          ) : (
            <div>
              <ul className="search-history-list">
                {searchHistory.map((historyItem, index) => (
                  <li key={historyItem + index} onClick={() => handleSearchHistoryClick(historyItem)}>
                    {historyItem}
                  </li>
                ))}
              </ul>
              <button className={`delete-history-button ${darkMode ? 'dark-mode' : ''}`} onClick={deleteSearchHistory}>
                Delete History
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      <ul className="stadi-list">
        {Array.isArray(stadi) && stadi.length === 0 && !loading ? (
          <p className="no-data">No data found</p>
        ) : (
          stadi.map((item, index) => (
            <li key={item.id} className="stadi-item">
              <strong>ID:</strong> {item.id}<br />
              <strong>Base Name:</strong> {item.base_name}<br />
              <strong>Date Added:</strong> {item.date_added}<br />
              <strong>Base Description:</strong> {item.base_descr}<br />
              
              {/* Button to toggle showing type and name */}
              <button className='type-name' onClick={() => toggleShowTypeAndName(index)}>
                {showNames[index] ? 'Hide Type and Name' : 'Show Type and Name'}
              </button>
              
              {/* Show Type and Name if item.synonyms exists and is an array */}
              {showNames[index] && item.synonyms && Array.isArray(item.synonyms) && item.synonyms.length > 0 && (
                <ul className="synonyms-list">
                  {item.synonyms.map((synonym, idx) => (
                    <li key={idx}>
                      <strong>Type:</strong> {synonym.type}, <strong>Name:</strong> {synonym.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        )}
        <li ref={lastStadiElementRef} style={{ height: '1px', visibility: 'hidden' }}></li>
      </ul>
      {loading && <p className="loading-message">Loading...</p>}
    </div>
  );
};

// Utility function for debouncing
function debounce(func, timeout) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
}

export default StadiList;