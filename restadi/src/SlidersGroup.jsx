import React from 'react';

const SlidersGroup = ({ rangeSliderValues, handleRangeSliderChange, handleRangeInputChange }) => {
  return (
    <div className="sliders-container p-4 border rounded-md w-full md:w-2/4 mx-auto mb-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Height Min */}
        <div className="text-center height-min">
          <label className="mb-2 block font-bold border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Height Min</label>
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
            className={'mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}
            value={rangeSliderValues.pid_3.value || rangeSliderValues.pid_3.min}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              handleRangeInputChange(newValue, 'pid_3');
            }}
          />
        </div>
        {/* Height Max */}
        <div className="text-center height-max">
          <label className="mb-2 block font-bold border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Height Max</label>
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
            className={'mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}
            value={rangeSliderValues.pid_4.value || rangeSliderValues.pid_4.min}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              handleRangeInputChange(newValue, 'pid_4');
            }}
          />
        </div>
        {/* Width Min */}
        <div className="text-center width-min">
          <label className="mb-2 block font-bold border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Width Min</label>
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
            className={'mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}
            value={rangeSliderValues.pid_6.value || rangeSliderValues.pid_6.min}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              handleRangeInputChange(newValue, 'pid_6');
            }}
          />
        </div>
        {/* Width Max */}
        <div className="text-center width-max">
          <label className="mb-2 block font-bold border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Width Max</label>
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
            className={'mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}
            value={rangeSliderValues.pid_7.value || rangeSliderValues.pid_7.min}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              handleRangeInputChange(newValue, 'pid_7');
            }}
          />
        </div>
        {/* Height Flowers */}
        <div className="text-center height-flowers">
          <label className="mb-2 block font-bold border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Height Flowers</label>
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
            className={'mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}
            value={rangeSliderValues.pid_25.value || rangeSliderValues.pid_25.min}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              handleRangeInputChange(newValue, 'pid_25');
            }}
          />
        </div>
        {/* Height Leaves */}
        <div className="text-center height-leaves">
          <label className="mb-2 block font-bold border-b-3 border-gray-500 bg-gradient-to-t from-transparent to-gray-300 text-center">Height Leaves</label>
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
            className={'mt-2 w-20 p-1 border rounded-md focus:outline-none focus:border-blue-500 text-center bg-gray-100'}
            value={rangeSliderValues.pid_26.value || rangeSliderValues.pid_26.min}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              handleRangeInputChange(newValue, 'pid_26');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SlidersGroup;