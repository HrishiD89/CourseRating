import React from "react";
import { Link } from "react-router-dom";

const LinkButton = ({ children, to, className }) => {
  return (
    <Link className={`${className} px-4 py-2 rounded`} to={to}>
      {children}
    </Link>
  );
};

export default LinkButton;
