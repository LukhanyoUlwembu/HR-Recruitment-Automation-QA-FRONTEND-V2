    import React from "react";

    const Input = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required,
    maxLength,
    error,
    }) => {
    return (
        <div className="mb-2 w-full">
        {label && (
            <label className="block text-sm font-medium mb-1" htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <input
            name={name}
            type={type}
            value={value}
            maxLength={maxLength}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label}`}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
            error ? "border-red-500" : "border-gray-300"
            }`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
    };

    export default Input;
