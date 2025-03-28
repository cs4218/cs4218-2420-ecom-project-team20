import React from "react";
import Layout from "./../components/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate();

  console.log("Search values", values);

  return (
    <Layout title={ "Search results" }>
      <div className="container">
        <div className="text-center">
          <h1>Search Results</h1>
          <h6>
            { values?.results.length < 1
              ? "No Products Found"
              : `Found ${ values?.results.length }` }
          </h6>
          <div className="d-flex flex-wrap mt-4">
            {values?.results.map((p) => (
              <div className="card m-2" style={ { width: "18rem" } }>
                <img
                  src={ `/api/v1/product/product-photo/${ p._id }` }
                  className="card-img-top"
                  alt={ p.name }
                  data-testid={`s-img-${p.name}`}
                />
                <div className="card-body">
                  <h5 className="card-title">{ p.name }</h5>
                  <p className="card-text">{ p.description.substring(0, 30) }...</p>
                  <p className="card-text">
                    { p.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  }) }
                  </p>
                  <button
                    class="btn btn-primary ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                    data-testid={`s-md-button-${p.slug}`}
                  >
                    More Details
                  </button>
                  {/* TODO: Add in add to cart feature...? */}
                  <button class="btn btn-secondary ms-1">ADD TO CART</button>
                </div>
              </div>
            )) }
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
