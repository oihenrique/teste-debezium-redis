import "@/styles/globals.css";
import { PrimeReactProvider } from "primereact/api";
import type { AppProps } from "next/app";
import "primereact/resources/themes/viva-light/theme.css"; // tema
import "primereact/resources/primereact.min.css"; // estilos principais
import "primeicons/primeicons.css"; // ícones
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrimeReactProvider>
      <Component {...pageProps} />
    </PrimeReactProvider>
  );
}
