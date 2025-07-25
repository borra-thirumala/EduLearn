import { createContext, useContext, useEffect, useState } from "react";

const initialState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};












// import React, { createContext, useContext, useEffect, useState } from "react";

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("theme") || "system";
//   });

//   useEffect(() => {
//     const root = window.document.documentElement;

//     const applyTheme = () => {
//       let resolvedTheme = theme;

//       if (theme === "system") {
//         const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//         resolvedTheme = isDark ? "dark" : "light";
//       }

//       if (resolvedTheme === "dark") {
//         root.classList.add("dark");
//       } else {
//         root.classList.remove("dark");
//       }
//     };

//     applyTheme();
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);




// import { createContext, useContext, useEffect, useState } from "react";

// const initialState = {
//   theme: "system",
//   setTheme: () => null,
// };

// const ThemeProviderContext = createContext(initialState);

// export function ThemeProvider({
//   children,
//   defaultTheme = "system",
//   storageKey = "vite-ui-theme",
//   ...props
// }) {
//   const [theme, setTheme] = useState(
//     () => localStorage.getItem(storageKey) || defaultTheme
//   );

//   useEffect(() => {
//     const root = window.document.documentElement;

//     root.classList.remove("light", "dark");

//     if (theme === "system") {
//       const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
//         .matches
//         ? "dark"
//         : "light";

//       root.classList.add(systemTheme);
//       return;
//     }

//     root.classList.add(theme);
//   }, [theme]);

//   const value = {
//     theme,
//     setTheme: (theme) => {
//       localStorage.setItem(storageKey, theme);
//       setTheme(theme);
//     },
//   };

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       {children}
//     </ThemeProviderContext.Provider>
//   );
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext);

//   if (context === undefined)
//     throw new Error("useTheme must be used within a ThemeProvider");

//   return context;
// };