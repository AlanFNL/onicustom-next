"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type StatusMsg = { type: "ok" | "err"; msg: string } | null;

function digitsOnly(input: string) {
  return input.replace(/\D/g, "");
}

export default function ArtesanalFormPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // WhatsApp (opcional)
  const [character, setCharacter] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusMsg>(null);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 2 &&
      email.trim().length > 4 &&
      character.trim().length > 1 &&
      !!file &&
      !submitting
    );
  }, [fullName, email, character, file, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!fullName.trim() || !email.trim() || !character.trim() || !file) {
      setStatus({
        type: "err",
        msg: "Completá nombre, email, personaje y subí una foto.",
      });
      return;
    }

    // Tel opcional, pero si lo completan validamos mínimo (muy suave)
    if (phone.trim()) {
      const d = digitsOnly(phone);
      if (d.length < 8) {
        setStatus({
          type: "err",
          msg: "El teléfono parece muy corto. Probá con código de área (ej: +54 9 341 ...).",
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      // 🔸 Aún no conectamos a backend: simulamos envío
      await new Promise((r) => setTimeout(r, 700));

      setStatus({
        type: "ok",
        msg: "¡Listo! Recibimos tu pedido. En breve te contactamos.",
      });

      // reset
      setFullName("");
      setEmail("");
      setPhone("");
      setCharacter("");
      setNote("");
      setFile(null);

      const input = document.getElementById("file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch {
      setStatus({
        type: "err",
        msg: "Ocurrió un error enviando el pedido. Probá de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.jpeg"
              alt="Onicaps Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Volver
            </span>
          </a>

          <span className="text-xs text-gray-500 hidden md:block">
            Keycap artesanal • pedido sin editor
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Pedido de Keycap Artesanal
          </h1>
          <p className="mt-2 text-gray-600 leading-relaxed">
            Completá estos datos y subí una foto de referencia. Cuanto mejor la
            foto, mejor el resultado.
          </p>

          {status && (
            <div
              className={`mt-6 rounded-2xl border p-4 text-sm ${
                status.type === "ok"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* Nombre + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre y apellido <span className="text-red-500">*</span>
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] bg-white"
                  placeholder="Ej: Juan Pérez"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] bg-white"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (WhatsApp){" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] bg-white"
                placeholder="Ej: +54 9 341 123-4567"
                autoComplete="tel"
                inputMode="tel"
              />
              <p className="mt-2 text-xs text-gray-500">
                Si lo dejás, podemos contactarte más rápido por WhatsApp.
              </p>
            </div>

            {/* Personaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personaje que querés que hagamos{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] bg-white"
                placeholder="Ej: Goku / Pikachu / tu personaje"
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de referencia <span className="text-red-500">*</span>
              </label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white"
              />
              <p className="mt-2 text-xs text-gray-500">
                Formatos recomendados: JPG/PNG. Ideal: imagen nítida, frontal y
                sin filtros.
              </p>
            </div>

            {/* Nota */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota extra{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] bg-white resize-none"
                placeholder="Colores, estilo, si querés nombre, detalles importantes, etc."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#7a4dff] hover:bg-[#6b42e6] disabled:opacity-60 disabled:hover:bg-[#7a4dff] text-white font-medium py-3.5 rounded-2xl transition-colors"
            >
              {submitting ? "Enviando..." : "Enviar pedido"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Los campos marcados con <span className="text-red-500">*</span>{" "}
              son obligatorios.
            </p>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
