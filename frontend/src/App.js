import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Home from "pages/Home";
import About from "pages/About";
import Menu from "components/Menu";
import CourseShowById from "pages/Courses/CourseShowById";
import Services from "pages/Services";
import Signup from "pages/Signup";
import NotFound from "pages/NotFound";
import Signin from "pages/Signin";

function App() {
  const [language, setLanguage] = useState("en");
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("chosenLanguage") || "pt";
    i18n.changeLanguage(savedLanguage).then(() => {
      setLanguage(savedLanguage);
      setIsLoading(false);
    });
  }, [i18n]);

  const handleTrans = (code) => {
    i18n.changeLanguage(code).then(() => {
      setLanguage(code);
      sessionStorage.setItem("chosenLanguage", code);
    });
  };

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  return (
    <BrowserRouter>
      <Menu t={t} handleTrans={handleTrans} language={language} />
      <Routes>
        <Route path="/" element={<Home t={t} language={language} />} />
        <Route path="/about" element={<About language={language} />} />
        <Route path="/services" element={<Services t={t} />} />
        <Route path="*" element={<NotFound t={t} />} />
        <Route path="/signup" element={<Signup t={t} />} />
        <Route path="/login" element={<Signin t={t} />} />
        <Route
          path="/course/:id"
          element={<CourseShowById t={t} language={language} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
