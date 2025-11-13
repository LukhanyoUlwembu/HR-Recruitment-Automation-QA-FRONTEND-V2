import React, { useEffect } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

const AddressInput = ({ onAddressSelect, valueProp }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "za" },
    },
    debounce: 300,
  });

  useEffect(() => {
    if (valueProp && valueProp !== value) {
      setValue(valueProp);
    }
  }, [valueProp]);

 const handleSelect = async (address) => {
  setValue(address, false);
  clearSuggestions();

  try {
    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);

    const components = results[0].address_components;

    const getComponent = (type) =>
      components.find((c) => c.types.includes(type))?.long_name || "";

    const city =
      getComponent("locality") || getComponent("administrative_area_level_2");
    const street = getComponent("route");
    const zip = getComponent("postal_code");

    const provinceComponent = components.find((component) =>
      component.types.includes("administrative_area_level_1")
    );

    const province = provinceComponent?.long_name || "";
    const formattedProvince = province.replace(/\s/g, "_");

    onAddressSelect({
      address,
      city,
      street,
      zip,
      lat,
      lng,
      province: formattedProvince,
    });
  } catch (error) {
    console.error("Autocomplete Error:", error);
  }
};


  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Enter address..."
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
      {status === "OK" && (
        <ul className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-48 overflow-y-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(description)}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AddressAutocomplete = (props) => {
  return <AddressInput {...props} />;
};

export default AddressAutocomplete;