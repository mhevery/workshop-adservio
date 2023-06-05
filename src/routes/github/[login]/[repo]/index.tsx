import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import type { paths } from "@octokit/openapi-types";
import { createServerClient } from "supabase-auth-helpers-qwik";

type OrgRepoResponse =
  paths["/repos/{owner}/{repo}"]["get"]["responses"]["200"]["content"]["application/json"];

export const useRepository = routeLoader$(async ({ params, env }) => {
  const login = params.login;
  const repo = params.repo;

  const response = await fetch(
    `https://api.github.com/repos/${login}/${repo}`,
    {
      headers: {
        "User-Agent": "Qwik Workshop",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  const repository = (await response.json()) as OrgRepoResponse;
  return repository;
});

export const useSetIsFavoriteAction = routeAction$(
  async ({ favorite }, requestEv) => {
    const email = requestEv.sharedMap.get("session")?.user?.email as
      | string
      | undefined;
    const login = requestEv.params.login;
    const repo = requestEv.params.repo;
    console.log("SET FAVORITE", favorite, email, login, repo);
    if (email) {
      const supabaseClient = createServerClient(
        requestEv.env.get("PRIVATE_SUPABASE_URL")!,
        requestEv.env.get("PRIVATE_SUPABASE_ANON_KEY")!,
        requestEv
      );
      if (favorite) {
        await supabaseClient.from("favorite").upsert({
          email,
          user: login,
          repo,
        });
      } else {
        await supabaseClient.from("favorite").delete().match({
          email,
          user: login,
          repo,
        });
      }
    }
  },
  zod$({
    favorite: z.coerce.boolean(),
  })
);

export const useIsFavorite = routeLoader$(async (requestEv) => {
  const email = requestEv.sharedMap.get("session")?.user?.email as
    | string
    | undefined;
  const login = requestEv.params.login;
  const repo = requestEv.params.repo;

  if (email) {
    const supabaseClient = createServerClient(
      requestEv.env.get("PRIVATE_SUPABASE_URL")!,
      requestEv.env.get("PRIVATE_SUPABASE_ANON_KEY")!,
      requestEv
    );
    const { data: favorite, error } = await supabaseClient
      .from("favorite")
      .select("*")
      .eq("email", email)
      .eq("user", login)
      .eq("repo", repo);
    if (error) {
      console.log("ERROR", error);
      throw error;
    }
    console.log("IS FAVORITE", favorite?.length, email, login, repo);
    return (favorite?.length || 0) > 0;
  }
  return false;
});

export default component$(() => {
  const repository = useRepository();
  const isFavorite = useIsFavorite();
  const setIsFavoriteAction = useSetIsFavoriteAction();
  return (
    <div>
      <h1>{repository.value.name}</h1>
      <div>
        <button
          onClick$={async () => {
            console.log("CLICK", isFavorite.value);
            await setIsFavoriteAction.submit({ favorite: !isFavorite.value });
          }}
        >
          {isFavorite.value ? <>✭</> : <>✩</>}
        </button>
      </div>
      <p>{repository.value.description}</p>
    </div>
  );
});
