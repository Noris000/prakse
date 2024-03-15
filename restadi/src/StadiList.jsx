import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import SearchResults from './SearchResults';
import SearchBar from './SearchBar';

const StadiList = ({ darkMode, setDarkMode }) => {
   // State variables
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
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showNames, setShowNames] = useState(Array(10).fill(false));
  const [rangeSliderValues, setRangeSliderValues] = useState({
    pid_3: { min: 0, max: 100, value: null },
    pid_4: { min: 0, max: 100, value: null },
    pid_6: { min: 0, max: 100, value: null },
    pid_7: { min: 0, max: 100, value: null },
    pid_25: { min: 0, max: 100, value: null },
    pid_26: { min: 0, max: 100, value: null },
  });
  const [checkboxData, setCheckboxData] = useState({});
  const [soilCheckboxes, setSoilCheckboxes] = useState({});
  const [waterCheckboxes, setWaterCheckboxes] = useState({});
  const [pHCheckboxes, setPHCheckboxes] = useState({});
  const [sunlightCheckboxes, setSunlightCheckboxes] = useState({});

  const [checkboxState, setCheckboxState] = useState({
    Soil: {},
    Water: {},
    pH: {},
    Sun: {},
  });

 // Ref for observing last Stadi element
  const lastStadiElementRef = useRef();

// Observer for infinite scrolling
  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Handles click on a suggestion
  const handleSuggestionClick = (suggestion) => {
    setSuggestionClicked(false);
    saveSuggestionToLocalStorage(suggestion.base_name);
    setSearchQuery(suggestion.base_name);
    setShowSuggestions(false);
    setPage(1);
  };

// Save suggestion to local storage
  const saveSuggestionToLocalStorage = (suggestion) => {
    const index = searchHistory.indexOf(suggestion);
    const updatedSearchHistory =
      index !== -1
        ? [suggestion, ...searchHistory.slice(0, index), ...searchHistory.slice(index + 1, 4)]
        : [suggestion, ...searchHistory.slice(0, 4)];

    setSearchHistory(updatedSearchHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedSearchHistory));
  };

 // Debounced function to handle search history click
  const debouncedHandleSearchHistoryClick = useRef(
    debounce((historyItem) => {
      setSearchQuery(historyItem);
      setPage(1);
      setShowSuggestions(false);
    }, 500)
  ).current;

  // Handle click on search history item
  const handleSearchHistoryClick = (historyItem) => {
    debouncedHandleSearchHistoryClick(historyItem);
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setShowSuggestions(query.trim() !== '');
  };

// Handle click outside of search bar and suggestions
  const handleDocumentClick = (e) => {
    const isClickInsideSearchBar = e.target.closest('.search-bar-container');
    const isClickInsideSuggestions = e.target.closest('.suggestions-list');

    if (!isClickInsideSearchBar && !isClickInsideSuggestions) {
      setShowSuggestions(false);
    }
  };

// Handle key press (Enter) for search
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

// Toggle dark mode
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

// Delete search history
  const deleteSearchHistory = () => {
    const confirmed = window.confirm('Are you sure you want to delete the search history?');
    if (confirmed) {
      setSearchHistory([]);
      localStorage.removeItem('searchHistory');
    }
  };

