import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClientsWithProjects } from "@/lib/db/queries";
import { createClientAction, createProjectAction, signOutAction } from "@/app/actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = await getClientsWithProjects(session.user.id);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">
          Brand Strategy Engine
        </h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-700">
            New client
          </h2>
          <form action={createClientAction} className="flex gap-2">
            <input
              name="name"
              placeholder="Client name"
              required
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add client
            </button>
          </form>
        </section>

        <div className="flex flex-col gap-6">
          {clients.length === 0 && (
            <p className="text-sm text-zinc-500">
              No clients yet. Add your first client above.
            </p>
          )}

          {clients.map((client) => (
            <section
              key={client.id}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-900">
                  {client.name}
                </h3>
              </div>

              <ul className="mb-4 flex flex-col gap-2">
                {client.projects.map((project) => (
                  <li key={project.id}>
                    <a
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 hover:border-zinc-400"
                    >
                      <span className="text-sm font-medium text-zinc-800">
                        {project.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {project.approvedCount}/{project.totalCount} approved
                        &middot; {project.language.toUpperCase()}
                      </span>
                    </a>
                  </li>
                ))}
                {client.projects.length === 0 && (
                  <li className="text-sm text-zinc-400">No projects yet.</li>
                )}
              </ul>

              <form
                action={createProjectAction}
                className="flex flex-wrap gap-2"
              >
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  name="name"
                  placeholder="Project name"
                  required
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
                <select
                  name="language"
                  defaultValue="ar"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                >
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200"
                >
                  New project
                </button>
              </form>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
