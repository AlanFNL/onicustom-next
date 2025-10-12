"use client";

import { motion } from "framer-motion";

export default function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 text-center"
          >
            Términos y Condiciones
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none text-gray-700"
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Producto personalizado
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  No hay cambios ni devoluciones por gusto. Cada desk pad se
                  fabrica a pedido.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Calidad de la impresión
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  El resultado depende exclusivamente de la calidad de tu
                  imagen. No revisamos archivos uno por uno. Nuestros mousepads
                  son premium, pero si tu imagen está pixelada o de baja
                  resolución, el resultado también lo estará.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Derechos de imagen
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al subir un archivo, declaras que tienes los derechos o
                  permisos para usarlo.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Si la imagen es de tu autoría y no querés que se replique en
                  otros desk pads, escribinos a{" "}
                  <a
                    href="mailto:hola@onicaps.online"
                    className="text-[#7a4dff] hover:text-[#6b42e6] underline transition-colors duration-200"
                  >
                    hola@onicaps.online
                  </a>{" "}
                  mencionando tu número de pedido.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contenido no aceptado
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  No imprimimos material ilegal, ofensivo o que infrinja
                  derechos de terceros.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Aceptación
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Al realizar la compra en nuestra web, aceptás estos términos.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
