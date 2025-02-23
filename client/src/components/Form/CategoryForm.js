import React from "react";

const CategoryForm = ({ handleSubmit, value, setValue }) => {
  const onSubmit = (e) => {
    e.preventDefault();
    console.log("form submitted prevent default called");
    handleSubmit(e);
    setValue("");
  };

  return (
    <form onSubmit={onSubmit} data-testid="category-form">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter new category"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default CategoryForm;
