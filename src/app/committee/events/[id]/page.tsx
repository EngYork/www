import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { EventT } from "../../../pageFragments/EventsGrid";
import EventForm from "./components/EventForm";

export default async function AdminEvent({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    if (params.id === "1") {
      return (
        <main className="flex flex-col pt-20 px-10 min-h-[80vh]">
          <h1 className="text-6xl font-extrabold text-red-500 my-auto">
            You cannot modify the weekly labs event. Please get in touch with
            the website admin.
          </h1>
        </main>
      );
    }

    const { supabaseAccessToken } = session;
    const cookiesStore = cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookiesStore },
      {
        options: {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseAccessToken}`,
            },
          },
        },
      }
    );

    let event: EventT | undefined = undefined;

    if (params.id !== "new") {
      const { data: events, error } = await supabase
        .from("events")
        .select()
        .eq("id", params.id);

      if (error) {
        console.error(error);
      }

      if (events && events.length > 0) event = events[0];
      else redirect("/committee");
    }

    return (
      <main className="flex flex-col pt-20">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <EventForm event={event} />
      </main>
    );
  }

  redirect("/");
}
