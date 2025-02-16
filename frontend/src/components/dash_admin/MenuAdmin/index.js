import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function MenuAdmin({ t }) {
  const name = JSON.parse(localStorage.getItem("user"))?.username;

  // State to control submenu visibility
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  // Toggles submenu visibility when "Create Course" is clicked
  const toggleSubMenu = () => {
    setIsSubMenuOpen((prev) => !prev);
  };

  return (
    <section className="bg-[--azul-escuro] px-12">
      <div>
        {/* Greeting with user name */}
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="mx-2 text-2xl font-semibold text-[--amarelo]">
              {t("dash_greeting")}, {name}
            </span>
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="mt-10">
          <NavLink
            className="flex items-center px-6 py-2 mt-4 text-gray-100 bg-gray-700 bg-opacity-25"
            to="/admin"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <span className="mx-3">Dashboard</span>
          </NavLink>

          <NavLink
            className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
            to="users/all"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
              />
            </svg>
            <span className="mx-3">{t("dash_users")}</span>
          </NavLink>

          <a
            className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
            href="#"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="mx-3">Tables</span>
          </a>

          {/* Main menu item for "Create Course" with toggleable submenu */}
          <div
            className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100 cursor-pointer"
            onClick={toggleSubMenu}
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>

            <span className="mx-3">{t("dash_courses")}</span>
          </div>

          {/* Submenu items - visible only when isSubMenuOpen is true */}
          {isSubMenuOpen && (
            <div className="ml-12 mt-2 space-y-2 text-gray-500">
              <div className="hover:text-gray-100 cursor-pointer">
                {t("dash_allCourses")}
              </div>
              <p>
                <NavLink
                  to={"courses/create"}
                  className="hover:text-gray-100 cursor-pointer"
                >
                  {t("dash_createCourse")}
                </NavLink>
              </p>
              <p>
                <NavLink
                  className="hover:text-gray-100 cursor-pointer"
                  to={"courses/category"}
                >
                  {t("dash_createCategory")}
                </NavLink>
              </p>
            </div>
          )}
        </nav>
      </div>
    </section>
  );
}
