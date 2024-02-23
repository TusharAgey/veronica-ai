import React from "react";

import Dashboard from "./views/Dashboard/Dashboard";
import PasswordManager from "./views/PasswordManager/PasswordManager";
import DiaryManager from "./views/Diary/DiaryManager";
import { Icon } from "@chakra-ui/icons";
import { MdLock } from "react-icons/md";
import { MdBookOnline } from "react-icons/md";

import { HomeIcon } from "components/Icons/Icons";

const dashRoutes = [
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
  {
    path: "/diary-manager",
    name: "Journal",
    icon: <Icon as={MdBookOnline} color="inherit" />,
    component: DiaryManager,
    layout: "/admin",
  },
];
export default dashRoutes;
