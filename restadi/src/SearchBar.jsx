// Importing React and useState hook from React library
import React, { useState } from 'react';

// Functional component for the search bar
const SearchBar = ({ darkMode, searchQuery, setSearchQuery, showSuggestions, setShowSuggestions, handleKeyPress, handleSearch, handleSuggestionClick, suggestions }) => {
  // State to manage the input value
  const [inputValue, setInputValue] = useState('');

  // Function to handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    handleSearch(value);
  };
  
  // Function to handle suggestion click
  const handleClickSuggestion = (suggestion) => {
    handleSuggestionClick(suggestion);
    setInputValue('');
  };

  // Function to handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Function to handle input blur
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Function to handle key press (Enter) for search
  const handleKeyPressLocal = (e) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
      setShowSuggestions(false);
    }
    handleKeyPress(e);
  };

  return (
    <div className="search-bar-container w-full md:w-2/3 mb-2 relative">
      {/* Search input field */}
      <input
        type="text"
        placeholder="Search..."
        value={inputValue !== '' ? inputValue : searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyPressLocal}
        className='search-input w-full p-2 border rounded-md shadow-sm'
      />
      {/* Suggestions dropdown */}
      {showSuggestions && Array.isArray(suggestions) && suggestions.length > 0 && (
        <ul className='suggestions-list mt-2 absolute w-full z-10 border border-gray-300 rounded-md bg-white'>
          {suggestions
            .filter((suggestion) => suggestion.base_name.trim() !== '')
            .map((suggestion, index) => (
              <li
                key={`${suggestion.id}_${index}`}
                onClick={() => handleClickSuggestion(suggestion)}
                className='cursor-pointer p-2 hover:bg-gray-200'
              >
                <div>
                  <strong>{suggestion.base_name}</strong>
                  {/* Displaying synonyms if available */}
                  {suggestion.synonyms && suggestion.synonyms.length > 0 && (
                    <ul className="ml-4">
                      {suggestion.synonyms.map((synonym, idx) => (
                        <li key={`${suggestion.id}_${synonym}_${idx}`}>{synonym.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;