// Effect for adding event listener on mount
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

 // Effect for fetching initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/stadi');
        if (response.status === 200) {
          const {
            pid_3_range_slider_values,
            pid_4_range_slider_values,
            pid_6_range_slider_values,
            pid_7_range_slider_values,
            pid_25_range_slider_values,
            pid_26_range_slider_values,
          } = response.data;
          setRangeSliderValues({
            pid_3: { min: pid_3_range_slider_values.min, max: pid_3_range_slider_values.max, value: null },
            pid_4: { min: pid_4_range_slider_values.min, max: pid_4_range_slider_values.max, value: null },
            pid_6: { min: pid_6_range_slider_values.min, max: pid_6_range_slider_values.max, value: null },
            pid_7: { min: pid_7_range_slider_values.min, max: pid_7_range_slider_values.max, value: null },
            pid_25: { min: pid_25_range_slider_values.min, max: pid_25_range_slider_values.max, value: null },
            pid_26: { min: pid_26_range_slider_values.min, max: pid_26_range_slider_values.max, value: null },
          });
  
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/stadi');
        if (response.status === 200) {
          setCheckboxData(response.data);
        } else {
          console.error('Error fetching checkbox data. Unexpected status code:', response.status);
          setError('Error fetching checkbox data. Unexpected status code: ' + response.status);
        }
      } catch (error) {
        console.error('Error fetching checkbox data:', error);
        console.error('Error details:', error.response || error.request || error.message);
        setError('Server is down!!!');
      }
  
      setLoading(false);
    };
  
    fetchData();
  }, []);

