import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronDown, X } from 'lucide-react';

const CountrySelector = ({ 
  countries, 
  popularCountries, 
  selectedCountry, 
  onCountryChange, 
  loading,
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get selected country details
  const selectedCountryData = countries.find(c => c.iso === selectedCountry) || 
                             popularCountries.find(c => c.iso === selectedCountry);

  // Handle search with debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        if (onSearch) {
          const results = await onSearch(searchQuery);
          setSearchResults(results || []);
        } else {
          // Fallback to client-side filtering
          const filtered = countries.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.iso.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, countries, onSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCountrySelect = (country) => {
    onCountryChange(country.iso);
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const getDisplayCountries = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults;
    }
    return popularCountries.length > 0 ? popularCountries : countries.slice(0, 15);
  };

  return (
    <div className="country-selector" ref={dropdownRef}>
      {/* Selected Country Display */}
      <button
        className={`country-selector-button ${isOpen ? 'open' : ''} ${loading ? 'loading' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <div className="selected-country">
          {selectedCountryData ? (
            <>
              <img 
                src={selectedCountryData.flag} 
                alt={`${selectedCountryData.name} flag`}
                className="country-flag"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="country-name">{selectedCountryData.name}</span>
              <span className="country-code">({selectedCountryData.iso})</span>
            </>
          ) : (
            <>
              <Globe size={20} />
              <span className="country-name">Select Country</span>
            </>
          )}
        </div>
        
        <ChevronDown 
          size={20} 
          className={`dropdown-icon ${isOpen ? 'rotated' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="country-dropdown">
          {/* Search Input */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="clear-search"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Loading State */}
          {(loading || isSearching) && (
            <div className="dropdown-loading">
              <div className="loading-spinner small"></div>
              <span>Loading...</span>
            </div>
          )}

          {/* Search Results or Popular Countries */}
          <div className="countries-list">
            {searchQuery.trim() && searchResults.length === 0 && !isSearching ? (
              <div className="no-results">
                <p>No countries found for "{searchQuery}"</p>
              </div>
            ) : (
              <>
                {/* Section Header */}
                <div className="section-header">
                  {searchQuery.trim() ? (
                    <span>Search Results ({searchResults.length})</span>
                  ) : (
                    <span>Popular Countries</span>
                  )}
                </div>

                {/* Countries List */}
                {getDisplayCountries().map((country) => (
                  <button
                    key={country.iso}
                    className={`country-option ${country.iso === selectedCountry ? 'selected' : ''}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <img 
                      src={country.flag} 
                      alt={`${country.name} flag`}
                      className="country-flag"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="country-info">
                      <span className="country-name">{country.name}</span>
                      <span className="country-code">{country.iso}</span>
                    </div>
                    {country.iso === selectedCountry && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </button>
                ))}

                {/* Show All Countries Link */}
                {!searchQuery.trim() && popularCountries.length > 0 && countries.length > popularCountries.length && (
                  <button 
                    className="show-all-countries"
                    onClick={() => setSearchQuery(' ')} // Trigger search to show all
                  >
                    Show all {countries.length} countries...
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for mobile
export const CountrySelector_Mobile = ({ 
  countries, 
  selectedCountry, 
  onCountryChange 
}) => {
  const selectedCountryData = countries.find(c => c.iso === selectedCountry);

  return (
    <div className="country-selector-mobile">
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        className="mobile-select"
      >
        {countries.map(country => (
          <option key={country.iso} value={country.iso}>
            {country.name} ({country.iso})
          </option>
        ))}
      </select>
      
      {selectedCountryData && (
        <img 
          src={selectedCountryData.flag} 
          alt={`${selectedCountryData.name} flag`}
          className="mobile-flag"
        />
      )}
    </div>
  );
};

export default CountrySelector;