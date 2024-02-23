import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import SearchResults from './SearchResults';
import SearchBar from './SearchBar';

const StadiList = () => {
  const [stadi, setStadi] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showNames, setShowNames] = useState(Array(10).fill(false));

  const observer = useRef();
  const lastStadiElementRef = useRef();

  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSuggestionClicked(false);
    saveSuggestionToLocalStorage(suggestion.base_name);
    setSearchQuery(suggestion.base_name);
    setShowSuggestions(false);
    setPage(1);
  };

  const saveSuggestionToLocalStorage = (suggestion) => {
    const index = searchHistory.indexOf(suggestion);
    const updatedSearchHistory =
      index !== -1
        ? [suggestion, ...searchHistory.slice(0, index), ...searchHistory.slice(index + 1, 4)]
        : [suggestion, ...searchHistory.slice(0, 4)];

    setSearchHistory(updatedSearchHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedSearchHistory));
  };

  const debouncedHandleSearchHistoryClick = useRef(
    debounce((historyItem) => {
      setSearchQuery(historyItem);
      setPage(1);
      setShowSuggestions(false);
    }, 500)
  ).current;

  const handleSearchHistoryClick = (historyItem) => {
    debouncedHandleSearchHistoryClick(historyItem);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setShowSuggestions(query.trim() !== '');
  };

  const handleDocumentClick = (e) => {
    const isClickInsideSearchBar = e.target.closest('.search-bar-container');
    const isClickInsideSuggestions = e.target.closest('.suggestions-list');

    if (!isClickInsideSearchBar && !isClickInsideSuggestions) {
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery !== '') {
        saveSuggestionToLocalStorage(trimmedQuery);
      }
      setPage(1);
      setShowSuggestions(false);
    }
  };

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

  const deleteSearchHistory = () => {
    const confirmed = window.confirm('Are you sure you want to delete the search history?');
    if (confirmed) {
      setSearchHistory([]);
      localStorage.removeItem('searchHistory');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const trimmedSearchQuery = searchQuery.trim();
        const response = await axios.get(`http://127.0.0.1:8000/api/stadi`, {
  params: {
    limit: 10,
    offset: (page - 1) * 10,
    search: trimmedSearchQuery,
    searchSynonyms: true,
    sortBy: sortBy,
    sortDirection: sortDirection,
  },
});
  
        if (response.status === 200) {
          if (page === 1) {
            setStadi(response.data.stadi.filter((item, index, self) =>
              index === self.findIndex((t) => (
                t.id === item.id
              ))
            ));
          } else {
            setStadi((prevStadi) => {
              const newStadi = [...prevStadi];
              response.data.stadi.forEach((item) => {
                if (!newStadi.some((existingItem) => existingItem.id === item.id)) {
                  newStadi.push(item);
                }
              });
              return newStadi;
            });
          }
  
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
          setSuggestions(suggestionsWithSynonyms.filter((item, index, self) =>
            index === self.findIndex((t) => (
              t.base_name === item.base_name
            ))
          ));
        } else {
          console.error('Error fetching Stadi. Unexpected status code:', response.status);
          setError('Error fetching Stadi. Unexpected status code: ' + response.status);
        }
      } catch (error) {
        console.error('Error fetching Stadi:', error);
        console.error('Error details:', error.response || error.request || error.message);
        setError('Server is down!!!');
      }
  
      setLoading(false);
    };
  
    fetchData();
  }, [page, searchQuery, sortBy, sortDirection]);

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

  useEffect(() => {
    const storedSearchHistory = localStorage.getItem('searchHistory');
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }
  }, []);

  const handleSortByName = () => {
    setSortBy('name');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  const handleSortByDateAdded = () => {
    setSortBy('dateAdded');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  const handleToggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
    setShowHistory(false);
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    setShowSortOptions(false);
  };

  const toggleShowTypeAndName = (index) => {
    setShowNames((prevShowNames) => {
      const newShowNames = [...prevShowNames];
      newShowNames[index] = !newShowNames[index];
      return newShowNames;
    });
  };

  useEffect(() => {
    if (suggestionClicked) {
      setShowSuggestions(false);
      setSuggestionClicked(false);
    }
  }, [searchQuery, suggestionClicked]);

  return (
    <div className="m-4">
      <div className={`container mx-auto ${darkMode ? 'dark-mode' : ''}`}>
        <div className="flex flex-col items-center">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 md:mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Stadi Records
          </h1>
          <SearchBar
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            handleKeyPress={handleKeyPress}
            handleSearch={handleSearch}
            handleSuggestionClick={handleSuggestionClick}
            suggestions={suggestions}
          />
          <div
            className={`toggle-container ${
              darkMode ? 'dark-mode' : 'light-mode'
            } mb-2 w-full md:w-auto flex flex-wrap justify-center`}
          >
            <button
              className={`history-button ${
                darkMode ? 'bg-gray-500' : 'bg-white'
              } ${
                darkMode ? 'text-white' : 'text-black'
              } px-4 py-2 rounded-md mr-2 mb-2 ${
                darkMode ? '' : 'border border-black hover:bg-gray-200'
              }`}
              onClick={handleToggleHistory}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
            <button
              className={`${
                darkMode ? 'dark-mode-toggle bg-gray-500 text-white' : 'light-mode-toggle bg-white text-black'
              } px-4 py-2 rounded-md mr-2 mb-2 ${
                darkMode ? '' : 'border border-black hover:bg-gray-200'
              }`}
              onClick={handleDarkModeToggle}
            >
              {darkMode ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button
              className={`sort-button ${
                darkMode ? 'bg-gray-500' : 'bg-white'
              } ${
                darkMode ? 'text-white' : 'text-black'
              } px-4 py-2 rounded-md mb-2 ${
                darkMode ? '' : 'border border-black hover:bg-gray-200'
              }`}
              onClick={handleToggleSortOptions}
            >
              {showSortOptions ? 'Hide Sort Options' : 'Show Sort Options'}
            </button>
          </div>
        </div>
        {showSortOptions && (
          <div
            className={`sort-options-container w-full md:w-1/2 mx-auto border ${
              darkMode ? 'border-gray-700 dark-mode' : 'border-gray-300'
            } rounded-md mb-4`}
          >
            <ul className="sort-options-list">
              <li
                onClick={handleSortByName}
                className={`cursor-pointer ${
                  sortBy === 'name' ? 'font-bold' : ''
                } border p-2 rounded-md ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                Sort by Name {sortBy === 'name' && `(${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`}
              </li>
              <li
                onClick={handleSortByDateAdded}
                className={`cursor-pointer ${
                  sortBy === 'dateAdded' ? 'font-bold' : ''
                } border p-2 rounded-md ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                Sort by Date Added{' '}
                {sortBy === 'dateAdded' &&
                  `(${sortDirection === 'asc' ? 'Oldest-Newest' : 'Newest-Oldest'})`}
              </li>
            </ul>
          </div>
        )}
        {showHistory && (
          <div className="search-history-container w-full md:w-1/2 mx-auto border border-gray-300 rounded-md p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Search History:</h2>
            {searchHistory.length === 0 ? (
              <div className="centered-message">
                <p>No recent searches</p>
              </div>
            ) : (
              <div>
                <ul className="search-history-list">
                  {searchHistory.map((historyItem, index) => (
                    <li
                      key={historyItem + index}
                      onClick={() => handleSearchHistoryClick(historyItem)}
                      className={`cursor-pointer hover:underline border p-2 mb-2 rounded-md ${
                        darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      {historyItem}
                    </li>
                  ))}
                </ul>
                <button
                  className={`delete-history-button ${
                    darkMode ? 'bg-gray-500' : 'bg-white'
                  } ${
                    darkMode ? 'text-white' : 'text-black'
                  } px-2 py-1 rounded-md mt-2 ${
                    darkMode ? '' : 'border border-black hover:bg-gray-200'
                  }`}
                  onClick={deleteSearchHistory}
                >
                  Delete History
                </button>
              </div>
            )}
          </div>
        )}
<SearchResults
          stadi={stadi}
          loading={loading}
          error={error}
          darkMode={darkMode}
          showNames={showNames}
          lastStadiElementRef={lastStadiElementRef}
          toggleShowTypeAndName={toggleShowTypeAndName}
        />
      </div>
    </div>
  );
        };  
function debounce(func, timeout) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
}

export default StadiList;
