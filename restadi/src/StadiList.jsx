import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import CheckboxGroup from './CheckboxGroup';
import SlidersGroup from './SlidersGroup';
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
  const [setApplyFilter] = useState(false);
  const [rangeSliderValues, setRangeSliderValues] = useState({
    pid_3: {},
    pid_4: {},
    pid_6: {},
    pid_7: {},
    pid_25: {},
    pid_26: {},
  });

  const [checkboxValues, setCheckboxValues] = useState({
    Soil: [],
    Water: [],
    pH: [],
    Sun: [],
  });

// Define the onApply function to accept an event object
const onApply = (e) => {
  // Prevent the default form submission behavior
  e.preventDefault();
  // Directly call handleCheckboxChange with applyFilter set to true
  handleCheckboxChange(e, true);
};

  // State variable to track checkbox changes
  const [checkboxChanged, setCheckboxChanged] = useState(false);

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

  // Saves suggestion to local storage
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

  // Handles click on search history item
  const handleSearchHistoryClick = (historyItem) => {
    debouncedHandleSearchHistoryClick(historyItem);
  };

  // Handles click outside of search bar and suggestions
  const handleDocumentClick = (e) => {
    const isClickInsideSearchBar = e.target.closest('.search-bar-container');
    const isClickInsideSuggestions = e.target.closest('.suggestions-list');

    if (!isClickInsideSearchBar && !isClickInsideSuggestions) {
      setShowSuggestions(false);
    }
  };

  const deleteTimeoutRef = useRef(null);

  // Debounced function to handle search input with delay
  const debouncedHandleSearch = useRef(
    debounce((query) => {
      if (query.trim() !== '') {
        setShowSuggestions(true);
        setPage(1);
      }
    }, 500)
  ).current;

  // Handles search input
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setShowSuggestions(false);
    }

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }

    deleteTimeoutRef.current = setTimeout(() => {
      debouncedHandleSearch(query);
    }, 300);
  };

  // Handle key press (Enter) for search and backspace for deleting
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery !== '') {
        saveSuggestionToLocalStorage(trimmedQuery);
      }
      setPage(1);
      setShowSuggestions(false);
    } else if (e.key === 'Backspace') {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      if (searchQuery !== '') {
        // Only modify searchQuery if it's not empty
        deleteTimeoutRef.current = setTimeout(() => {
          setSearchQuery(prevQuery => prevQuery.slice(0, -1));
          deleteTimeoutRef.current = null;
        }, 300);
      }
    }
  };

  // Toggles dark mode
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Deletes search history
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

