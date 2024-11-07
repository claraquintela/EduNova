import Button from "components/Button/Button";
import React, { useState, useEffect } from "react";
import cake from "assets/imgs/birthday-cake-svgrepo-com.svg";

export default function UserIndex({ t }) {
  // State management
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    birthday: "",
    privilege: "",
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Helper functions
  const formatDate = (date) => {
    if (!date) return "Not set";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    return date;
  };

  // Fetch current user and users list on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setCurrentUser(userData);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("http://localhost:5000/api/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        throw new Error("Authentication required");
      }

      // Validations
      if (!editFormData.email?.trim()) {
        throw new Error("Email is required");
      }
      if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
        throw new Error("Invalid email format");
      }

      // Prepare update payload
      const updatePayload = {
        email: editFormData.email,
        birthday: editFormData.birthday || null,
      };

      // Se é admin, incluir privilege_id
      if (currentUser.privilege?.name === "admin" && editFormData.privilege) {
        const privilegeMap = {
          admin: 1,
          teacher: 2,
          subscriber: 3,
        };

        updatePayload.privilege_id = privilegeMap[editFormData.privilege];
      }

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log("Could not parse response as JSON:", responseText);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP error! status: ${response.status}`
        );
      }

      await fetchUsers();
      setEditingId(null);
      setEditFormData({
        email: "",
        birthday: "",
        privilege: "",
      });
      setError(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(t("user.delete_confirm"))) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message);
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setEditFormData({
      email: user.email || "",
      birthday: user.birthday || "",
      privilege:
        typeof user.privilege === "string"
          ? user.privilege
          : user.privilege?.name || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      email: "",
      birthday: "",
      privilege: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    if (!users.length) return [];
    return [...users].sort((a, b) => {
      if (!sortConfig.key) return 0;

      // Tratamento especial para username/name
      if (sortConfig.key === "username") {
        const aName = (a.username || a.name || "").toLowerCase();
        const bName = (b.username || b.name || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      // Para outros campos
      const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [users, sortConfig]);
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isBirthday = (birthday) => {
    if (!birthday) return false;
    const today = new Date();
    const birthDate = new Date(birthday);
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  return (
    <div className="flex flex-wrap">
      <div className="w-full px-3 sm:w-[80%] sm:mx-0 mb-16 sm:mb-24">
        <h2 className="mb-[2rem] p-3">{t("user_list_titre")}</h2>
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full divide-y text-center divide-gray-200 bg-[--azul-escuro] mt-4 rounded-lg mb-[4rem]">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("username")}
                  className="px-6 py-3 text-xs font-large text-center text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <span
                    className={sortConfig.key === "username" ? "font-bold" : ""}
                  >
                    {t("user.username")}{" "}
                    {sortConfig.key === "username"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : "⇅"}
                  </span>
                </th>
                <th className="px-6 py-3 text-center text-xs font-large text-gray-500 uppercase tracking-wider">
                  {t("user.email")}
                </th>
                <th className="px-6 py-3 text-center text-xs font-large text-gray-500 uppercase tracking-wider">
                  {t("user.birthday")}
                </th>
                <th className="px-6 py-3 text-center text-xs font-large text-gray-500 uppercase tracking-wider">
                  {t("user.privilege")}
                </th>
                <th className="px-6 py-3 text-center text-xs font-large text-gray-500 uppercase tracking-wider">
                  {t("user.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[--azul-escuro] divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-white">
                    {user.username || user.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-white">
                    {editingId === user.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-black rounded"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-white">
                    {editingId === user.id ? (
                      <input
                        type="date"
                        name="birthday"
                        value={formatDateForInput(editFormData.birthday)}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-black rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {formatDate(user.birthday)}
                        {isBirthday(user.birthday) && (
                          <img src={cake} alt="Birthday" className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-white">
                    {editingId === user.id &&
                    currentUser?.privilege?.name === "admin" ? (
                      <select
                        name="privilege"
                        value={editFormData.privilege}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-black rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="student">Student</option>
                        <option value="subscriber">Subscriber</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          (typeof user.privilege === "string"
                            ? user.privilege
                            : user.privilege?.name) === "admin"
                            ? "bg-purple-200 text-purple-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {typeof user.privilege === "string"
                          ? user.privilege
                          : user.privilege?.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    {editingId === user.id ? (
                      <>
                        <Button
                          onClick={() => handleUpdate(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {t("btn_save")}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          {t("btn_cancel")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => handleEditClick(user)}>
                          {t("btn_edit")}
                        </Button>
                        <Button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("btn_delete")}
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
