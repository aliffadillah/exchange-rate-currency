import { useState, useEffect } from 'react';
import ConverterForm from "./components/ConverterForm"

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <button 
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

const App = () => {
  return (
    <div className="currency-converter">
      <div className="converter-header">
        <h2 className="converter-title">💱 Currency Converter</h2>
        <ThemeToggle />
      </div>
      <ConverterForm />
    </div>
  )
}

export default App;