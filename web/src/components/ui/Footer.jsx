import React from "react";

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-white">
      <div className="w-full mx-auto max-w-screen-xl p-4 flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0">
        <span className="text-sm text-slate-600 text-center sm:text-left">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://codaweb.com.br/"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            CodaWeb Notes.
          </a>{" "}
          Todos os direitos reservados.
        </span>

        <ul className="flex flex-col items-center gap-2 text-sm font-medium text-slate-500 sm:flex-row sm:gap-6">
          <li>
            <a href="/about" className="hover:underline">
              Sobre
            </a>
          </li>
          <li className="flex gap-1">
            <p className="text-xs text-slate-500">Codaweb Notes</p>
            <p className="text-xs text-slate-400">{`v1.0.0`}</p>
          </li>
        </ul>
      </div>
    </footer>
  );
}
