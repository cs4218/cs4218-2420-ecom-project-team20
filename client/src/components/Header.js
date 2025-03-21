import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import SearchInput from "./Form/SearchInput";
import useCategory from "../hooks/useCategory";
import { useCart } from "../context/cart";
import { Badge } from "antd";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cart] = useCart();
  const categories = useCategory();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    navigate("/login");

    setTimeout(() => {
      toast.success("Logout Successfully");
    }, 500);
  };
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo01"
            aria-controls="navbarTogglerDemo01"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
            <Link to="/" className="navbar-brand">
              🛒 Virtual Vault
            </Link>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {!auth?.user ? (
                <>
                  <SearchInput />
                  <li className="nav-item">
                    <NavLink to="/" className="nav-link ">
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link dropdown-toggle"
                      to={"/categories"}
                      data-bs-toggle="dropdown"
                    >
                      Categories
                    </Link>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item" to={"/categories"}>
                          All Categories
                        </Link>
                      </li>
                      {categories?.map((c) => (
                        <li key={c.slug}>
                          <Link
                            className="dropdown-item"
                            to={`/category/${c.slug}`}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/register" className="nav-link">
                      Register
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/login" className="nav-link">
                      Login
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <SearchInput />
                  <li className="nav-item">
                    <NavLink to="/" className="nav-link ">
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link dropdown-toggle"
                      to={"/categories"}
                      data-bs-toggle="dropdown"
                    >
                      Categories
                    </Link>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item" to={"/categories"}>
                          All Categories
                        </Link>
                      </li>
                      {categories?.map((c) => (
                        <li key={c.slug}>
                          <Link
                            className="dropdown-item"
                            to={`/category/${c.slug}`}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                    >
                      {auth?.user?.name}
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <NavLink
                          to={`/dashboard/${
                            auth?.user?.role === 1 ? "admin" : "user"
                          }`}
                          className="dropdown-item"
                        >
                          Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={(e) => handleLogout(e)}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item d-flex align-items-center">
                    <Badge count={cart?.length} showZero>
                      <NavLink to="/cart" className="nav-link ">
                        Cart
                      </NavLink>
                    </Badge>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
