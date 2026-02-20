"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

type MenuProps = {
  collapsed: boolean;
};

const menuItems = [
  {
    label: "Home",
    href: "/home",
    icon: <HomeIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <FolderIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "Blogs",
    href: "/blogs",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "Categories",
    href: "/categories",
    icon: <TagIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "Testimonials",
    href: "/testimonials",
    icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "CTA",
    href: "/cta",
    icon: <PhoneIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <EnvelopeIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
  {
    label: "leads",
    href: "/leads",
    icon: <BriefcaseIcon className="w-5 h-5" />,
    color: "from-purple-700 to-purple-600",
  },
];

const Menu = ({ collapsed }: MenuProps) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className={`mt-4 ${collapsed ? "px-2" : "px-4"}`}>
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className={`group relative flex items-center ${
              collapsed ? "justify-center" : "justify-start"
            } gap-4 font-medium py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive(item.href)
                ? `text-white bg-linear-to-r ${item.color} shadow-lg`
                : "text-gray-600 hover:text-gray-900 hover:bg-zinc-200"
            }`}
          >
            {/* Icon with hover effect */}
            <div
              className={`transition-all duration-300 ${
                isActive(item.href)
                  ? "scale-110 text-white"
                  : "group-hover:scale-110 text-current"
              } ${collapsed ? "mx-auto" : ""}`}
            >
              {item.icon}
            </div>

            {/* Label with slide-in effect */}
            {!collapsed && (
              <span
                className={`block transition-all duration-300 ${
                  isActive(item.href)
                    ? "translate-x-0 font-semibold"
                    : "group-hover:translate-x-1"
                }`}
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
