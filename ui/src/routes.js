import React from "react";
import Dashboard from "views/Dashboard/Dashboard";

import PasswordManager from "views/PasswordManager/PasswordManager";
import { Icon } from "@chakra-ui/icons";
import { MdLock } from "react-icons/md";

import { HomeIcon } from "components/Icons/Icons";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/password-manager",
    name: "Password Manager",
    icon: <Icon as={MdLock} color="inherit" />,
    component: PasswordManager,
    layout: "/admin",
  },
];
export default dashRoutes;
