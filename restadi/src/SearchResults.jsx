import React from 'react';

const SearchResults = ({
  stadi,
  loading,
  error,
  darkMode,
  showNames,
  lastStadiElementRef,
  toggleShowTypeAndName
}) => {
  return (
    <div>
      {error && <p className="error-message text-red-500 mt-4">{error}</p>}
      <ul className="stadi-list">
        {Array.isArray(stadi) && stadi.length === 0 && !loading ? (
          <p className="no-data text-gray-500">No data found</p>
        ) : (
          stadi.map((item, index) => (
            <li key={`${item.id}_${index}`} className="stadi-item border p-4 rounded-md shadow-md mb-4 w-full md:w-1/2 mx-auto">
              <strong className="text-lg font-semibold">ID:</strong> {item.id}<br />
              <strong className="text-lg font-semibold">Base Name:</strong> {item.base_name}<br />
              <strong className="text-lg font-semibold">Date Added:</strong> {item.date_added}<br />
              <strong className="text-lg font-semibold">Base Description:</strong> {item.base_descr}<br />
              <div className="type-name-container">
                <button
                  className={`type-name-button ${
                    darkMode ? 'dark-mode-toggle bg-gray-500 text-white hover:bg-gray-600' : 'light-mode-toggle bg-white text-black hover:bg-gray-200'
                  } px-2 py-1 rounded-md ${
                    darkMode ? '' : 'border border-black'
                  }`}
                  onClick={() => toggleShowTypeAndName(index)}
                >
                  {showNames[index] ? 'Hide Info' : 'Show Info'}
                </button>
              </div>
              {showNames[index] && item.synonyms && Array.isArray(item.synonyms) && item.synonyms.length > 0 && (
                <ul className="synonyms-list mt-2">
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
      {loading && (
        <div className="flex justify-center items-center h-full mt-8">
          <div className="w-24 h-24 rounded-full animate-spin border-8 border-solid border-green-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
