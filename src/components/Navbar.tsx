"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, Building2, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide">EXO Travel</h1>
          <p className="text-xs text-slate-400">Organization Chart Portal</p>
        </div>
      </div>

      {/* User Profile & Logout */}
      {session?.user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 py-1.5 px-3 rounded-full">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-8 h-8 rounded-full border border-slate-600 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                {session.user.name?.[0] || <User className="w-4 h-4" />}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-white leading-tight">
                {session.user.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {session.user.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs font-medium py-2 px-3 rounded-xl border border-slate-700 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}