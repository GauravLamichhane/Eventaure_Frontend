import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { getProfile, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try {
      setError("");
      await logout();
    } catch {
      setError("Could not log out. Please try again.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getProfile();
        if (isMounted) {
          setProfile(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Could not load profile";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [getProfile]);

  const firstName = profile?.first_name || "there";

  return (
    <div className="justify-end">
      <nav className="">
        <button
          type="button"
          onClick={handleLogout}
          className="border bg-[rgb(37,41,41)] text-white p-2 rounded hover:bg-white cursor-pointer hover:text-[rgb(37,41,41)] hover:border mb-5"
        >
          Log out
        </button>

        <Link
          to="/events/new"
          className="inline-block border bg-[rgb(37,41,41)] text-white p-2 rounded hover:bg-white cursor-pointer hover:text-[rgb(37,41,41)] hover:border mb-5"
        >
          Create Event
        </Link>
      </nav>
      <div className="min-h-screen">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="text-2xl">
            Hi {firstName}
            {/* <div>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
