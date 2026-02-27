"use client";

import { Code2, Zap, LogIn, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-dark-700/50 backdrop-blur-xl bg-dark-900/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">
                AI Code Forge
              </h1>
              <p className="text-[10px] text-dark-400 -mt-0.5 tracking-wider uppercase">
                Intelligent API Generator
              </p>
            </div>
          </div>

          {/* Center badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full">
            <Zap className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs text-primary-300 font-medium">
              Powered by Gemini
            </span>
          </div>

          {/* Right side - Auth */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm text-dark-200 font-medium leading-tight">
                    {session.user.name}
                  </span>
                  <span className="text-[10px] text-dark-500 leading-tight">
                    {session.user.email}
                  </span>
                </div>
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Avatar"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-dark-600"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-800"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
