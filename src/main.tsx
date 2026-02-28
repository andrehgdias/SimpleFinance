import "./style.css"
import { render } from "solid-js/web"
import App from "./ui/app.tsx"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element is missing")
}
render(() => <App />, root)
