export default function Box3({ t, language }) {
  return (
    <div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 xl:mt-0">
      <div className="flex items-center px-5 py-6 bg-white rounded-md shadow-sm">
        <div className="p-3 bg-pink-600 bg-opacity-75 rounded-full">
          <svg
            className="w-8 h-8 text-white"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.99998 11.2H21L22.4 23.8H5.59998L6.99998 11.2Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            ></path>
            <path
              d="M9.79999 8.4C9.79999 6.08041 11.6804 4.2 14 4.2C16.3196 4.2 18.2 6.08041 18.2 8.4V12.6C18.2 14.9197 16.3196 16.8 14 16.8C11.6804 16.8 9.79999 14.9197 9.79999 12.6V8.4Z"
              stroke="currentColor"
              strokeWidth="2"
            ></path>
          </svg>
        </div>

        <div className="mx-5">
          <h4 className="text-2xl font-semibold text-gray-700">24</h4>
          <div className="text-gray-500">Available Courses</div>
        </div>
      </div>
    </div>
  );
}
