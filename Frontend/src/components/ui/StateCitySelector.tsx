import React, { useState, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';
import { State, City } from 'country-state-city';
import { Label } from '@/components/ui/label';

interface Option {
  value: string;
  label: string;
}

interface StateCitySelectorProps {
  selectedState?: string;
  selectedCity?: string;
  onStateChange: (stateName: string) => void;
  onCityChange: (cityName: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  placeholder?: {
    state?: string;
    city?: string;
  };
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const StateCitySelector: React.FC<StateCitySelectorProps> = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  stateLabel = "State",
  cityLabel = "City",
  placeholder = {
    state: "Select State",
    city: "Select City"
  },
  required = false,
  disabled = false,
  className = ""
}) => {
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [cityOptions, setCityOptions] = useState<Option[]>([]);

  // Load Indian states on component mount
  useEffect(() => {
    try {
      const indianStates = State.getStatesOfCountry('IN');
      // console.log('Loaded states:', indianStates);
      
      const stateOptions = indianStates.map(state => ({
        value: state.name, 
        label: state.name 
      }));
      
      setStateOptions(stateOptions);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      try {
        // Find state by name to get its ISO code
        const stateData = State.getStatesOfCountry('IN').find(
          state => state.name === selectedState
        );
        
        // console.log('Selected state data:', stateData);
        
        if (stateData) {
          const cities = City.getCitiesOfState('IN', stateData.isoCode);
          // console.log('Loaded cities:', cities);
          
          const cityOptions = cities.map(city => ({
            value: city.name,
            label: city.name
          }));
          
          setCityOptions(cityOptions);
          
          // Reset city if it doesn't exist in new state
          if (selectedCity && !cities.some(city => city.name === selectedCity)) {
            onCityChange('');
          }
        }
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    } else {
      setCityOptions([]);
      onCityChange('');
    }
  }, [selectedState, selectedCity, onCityChange]);

  const handleStateChange = (selectedOption: SingleValue<Option>) => {
    const stateName = selectedOption?.value || '';
    console.log('State changed to:', stateName);
    onStateChange(stateName);
  };

  const handleCityChange = (selectedOption: SingleValue<Option>) => {
    const cityName = selectedOption?.value || '';
    console.log('City changed to:', cityName);
    onCityChange(cityName);
  };

  // Custom styles for react-select to match your UI
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))'
      },
      minHeight: '40px',
      fontSize: '14px',
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      cursor: 'pointer'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--primary))' 
        : state.isFocused 
        ? 'hsl(var(--accent))' 
        : 'transparent',
      color: state.isSelected 
        ? 'hsl(var(--primary-foreground))' 
        : 'hsl(var(--foreground))',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 12px'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))'
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: '200px',
      padding: '4px'
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))'
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--foreground))'
      }
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--foreground))'
      }
    })
  };

  // console.log('Current state options:', stateOptions);
  // console.log('Current city options:', cityOptions);
  // console.log('Selected state:', selectedState); 
  // console.log('Selected city:', selectedCity); 

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="state">
          {stateLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select
          id="state"
          value={selectedState ? { 
            value: selectedState, 
            label: selectedState 
          } : null}
          onChange={handleStateChange}
          options={stateOptions}
          placeholder={placeholder.state}
          isSearchable
          isClearable
          isDisabled={disabled}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
          noOptionsMessage={() => "No states found"}
          loadingMessage={() => "Loading states..."}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">
          {cityLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select
          id="city"
          value={selectedCity ? { 
            value: selectedCity, 
            label: selectedCity 
          } : null}
          onChange={handleCityChange}
          options={cityOptions}
          placeholder={selectedState ? placeholder.city : "Select State First"}
          isSearchable
          isClearable
          isDisabled={disabled || !selectedState}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
          noOptionsMessage={() => selectedState ? "No cities found" : "Please select a state first"}
          loadingMessage={() => "Loading cities..."}
        />
      </div>
    </div>
  );
};

export default StateCitySelector;