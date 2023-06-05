import { component$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
} from "@builder.io/qwik-city";

export const useCount = routeLoader$(async ({ sharedMap }) => {
  const count = (sharedMap.get("count") as number) || 123;
  return count;
});

export const useCountAction = routeAction$(
  async ({ count }, { sharedMap }) => {
    console.log("useCountAction", count);
    sharedMap.set("count", count + 1);
  },
  zod$({
    count: z.coerce.number(),
  })
);

export default component$(() => {
  const count = useCount();
  const countAction = useCountAction();
  return (
    <div>
      Count: {count.value}
      <Form action={countAction}>
        <input type="hidden" name="count" value={count.value} />
        <button>+1</button>
      </Form>
    </div>
  );
});
