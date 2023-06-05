import { component$, useSignal, $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

export default component$<{ sku?: string }>(({ sku }) => {
  console.log("Render: <Counter/>");
  const count = useSignal(123);
  return (
    <div>
      <h1>{sku}</h1>
      Count: {count.value}
      <button onClick$={async () => count.value++}>+1</button>
      <button
        onClick$={async () => {
          console.log("Amazing!");
          if (count.value > 100) {
            const fn = server$(() => {
              console.log("Expensive");
              return count.value % 2 == 0
                ? $(() => console.log("even"))
                : $(() => console.log("odd"));
            });
            const serverFn = await fn();
            serverFn();
          }
        }}
      >
        mind-blown
      </button>
      <button onClick$={() => console.log("Hello Adservio")}>greet</button>
    </div>
  );
});
