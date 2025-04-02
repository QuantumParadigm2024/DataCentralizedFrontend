import React from "react";
import { createRoot } from "react-dom/client";
import WebFont from 'webfontloader';
import App from "./App.jsx";

WebFont.load({
    google: {
        families: ['Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900', 'Roboto:400,700', 'sans-serif']
    }
});

createRoot(document.getElementById("root")).render(
    <App />
);