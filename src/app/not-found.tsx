"use client";

import Image from "next/image";
import Link from "next/link";
import BibiChibi from "@/assets/svg/bibi-chibi.svg";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <h1 className="text-center text-3xl font-bold text-gray-800">
        Página em construção ou não existente
      </h1>

      <div className="flex items-center justify-center gap-4">
        <Image
          loading="eager"
          src={BibiChibi}
          alt="404"
          style={{ width: 300, height: 300 }}
          width={300}
          height={300}
        />
        <div className="hidden sm:flex flex-col items-center gap-2">
          <span className="text-7xl font-bold text-gray-400">404</span>
          <span className="text-2xl font-semibold text-gray-400">
            NOT FOUND
          </span>
        </div>
      </div>

      <p className="text-center text-gray-600">
        Essa página não foi encontrada
      </p>
      <Link
        className="font-roboto font-medium text-orange-60 hover:text-orange-60/80"
        href="/"
      >
        Voltar para home
      </Link>
    </div>
  );
}
