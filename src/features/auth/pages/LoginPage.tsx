import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-stone-900">Login Toko Makanan</h1>
        <p className="text-sm text-stone-500 mt-2">Memuat modul autentikasi...</p>
      </div>
    </div>
  );
};
