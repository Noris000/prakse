import React from 'react';

const CheckboxGroup = ({ checkboxValues, handleCheckboxChange }) => {

  return (
    // Container for checkboxes with grid layout
    <div className="checkboxes-container grid gap-4 grid-cols-2 p-4 border rounded-md w-full md:w-2/4 mx-auto mb-4">
      {/* Soil checkboxes */}
      <div>
        {/* Soil section title */}
        <h2 className="font-bold text-lg border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Soil</h2>
        <div className="p-1">
          {/* Individual soil checkboxes */}
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Soil"
              checked={checkboxValues['Soil'].includes('2')}
              value="2"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Clay
          </label>
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Soil"
              checked={checkboxValues['Soil'].includes('3')}
              value="3"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Loam
          </label>
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Soil"
              checked={checkboxValues['Soil'].includes('4')}
              value="4"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Sand
          </label>
          <label className="block font-bold">
            <input
              type="checkbox"
              name="Soil"
              checked={checkboxValues['Soil'].includes('1')}
              value="1"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Chalk
          </label>
        </div>
      </div>
      {/* Water checkboxes */}
      <div>
        {/* Water section title */}
        <h2 className="font-bold text-lg border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Water</h2>
        <div className="p-1">
          {/* Individual water checkboxes */}
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Water"
              checked={checkboxValues['Water'].includes('1')}
              value="1"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Well
          </label>
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Water"
              checked={checkboxValues['Water'].includes('3')}
              value="3"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Poorly
          </label>
          <label className="block font-bold ">
            <input
              type="checkbox"
              name="Water"
              checked={checkboxValues['Water'].includes('2')}
              value="2"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Moist but well
          </label>
        </div>
      </div>
      {/* pH checkboxes */}
      <div>
        {/* pH section title */}
        <h2 className="font-bold text-lg border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">pH</h2>
        <div className="p-1">
          {/* Individual pH checkboxes */}
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="pH"
              checked={checkboxValues['pH'].includes('1')}
              value="1"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Acid 0-6.5
          </label>
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="pH"
              checked={checkboxValues['pH'].includes('2')}
              value="2"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Alkaline 7.4+
          </label>
          <label className="block font-bold">
            <input
              type="checkbox"
              name="pH"
              checked={checkboxValues['pH'].includes('3')}
              value="3"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Neutral 6.6–7.3
          </label>
        </div>
      </div>
      {/* Sunlight checkboxes */}
      <div>
        {/* Sunlight section title */}
        <h2 className="font-bold text-lg border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Sunlight</h2>
        <div className="p-1">
          {/* Individual sunlight checkboxes */}
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Sun"
              checked={checkboxValues['Sun'].includes('1')}
              value="1"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Full sun
          </label>
          <label className="mb-2 block font-bold">
            <input
              type="checkbox"
              name="Sun"
              checked={checkboxValues['Sun'].includes('2')}
              value="2"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Partial shade
          </label>
          <label className="block font-bold">
            <input
              type="checkbox"
              name="Sun"
              checked={checkboxValues['Sun'].includes('3')}
              value="3"
              onChange={(e) => handleCheckboxChange(e)}
            />
            Full shade
          </label>
        </div>
      </div>
    </div>
  );
};

// Exporting the CheckboxGroup component as default
export default CheckboxGroup;
