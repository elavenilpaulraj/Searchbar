import React, { useState, useEffect, useCallback } from 'react';
import './SearchBar.css';

interface Country {
  id: number;
  name: string;
  capital?: string;
}

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json');
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data = await response.json();
        setCountries(data);
      } catch (err) {
        setError('Error fetching countries. Please try again later.');
        console.error('Error fetching countries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const searchCountries = (value: string) => {
    if (value.length > 0) {
      const filteredSuggestions = countries.filter(country =>
        country.name.toLowerCase().includes(value.toLowerCase()) ||
        country.capital?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const debouncedSearch = useCallback(debounce(searchCountries, 300), [countries]);

  const handleSuggestionClick = (country: Country) => {
    setSearchTerm(country.name);
    setSuggestions([]);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for a country or capital..."
        value={searchTerm}
        onChange={handleInputChange}
      />
      {isLoading && <div className="loading">Loading countries...</div>}
      {error && <div className="error">{error}</div>}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((country) => (
            <li
              key={country.id}
              onClick={() => handleSuggestionClick(country)}
            >
              <span className="country-name">{country.name}</span>
              {country.capital && <span className="country-capital"> - {country.capital}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;