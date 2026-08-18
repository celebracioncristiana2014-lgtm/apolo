import "./globals.css";
import { Providers } from "./providers"; // <-- Agregamos esta línea

export const metadata = {
  title: "Apologética Avanzada",
  description: "Plataforma de estudio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {/* Envolvemos la app con el proveedor */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}