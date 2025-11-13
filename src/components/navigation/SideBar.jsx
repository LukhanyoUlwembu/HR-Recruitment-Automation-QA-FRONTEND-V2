import {
  BriefcaseBusiness,
  HandCoins,
  Handshake,
  House,
  MessagesSquare,
  Users,
  Bell,
  BarChart2,
  Settings2,
  Settings,
} from 'lucide-react';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../pages/useAuth';

const Sidebar = () => {
  const commonClasses = "relative group w-fit";
  const role = sessionStorage.getItem("role");
  const [roles,setRoles] = useState([]);
  const isRecruiterRole = roles.includes(role);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${BASE_URL}/dropdown/roles/role-names`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRoles(data);
        }
      } catch (err) {
        console.error("Error fetching stages:", err);
      }
    };

    fetchRoles();
  }, []);
  const recruiterLinks = [
    { to: "/dashboard", icon: <House />, label: "Dashboard" },
    { to: "/rec-notifications", icon: <Bell />, label: "Notifications" },
    { to: "/database", icon: <Users />, label: "Database" },
    { to: "/report", icon: <BarChart2 />, label: "Reports" },
  ];

  const adminOnlyLinks = [
    { to: "/manage", icon: <Settings2 />, label: "Admin Portal" },
  ];

  const applicantLinks = [
    { to: "/jobs", icon: <House />, label: "Home" },
    { to: "/profile", icon: <Users />, label: "Profile" },
    { to: "/applications", icon: <BriefcaseBusiness />, label: "Applications" },
    { to: "/notifications", icon: <Bell />, label: "Notifications" },
  ];

  let links = [];

  if (isRecruiterRole) {
    links = recruiterLinks;
    if (role === "Admin") {
      links = [...recruiterLinks, ...adminOnlyLinks];
    }
  } else {
    links = applicantLinks;
  }

  return (
    <div className="flex flex-col space-y-5 py-20 px-4">
      {links.map(({ to, icon, label }) => (
        <div className={commonClasses} key={to}>
          <Link to={to}>
            {icon}
          </Link>
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-400 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