// Fetch Stadi data based on search query, pagination, sorting, and filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
    
      try {
        const trimmedSearchQuery = searchQuery.trim();
        
        const sliderValues = {};
        Object.entries(rangeSliderValues).forEach(([key, value]) => {
          if (value.value !== null) {
            sliderValues[key] = value.value;
          }
        });
        
        const response = await axios.get(`http://127.0.0.1:8000/api/stadi`, {
          params: {
            limit: 10,
            offset: (page - 1) * 10,
            search: trimmedSearchQuery,
            searchSynonyms: true,
            sortBy: sortBy,
            sortDirection: sortDirection,
            sliderValues: sliderValues,
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
  }, [page, searchQuery, sortBy, sortDirection, rangeSliderValues]);

// Intersection observer for infinite scrolling
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

// Load search history from local storage on component mount
  useEffect(() => {
    const storedSearchHistory = localStorage.getItem('searchHistory');
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }
  }, []);

  // Function to handle sorting by name
const handleSortByName = () => {
  setSortBy('name'); // Set sorting criteria to 'name'
  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  setPage(1);
};

// Function to handle sorting by date added
const handleSortByDateAdded = () => {
  setSortBy('dateAdded'); // Set sorting criteria to 'dateAdded'
  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  setPage(1);
};

// Function to toggle display of sort options
const handleToggleSortOptions = () => {
  setShowSortOptions(!showSortOptions);
  setShowHistory(false);
};

// Function to toggle display of search history
const handleToggleHistory = () => {
  setShowHistory(!showHistory);
  setShowSortOptions(false);
};

// Function to toggle show type and name
const toggleShowTypeAndName = (index) => {
  setShowNames((prevShowNames) => {
    const newShowNames = [...prevShowNames];
    newShowNames[index] = !newShowNames[index];
    return newShowNames;
  });
};

// Effect to hide suggestions when search query changes or suggestion is clicked
useEffect(() => {
  if (suggestionClicked) {
    setShowSuggestions(false);
    setSuggestionClicked(false);
  }
}, [searchQuery, suggestionClicked]);

// Function to handle checkbox change for a specific category and key
const handleCheckboxChange = (category, key, checked) => {
  setCheckboxState(prevState => ({
    ...prevState,
    [category]: {
      ...prevState[category],
      [key]: checked
    }
  }));
};

// Function to handle checkbox change for soil type
const handleSoilCheckboxChange = (key) => {
  setSoilCheckboxes(prevState => ({
    ...prevState,
    [key]: !prevState[key]
  }));
};

// Function to handle checkbox change for water needs
const handleWaterCheckboxChange = (key) => {
  setWaterCheckboxes(prevState => ({
    ...prevState,
    [key]: !prevState[key]
  }));
};

// Function to handle checkbox change for pH level
const handlePHCheckboxChange = (key) => {
  setPHCheckboxes(prevState => ({
    ...prevState,
    [key]: !prevState[key]
  }));
};

// Function to handle checkbox change for sunlight needs
const handleSunlightCheckboxChange = (key) => {
  setSunlightCheckboxes(prevState => ({
    ...prevState,
    [key]: !prevState[key]
  }));
};

// Function to handle range slider change
const handleRangeSliderChange = (e, sliderName) => {
  const newValue = e.target.value;

  setRangeSliderValues(prevState => ({
    ...prevState,
    [sliderName]: { ...prevState[sliderName], value: newValue }
  }));
};

// Function to handle range input change
const handleRangeInputChange = (newValue, sliderName) => {
  if (newValue < rangeSliderValues[sliderName].min) {
    newValue = rangeSliderValues[sliderName].min;
  } else if (newValue > rangeSliderValues[sliderName].max) {
    newValue = rangeSliderValues[sliderName].max;
  }

  setRangeSliderValues(prevState => ({
    ...prevState,
    [sliderName]: { ...prevState[sliderName], value: newValue }
  }));
};

return (
  <div className="p-4">
    {/* Container for dark mode and flex layout */}
    <div className={`container mx-auto`}>
      <div className="flex flex-col items-center">
        <h1 className={`text-2xl md:text-3xl font-bold mb-2 md:mb-4`}>
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
        {/* Toggle buttons container */}
        <div
          className='toggle-container mb-2 w-full md:w-auto flex flex-wrap justify-center'
        >
          {/* History Toggle Button */}
          <button
        className={`history-button bg-white text-black px-4 py-2 rounded-md mr-2 mb-2 border border-black hover:bg-gray-200`}
            onClick={handleToggleHistory}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          {/* Dark Mode Toggle Button */}
          <button
            className={'dark-mode-toggle bg-white text-black px-4 py-2 rounded-md mr-2 mb-2 border border-black hover:bg-gray-200'}
            onClick={handleDarkModeToggle}
          >
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
          {/* Sort Options Toggle Button */}
          <button
            className={'sort-button bg-white text-black px-4 py-2 rounded-md mb-2 border border-black hover:bg-gray-200'}
            onClick={handleToggleSortOptions}
          >
            {showSortOptions ? 'Hide Sort Options' : 'Show Sort Options'}
          </button>
        </div>
      </div>
      {/* Sort Options Container */}
      {showSortOptions && (
        <div className={`sort-options-container w-full md:w-1/2 mx-auto border border-gray-300 rounded-md mb-4`}>
          <ul className="sort-options-list">
            {/* Sort by Name */}
            <li
              onClick={handleSortByName}
              className={`cursor-pointer ${sortBy === 'name' ? 'font-bold' : ''} border p-2 rounded-md hover:bg-gray-100`}
            >
              Sort by Name {sortBy === 'name' && `(${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`}
            </li>
            {/* Sort by Date Added */}
            <li
              onClick={handleSortByDateAdded}
              className={`cursor-pointer ${sortBy === 'dateAdded' ? 'font-bold' : ''} border p-2 rounded-md hover:bg-gray-100`}
            >
              Sort by Date Added {sortBy === 'dateAdded' && `(${sortDirection === 'asc' ? 'Oldest-Newest' : 'Newest-Oldest'})`}
            </li>
            {/* Sort by Range Sliders */}
            <li
              onClick={() => setSortBy('rangeSliders')}
              className={`cursor-pointer ${sortBy === 'rangeSliders' ? 'font-bold' : ''} border p-2 rounded-md hover:bg-gray-100`}
            >
              Refine by Range Sliders
            </li>
            {/* Sort by Checkboxes */}
            <li
              onClick={() => setSortBy('checkboxes')}
              className={`cursor-pointer ${sortBy === 'checkboxes' ? 'font-bold' : ''} border p-2 rounded-md hover:bg-gray-100`}
            >
              Refine by Checkboxes
            </li>
          </ul>
  {/* Range Sliders Component */}
{sortBy === 'rangeSliders' && (
  <div className="sliders-container px-4 py-2">
    <div className="grid grid-cols-2 gap-4">
      {/* Height Min */}
      <div className="text-center height-min">
        <label className="mb-2 block font-bold">Height Min</label>
        <div className="flex items-center justify-center">
          <input 
            type="range" 
            min={rangeSliderValues.pid_3.min} 
            max={rangeSliderValues.pid_3.max} 
            value={rangeSliderValues.pid_3.value || rangeSliderValues.pid_3.min}
            onChange={(e) => handleRangeSliderChange(e, 'pid_3')}
            className="dark:bg-gray-500"
          />
        </div>
        <input
          type="number"
          className={`mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}`}
          value={rangeSliderValues.pid_3.value || rangeSliderValues.pid_3.min}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            handleRangeInputChange(newValue, 'pid_3');
          }}
        />
      </div>
      {/* Height Max */}
      <div className="text-center height-max">
        <label className="mb-2 block font-bold">Height Max</label>
        <div className="flex items-center justify-center">
          <input 
            type="range" 
            min={rangeSliderValues.pid_4.min} 
            max={rangeSliderValues.pid_4.max} 
            value={rangeSliderValues.pid_4.value || rangeSliderValues.pid_4.min}
            onChange={(e) => handleRangeSliderChange(e, 'pid_4')}
            className="dark:bg-gray-500"
          />
        </div>
        <input
          type="number"
          className={`mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100`}
          value={rangeSliderValues.pid_4.value || rangeSliderValues.pid_4.min}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            handleRangeInputChange(newValue, 'pid_4');
          }}
        />
      </div>
      {/* Width Min */}
      <div className="text-center width-min">
        <label className="mb-2 block font-bold">Width Min</label>
        <div className="flex items-center justify-center">
          <input 
            type="range" 
            min={rangeSliderValues.pid_6.min} 
            max={rangeSliderValues.pid_6.max} 
            value={rangeSliderValues.pid_6.value || rangeSliderValues.pid_6.min}
            onChange={(e) => handleRangeSliderChange(e, 'pid_6')}
            className="dark:bg-gray-500"
          />
        </div>
        <input
          type="number"
          className={`mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100`}
          value={rangeSliderValues.pid_6.value || rangeSliderValues.pid_6.min}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            handleRangeInputChange(newValue, 'pid_6');
          }}
        />
      </div>
      {/* Width Max */}
      <div className="text-center width-max">
        <label className="mb-2 block font-bold">Width Max</label>
        <div className="flex items-center justify-center">
          <input 
            type="range" 
            min={rangeSliderValues.pid_7.min} 
            max={rangeSliderValues.pid_7.max} 
            value={rangeSliderValues.pid_7.value || rangeSliderValues.pid_7.min}
            onChange={(e) => handleRangeSliderChange(e, 'pid_7')}
            className="dark:bg-gray-500"
          />
        </div>
        <input
          type="number"
          className={`mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}`}
          value={rangeSliderValues.pid_7.value || rangeSliderValues.pid_7.min}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            handleRangeInputChange(newValue, 'pid_7');
          }}
        />
      </div>
      {/* Height Flowers */}
      <div className="text-center height-flowers">
        <label className="mb-2 block font-bold">Height Flowers</label>
        <div className="flex items-center justify-center">
          <input 
            type="range" 
            min={rangeSliderValues.pid_25.min} 
            max={rangeSliderValues.pid_25.max} 
            value={rangeSliderValues.pid_25.value || rangeSliderValues.pid_25.min}
            onChange={(e) => handleRangeSliderChange(e, 'pid_25')}
            className="dark:bg-gray-500"
          />
        </div>
        <input
          type="number"
          className={`mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}`}
          value={rangeSliderValues.pid_25.value || rangeSliderValues.pid_25.min}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            handleRangeInputChange(newValue, 'pid_25');
          }}
        />
      </div>
      {/* Height Leaves */}
      <div className="text-center height-leaves">
        <label className="mb-2 block font-bold">Height Leaves</label>
        <div className="flex items-center justify-center">
          <input 
            type="range" 
            min={rangeSliderValues.pid_26.min} 
            max={rangeSliderValues.pid_26.max} 
            value={rangeSliderValues.pid_26.value || rangeSliderValues.pid_26.min}
            onChange={(e) => handleRangeSliderChange(e, 'pid_26')}
            className="dark:bg-gray-500"
          />
        </div>
        <input
          type="number"
          className={`mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}`}
          value={rangeSliderValues.pid_26.value || rangeSliderValues.pid_26.min}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            handleRangeInputChange(newValue, 'pid_26');
          }}
        />
      </div>
    </div>
  </div>
)}
{sortBy === 'checkboxes' && (
  <div className="checkboxes-container justify-center grid gap-4  grid-cols-2 p-4">
      <div>
        <h2 className="font-bold text-lg">Soil</h2>
        <div>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={soilCheckboxes.clay} onChange={() => handleSoilCheckboxChange('clay')} /><span>Clay</span> 
          </label>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={soilCheckboxes.loam} onChange={() => handleSoilCheckboxChange('loam')} /> Loam
          </label>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={soilCheckboxes.sand} onChange={() => handleSoilCheckboxChange('sand')} /> Sand
          </label>
          <label className="block font-bold">
            <input type="checkbox" checked={soilCheckboxes.chalk} onChange={() => handleSoilCheckboxChange('chalk')} /> Chalk
          </label>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-lg">Water</h2>
        <div>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={waterCheckboxes.well} onChange={() => handleWaterCheckboxChange('well')} /> Well
          </label>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={waterCheckboxes.poorly} onChange={() => handleWaterCheckboxChange('poorly')} /> Poorly
          </label>
          <label className="block font-bold">
            <input type="checkbox" checked={waterCheckboxes.moistButWell} onChange={() => handleWaterCheckboxChange('moistButWell')} /> Moist but well
          </label>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-lg">pH</h2>
        <div>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={pHCheckboxes.acid} onChange={() => handlePHCheckboxChange('acid')} /> Acid 0-6.5
          </label>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={pHCheckboxes.alkaline} onChange={() => handlePHCheckboxChange('alkaline')} /> Alkaline 7.4+
          </label>
          <label className="block font-bold">
            <input type="checkbox" checked={pHCheckboxes.neutral} onChange={() => handlePHCheckboxChange('neutral')} /> Neutral 6.6–7.3
          </label>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-lg">Sunlight</h2>
        <div>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={sunlightCheckboxes.fullSun} onChange={() => handleSunlightCheckboxChange('fullSun')} /> Full sun
          </label>
          <label className="mb-2 block font-bold">
            <input type="checkbox" checked={sunlightCheckboxes.partialShade} onChange={() => handleSunlightCheckboxChange('partialShade')} /> Partial shade
          </label>
          <label className="block font-bold">
            <input type="checkbox" checked={sunlightCheckboxes.fullShade} onChange={() => handleSunlightCheckboxChange('fullShade')} /> Full shade
          </label>
        </div>
      </div>
    </div>
)}
  </div>
)}
      {/* Search History Container */}
      {showHistory && (
        <div className='search-history-container'>
          <h2 className='text-xl mb-2'>Search History</h2>
          {searchHistory.length > 0 ? (
            <>
            <ul className="search-history-list">
              {searchHistory.map((historyItem, index) => (
                <li
                  key={index}
                  onClick={() => handleSearchHistoryClick(historyItem)}
                  className='cursor-pointer border p-2 rounded-md mb-2 border-gray-300 hover:bg-gray-100'
                >
                  {historyItem}
                </li>
              ))}
            </ul>
          {/* Clear History Button */}
          <button onClick={deleteSearchHistory} className='clear-history-button mt-2 px-4 py-2 rounded-md'>
            Clear History
          </button>
        </>
          ) : (
            <p className='text-sm'>No search history available</p>
          )}
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

// Debounce function to delay execution of a function
function debounce(func, timeout) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
}

export default StadiList;