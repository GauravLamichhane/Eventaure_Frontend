import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
