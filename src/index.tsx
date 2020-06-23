import * as React from "react";
import * as ReactDOM from "react-dom";

import Main from "./Main";

declare global {
  interface Window {
    store: any;
  }
}

ReactDOM.render(<Main />, document.getElementById("root") as HTMLElement);
