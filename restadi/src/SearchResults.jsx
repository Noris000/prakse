import React from 'react';

const SearchResults = ({
  stadi,
  loading,
  error,
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
            <li key={`${item.id}_${index}`} className="stadi-item border p-4 rounded-md shadow-md mb-4 w-full md:w-1/2 mx-auto relative">
              <div className="absolute top-0 right-0 p-2 bg-gray-100 text-black rounded-bl-lg"><strong className="text-lg font-semibold ">ID:</strong> {item.id}<br /> </div>
              <strong className="text-lg font-semibold">Base Name:</strong> {item.base_name}<br />
              <strong className="text-lg font-semibold">Date Added:</strong> {item.date_added}<br />
              <strong className="text-lg font-semibold">Base Description:</strong> {item.base_descr}<br />
              <div className="type-name-container">
                <button
                  className='type-name-button  bg-white hover:bg-gray-200 px-2 py-1 rounded-md border border-black'
                  onClick={() => toggleShowTypeAndName(index)}
                >
                  {showNames[index] ? 'Hide Info' : 'Show Info'}
                </button>
              </div>
              {showNames[index] && (
                <div className="plant-info card border border-gray-300 rounded-md mt-4">
                  <div className="info-columns grid grid-cols-2">
                    <div className="characteristics p-4">
                      <h2><strong className="text-3xl">Characteristics:</strong></h2>
                      <ul>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Flowers:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.flowers && Array.isArray(item.additional_properties.flowers) && item.additional_properties.flowers.length > 0 &&
                            item.additional_properties.flowers.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Crown:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.crown && Array.isArray(item.additional_properties.crown) && item.additional_properties.crown.length > 0 &&
                            item.additional_properties.crown.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Foliage:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.foliage && Array.isArray(item.additional_properties.foliage) && item.additional_properties.foliage.length > 0 &&
                            item.additional_properties.foliage.join(', ')
                          }
                        </li>
                        <li className="mb-2"><strong className="underline decoration-2">Description:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.description && Array.isArray(item.additional_properties.description) && item.additional_properties.description.length > 0 &&
                            item.additional_properties.description.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Purposes:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.purposes && Array.isArray(item.additional_properties.purposes) && item.additional_properties.purposes.length > 0 &&
                            item.additional_properties.purposes.join(', ')
                          }
                        </li>
                      </ul>
                    </div>
                    <div className="environment p-4">
                      <h2><strong className="text-3xl">Environment:</strong></h2>
                      <ul>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Soil:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.soil && Array.isArray(item.additional_properties.soil) && item.additional_properties.soil.length > 0 &&
                            item.additional_properties.soil.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Water:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.water && Array.isArray(item.additional_properties.water) && item.additional_properties.water.length > 0 &&
                            item.additional_properties.water.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">pH:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.ph && Array.isArray(item.additional_properties.ph) && item.additional_properties.ph.length > 0 &&
                            item.additional_properties.ph.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Sunlight:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.sunlight && Array.isArray(item.additional_properties.sunlight) && item.additional_properties.sunlight.length > 0 &&
                            item.additional_properties.sunlight.join(', ')
                          }
                        </li>
                        <li className="mb-2 mt-4"><strong className="underline decoration-2">Companions:</strong></li>
                        <li className="mb-1">
                          {item.additional_properties.companions && Array.isArray(item.additional_properties.companions) && item.additional_properties.companions.length > 0 &&
                            item.additional_properties.companions.join(', ')
                          }
                        </li>
                      </ul>
                    </div>
                  </div>
                <div className='aliases p-4'>
                <h2><strong className="text-3xl">Aliases:</strong></h2>
                  <li className="mb-2"><strong className="underline decoration-2">Synonyms:</strong></li>
                        {item.synonyms && Array.isArray(item.synonyms) && item.synonyms.length > 0 && (
                          <table className="border-collapse border border-gray-300">
                            <tbody>
                              {item.synonyms.map((synonym, idx) => (
                                <tr key={idx}>
                                  <td className="border border-gray-300 px-4 py-2">{synonym.type}</td>
                                  <td className="border border-gray-300 px-4 py-2">{synonym.name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                  {item.links && Array.isArray(item.links) && item.links.length > 0 && (
                          <>
                            <li className="mb-2 mt-4"><strong className="underline decoration-2">Links:</strong></li>
                            <ul className="info-list">
                              {item.links.map((link, idx) => (
                                <li key={idx} className="mb-1 underline decoration-1">
                                  <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                  </div>
                </div>
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