// Merges both useEffect hooks into one
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

  // Loads search history from local storage on component mount
  useEffect(() => {
    const storedSearchHistory = localStorage.getItem('searchHistory');
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }
  }, []);

  // Function to handle sorting by name
  const handleSortByName = () => {
    setSortBy('name');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  // Function to handle sorting by date added
  const handleSortByDateAdded = () => {
    setSortBy('dateAdded');
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

  // Function to handle range slider change
  const handleRangeSliderChange = (e, sliderName) => {
    const newValue = e.target.value;

    setRangeSliderValues(prevState => ({
      ...prevState,
      [sliderName]: { ...prevState[sliderName], value: newValue }
    }));
  };

// Function to handle range input change without triggering search
const handleRangeInputChange = (newValue, sliderName) => {
  if (newValue < rangeSliderValues[sliderName].min) {
    newValue = rangeSliderValues[sliderName].min;
  } else if (newValue > rangeSliderValues[sliderName].max) {
    newValue = rangeSliderValues[sliderName].max;
  }

  // Updates the state with the new input value
  setRangeSliderValues(prevState => ({
    ...prevState,
    [sliderName]: { ...prevState[sliderName], value: newValue }
  }));
};

  const handleSearchAction = () => {
    // Sets the sorting criteria based on the current state
    setSortBy('checkboxes');
    setPage(1);
  
    // Resets the search query to empty
    setSearchQuery('');
  
    // Shows suggestions will be false, as we are not using searchQuery
    setShowSuggestions(false);
  };
  const handleCheckboxChange = async (e, applyFilter = false) => {
    const { name, value } = e.target;
  
    // Updates the checkbox values without directly calling setCheckboxValues
    const updatedCheckboxValues = { ...checkboxValues };
    if (updatedCheckboxValues[name] && updatedCheckboxValues[name].includes(value)) {
      updatedCheckboxValues[name] = updatedCheckboxValues[name].filter((val) => val !== value);
    } else {
      updatedCheckboxValues[name] = [...(updatedCheckboxValues[name] || []), value];
    }
  
    setCheckboxValues(updatedCheckboxValues);
  
    // If applyFilter is true, calls the search action to update the results
    if (applyFilter) {
      // Adds checkbox values to the search query parameters
      const { Soil, Water, pH, Sun } = updatedCheckboxValues;
      const params = {
        limit: 10,
        offset: (page - 1) * 10,
        search: searchQuery.trim(),
        searchSynonyms: true,
        sortBy: sortBy,
        sortDirection: sortDirection,
        Soil: Soil.join(','),
        Water: Water.join(','),
        pH: pH.join(','),
        Sun: Sun.join(','),
      };
  
      // API calls with the updated search query parameters
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/stadi`, { params });
        if (response.status === 200) {
          setStadi(response.data.stadi.filter((item, index, self) =>
            index === self.findIndex((t) => (
              t.id === item.id
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
    }
  };
  
  useEffect(() => {
    setCheckboxChanged(false);
  }, [checkboxValues, setCheckboxChanged]);
  
  const handleResetCheckboxValues = async () => {
    // Clones the current checkbox values object
    const updatedCheckboxValues = { ...checkboxValues };
  
    // Loops through each category
    for (const category in updatedCheckboxValues) {
      // Sets the category's value to an empty array
      updatedCheckboxValues[category] = [];
    }
  
    // Updates the state with the new checkbox values
    setCheckboxValues(updatedCheckboxValues);
  
    // Removes the checkbox values from the search query parameters
    const { Soil, Water, pH, Sun } = updatedCheckboxValues;
    const params = {
      limit: 10,
      offset: (page - 1) * 10,
      search: searchQuery.trim(),
      searchSynonyms: true,
      sortBy: sortBy,
      sortDirection: sortDirection,
    };
  
    // Add scheckbox values to the params only if they are not empty
    if (Soil.length > 0) params.Soil = Soil.join(',');
    if (Water.length > 0) params.Water = Water.join(',');
    if (pH.length > 0) params.pH = pH.join(',');
    if (Sun.length > 0) params.Sun = Sun.join(',');
  
    // Call with the updated search query parameters
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/stadi`, { params });
      if (response.status === 200) {
        setStadi(response.data.stadi.filter((item, index, self) =>
          index === self.findIndex((t) => (
            t.id === item.id
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
  };

// Function to handle reset of slider values
const handleResetSliderValues = async () => {
  const resetSliderValues = {
    pid_3: { min: rangeSliderValues.pid_3.min, max: rangeSliderValues.pid_3.min, value: null },
    pid_4: { min: rangeSliderValues.pid_4.min, max: rangeSliderValues.pid_4.min, value: null },
    pid_6: { min: rangeSliderValues.pid_6.min, max: rangeSliderValues.pid_6.min, value: null },
    pid_7: { min: rangeSliderValues.pid_7.min, max: rangeSliderValues.pid_7.min, value: null },
    pid_25: { min: rangeSliderValues.pid_25.min, max: rangeSliderValues.pid_25.min, value: null },
    pid_26: { min: rangeSliderValues.pid_26.min, max: rangeSliderValues.pid_26.min, value: null },
  };

  setRangeSliderValues(resetSliderValues);

  // Make the API call after resetting the slider values
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/stadi`, {
      params: {
        limit: 10,
        offset: (page - 1) * 10,
        search: searchQuery.trim(),
        searchSynonyms: true,
        sortBy: sortBy,
        sortDirection: sortDirection,
        // Exclude slider values from the query
      },
    });

    if (response.status === 200) {
      setStadi(response.data.stadi.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.id === item.id
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
};

return (
  <div className="p-4">
    {/* Container for flex layout */}
    <div className={`container mx-auto`}>
      <div className="flex flex-col items-center">
        <h1 className={`text-2xl md:text-3xl font-bold mb-2 md:mb-4`}>
          Plant Records
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
        {/* Filter by Range Sliders */}
          <li
            onClick={() => setSortBy('rangeSliders')}
            className={`cursor-pointer ${sortBy === 'rangeSliders' ? 'font-bold' : ''} flex justify-between border p-2 rounded-md hover:bg-gray-100`}
          >
            <button>Filter by Range Sliders</button>
            <div className="button-container">
              <button
                className="default-btn"
                onClick={handleResetSliderValues}
              >
                Reset
              </button>
            <button
              className="default-btn"
              onClick={(e) => {
                e.stopPropagation();
                onApply(e);
              }}
            >
              Apply
            </button>
          </div>
          </li>
    
        {/* Filter by Checkboxes */}
          <li
            onClick={() => setSortBy('checkboxes')}
            className={`cursor-pointer ${sortBy === 'checkboxes' ? 'font-bold' : ''} flex justify-between border p-2 rounded-md hover:bg-gray-100`}
          >
            <button>Filter by Checkboxes</button>
            <div className="button-container">
              <button
                className="default-btn"
                onClick={handleResetCheckboxValues}
              >
                Reset
              </button>
              <button
                className="default-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(e);
                }}
              >
                Apply
              </button>
            </div>
          </li>
        </ul>
      </div>
    )}
    {/* Range Sliders Component */}
    {sortBy === 'rangeSliders' && (
        <SlidersGroup
          rangeSliderValues={rangeSliderValues}
          handleRangeSliderChange={handleRangeSliderChange}
          handleRangeInputChange={handleRangeInputChange}
        />
      )}
    {/* Checkbox Component */}
    {sortBy === 'checkboxes' && <CheckboxGroup
      checkboxValues={checkboxValues}
      handleCheckboxChange={handleCheckboxChange}
      onApply={() => handleCheckboxChange(null, true)}
    />}
    {/* Search History Container */}
    {showHistory && (
      <div className='search-history-container border p-4 rounded-md shadow-md mb-4 w-full md:w-1/2 mx-auto relative'>
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
      <div className='flex justify-center text-center'>
        <button onClick={deleteSearchHistory} className='clear-history-button bg-white text-black px-4 py-2 rounded-md mr-2 mb-2 border-none hover:bg-gray-200'>
          Clear History
        </button>
        </div>
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
