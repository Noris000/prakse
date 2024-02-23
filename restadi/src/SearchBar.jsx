import React from 'react';

const SearchBar = ({ darkMode, searchQuery, setSearchQuery, showSuggestions, setShowSuggestions, handleKeyPress, handleSearch, handleSuggestionClick, suggestions }) => {
  return (
    <div className="search-bar-container w-full md:w-2/3 mb-2 relative">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyPress}
        className={`search-input w-full p-2 border rounded-md shadow-sm ${
          darkMode ? 'bg-gray-500 text-white' : 'bg-white text-black'
        }`}
      />
      {showSuggestions && Array.isArray(suggestions) && suggestions.length > 0 && (
        <ul className={`suggestions-list mt-2 absolute w-full z-10 border border-gray-300 rounded-md ${darkMode ? 'bg-gray-500' : 'bg-white'}`}>
          {suggestions
            .filter((suggestion) => suggestion.base_name.trim() !== '')
            .map((suggestion, index) => (
              <li
                key={`${suggestion.id}_${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`cursor-pointer p-2 ${darkMode ? 'text-white' : 'text-black'} ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <div>
                  <strong>{suggestion.base_name}</strong>
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