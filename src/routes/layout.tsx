import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";
import { Form, type RequestHandler, routeLoader$ } from "@builder.io/qwik-city";
import { useAuthSession, useAuthSignin, useAuthSignout } from "./plugin@auth";
import CSS from "./layout.css?inline";
import { type Session } from "@auth/core/types";

export const onRequest: RequestHandler = async ({ url }) => {
  console.log("GUARD", url.toString());
};

export const useUser = routeLoader$(async ({ sharedMap }) => {
  const session = sharedMap.get("session") as Session;
  // console.log("session", session);
  return "mhevery";
});

export default component$(() => {
  useStylesScoped$(CSS);
  const user = useAuthSession();
  const userSigninAction = useAuthSignin();
  const userSignoutAction = useAuthSignout();
  return (
    <div>
      <header>
        {user.value?.user ? (
          <div style={{ minHeight: "50px" }}>
            {user.value.user.image && (
              <img
                class="avatar"
                width="25"
                height="25"
                src={user.value.user.image}
              />
            )}
            {user.value.user.name}
            <Form action={userSignoutAction}>
              <button>signout</button>
            </Form>
          </div>
        ) : (
          <div>
            <Form action={userSigninAction}>
              <button>signin</button>
            </Form>
          </div>
        )}
      </header>
      <main>
        <Slot />
      </main>
      <footer>Made with ❤️ by Builder.io</footer>
    </div>
  );
});
