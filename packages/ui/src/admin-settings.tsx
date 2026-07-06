import { Settings } from "lucide-react";
import type { User } from "@korfbaltools/types";
import { NavShape } from "./nav-shape";

export interface AdminSettingsProps {
  user: Pick<User, "email" | "naam" | "role"> | null;
  adminHref?: string;
}

export function AdminSettings({ user, adminHref = "/admin" }: AdminSettingsProps) {
  return (
    <>
      {user?.role === "admin" && (
        <div className="sticky right-0 top-[100px] flex items-end flex-col">
          <NavShape flipHorizontal flipVertical />
          <a className="group h-10 min-w-10 bg-primary-500 cursor-pointer text-white flex items-center justify-center rounded-tl-lg rounded-bl-lg hover:bg-primary-800 transition-colors overflow-hidden"
          href={adminHref} >
            <Settings className="h-6 w-6 shrink-0 mx-2" />
            <span className="max-w-0 opacity-0 whitespace-nowrap overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[160px] group-hover:opacity-100 group-hover:mr-3 text-xs">
              Adminpaneel
            </span>
          </a>
          <NavShape flipHorizontal />
        </div>
        )
      }
    </>
  )
}
