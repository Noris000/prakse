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
  const [slider1Value, setSlider1Value] = useState(50);
  const [slider2Value, setSlider2Value] = useState(50);
  const [slider3Value, setSlider3Value] = useState(50);
  const [slider4Value, setSlider4Value] = useState(50);
  const [slider5Value, setSlider5Value] = useState(50);
  const [slider6Value, setSlider6Value] = useState(50);
  const [soilCheckboxes, setSoilCheckboxes] = useState({
    clay: false,
    loam: false,
    sand: false,
    chalk: false,
  });
  const [waterCheckboxes, setWaterCheckboxes] = useState({
    well: false,
    poorly: false,
    moistButWell: false,
  });
  const [pHCheckboxes, setPHCheckboxes] = useState({
    acid: false,
    alkaline: false,
    neutral: false,
  });
  const [sunlightCheckboxes, setSunlightCheckboxes] = useState({
    fullSun: false,
    partialShade: false,
    fullShade: false,
  });

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
        } else {
          console.error('Error fetching Stadi. Unexpected status code:', response.status);
          setError('Error fetching Stadi. Unexpected status code: ' + response.status);
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
    const observer = new IntersectionObserver(handleObserver);

    const currentRef = lastStadiElementRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
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

  const handleSlider1Change = (e) => {
    setSlider1Value(e.target.value);
  };

  const handleSlider2Change = (e) => {
    setSlider2Value(e.target.value);
  };

  const handleSlider3Change = (e) => {
    setSlider3Value(e.target.value);
  };

  const handleSlider4Change = (e) => {
    setSlider4Value(e.target.value);
  };

  const handleSlider5Change = (e) => {
    setSlider5Value(e.target.value);
  };

  const handleSlider6Change = (e) => {
    setSlider6Value(e.target.value);
  };

  const handleSoilCheckboxChange = (name) => {
    setSoilCheckboxes((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handleWaterCheckboxChange = (name) => {
    setWaterCheckboxes((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handlePHCheckboxChange = (name) => {
    setPHCheckboxes((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handleSunlightCheckboxChange = (name) => {
    setSunlightCheckboxes((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

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
          <div className={`sort-options-container w-full md:w-1/2 mx-auto border ${darkMode ? 'border-gray-700 dark-mode' : 'border-gray-300'} rounded-md mb-4`}>
            <ul className="sort-options-list">
              <li
                onClick={handleSortByName}
                className={`cursor-pointer ${sortBy === 'name' ? 'font-bold' : ''} border p-2 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              >
                Sort by Name {sortBy === 'name' && `(${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`}
              </li>
              <li
                onClick={handleSortByDateAdded}
                className={`cursor-pointer ${sortBy === 'dateAdded' ? 'font-bold' : ''} border p-2 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              >
                Sort by Date Added {sortBy === 'dateAdded' && `(${sortDirection === 'asc' ? 'Oldest-Newest' : 'Newest-Oldest'})`}
              </li>
              <li
                onClick={() => setSortBy('rangeSliders')}
                className={`cursor-pointer ${sortBy === 'rangeSliders' ? 'font-bold' : ''} border p-2 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              >
                Sort by Range Sliders
              </li>
              <li
                onClick={() => setSortBy('checkboxes')}
                className={`cursor-pointer ${sortBy === 'checkboxes' ? 'font-bold' : ''} border p-2 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              >
                Sort by Checkboxes
              </li>
            </ul>
            {sortBy === 'rangeSliders' && (
              <div className="sliders-container px-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="heigt-min text-center">
                    <label className="mb-2 block font-bold">Height Min</label>
                    <input type="range" min="0" max="100" value={slider1Value} onChange={handleSlider1Change} />
                  </div>
                  <div className="height-max text-center">
                    <label className="mb-2 block font-bold">Height Max</label>
                    <input type="range" min="0" max="100" value={slider2Value} onChange={handleSlider2Change} />
                  </div>
                  <div className="width-min text-center">
                    <label className="mb-2 block font-bold">Width Min</label>
                    <input type="range" min="0" max="100" value={slider3Value} onChange={handleSlider3Change} />
                  </div>
                  <div className="width-max text-center">
                    <label className="mb-2 block font-bold">Width Max</label>
                    <input type="range" min="0" max="100" value={slider4Value} onChange={handleSlider4Change} />
                  </div>
                  <div className="height-flowers text-center">
                    <label className="mb-2 block font-bold">Height Flowers</label>
                    <input type="range" min="0" max="100" value={slider5Value} onChange={handleSlider5Change} />
                  </div>
                  <div className="height-leaves text-center">
                    <label className="mb-2 block font-bold">Height Leaves</label>
                    <input type="range" min="0" max="100" value={slider6Value} onChange={handleSlider6Change} />
                  </div>
                </div>
              </div>
            )}
            {sortBy === 'checkboxes' && (
              <div className="checkboxes-container px-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="font-bold mb-2">Soil Type</h2>
                    {Object.entries(soilCheckboxes).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <input
                          type="checkbox"
                          id={`soil-${key}`}
                          checked={value}
                          onChange={() => handleSoilCheckboxChange(key)}
                        />
                        <label htmlFor={`soil-${key}`} className="ml-2">{key}</label>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="font-bold mb-2">Water Needs</h2>
                    {Object.entries(waterCheckboxes).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <input
                          type="checkbox"
                          id={`water-${key}`}
                          checked={value}
                          onChange={() => handleWaterCheckboxChange(key)}
                        />
                        <label htmlFor={`water-${key}`} className="ml-2">{key}</label>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="font-bold mb-2">pH Level</h2>
                    {Object.entries(pHCheckboxes).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <input
                          type="checkbox"
                          id={`ph-${key}`}
                          checked={value}
                          onChange={() => handlePHCheckboxChange(key)}
                        />
                        <label htmlFor={`ph-${key}`} className="ml-2">{key}</label>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="font-bold mb-2">Sunlight Needs</h2>
                    {Object.entries(sunlightCheckboxes).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <input
                          type="checkbox"
                          id={`sunlight-${key}`}
                          checked={value}
                          onChange={() => handleSunlightCheckboxChange(key)}
                        />
                        <label htmlFor={`sunlight-${key}`} className="ml-2">{key}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {showHistory && (
          <div className={`search-history-container ${darkMode ? 'dark-mode' : ''}`}>
            <h2 className={`text-xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Search History</h2>
            {searchHistory.length > 0 ? (
              <ul className="search-history-list">
                {searchHistory.map((historyItem, index) => (
                  <li
                    key={index}
                    onClick={() => handleSearchHistoryClick(historyItem)}
                    className={`cursor-pointer border p-2 rounded-md mb-2 ${
                      darkMode ? 'border-gray-700 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {historyItem}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>No search history available</p>
            )}
            <button
              onClick={deleteSearchHistory}
              className={`clear-history-button mt-2 px-4 py-2 rounded-md ${
                darkMode ? 'bg-gray-500 text-white' : 'bg-white text-black'
              }`}
            >
              Clear History
            </button>
          </div>
        )}
        <SearchResults
          stadi={stadi}
          loading={loading}
          error={error}
          darkMode={darkMode}
          showNames={showNames}
          toggleShowTypeAndName={toggleShowTypeAndName}
          lastStadiElementRef={lastStadiElementRef}
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
