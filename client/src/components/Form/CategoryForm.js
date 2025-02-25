import React from "react";

const CategoryForm = ({ handleSubmit, value, setValue }) => {
  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
    setValue(""); // Clear input after submission
  };

  return (
    <form onSubmit={onSubmit} aria-label="category-form">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter new category"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!value?.trim()}
      >
        Submit
      </button>
    </form>
  );
};

export default CategoryForm;
