const FormSelect = ({ label, id, name, value, onChange, options, disabled, placeholder }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="" disabled>{placeholder || `Select ${label.toLowerCase()}`}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default FormSelect;
