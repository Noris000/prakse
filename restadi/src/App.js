import React, { useState } from 'react';
import StadiList from './StadiList';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className = "App" data-theme={`${darkMode ? 'dark' : 'light'}`}>
      <StadiList darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
};

export default App;