import { controller } from "./tests.controller";

export const TestsView = controller.view(({ state: { tests }, actions: { start } }) => {
  return (
    <div>
      <button onClick={start}>Start Tests</button>
      {tests.map(({ name, success }) => (
        <div key={name}>
          {name} - {success === true ? "Success" : "Failed"}
        </div>
      ))}
    </div>
  );
});
