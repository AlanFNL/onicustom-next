"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type StatusMsg = { type: "ok" | "err"; msg: string } | null;

function digitsOnly(input: string) {
  return input.replace(/\D/g, "");
}

const spring = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };
function StepsTimelineBar() {
  const steps = [
    { title: "Pedís tu boceto", desc: "Completás el formulario" },
    { title: "Te enviamos el diseño", desc: "Revisás y pedís ajustes" },
    { title: "Aprobás y comprás", desc: "Te pasamos el link" },
    { title: "Fabricamos y enviamos", desc: "Despacho final" },
  ];

  const activeStep = 1; // 1..4
  const accent = "#7a4dff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="mt-5"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        {/* En desktop: no scroll | En mobile: scroll suave */}
        <div className="md:overflow-visible overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          {/* Solo en mobile forzamos un ancho mínimo. En md+ usamos w-full */}
          <div className="w-full min-w-[420px] md:min-w-0">
            <div className="relative pt-2">
              {/* Track */}
              <div className="absolute left-0 right-0 top-[22px] h-[6px] rounded-full bg-gray-200" />

              {/* Progress */}
              <div
                className="absolute left-0 top-[22px] h-[6px] rounded-full"
                style={{
                  width: `${((Math.max(1, activeStep) - 1) / (steps.length - 1)) * 100}%`,
                  backgroundColor: accent,
                }}
              />

              <div className="relative grid grid-cols-4 gap-2">
                {steps.map((s, idx) => {
                  const stepNumber = idx + 1;
                  const done = stepNumber <= activeStep;

                  return (
                    <div key={s.title} className="flex flex-col items-center">
                      {/* Nodo */}
                      <div
                        className="h-10 w-10 md:h-11 md:w-11 rounded-full flex items-center justify-center border-4 bg-white"
                        style={{ borderColor: done ? accent : "#D1D5DB" }}
                      >
                        {done ? (
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={accent}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">
                            {stepNumber}
                          </span>
                        )}
                      </div>

                      {/* Texto (controlado para que no rompa) */}
                      <div className="mt-3 text-center px-1 md:px-2 w-full">
                        <div className="text-[12px] md:text-sm font-semibold text-gray-900 leading-tight">
                          {s.title}
                        </div>
                        <div className="mt-1 text-[11px] md:text-xs text-gray-600 leading-snug line-clamp-2">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hint solo en mobile */}
            <div className="mt-3 md:hidden text-[11px] text-gray-500 text-center">
              Deslizá para ver todos los pasos →
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}





export default function ArtesanalFormPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.message || "Error al subir la imagen");
      }

      const { url: imageUrl } = await uploadRes.json();
      if (!imageUrl) throw new Error("No se recibió URL de la imagen");

      const orderRes = await fetch("/api/artesanal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          character: character.trim(),
          note: note.trim() || null,
          imageUrl,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.message || "Error al enviar el pedido");
      }

      setStatus({
        type: "ok",
        msg: "¡Listo! Recibimos tu pedido. recorda que la fase de boceto puede demorar por al alta demanda y aun asi podes recibir una respuesta negativo D:.",
      });

      setFullName("");
      setEmail("");
      setPhone("");
      setCharacter("");
      setNote("");
      setFile(null);

      const input = document.getElementById("artesanal-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (err) {
      setStatus({
        type: "err",
        msg: err instanceof Error ? err.message : "Ocurrió un error enviando el pedido. Probá de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Header — aligned with ImageEditor */}
      <header className="bg-white shadow-sm px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium hidden sm:inline">Volver</span>
            </Link>
          </motion.div>

          <motion.div
            className="flex flex-col items-center flex-1 min-w-0 mx-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
          >
            <Link href="/" className="block">
              <img
                src="/assets/logo.jpeg"
                alt="Onicaps Logo"
                className="h-8 md:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs md:text-sm text-gray-500 mt-1.5 font-light hidden sm:block">
              Keycap artesanal • pedido sin editor
            </p>
          </motion.div>

          <div className="w-20 sm:w-24 flex-shrink-0" aria-hidden />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:px-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
        >
<h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
  Pedido Boceto
</h1>
<p className="mt-2 text-gray-600 text-sm md:text-base leading-relaxed">
  Completá estos datos y subí una foto de referencia.
</p>

<StepsTimelineBar />


          <AnimatePresence mode="wait">
            {status?.type === "err" && (
              <motion.div
                key={status.msg}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {status.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre y apellido <span className="text-red-500">*</span>
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent bg-white transition-all duration-200"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent bg-white transition-all duration-200"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (WhatsApp){" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent bg-white transition-all duration-200"
                placeholder="Ej: +54 9 341 123-4567"
                autoComplete="tel"
                inputMode="tel"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Si lo dejás, podemos contactarte más rápido por WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personaje o idea que querés que hagamos{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent bg-white transition-all duration-200"
                placeholder="Ej: Goku / Pikachu / tu personaje"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de referencia <span className="text-red-500">*</span>
              </label>
              <input
                id="artesanal-file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent transition-all duration-200"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Formatos recomendados: JPG/PNG. Ideal: imagen nítida, frontal y sin filtros.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota extra{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent bg-white resize-none transition-all duration-200"
                placeholder="Colores, estilo, si querés nombre, detalles importantes, etc."
              />
            </div>

            <motion.button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#7a4dff] hover:bg-[#6b42e6] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#7a4dff] text-white font-medium py-3.5 rounded-xl transition-colors duration-200"
              whileHover={canSubmit ? { scale: 1.01 } : {}}
              whileTap={canSubmit ? { scale: 0.99 } : {}}
            >
              {submitting ? "Enviando..." : "Enviar pedido"}
            </motion.button>

            <p className="text-xs text-gray-500 text-center">
              Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
            </p>
          </form>
        </motion.div>
      </main>

      {/* Footer — same as ImageEditor */}
      <footer className="mt-16 py-12 px-4 md:px-8 border-t border-gray-100">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="grid grid-cols-3 gap-4 md:flex md:justify-center md:space-x-8">
            <Link
              href="https://onicaps.online"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-medium text-xs md:text-sm text-center">onicaps.online</span>
            </Link>
            <Link
              href="https://instagram.com/oni.caps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="font-medium text-xs md:text-sm text-center">oni.caps</span>
            </Link>
            <Link
              href="https://tiktok.com/@oni.caps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              <span className="font-medium text-xs md:text-sm text-center">@oni.caps</span>
            </Link>
          </div>
        </motion.div>
      </footer>

      {/* Success popup */}
      <AnimatePresence>
        {status?.type === "ok" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setStatus(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Boceto enviado!
              </h3>
              <p className="text-gray-600 text-sm mb-6">{status.msg}</p>
              <button
                type="button"
                onClick={() => setStatus(null)}
                className="w-full py-3 rounded-xl bg-[#7a4dff] hover:bg-[#6b42e6] text-white font-medium transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

