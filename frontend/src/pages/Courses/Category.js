import Button from "components/Button/Button";
import React, { useState, useEffect } from "react";

export default function Category({ t, language }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
  });

  // Fetch current user and users list on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log(userData);
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("http://localhost:5000/api/categories/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("response: ", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    console.log("teste");
  };

  const handleSort = async (categoryId) => {
    console.log("teste");
  };

  const handleUpdate = async (categoryId) => {
    console.log("teste");
  };

  const handleEditClick = async (categoryId) => {
    console.log("teste");
  };

  const handleCancelEdit = async (categoryId) => {
    console.log("teste");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sortedCategories = React.useMemo(() => {
    if (!categories.length) return [];
    return [...categories].sort((a, b) => {
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
  }, [categories, sortConfig]);
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap">
      <div className="w-full px-3 sm:w-[80%] sm:mx-0 mb-16 sm:mb-24">
        <h2 className="mb-[2rem] p-3">{t("category_list_title")}</h2>
        {/* {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )} */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y text-center divide-gray-200 bg-[--azul-escuro] mt-4 rounded-lg mb-[4rem]">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="px-6 py-3 text-xs font-large text-center text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <span
                    className={sortConfig.key === "name" ? "font-bold" : ""}
                  >
                    {t("category.name")}{" "}
                    {sortConfig.key === "name"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : "⇅"}
                  </span>
                </th>

                <th className="px-6 py-3 text-center text-xs font-large text-gray-500 uppercase tracking-wider">
                  {t("category.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[--azul-escuro] divide-y divide-gray-200">
              {sortedCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-white">
                    {category.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-white">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        name="description"
                        value={editFormData.description}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-black rounded"
                      />
                    ) : (
                      category.description
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    {editingId === category.id ? (
                      <>
                        <Button
                          onClick={() => handleUpdate(category.id)}
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
                        <Button onClick={() => handleEditClick(category)}>
                          {t("btn_edit")}
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
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
