export default function Category() {
  return (
    <div className="flex flex-wrap">
      <div className="w-full px-3 sm:w-[80%] sm:mx-0 mb-16 sm:mb-24">
        <h2 className="mb-[2rem] p-3">{t("category_list_title")}</h2>
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
                  {t("category.description")}
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
