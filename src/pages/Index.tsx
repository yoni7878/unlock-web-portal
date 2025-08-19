
import { useState } from "react";
import { LicenseAuth } from "@/components/LicenseAuth";
import { Dashboard } from "@/components/Dashboard";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LicenseAuth onAuthenticated={handleAuthenticated} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ThemeProvider>
  );
};

export default Index;
