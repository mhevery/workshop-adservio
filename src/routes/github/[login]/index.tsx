import {
  component$,
  useComputed$,
  useSignal,
  useStylesScoped$,
  useTask$,
} from "@builder.io/qwik";
import {
  type StaticGenerateHandler,
  routeLoader$,
  useLocation,
  RequestHandler,
  Link,
} from "@builder.io/qwik-city";
import type { paths } from "@octokit/openapi-types";
import { useUser } from "~/routes/layout";
import CSS from "./index.css?inline";

type OrgReposResponse =
  paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"];

export const useRepositories = routeLoader$(async ({ env, params }) => {
  const response = await fetch(
    `https://api.github.com/users/${params.login}/repos?per_page=100`,
    {
      headers: {
        "User-Agent": "Qwik Workshop",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  return (await response.json()) as OrgReposResponse;
});

export const onGet: RequestHandler = async ({ request, exit, redirect }) => {
  const obj: Record<string, string> = {};
  request.headers.forEach((value, key) => (obj[key] = value));
  // console.log("GET", obj);
  hello();
  if (request.headers.get("accept") == "*/*") {
    // json(200, { hello: "world" });
    throw redirect(308, "/github/qwik");
    exit();
  }
};

export default component$(() => {
  useStylesScoped$(CSS);
  const repositories = useRepositories();
  const user = useUser();
  const location = useLocation();
  const filter = useSignal("");
  const debounceFilter = useSignal("");
  useTask$(({ track, cleanup }) => {
    console.log("TASK: debounceFilter", filter.value);
    if (filter.value) {
      hello();
    }
    const filterValue = track(() => filter.value);
    const id = setTimeout(() => (debounceFilter.value = filterValue), 500);
    cleanup(() => clearTimeout(id));
  });
  const filteredRepositories = useComputed$(() => {
    return repositories.value.filter((repo) =>
      repo.name.toLowerCase().includes(debounceFilter.value.toLowerCase())
    );
  });
  return (
    <div>
      <h1>
        Hello {location.params.login} / {user.value}!!!
      </h1>
      <input type="text" bind:value={filter} /> {debounceFilter.value}
      <ul class="card-list">
        {filteredRepositories.value.map((repo) => (
          <li class="card-item" key={repo.name}>
            <Link href={`/github/${repo.full_name}`}>{repo.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  return {
    params: [{ login: "mhevery" }, { login: "BuilderIO" }],
  };
};
function hello() {
  console.log("HELLO");
}
