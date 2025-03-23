import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminMenu from "../../components/AdminMenu";
import Layout from "../../components/Layout";

const Users = () => {
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-users");
      setUsers(data.users);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting users");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Layout title={"All Users Data"}>
      <div className="row dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1 className="text-center">All Users</h1>
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id}>
                    <td>{i + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role === 1 ? "Admin" : "User"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Users;
