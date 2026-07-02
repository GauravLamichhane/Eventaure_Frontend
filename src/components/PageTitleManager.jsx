import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Eventaure";

function getRouteTitle(pathname) {
  if (pathname === "/") return `Home | ${APP_NAME}`;
  if (pathname === "/login") return `Sign In | ${APP_NAME}`;
  if (pathname === "/register") return `Create Account | ${APP_NAME}`;
  if (pathname === "/dashboard") return `Dashboard | ${APP_NAME}`;
  if (pathname === "/events/new") return `Create Event | ${APP_NAME}`;
  if (pathname.startsWith("/events/")) return `Event Details | ${APP_NAME}`;
  return APP_NAME;
}

export default function PageTitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getRouteTitle(pathname);
  }, [pathname]);

  return null;
}
